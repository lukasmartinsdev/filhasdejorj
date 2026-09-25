import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { supabase } from '../lib/supabase';
import '../styles/admin.css';

export default function AdminAccess({ children }) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let active = true, revision = 0;
    async function verify() {
      const current = ++revision;
      try { await adminApi('/session'); if (active && current === revision) setStatus('allowed'); }
      catch { if (active && current === revision) setStatus('denied'); }
    }
    verify();
    const subscription = supabase?.auth.onAuthStateChange(() => { setTimeout(() => { if (active) verify(); }, 0); }).data.subscription;
    return () => { active = false; subscription?.unsubscribe(); };
  }, []);
  if (status === 'loading') return <p className="loading" role="status">Verificando acesso…</p>;
  if (status !== 'allowed') return <div className="admin-login-page"><div className="login-card"><h1>Acesso administrativo</h1><p>Entre com sua conta administrativa para acessar esta área.</p><a className="button" href="/admin">Entrar no painel</a></div></div>;
  return children;
}
