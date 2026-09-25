import { demoCatalog, exampleParticipant, quoteOrder, validateDraft, paymentNames } from './catalog.js';

const KEY = 'filhasdejorj:event-demo:v2';
const capacities = { evento: 200, duplo: 8, triplo: 6, quadruplo: 4, quintuplo: 3, 'coletivo-feminino': 20, 'coletivo-masculino': 20 };
export const statusNames = { pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada', expired: 'Expirada', refunded: 'Estornada' };
export const paymentStatusNames = { pending: 'Aguardando pagamento', declined: 'Recusado', approved: 'Aprovado', cancelled: 'Cancelado', expired: 'Expirado', refunded: 'Estornado' };
const uuid = () => crypto.randomUUID();
const timestamp = () => new Date().toISOString();
const publicAccount = account => account && ({ id: account.id, name: account.name, email: account.email, role: account.role });
async function hashCode(code, salt) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${code}`));
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
}

// This store is an openly accessible simulator, never an authentication or inventory backend.
export function createDemoService(storage) {
  let state = { orders: [], accounts: [], sessionId: null };
  try { const saved = JSON.parse(storage?.getItem(KEY) || 'null'); if (Array.isArray(saved?.orders) && Array.isArray(saved?.accounts)) state = saved; } catch { /* Use the in-memory simulator. */ }
  const save = () => { try { storage?.setItem(KEY, JSON.stringify(state)); } catch { /* Keep current-page state when storage is blocked. */ } };
  const account = () => state.sessionId === 'demo-admin' ? { id: 'demo-admin', name: 'Organização de demonstração', email: 'admin@example.invalid', role: 'admin' } : state.accounts.find(x => x.id === state.sessionId) || null;
  const admin = () => { if (account()?.role !== 'admin') throw new Error('Abra o painel demonstrativo para usar esta ação.'); };
  const orderAt = reference => { const order = state.orders.find(x => x.id === reference.trim().toUpperCase()); if (!order) throw new Error('Não encontramos esse teste nesta aba. Use o código TESTE recebido ao finalizar.'); return order; };
  const event = (order, label) => { order.updatedAt = timestamp(); order.history.push({ id: uuid(), at: order.updatedAt, label, actor: account()?.role === 'admin' ? 'Organização de teste' : 'Participante de teste' }); };
  const inventory = () => demoCatalog.accommodations.map(option => {
    const relevant = state.orders.filter(x => x.accommodationId === option.id && ['pending', 'confirmed'].includes(x.status));
    const units = x => option.id === 'evento' ? x.participantCount : 1;
    const occupied = relevant.filter(x => x.status === 'confirmed').reduce((n, x) => n + units(x), 0);
    const held = relevant.filter(x => x.status === 'pending').reduce((n, x) => n + units(x), 0);
    return { ...option, capacity: capacities[option.id], occupied, held, available: capacities[option.id] - occupied - held, unit: option.occupants > 1 ? 'quartos' : 'vagas' };
  });
  const createOrder = async (draft, requestId) => {
    if (Object.keys(validateDraft(demoCatalog, draft)).length) throw new Error('Revise os dados antes de continuar.');
    const existing = state.orders.find(x => x.requestId === requestId);
    if (existing) return structuredClone(existing);
    const room = inventory().find(x => x.id === draft.accommodationId);
    if (room.available < (room.id === 'evento' ? draft.participants.length : 1)) throw new Error('Essa opção esgotou no teste. Escolha outra acomodação.');
    if (state.orders.length >= 200) throw new Error('Limite de 200 pedidos por sessão de teste atingido.');
    const quote = quoteOrder(demoCatalog, draft);
    const order = { id: `TESTE-${uuid().slice(0, 8).toUpperCase()}`, requestId, mode: 'demo', status: 'pending', paymentStatus: 'pending', createdAt: timestamp(), eventName: demoCatalog.name, accommodationId: room.id, accommodation: room.label, lot: demoCatalog.lots.find(x => x.id === draft.lotId).label, participantCount: draft.participants.length, totalCents: quote.totalCents, paymentMethod: draft.paymentMethod, paymentLabel: paymentNames[draft.paymentMethod], installments: draft.installments, lines: quote.lines, accountId: account()?.id || null, source: account()?.role === 'admin' ? 'Cadastro administrativo' : 'Site', history: [], participants: draft.participants.map((person, index) => ({ id: uuid(), name: person.name.slice(0, 100), category: quote.lines[index].label, shirt: person.shirt, bethel: person.bethel.slice(0, 100), checkedIn: false })) };
    event(order, 'Pedido de teste criado; disponibilidade simulada separada.');
    state.orders.push(order); save(); return structuredClone(order);
  };
  const setDemoStatus = async (reference, status) => {
    const order = orderAt(reference);
    const allowed = order.status === 'pending' ? ['confirmed', 'cancelled', 'declined', 'expired'] : order.status === 'confirmed' ? ['refunded'] : [];
    if (!allowed.includes(status)) throw new Error('Este teste já foi finalizado ou a alteração é inválida.');
    if (['refunded', 'expired'].includes(status)) admin();
    if (status !== 'declined') order.status = status;
    order.paymentStatus = { confirmed: 'approved', cancelled: 'cancelled', declined: 'declined', expired: 'expired', refunded: 'refunded' }[status];
    if (status === 'refunded') order.participants.forEach(person => { person.checkedIn = false; });
    event(order, { confirmed: 'Pagamento aprovado na simulação; reserva de teste confirmada.', cancelled: 'Pedido cancelado; disponibilidade de teste liberada.', declined: 'Pagamento recusado na simulação; nova tentativa disponível.', expired: 'Prazo expirado na simulação; disponibilidade de teste liberada.', refunded: 'Estorno simulado; disponibilidade de teste liberada.' }[status]);
    save(); return structuredClone(order);
  };
  return {
    mode: 'demo', catalog: async () => demoCatalog, createOrder, setDemoStatus,
    getOrder: async reference => structuredClone(orderAt(reference)),
    recentOrders: async () => structuredClone(state.orders.filter(x => !account() || account().role === 'admin' || x.accountId === account().id).slice().reverse()),
    currentAccount: async () => publicAccount(account()),
    async createAccount({ name, email, code }) {
      const normalized = email.trim().toLowerCase();
      if (name.trim().length < 3 || !/^[a-z0-9._+-]+@example\.invalid$/.test(normalized) || !/^\d{6}$/.test(code)) throw new Error('Use nome fictício, e-mail terminado em @example.invalid e código de teste de 6 dígitos.');
      if (state.accounts.some(x => x.email === normalized)) throw new Error('Esse e-mail de teste já está cadastrado. Use Entrar.');
      const salt = uuid(), codeHash = await hashCode(code, salt);
      // Recheck after the asynchronous hash to prevent duplicate concurrent submissions.
      if (state.accounts.some(x => x.email === normalized)) throw new Error('Esse e-mail de teste já está cadastrado.');
      const created = { id: uuid(), name: name.trim().slice(0, 100), email: normalized, salt, codeHash, role: 'participant', createdAt: timestamp() };
      state.accounts.push(created); state.sessionId = created.id; save(); return publicAccount(created);
    },
    async login({ email, code }) {
      const found = state.accounts.find(x => x.email === email.trim().toLowerCase());
      if (!found || found.codeHash !== await hashCode(code, found.salt)) throw new Error('E-mail ou código de teste incorreto.');
      state.sessionId = found.id; save(); return publicAccount(found);
    },
    async logout() { state.sessionId = null; save(); },
    async enterDemoAdmin() { state.sessionId = 'demo-admin'; save(); return publicAccount(account()); },
    async listOrders() { admin(); return structuredClone(state.orders.slice().reverse()); },
    async listAccounts() { admin(); return state.accounts.map(x => ({ ...publicAccount(x), createdAt: x.createdAt, orders: state.orders.filter(order => order.accountId === x.id).length })); },
    async inventory() { admin(); return inventory(); },
    async setCheckIn(reference, participantId, checkedIn) {
      admin(); const order = orderAt(reference);
      if (order.status !== 'confirmed') throw new Error('Confirme o pagamento de teste antes de registrar presença.');
      const person = order.participants.find(x => x.id === participantId);
      if (!person) throw new Error('Participante não encontrado.');
      if (person.checkedIn !== checkedIn) { person.checkedIn = checkedIn; event(order, `${checkedIn ? 'Presença registrada' : 'Presença desfeita'}: ${person.name}.`); save(); }
      return structuredClone(order);
    },
    async changePayment(reference, method, installments = 1) {
      const order = orderAt(reference);
      if (order.status !== 'pending' || !demoCatalog.paymentMethods.includes(method) || !Number.isInteger(installments) || installments < 1 || installments > 10 || (method !== 'card' && installments !== 1)) throw new Error('Não é possível alterar essa forma de pagamento.');
      order.paymentMethod = method; order.paymentLabel = paymentNames[method]; order.installments = installments; order.paymentStatus = 'pending';
      event(order, `Pagamento de teste alterado para ${order.paymentLabel}${method === 'card' ? `, ${installments}x` : ''}.`); save(); return structuredClone(order);
    },
    async loadExamples() {
      admin();
      for (const [index, method] of ['pix', 'boleto', 'card'].entries()) {
        const requestId = `admin-example-${index}`;
        if (state.orders.some(x => x.requestId === requestId)) continue;
        const draft = { eventId: demoCatalog.id, catalogRevision: demoCatalog.revision, accommodationId: ['evento', 'duplo', 'triplo'][index], lotId: 'primeiro', participants: Array.from({ length: index + 1 }, (_, i) => exampleParticipant(i)), paymentMethod: method, installments: method === 'card' ? 3 : 1, consent: true, marketingConsent: false };
        const order = await createOrder(draft, requestId);
        if (index === 1) await setDemoStatus(order.id, 'confirmed');
        if (index === 2) await setDemoStatus(order.id, 'declined');
      }
    }
  };
}

export function ordersCsv(orders) {
  const cell = value => { let text = String(value ?? ''); if (/^[=+@\-\t\r\n]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
  const rows = [['Código', 'Reserva', 'Pagamento', 'Método', 'Participantes', 'Acomodação', 'Total BRL', 'Presenças'], ...orders.map(x => [x.id, statusNames[x.status], paymentStatusNames[x.paymentStatus], x.paymentLabel, x.participantCount, x.accommodation, (x.totalCents / 100).toFixed(2), x.participants.filter(p => p.checkedIn).length])];
  return '\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n');
}
