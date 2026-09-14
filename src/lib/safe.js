export function safeUrl(value, fallback = '') {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const url = value.trim();
  if (/^\/(?!\/)/.test(url) || /^#[a-z0-9_-]+$/i.test(url)) return url;
  try { const parsed = new URL(url); return ['http:','https:'].includes(parsed.protocol) ? url : fallback; } catch { return fallback; }
}
export function money(value) { return value === null || value === '' || value === undefined ? 'Valores em breve' : new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)); }
export function eventDate(value) { return value ? new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Sao_Paulo'}).format(new Date(value.length === 10 ? `${value}T12:00:00-03:00` : value)) : 'Data a definir'; }
