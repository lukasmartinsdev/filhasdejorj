import { useState } from 'react';
import { Button } from '../components/Shared';
import { registrationService as service } from './service';
import { currency, paymentNames } from './catalog';
import { statusNames, paymentStatusNames } from './demoService';

export function PaymentHistory({ order }) {
  return <details className="payment-history"><summary>Histórico do pedido ({order.history?.length || 0})</summary><ol>{order.history?.map(item => <li key={item.id}><strong>{item.label}</strong><small>{new Date(item.at).toLocaleString('pt-BR')} · {item.actor}</small></li>)}</ol></details>;
}

export default function PaymentPanel({ order, onUpdate }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [method, setMethod] = useState(order.paymentMethod), [installments, setInstallments] = useState(order.installments);
  async function act(action) { setBusy(true); setError(''); setNotice(''); try { onUpdate(await action()); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  const code = `SIMULACAO-${order.paymentMethod.toUpperCase()}-${order.id}-SEM-VALOR`;
  async function copy() { try { await navigator.clipboard.writeText(code); setNotice('Referência de teste copiada. Este código não pode ser pago.'); } catch { setNotice('Selecione e copie a referência de teste acima.'); } }
  return <div className="payment-simulator">
    <div className={`payment-state state-${order.paymentStatus}`}><span>Pagamento: <b>{paymentStatusNames[order.paymentStatus] || 'Pendente'}</b></span><span>Reserva: <b>{statusNames[order.status]}</b></span></div>
    {error && <p className="signup-alert" role="alert">{error}</p>}{notice && <p className="signup-hint" role="status">{notice}</p>}
    {order.status === 'pending' && <>
      <section className="demo-checkout"><span className="demo-tag">CHECKOUT DE TESTE</span><h2>{order.paymentLabel}</h2>
        {order.paymentMethod === 'card' ? <><div className="mock-card"><small>CARTÃO DE DEMONSTRAÇÃO</small><strong>•••• •••• •••• 0000</strong><span>PARTICIPANTE DE TESTE</span></div><p>{order.installments}x de aproximadamente {currency(Math.ceil(order.totalCents / order.installments))}. Use os controles abaixo para simular aprovação ou recusa. Nenhum cartão real é solicitado.</p></> : <><p>Referência de teste de {order.paymentMethod === 'pix' ? 'Pix' : 'boleto'}. Não realize pagamentos.</p><code className="demo-payment-code">{code}</code><button className="text-button" onClick={copy}>Copiar referência de teste</button></>}
        {order.paymentStatus === 'declined' && <p role="status" className="signup-alert">Pagamento recusado na simulação. Tente novamente ou escolha outra forma de pagamento.</p>}
        <div className="simulation-actions"><Button disabled={busy} onClick={() => act(() => service.setDemoStatus(order.id, 'confirmed'))}>{busy ? 'Processando…' : 'Simular pagamento aprovado'}</Button><button disabled={busy} onClick={() => act(() => service.setDemoStatus(order.id, 'declined'))}>Simular pagamento recusado</button><button disabled={busy} onClick={() => act(() => service.setDemoStatus(order.id, 'cancelled'))}>Cancelar este teste</button></div>
      </section>
      <details className="change-payment"><summary>Alterar forma de pagamento</summary><div className="payment-edit"><label>Forma de pagamento<select value={method} onChange={e => { setMethod(e.target.value); setInstallments(1); }}>{Object.entries(paymentNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>{method === 'card' && <label>Parcelas<select value={installments} onChange={e => setInstallments(Number(e.target.value))}>{Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>{i + 1}x</option>)}</select></label>}<Button disabled={busy} outline onClick={() => act(() => service.changePayment(order.id, method, installments))}>Atualizar pagamento</Button></div></details>
    </>}
    <PaymentHistory order={order}/>
  </div>;
}
