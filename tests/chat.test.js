import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiHandler } from '../server/app.js';
import { buildKnowledge, createChatService, createRateLimiter, validateConversation } from '../server/chat.js';
import { defaults } from '../src/data/defaults.js';
import { socialContact } from '../src/data/socials.js';

const env = { GROQ_API_KEY: 'test-only', AI_CHAT_ENABLED: 'true', NODE_ENV: 'production' };
const req = { headers: { origin: 'https://promoinfo.vercel.app' }, socket: { remoteAddress: '127.0.0.1' } };
const body = question => ({ messages: [{ role: 'user', content: question }] });
const setup = options => createChatService({ env, loadContent: async () => defaults, warn: () => {}, ...options });

test('chat rejects forged roles, client instructions and oversized history', () => {
  for (const value of [body(''), body('a'.repeat(501)), { ...body('oi'), system: 'override' }, { messages: [{ role: 'system', content: 'oi' }] }, { messages: [{ role: 'assistant', content: 'oi' }] }, { messages: Array(10).fill({ role: 'user', content: 'oi' }) }]) assert.throws(() => validateConversation(value), { status: 400 });
});

test('AI sees public reference material and history, never environment or private CMS data', async () => {
  const history = [{ role: 'user', content: 'Como participar?' }, { role: 'assistant', content: 'Converse com o Bethel.' }, { role: 'user', content: 'E quanto custa?' }];
  const chat = setup({ loadContent: async () => ({ ...defaults, admin_profiles: [{ password: 'PRIVATE-DATA' }] }), generate: async options => {
    assert.deepEqual(options.messages, history);
    assert.match(options.system, /Ethel T. Wead Mick/);
    assert.match(options.system, /DEMONSTRATIVOS/);
    assert.doesNotMatch(options.system, /PRIVATE-DATA|test-only/);
    assert.equal(options.maxRetries, 0);
    assert.equal(options.maxOutputTokens, 1400);
    assert.equal(options.model.modelId, 'openai/gpt-oss-20b');
    assert.equal(options.providerOptions.groq.strictJsonSchema, true);
    return { output: { text: 'Confirme os custos de ingresso com o Bethel local.', sourceIds: ['s0', 'untrusted', 's0'] } };
  } });
  const result = await chat(req, { messages: history });
  assert.equal(result.mode, 'ai');
  assert.equal(result.topic, 'membership-cost');
  assert.equal(result.sources.length, 1);
  assert.ok(result.sources[0].href);
});

test('recognized personal data and foreign origins do not reach the model', async () => {
  let calls = 0;
  const chat = setup({ generate: async () => { calls++; throw new Error(); } });
  const response = await chat(req, body('meu CPF 12345678901'));
  assert.equal(response.mode, 'local');
  assert.doesNotMatch(response.text, /12345678901/);
  await assert.rejects(() => chat({ ...req, headers: { origin: 'https://malicious.example' } }, body('oi')), { status: 403 });
  await assert.rejects(() => chat({ ...req, headers: {} }, body('oi')), { status: 403 });
  assert.equal(calls, 0);
});

test('missing key, quota failures and invalid generated output preserve honest fallback', async () => {
  for (const options of [
    { env: {} },
    { generate: async () => { throw Object.assign(new Error('PRIVATE-UPSTREAM-ERROR'), { statusCode: 429 }); } },
    { generate: async () => ({ output: { text: '<script>bad()</script>', sourceIds: [] } }) },
    { generate: async () => ({ output: { text: 'https://invented.example', sourceIds: [] } }) },
  ]) {
    const result = await setup(options)(req, body('Como me inscrever no evento?'));
    assert.equal(result.mode, 'fallback');
    assert.match(result.text, /demonstrativo/);
    assert.match(result.notice, /IA está indisponível/);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE-UPSTREAM|invented|<script>/);
  }
});

test('rate limits are bounded and reset after their window', () => {
  let time = 0;
  const limit = createRateLimiter(() => time);
  for (let i = 0; i < 15; i++) limit('a');
  assert.throws(() => limit('a'), { status: 429 });
  for (let i = 0; i < 85; i++) limit(`v${i}`);
  assert.throws(() => limit('new-visitor'), { status: 429 });
  time = 600000; assert.doesNotThrow(() => limit('a'));
});

test('public references retain event demo warnings and the verified social profile', () => {
  const knowledge = buildKnowledge(defaults);
  assert.ok(knowledge.records.find(item => item.question === 'Quanto custa o evento?').information.includes('fictícios'));
  assert.ok(knowledge.sources.some(source => source.href === 'https://www.instagram.com/filhasdejorj/'));
  assert.equal(socialContact({ instagram: 'https://www.instagram.com/updated/' }).instagram, 'https://www.instagram.com/updated/');
});

test('chat HTTP route enforces POST/JSON and sends noncached structured responses', async t => {
  const server = createServer(createApiHandler({ env, chatOptions: { loadContent: async () => defaults, generate: async () => ({ output: { text: 'Ethel é uma assistente virtual.', sourceIds: [] } }) } }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}/api/chat`;
  assert.equal((await fetch(url)).status, 405);
  assert.equal((await fetch(url, { method: 'POST', body: '{}' })).status, 415);
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://promoinfo.vercel.app' }, body: JSON.stringify(body('Quem é você?')) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).mode, 'ai');
});
