import test from 'node:test';
import assert from 'node:assert/strict';
import { demoCatalog, exampleParticipant, quoteOrder, validateDraft, ageAt } from '../src/registration/catalog.js';
import { createDemoService, createApiService } from '../src/registration/service.js';

const draft = () => ({ eventId: demoCatalog.id, catalogRevision: demoCatalog.revision, accommodationId: 'duplo', lotId: 'primeiro', participants: [exampleParticipant(0), exampleParticipant(1)], paymentMethod: 'pix', installments: 1, consent: true, marketingConsent: false });
const memoryStorage = () => { const values = new Map(); return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), values }; };

test('event takes place on Saturday and schedule is one day', () => {
  assert.equal(new Date(demoCatalog.date + 'T12:00:00Z').getUTCDay(), 6);
  assert.deepEqual(demoCatalog.schedule.map(x => x.time), ['08:00', '09:30', '10:30', '12:00', '13:30', '17:00', '18:00']);
});
test('quotes use integer cents for every participant and lot', () => {
  const value = draft(); value.participants[1].categoryId = 'convidado'; value.lotId = 'segundo';
  assert.equal(quoteOrder(demoCatalog, value).totalCents, 41000);
  value.participants[1].categoryId = '';
  assert.equal(quoteOrder(demoCatalog, value).complete, false);
});
test('room occupancy, duplicate identifiers and consent are enforced', () => {
  assert.deepEqual(validateDraft(demoCatalog, draft()), {});
  const value = draft(); value.participants[1].cpf = value.participants[0].cpf; value.consent = false;
  assert.ok(validateDraft(demoCatalog, value)['participants.1.cpf']);
  assert.ok(validateDraft(demoCatalog, value).consent);
  value.participants.pop(); assert.ok(validateDraft(demoCatalog, value).participants);
});
test('age validation handles calendar boundaries, minors and collective rooms', () => {
  assert.equal(ageAt('2009-01-24', '2027-01-23'), 17);
  assert.equal(ageAt('2009-01-23', '2027-01-23'), 18);
  assert.equal(ageAt('2020-02-31', '2027-01-23'), null);
  const value = draft(); value.participants[0].birthDate = '2015-02-01';
  assert.ok(validateDraft(demoCatalog, value)['participants.0.guardianName']);
  value.accommodationId = 'coletivo-feminino'; value.participants.length = 1;
  assert.ok(validateDraft(demoCatalog, value)['participants.0.birthDate']);
});
test('same address inherits only from first participant and card limits are checked', () => {
  const value = draft(); value.participants[1].sameAddress = true; value.participants[1].city = ''; value.participants[1].cep = '';
  assert.deepEqual(validateDraft(demoCatalog, value), {});
  value.installments = 3; assert.ok(validateDraft(demoCatalog, value).installments);
  value.paymentMethod = 'card'; assert.deepEqual(validateDraft(demoCatalog, value), {});
  value.installments = 11; assert.ok(validateDraft(demoCatalog, value).installments);
});
test('demo receipts are idempotent and discard sensitive registration fields', async () => {
  const storage = memoryStorage(), service = createDemoService(storage), value = draft();
  const order = await service.createOrder(value, 'same-request');
  assert.equal((await service.createOrder(value, 'same-request')).id, order.id);
  assert.equal((await service.recentOrders()).length, 1);
  const persisted = [...storage.values.values()].join('');
  for (const field of ['cpf', 'phone', 'email', 'street', 'guardianName', 'supportDetails']) {
    assert.equal(persisted.includes(`"${field}":`), false);
  }
  assert.equal(persisted.includes(value.participants[0].email), false);
  assert.equal((await createDemoService(storage).getOrder(order.id)).status, 'pending');
});
test('confirmation and cancellation are terminal and remain visible to tracking', async () => {
  const service = createDemoService(memoryStorage());
  const order = await service.createOrder(draft(), 'a');
  assert.equal((await service.setDemoStatus(order.id, 'confirmed')).status, 'confirmed');
  assert.equal((await service.getOrder(order.id)).status, 'confirmed');
  await assert.rejects(service.setDemoStatus(order.id, 'cancelled'));
  await assert.rejects(service.getOrder('TESTE-DOESNOTEXIST'));
});
test('blocked browser storage still allows the in-memory demo to work', async () => {
  const service = createDemoService({ getItem: () => null, setItem: () => { throw new Error('quota'); } });
  const order = await service.createOrder(draft(), 'quota');
  assert.equal((await service.getOrder(order.id)).id, order.id);
});
test('API adapter expands shared address and never trusts client totals', async () => {
  const calls = [], service = createApiService('/api/registrations', async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ id: 'server-order', totalCents: 42000 }) }; });
  const value = draft(); value.participants[1].sameAddress = true; value.participants[1].city = ''; value.totalCents = 1;
  const result = await service.createOrder(value, 'request-123');
  assert.equal(result.totalCents, 42000);
  assert.equal(calls[0].url, '/api/registrations/orders');
  assert.equal(calls[0].options.headers['Idempotency-Key'], 'request-123');
  const body = JSON.parse(calls[0].options.body);
  assert.equal('totalCents' in body, false);
  assert.equal(body.participants[1].city, value.participants[0].city);
});
test('API errors never fall back to a simulated successful order', async () => {
  const api = createApiService('/api/registrations', async () => ({ ok: false, status: 503 }));
  await assert.rejects(api.createOrder(draft(), 'failure'), /indisponível/);
  const privateApi = createApiService('/api/registrations', async () => ({ ok: false, status: 401 }));
  await assert.rejects(privateApi.getOrder('ABC'), /Entre na sua conta/);
  assert.throws(() => createApiService('//other.example'), /inválida/);
});

