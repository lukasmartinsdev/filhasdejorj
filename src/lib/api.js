import { supabase } from './supabase';

export async function apiRequest(path, { admin = false, method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (admin) {
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data?.session?.access_token;
    if (!token) throw new Error('Entre no painel para continuar.');
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`/api${path}`, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000)
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('A API não respondeu corretamente. Tente novamente.'); }
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}
export const adminApi = (path, options = {}) => apiRequest(`/admin${path}`, { ...options, admin: true });
