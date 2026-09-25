import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoService, ordersCsv } from '../src/registration/demoService.js';
import { demoCatalog, exampleParticipant } from '../src/registration/catalog.js';
const storage = () => { const values = new Map(); return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), values }; };
const draft = () => ({ eventId: demoCatalog.id, catalogRevision: demoCatalog.revision, accommodationId: 'duplo', lotId: 'primeiro', participants: [exampleParticipant(0), exampleParticipant(1)], paymentMethod: 'pix', installments: 1, consent: true });

test('demo registration, login and account ownership survive navigation without storing access code', async () => {
  const store = storage(), service = createDemoService(store);
  const form = { name: 'Pessoa Exemplo', email: 'pessoa@example.invalid', code: '123456' };
  const account = await service.createAccount(form);
  await assert.rejects(service.createAccount(form), /cadastrado/);
  await assert.rejects(service.createAccount({ ...form, email: 'real@example.com' }), /example.invalid/);
  const order = await service.createOrder(draft(), 'account-order');
  assert.equal(order.accountId, account.id);
  assert.equal((await createDemoService(store).currentAccount()).id, account.id);
  await service.logout();
  await assert.rejects(service.login({ ...form, code: '000000' }), /incorreto/);
  assert.equal((await service.login(form)).id, account.id);
  assert.equal((await service.recentOrders()).length, 1);
  await service.createAccount({ ...form, email: 'outra@example.invalid' });
  assert.equal((await service.recentOrders()).length, 0);
  assert.equal([...store.values.values()].join('').includes('123456'), false);
});

test('payment refusal can be retried, method changed, and approval becomes terminal', async () => {
  const service = createDemoService(storage()), order = await service.createOrder(draft(), 'retry');
  const declined = await service.setDemoStatus(order.id, 'declined');
  assert.equal(declined.status, 'pending'); assert.equal(declined.paymentStatus, 'declined');
  await assert.rejects(service.changePayment(order.id, 'pix', 3));
  const card = await service.changePayment(order.id, 'card', 4);
  assert.equal(card.installments, 4); assert.equal(card.paymentStatus, 'pending');
  const approved = await service.setDemoStatus(order.id, 'confirmed');
  assert.equal(approved.paymentStatus, 'approved'); assert.equal(approved.history.length, 4);
  await assert.rejects(service.changePayment(order.id, 'boleto'));
  await assert.rejects(service.setDemoStatus(order.id, 'declined'));
});

test('demo inventory handles exhaustion, idempotency, cancellation, expiration and refund', async () => {
  const service = createDemoService(storage()); await service.enterDemoAdmin();
  const orders = [];
  for (let i = 0; i < 8; i++) orders.push(await service.createOrder(draft(), `room-${i}`));
  const room = async () => (await service.inventory()).find(x => x.id === 'duplo');
  assert.equal((await room()).available, 0);
  await assert.rejects(service.createOrder(draft(), 'extra'), /esgotou/);
  assert.equal((await service.createOrder(draft(), 'room-0')).id, orders[0].id);
  await service.setDemoStatus(orders[0].id, 'cancelled');
  await service.setDemoStatus(orders[1].id, 'expired');
  await service.setDemoStatus(orders[2].id, 'confirmed');
  assert.equal((await room()).occupied, 1); assert.equal((await room()).available, 2);
  await service.setDemoStatus(orders[2].id, 'refunded');
  assert.equal((await room()).available, 3); assert.equal((await room()).occupied, 0);
  await assert.rejects(service.setDemoStatus(orders[2].id, 'confirmed'));
});

test('admin demonstration actions require opening the demo panel and check-in requires paid order', async () => {
  const service = createDemoService(storage()), order = await service.createOrder(draft(), 'check-in');
  await assert.rejects(service.listOrders()); await assert.rejects(service.listAccounts());
  await assert.rejects(service.setDemoStatus(order.id, 'expired'));
  await service.enterDemoAdmin();
  await assert.rejects(service.setCheckIn(order.id, order.participants[0].id, true), /Confirme/);
  await service.setDemoStatus(order.id, 'confirmed');
  assert.equal((await service.setCheckIn(order.id, order.participants[0].id, true)).participants[0].checkedIn, true);
  const refunded = await service.setDemoStatus(order.id, 'refunded');
  assert.equal(refunded.participants[0].checkedIn, false);
});

test('example reservations do not duplicate or reset changed payments', async () => {
  const service = createDemoService(storage()); await service.enterDemoAdmin();
  await service.loadExamples();
  const orders = await service.listOrders(); assert.equal(orders.length, 3);
  await service.setDemoStatus(orders.find(x => x.paymentMethod === 'pix').id, 'cancelled');
  await service.loadExamples(); assert.equal((await service.listOrders()).length, 3);
  assert.equal((await service.listOrders()).filter(x => x.status === 'cancelled').length, 1);
});

test('CSV export escapes formulas and quotes and includes only reservation summary', async () => {
  const service = createDemoService(storage()), order = await service.createOrder(draft(), 'export');
  order.accommodation = '=1+1;"test"';
  const csv = ordersCsv([order]);
  assert.ok(csv.includes('"\'=1+1;""test"""'));
  assert.equal(csv.includes(order.participants[0].name), false);
  assert.ok(csv.startsWith('\uFEFF'));
});
