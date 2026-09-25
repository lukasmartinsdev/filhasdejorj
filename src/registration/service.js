import { createDemoService } from './demoService.js';
export { createDemoService } from './demoService.js';

export function createApiService(baseUrl, fetcher = fetch) {
  const base = baseUrl.replace(/\/$/, '');
  if (!base.startsWith('/') && !base.startsWith('https://')) throw new Error('Configure uma URL HTTPS ou uma rota local para a API.');
  if (base.startsWith('//')) throw new Error('URL de API inválida.');
  async function request(path, options = {}) {
    const response = await fetcher(`${base}${path}`, { credentials: 'same-origin', signal: AbortSignal.timeout(15000), ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
    if (!response.ok) throw new Error(response.status === 401 ? 'Entre na sua conta para consultar a inscrição.' : 'A inscrição está indisponível agora. Tente novamente.');
    return response.json();
  }
  return {
    mode: 'api',
    catalog: () => request('/catalog'),
    async createOrder(draft, requestId) {
      const payload = { eventId: draft.eventId, catalogRevision: draft.catalogRevision, accommodationId: draft.accommodationId, lotId: draft.lotId, participants: draft.participants.map((person, index) => index > 0 && person.sameAddress ? { ...person, ...Object.fromEntries(['cep', 'street', 'number', 'complement', 'district', 'city', 'state'].map(key => [key, draft.participants[0][key]])) } : person), paymentMethod: draft.paymentMethod, installments: draft.installments, consent: draft.consent, marketingConsent: draft.marketingConsent };
      return request('/orders', { method: 'POST', headers: { 'Idempotency-Key': requestId }, body: JSON.stringify(payload) });
    },
    getOrder: reference => request(`/orders/${encodeURIComponent(reference.trim())}`),
    recentOrders: async () => []
  };
}

let session;
try { session = globalThis.sessionStorage; } catch { /* Storage may be disabled. */ }
const settings = import.meta.env || {};
export const registrationService = settings.VITE_REGISTRATION_MODE === 'api'
  ? createApiService(settings.VITE_REGISTRATION_API_URL || '/api/registrations')
  : createDemoService(session);

