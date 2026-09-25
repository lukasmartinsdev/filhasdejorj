import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

try { process.loadEnvFile('.env'); } catch {}
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const email = process.env.TEST_ADMIN_EMAIL, password = process.env.TEST_ADMIN_PASSWORD;
if (!email || !password) throw new Error('Defina TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD apenas no ambiente do terminal.');
const { data: login, error } = await client.auth.signInWithPassword({ email, password });
if (error) throw new Error('Não foi possível autenticar a conta de teste.');
let record;
async function request(path, { method = 'GET', body, authenticated = true } = {}) {
  const response = await fetch(base + '/api' + path, {
    method, headers: { ...(authenticated ? { Authorization: `Bearer ${login.session.access_token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, data: await response.json() };
}
try {
  assert.equal((await request('/health', { authenticated: false })).status, 200);
  assert.equal((await request('/admin/content', { authenticated: false })).status, 401);
  assert.equal((await request('/admin/session')).data.allowed, true);
  const content = await request('/admin/content');
  assert.equal(content.status, 200); assert.ok(content.data.sections.length);
  const created = await request('/admin/content/faq', { method: 'POST', body: { data: { question: 'Teste automatizado da API — não publicar', answer: 'Registro temporário de verificação do CRUD.' }, active: false, sort_order: 99999 } });
  assert.equal(created.status, 201, JSON.stringify(created.data)); record = created.data;
  assert.equal((await request(`/admin/content/faq/${record.id}`)).data.id, record.id);
  assert.ok(!(await request('/content', { authenticated: false })).data.faq.some(row => row.id === record.id));
  const changed = await request(`/admin/content/faq/${record.id}`, { method: 'PATCH', body: { data: { ...record.data, answer: 'Edição confirmada pela API.' }, updated_at: record.updated_at } });
  assert.equal(changed.status, 200, JSON.stringify(changed.data));
  assert.equal((await request(`/admin/content/faq/${record.id}`, { method: 'PATCH', body: { active: false, updated_at: record.updated_at } })).status, 409);
  record = changed.data;
  const deleted = await request(`/admin/content/faq/${record.id}`, { method: 'DELETE', body: { updated_at: record.updated_at } });
  assert.equal(deleted.status, 200); assert.equal(deleted.data.deleted, true);
  assert.equal((await request(`/admin/content/faq/${record.id}`)).status, 404); record = null;
  const cep = await request('/cep/01001000', { authenticated: false });
  assert.equal(cep.status, 200, JSON.stringify(cep.data)); assert.equal(cep.data.city, 'São Paulo');
  console.log(JSON.stringify({ base, authentication: 'passed', crud: 'passed', hiddenRecord: 'passed', staleUpdate: 'rejected', viaCep: 'passed' }));
} finally {
  if (record) await request(`/admin/content/faq/${record.id}`, { method: 'DELETE', body: { updated_at: record.updated_at } });
  await client.auth.signOut({ scope: 'local' });
}
