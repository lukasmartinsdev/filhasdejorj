import { createClient } from '@supabase/supabase-js';
import { editors } from '../src/admin/schema.js';

export const contentTables = [...Object.keys(editors), 'sections'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const bodyLimit = 128 * 1024;
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new HttpError(status, message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const identifier = value => { if (!uuid.test(value || '')) fail(400, 'Identificador inválido.'); return value; };
function reply(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, 'Envie os dados como JSON.');
  if (Number(req.headers['content-length']) > bodyLimit) fail(413, 'Conteúdo muito grande.');
  let value = req.body;
  if (value === undefined) {
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += Buffer.byteLength(chunk);
      if (size > bodyLimit) fail(413, 'Conteúdo muito grande.');
      chunks.push(Buffer.from(chunk));
    }
    value = Buffer.concat(chunks).toString('utf8');
  }
  if (Buffer.isBuffer(value)) value = value.toString('utf8');
  if (typeof value === 'string') {
    if (Buffer.byteLength(value) > bodyLimit) fail(413, 'Conteúdo muito grande.');
    try { value = JSON.parse(value); } catch { fail(400, 'JSON inválido.'); }
  }
  if (!object(value)) fail(400, 'Informe um objeto JSON.');
  if (Buffer.byteLength(JSON.stringify(value)) > bodyLimit) fail(413, 'Conteúdo muito grande.');
  return value;
}
function validateRecord(table, body, updating) {
  const allowed = table === 'sections' ? ['title', 'active', 'updated_at'] : ['data', 'active', 'sort_order', 'updated_at'];
  if (Object.keys(body).some(key => !allowed.includes(key))) fail(400, 'Campo não permitido.');
  const value = {};
  if (updating && (typeof body.updated_at !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(body.updated_at) || !Number.isFinite(Date.parse(body.updated_at)))) fail(400, 'Informe a versão do registro.');
  if ('active' in body) {
    if (typeof body.active !== 'boolean') fail(400, 'O campo ativo deve ser verdadeiro ou falso.');
    value.active = body.active;
  }
  if ('sort_order' in body) {
    if (!Number.isInteger(body.sort_order) || Math.abs(body.sort_order) > 100000) fail(400, 'Ordem inválida.');
    value.sort_order = body.sort_order;
  }
  if (table === 'sections') {
    if ('title' in body) {
      if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 120) fail(400, 'Título inválido.');
      value.title = body.title.trim();
    }
  } else if ('data' in body) {
    if (!object(body.data)) fail(400, 'Conteúdo inválido.');
    const fields = new Map(editors[table].fields.map(field => [field.key, field]));
    for (const [key, item] of Object.entries(body.data)) {
      const field = fields.get(key);
      if (!field) fail(400, 'Campo de conteúdo não permitido.');
      if (field.type === 'checkbox') { if (typeof item !== 'boolean') fail(400, 'Valor booleano inválido.'); }
      else if (field.type === 'number') { if (item !== null && (typeof item !== 'number' || !Number.isFinite(item) || item < 0)) fail(400, 'Número inválido.'); }
      else if (['timeline', 'bethels'].includes(field.type)) {
        if (!Array.isArray(item) || item.length > 100 || item.some(row => !object(row) || Object.values(row).some(v => typeof v !== 'string' || v.length > 10000))) fail(400, 'Lista de conteúdo inválida.');
      } else if (typeof item !== 'string' || item.length > 20000) fail(400, 'Texto inválido ou muito longo.');
    }
    if (!Object.keys(body.data).length) fail(400, 'Preencha o conteúdo do registro.');
    value.data = body.data;
  } else if (!updating) fail(400, 'Informe o conteúdo do registro.');
  if (!Object.keys(value).length) fail(400, 'Nenhuma alteração informada.');
  return value;
}
function databaseResult(result) {
  if (result.error) {
    if (result.error.code === '42501') fail(403, 'Você não tem permissão para esta operação.');
    if (result.error.code === '23505') fail(409, 'Este registro já existe.');
    fail(502, 'Não foi possível acessar os dados. Tente novamente.');
  }
  return result.data;
}

export function createApiHandler({ env = process.env, makeClient = createClient, fetcher = fetch } = {}) {
  const cepCache = new Map();
  function client(token) {
    const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const key = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) fail(503, 'A API ainda não está configurada.');
    return makeClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    });
  }
  async function admin(req) {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
    if (!match) fail(401, 'Entre no painel para continuar.');
    const db = client(match[1]);
    const { data, error } = await db.auth.getUser(match[1]);
    if (error || !data?.user) fail(401, 'Sua sessão expirou. Entre novamente.');
    const profile = await db.from('admin_profiles').select('id,active,role').eq('id', data.user.id).eq('active', true).eq('role', 'admin').maybeSingle();
    if (profile.error) fail(503, 'Não foi possível verificar seu acesso.');
    if (!profile.data) fail(403, 'Acesso exclusivo para administradores autorizados.');
    return { db, user: data.user };
  }
  async function allContent(db, isAdmin) {
    const entries = await Promise.all(contentTables.map(async table => {
      let query = db.from(table).select('*').order('sort_order');
      if (!isAdmin) query = query.eq('active', true);
      return [table, databaseResult(await query)];
    }));
    return Object.fromEntries(entries);
  }
  async function cepLookup(cep) {
    if (!/^\d{8}$/.test(cep)) fail(400, 'Informe um CEP com 8 dígitos.');
    const cached = cepCache.get(cep);
    if (cached?.expires > Date.now()) return cached.value;
    let data;
    try {
      const response = await fetcher(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('ViaCEP indisponível');
      data = await response.json();
    } catch { fail(502, 'Não foi possível consultar o CEP. Você pode preencher o endereço manualmente.'); }
    if (data.erro) fail(404, 'CEP não encontrado. Confira os números ou preencha o endereço manualmente.');
    if (typeof data.localidade !== 'string' || !/^[A-Z]{2}$/.test(data.uf)) fail(502, 'A consulta retornou um endereço inválido.');
    const value = { cep: data.cep, street: data.logradouro || '', district: data.bairro || '', city: data.localidade, state: data.uf };
    if (cepCache.size >= 128) cepCache.delete(cepCache.keys().next().value);
    cepCache.set(cep, { value, expires: Date.now() + 86400000 });
    return value;
  }
  return async function handler(req, res) {
    try {
      const path = new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '');
      const method = req.method || 'GET';
      if (method === 'GET' && path === '/api/health') return reply(res, 200, { status: 'ok', name: 'Filhas de Jó RJ API', version: 1 });
      if (method === 'GET' && path === '/api/content') return reply(res, 200, await allContent(client(), false));
      if (method === 'GET' && path.startsWith('/api/cep/')) return reply(res, 200, await cepLookup(path.slice('/api/cep/'.length)));
      if (!path.startsWith('/api/admin/')) fail(404, 'Rota não encontrada.');
      const { db, user } = await admin(req);
      if (method === 'GET' && path === '/api/admin/session') return reply(res, 200, { id: user.id, allowed: true });
      if (method === 'GET' && path === '/api/admin/content') return reply(res, 200, await allContent(db, true));
      if (method === 'GET' && /^\/api\/admin\/inbox\/(contact|interest)$/.test(path)) {
        const table = path.endsWith('/interest') ? 'event_interest' : 'contact_messages';
        return reply(res, 200, databaseResult(await db.from(table).select('*').order('created_at', { ascending: false }).limit(300)));
      }
      if (method === 'POST' && path === '/api/admin/sections/swap') {
        const body = await readBody(req);
        databaseResult(await db.rpc('swap_sections', { p_first: identifier(body.first), p_second: identifier(body.second) }));
        return reply(res, 200, { updated: true });
      }
      const route = /^\/api\/admin\/content\/([a-z_]+)(?:\/([^/]+))?$/.exec(path);
      if (!route || !contentTables.includes(route[1])) fail(404, 'Recurso não encontrado.');
      const [, table, id] = route;
      if (id) identifier(id);
      if (method === 'GET') {
        const query = db.from(table).select('*');
        const result = databaseResult(await (id ? query.eq('id', id).maybeSingle() : query.order('sort_order')));
        if (id && !result) fail(404, 'Registro não encontrado.');
        return reply(res, 200, result);
      }
      if (method === 'POST' && !id && table !== 'sections') {
        const record = validateRecord(table, await readBody(req), false);
        if (editors[table].single) fail(405, 'Edite o registro existente desta seção.');
        return reply(res, 201, databaseResult(await db.from(table).insert(record).select().single()));
      }
      if (method === 'PATCH' && id) {
        const body = await readBody(req);
        const record = validateRecord(table, body, true);
        const data = databaseResult(await db.from(table).update(record).eq('id', id).eq('updated_at', body.updated_at).select().maybeSingle());
        if (!data) fail(409, 'O conteúdo foi alterado ou removido. Recarregue antes de salvar.');
        return reply(res, 200, data);
      }
      if (method === 'DELETE' && id && table !== 'sections' && !editors[table].single) {
        const body = await readBody(req);
        if (typeof body.updated_at !== 'string' || !Number.isFinite(Date.parse(body.updated_at))) fail(400, 'Informe a versão do registro.');
        const data = databaseResult(await db.from(table).delete().eq('id', id).eq('updated_at', body.updated_at).select('id').maybeSingle());
        if (!data) fail(409, 'O conteúdo foi alterado ou removido. Recarregue antes de excluir.');
        return reply(res, 200, { deleted: true, id: data.id });
      }
      fail(405, 'Operação não permitida para este recurso.');
    } catch (error) {
      reply(res, error instanceof HttpError ? error.status : 500, { error: error instanceof HttpError ? error.message : 'Não foi possível concluir a operação.' });
    }
  };
}
