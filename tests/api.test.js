import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiHandler } from '../server/app.js';

const id = '12345678-1234-1234-1234-123456789abc';
const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'public-test-key' };
const jsonHeaders = { 'Content-Type': 'application/json', Authorization: 'Bearer admin-token' };
function authClient(role = 'admin') {
  return (_url, _key, options) => ({
    auth: { getUser: async token => token === 'admin-token' ? { data: { user: { id } } } : { error: { message: 'Invalid token' } } },
    from(table) {
      assert.equal(table, 'admin_profiles', 'Invalid requests must not reach content tables');
      assert.equal(options.global.headers.Authorization, 'Bearer admin-token');
      const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: role === 'admin' ? { id, active: true, role } : null }) };
      return query;
    }
  });
}
async function serve(t, options = {}) {
  const server = createServer(createApiHandler({ env, makeClient: authClient(), ...options }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return (path, options) => fetch(`http://127.0.0.1:${server.address().port}/api${path}`, options);
}
test('admin API rejects missing, forged and non-admin credentials', async t => {
  const request = await serve(t);
  assert.equal((await request('/admin/content')).status, 401);
  assert.equal((await request('/admin/content', { headers: { Authorization: 'Bearer forged' } })).status, 401);
  const ordinary = await serve(t, { makeClient: authClient('member') });
  assert.equal((await ordinary('/admin/content', { headers: jsonHeaders })).status, 403);
  const response = await request('/admin/session', { headers: jsonHeaders });
  assert.deepEqual(await response.json(), { id, allowed: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('admin API restricts resources, methods and identifiers', async t => {
  const request = await serve(t);
  for (const resource of ['admin_profiles', 'auth.users', 'users', 'legacy_table']) {
    assert.equal((await request(`/admin/content/${resource}`, { headers: jsonHeaders })).status, 404);
  }
  assert.equal((await request('/admin/content/faq/not-a-uuid', { headers: jsonHeaders })).status, 400);
  assert.equal((await request(`/admin/content/site_settings/${id}`, { method: 'DELETE', headers: jsonHeaders })).status, 405);
  assert.equal((await request('/admin/content/sections', { method: 'POST', headers: jsonHeaders })).status, 405);
});
test('invalid writes never reach the database', async t => {
  const request = await serve(t);
  const write = (body, options = {}) => request('/admin/content/faq', { method: 'POST', headers: jsonHeaders, body, ...options });
  assert.equal((await write('not json')).status, 400);
  assert.equal((await write('[]')).status, 400);
  assert.equal((await write('{}', { headers: { Authorization: 'Bearer admin-token' } })).status, 415);
  assert.equal((await write(JSON.stringify({ data: { question: 'Example' }, role: 'admin' }))).status, 400);
  assert.equal((await write(JSON.stringify({ data: { unexpected: 'value' } }))).status, 400);
  assert.equal((await write(JSON.stringify({ data: { question: 123 } }))).status, 400);
  assert.equal((await write(JSON.stringify({ data: { question: 'a'.repeat(140000) } }))).status, 413);
  assert.equal((await request(`/admin/content/faq/${id}`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ active: false }) })).status, 400);
  assert.equal((await request(`/admin/content/faq/${id}`, { method: 'DELETE', headers: jsonHeaders, body: '{}' })).status, 400);
});
test('ViaCEP validates input, maps an address and caches successful lookups', async t => {
  let calls = 0;
  const request = await serve(t, { fetcher: async url => {
    calls++; assert.equal(url, 'https://viacep.com.br/ws/01001000/json/');
    return Response.json({ cep: '01001-000', logradouro: 'Praça da Sé', bairro: 'Sé', localidade: 'São Paulo', uf: 'SP' });
  } });
  assert.equal((await request('/cep/123')).status, 400);
  assert.equal(calls, 0);
  const response = await request('/cep/01001000');
  assert.deepEqual(await response.json(), { cep: '01001-000', street: 'Praça da Sé', district: 'Sé', city: 'São Paulo', state: 'SP' });
  await request('/cep/01001000'); assert.equal(calls, 1);
});
test('ViaCEP reports unknown CEPs and unavailable upstream without inventing an address', async t => {
  const missing = await serve(t, { fetcher: async () => Response.json({ erro: true }) });
  assert.equal((await missing('/cep/99999999')).status, 404);
  const unavailable = await serve(t, { fetcher: async () => { throw new Error('Timeout'); } });
  const result = await unavailable('/cep/01001000');
  assert.equal(result.status, 502);
  assert.match((await result.json()).error, /manualmente/);
});
