import { useContent } from '../hooks/useContent';
import Header from '../components/Header';
import { first } from '../data/defaults';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CalendarDays, MapPin, Users, BedDouble, Ticket, CreditCard, Landmark, FileText, FlaskConical, LoaderCircle, XCircle } from 'lucide-react';
import { Button } from '../components/Shared';
import { demoCatalog, currency, paymentNames, newParticipant, quoteOrder, validateDraft, exampleParticipant, ageAt } from './catalog';
import { registrationService as service } from './service';
import '../styles/registration.css';
import '../styles/reservations.css';
import PaymentPanel from './PaymentPanel';
import { statusNames } from './demoService';
import { apiRequest } from '../lib/api';

function useCatalog() {
  const [catalog, setCatalog] = useState(null), [error, setError] = useState('');
  useEffect(() => { let active = true; service.catalog().then(data => {
    if (!data?.id || !Array.isArray(data.categories) || !Array.isArray(data.accommodations) || !Array.isArray(data.lots) || !Array.isArray(data.shirts) || !Array.isArray(data.supportNeeds) || !Array.isArray(data.paymentMethods) || !Number.isInteger(data.maxInstallments) || !data.date) throw new Error('O catálogo de inscrições não está disponível.');
    if (active) setCatalog({ ...data, mode: service.mode });
  }).catch(() => { if (active) setError('Não foi possível carregar as inscrições. Tente novamente em alguns instantes.'); }); return () => { active = false; }; }, []);
  return { catalog, error };
}

export function Frame({ children, active, title }) {
  const content = useContent();
  useEffect(() => { document.title = `${title} — Filhas de Jó RJ`; }, [title]);
  return <div className="registration-shell">
    <a className="skip-link" href="#registration-main">Pular para o conteúdo</a>
    <div className="checkout-masthead"><Header site={first(content, 'site_settings')} sections={content.sections} contact={first(content, 'contact_info')} registration={first(content, 'registration_settings')} onModal={() => { location.href = '/#contato'; }}/></div><nav className="checkout-subnav" aria-label="Navegação do evento">{[['/evento','O evento','event'],['/inscricao','Inscrição','signup'],['/acompanhamento','Acompanhar','tracking'],['/conta','Minha conta','account']].map(([href,label,key])=><a key={href} href={href} aria-current={active===key?'page':undefined}>{label}</a>)}</nav>
    {service.mode === 'demo' && <div className="demo-strip"><FlaskConical size={16}/><strong>Ambiente de teste</strong><span>Inscrições e pagamentos simulados. Use apenas dados fictícios.</span></div>}
    <main id="registration-main">{children}</main>
    <footer className="registration-footer"><span>Filhas de Jó RJ · {new Date().getFullYear()}</span><a href="/">Voltar ao site institucional <ArrowRight size={14}/></a>{service.mode === 'demo' && <><small>Nenhuma cobrança ou reserva real é feita nesta prévia.</small></>}</footer>
  </div>;
}

function Field({ label, field, person, set, errors, index, type = 'text', options, optional = false, maxLength = 100, wide = false, ...props }) {
  const id = `person-${index}-${field}`, error = errors[`participants.${index}.${field}`];
  return <div className={`signup-field ${wide ? 'field-wide' : ''}`}><label htmlFor={id}>{label}{optional && <span>opcional</span>}</label>{options ? <select id={id} value={person[field]} onChange={e => set(field, e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props}><option value="">Selecione…</option>{options.map(option => <option key={option.id || option} value={option.id || option}>{option.label || option}</option>)}</select> : type === 'textarea' ? <textarea id={id} rows={3} maxLength={500} value={person[field]} onChange={e => set(field, e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}/> : <input id={id} type={type} value={person[field]} onChange={e => set(field, e.target.value)} maxLength={maxLength} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} autoComplete="off" {...props}/>} {error && <small id={`${id}-error`} className="field-error">{error}</small>}</div>;
}

function PersonForm({ catalog, person, index, set, errors }) {
  const common = { person, index, set, errors };
  const [cepStatus, setCepStatus] = useState({ loading: false, message: '' });
  const setRef = useRef(set);
  useEffect(() => { setRef.current = set; }, [set]);
  const cep = person.cep.replace(/\D/g, '');
  const sharedAddress = index > 0 && person.sameAddress;
  useEffect(() => {
    if (sharedAddress || cep.length !== 8) { setCepStatus({ loading: false, message: '' }); return; }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setCepStatus({ loading: true, message: 'Consultando endereço no ViaCEP…' });
      try {
        const address = await apiRequest(`/cep/${cep}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setRef.current({ street: address.street, district: address.district, city: address.city, state: address.state });
        setCepStatus({ loading: false, message: 'Endereço preenchido pelo ViaCEP. Confira e informe o número.' });
      } catch (error) {
        if (!controller.signal.aborted) setCepStatus({ loading: false, message: error.message });
      }
    }, 450);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [cep, index, sharedAddress]);
  const age = ageAt(person.birthDate, catalog.date);
  const field = (key, label, props = {}) => <Field key={key} {...common} field={key} label={label} {...props}/>;
  return <div className="participant-fields"><div className="signup-field-grid">
    {field('name', 'Nome completo', { wide: true })}{field('cpf', catalog.mode === 'demo' ? 'CPF fictício (11 dígitos)' : 'CPF', { inputMode: 'numeric', maxLength: 14 })}{field('birthDate', 'Data de nascimento', { type: 'date', max: catalog.date, min: '1900-01-01' })}
    {field('categoryId', 'Categoria', { options: catalog.categories })}{field('shirt', 'Tamanho de camisa', { options: catalog.shirts })}
    {field('phone', 'Celular com DDD', { type: 'tel', maxLength: 20 })}{field('email', 'E-mail', { type: 'email', maxLength: 254 })}
  </div>
  <h4>Endereço</h4>{index > 0 && <label className="signup-check"><input type="checkbox" checked={person.sameAddress} onChange={e => set('sameAddress', e.target.checked)}/>Usar o endereço do participante 1</label>}
  {sharedAddress ? <p className="signup-hint">O endereço do participante 1 será usado nesta inscrição.</p> : <><div className="signup-field-grid" aria-busy={cepStatus.loading}>{field('cep', 'CEP', { inputMode: 'numeric', maxLength: 9, placeholder: '00000-000', 'aria-describedby': `cep-status-${index}` })}{field('street', 'Endereço', { maxLength: 150 })}{field('number', 'Número', { maxLength: 20 })}{field('complement', 'Complemento', { optional: true })}{field('district', 'Bairro')}{field('city', 'Cidade')}{field('state', 'Estado', { options: 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ') })}</div><p id={`cep-status-${index}`} className="signup-hint" role="status">{cepStatus.message || 'Digite os 8 números do CEP para preencher o endereço automaticamente.'}</p></>}
  <h4>Vínculo com a organização</h4><div className="signup-field-grid">{field('bethel', 'Bethel / instituição', { optional: true, placeholder: 'Nome e cidade, se houver vínculo' })}{field('memberId', 'Número de registro', { optional: true, maxLength: 40 })}</div>
  {age !== null && age < 18 && <><h4>Responsável pelo menor de idade</h4><p className="signup-hint">Participantes menores de 18 anos precisam de um responsável.</p><div className="signup-field-grid">{field('guardianName', 'Nome completo do responsável')}{field('guardianPhone', 'Celular do responsável', { type: 'tel', maxLength: 20 })}</div></>}
  <h4>Acessibilidade e acolhimento</h4><div className="signup-field-grid">{field('supportNeed', 'Apoio necessário', { options: catalog.supportNeeds, wide: true })}{person.supportNeed !== 'Nenhuma' && field('supportDetails', 'Como podemos acolher você?', { type: 'textarea', wide: true })}</div>
  </div>;
}

function Summary({ catalog, draft }) {
  let quote;
  try { quote = quoteOrder(catalog, draft); } catch { quote = { lines: [], totalCents: 0, complete: false }; }
  return <aside className="signup-summary"><div className="summary-picture"><span>FILHAS DE JÓ RJ</span></div><div className="summary-content"><p className="eyebrow">RESUMO DA INSCRIÇÃO</p><h2>{catalog.name}</h2><p className="summary-fact"><CalendarDays size={15}/>{catalog.dateLabel}</p><p className="summary-fact"><MapPin size={15}/>{catalog.venue} · previsto</p><hr/><div className="summary-choice"><strong>{catalog.accommodations.find(x => x.id === draft.accommodationId)?.label || 'Escolha sua participação'}</strong><span>{draft.participants.length} participante{draft.participants.length > 1 ? 's' : ''} · {catalog.lots.find(x => x.id === draft.lotId)?.label}</span></div>{quote.lines.map(line => <div className="summary-line" key={line.participant}><span>Participante {line.participant}<small>{line.label}</small></span><b>{draft.participants[line.participant - 1].categoryId ? currency(line.amountCents) : 'A definir'}</b></div>)}<div className="summary-total"><span>{catalog.mode === 'demo' ? 'Total simulado' : 'Total estimado'}</span><strong>{quote.complete ? currency(quote.totalCents) : 'A definir'}</strong></div>{draft.paymentMethod === 'card' && quote.complete && <p className="summary-installments">{draft.installments}x de aproximadamente {currency(Math.ceil(quote.totalCents / draft.installments))}</p>}<p className="summary-notice">{catalog.mode === 'demo' ? 'Valores fictícios para demonstração. Nenhuma cobrança, ingresso ou reserva real.' : 'O valor final e a disponibilidade serão confirmados pelo sistema antes do pagamento.'}</p><a href="/evento">Ver informações do evento <ArrowRight size={13}/></a></div></aside>;
}

export function SignupPage() {
  const { catalog, error } = useCatalog();
  return <Frame title="Inscrição" active="signup">{error ? <div className="registration-width registration-error" role="alert"><h1>Inscrições indisponíveis</h1><p>{error}</p><Button href="/evento">Voltar ao evento</Button></div> : !catalog ? <p className="loading" role="status">Carregando inscrições…</p> : <SignupFlow catalog={catalog}/>}</Frame>;
}

function SignupFlow({ catalog }) {
  const [account, setAccount] = useState(null);
  useEffect(() => { let active = true; if (service.currentAccount) service.currentAccount().then(user => { if (active) setAccount(user); }); return () => { active = false; }; }, []);
  const requestedType = new URLSearchParams(location.search).get('tipo');
  const startingType = catalog.accommodations.find(x => x.id === requestedType) || catalog.accommodations[0];
  const [draft, setDraft] = useState(() => ({ eventId: catalog.id, catalogRevision: catalog.revision, accommodationId: startingType.id, lotId: catalog.lots[0].id, participants: Array.from({ length: startingType.occupants || 1 }, newParticipant), paymentMethod: 'pix', installments: 1, consent: false, marketingConsent: false }));
  const [step, setStep] = useState(1), [personIndex, setPersonIndex] = useState(0), [errors, setErrors] = useState({}), [failure, setFailure] = useState(''), [busy, setBusy] = useState(false), [order, setOrder] = useState(null);
  const requestId = useRef(crypto.randomUUID()), heading = useRef(null), previousStep = useRef(1);
  useEffect(() => { if (previousStep.current !== step) { heading.current?.focus(); previousStep.current = step; } }, [step]);
  const update = changes => { requestId.current = crypto.randomUUID(); setDraft(current => ({ ...current, ...changes })); setFailure(''); };
  const resize = (count, accommodationId = draft.accommodationId) => { update({ accommodationId, participants: Array.from({ length: count }, (_, index) => draft.participants[index] || newParticipant()) }); setPersonIndex(0); setErrors({}); };
  const setPerson = (key, value) => {
    requestId.current = crypto.randomUUID();
    const changes = typeof key === 'object' ? key : { [key]: value };
    setDraft(current => ({ ...current, participants: current.participants.map((person, index) => index === personIndex ? { ...person, ...changes } : person) }));
    setFailure('');
  };
  function advance() {
    const issues = validateDraft(catalog, draft, step); setErrors(issues);
    if (Object.keys(issues).length) {
      const bad = Object.keys(issues).find(key => key.startsWith('participants.'));
      if (bad) setPersonIndex(Number(bad.split('.')[1]));
      setFailure('Confira os campos destacados para continuar.'); return;
    }
    setFailure(''); setStep(step + 1);
  }
  async function submit() {
    const issues = validateDraft(catalog, draft); setErrors(issues);
    if (Object.keys(issues).length) { setFailure('Confira os campos destacados.'); return; }
    setBusy(true); setFailure('');
    try {
      const result = await service.createOrder(draft, requestId.current);
      if (!result?.id || !['pending', 'confirmed', 'cancelled'].includes(result.status) || !Number.isInteger(result.totalCents)) throw new Error('A resposta da inscrição é inválida. Tente novamente.');
      setOrder(result); setStep(4);
      setDraft(current => ({ ...current, participants: current.participants.map(newParticipant) }));
    } catch (error) { setFailure(error.message || 'Não foi possível concluir. Tente novamente.'); } finally { setBusy(false); }
  }
  if (order) return <div className="registration-width receipt-wrap"><OrderReceipt order={order} onUpdate={setOrder}/></div>;
  return <div className="registration-width signup-page"><div className="signup-intro"><a href="/evento"><ArrowLeft size={14}/> Sobre o evento</a><p className="eyebrow">SEU PRÓXIMO ENCONTRO COMEÇA AQUI</p><h1>Vamos fazer sua inscrição.</h1><p>{catalog.mode === 'demo' ? 'Explore cada etapa com tranquilidade. Esta é uma demonstração do processo.' : 'Escolha sua participação e preencha os dados para continuar.'}</p></div>
    <ol className="signup-progress" aria-label="Etapas da inscrição">{['Participação', 'Participantes', 'Revisão e pagamento'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className={step > index + 1 ? 'done' : ''}><button disabled={step < index + 1 || busy} onClick={() => { setStep(index + 1); setFailure(''); }}><span>{step > index + 1 ? <Check size={15}/> : `0${index + 1}`}</span>{label}</button></li>)}</ol>
    <p className="signup-account-link">{account ? <>Pedido vinculado a <strong>{account.name}</strong>. <a href="/conta">Ver minha conta</a></> : <><a href="/conta?retorno=inscricao">Criar cadastro ou entrar</a> para vincular esta inscrição à sua conta de teste. Você também pode continuar como visitante.</>}</p><div className="signup-layout"><section className="signup-panel"><div className="signup-panel-heading"><span className="step-caption">ETAPA {step} DE 3</span><h2 ref={heading} tabIndex={-1}>{['Como você vai participar?', 'Quem vem com você?', 'Está tudo certo?'][step - 1]}</h2><p>{['Escolha a opção e o lote para começar.', 'Preencha os dados de cada participante do pedido.', 'Revise a inscrição e escolha como deseja testar o pagamento.'][step - 1]}</p></div>
      {failure && <div className="signup-alert" role="alert">{failure}</div>}
      {step === 1 && <><fieldset className="option-fieldset"><legend>Tipo de inscrição</legend><div className="accommodation-grid">{catalog.accommodations.map(option => <label className={`accommodation-option ${draft.accommodationId === option.id ? 'selected' : ''}`} key={option.id}><input type="radio" name="accommodation" value={option.id} checked={draft.accommodationId === option.id} onChange={() => resize(option.occupants || 1, option.id)}/>{option.id === 'evento' ? <Ticket size={23}/> : <BedDouble size={23}/>}<strong>{option.label}</strong><span>{option.description}</span></label>)}</div></fieldset>{!catalog.accommodations.find(x => x.id === draft.accommodationId)?.occupants && <label className="signup-quantity">Quantidade de participantes<select value={draft.participants.length} onChange={e => resize(Number(e.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} participante{value > 1 ? 's' : ''}</option>)}</select></label>}<fieldset className="option-fieldset lots-fieldset"><legend>Escolha o lote</legend>{catalog.lots.map(lot => <label className="lot-choice" key={lot.id}><input type="radio" name="lot" checked={draft.lotId === lot.id} onChange={() => update({ lotId: lot.id })}/><span><strong>{lot.label}</strong><small>{lot.extraCents ? `Acréscimo demonstrativo de ${currency(lot.extraCents)} por pessoa` : 'Valores de demonstração por categoria'}</small></span></label>)}</fieldset></>}
      {step === 2 && <>{catalog.mode === 'demo' && <div className="example-data-box"><div><FlaskConical size={20}/><p><strong>Quer experimentar mais rápido?</strong><span>Preencha todos os participantes com dados fictícios.</span></p></div><button type="button" onClick={() => { update({ participants: draft.participants.map((_, index) => exampleParticipant(index)) }); setErrors({}); setFailure(''); }}>Usar dados de exemplo</button></div>}<div className="participant-tabs" aria-label="Participantes">{draft.participants.map((person, index) => <button className={personIndex === index ? 'active' : ''} key={index} onClick={() => setPersonIndex(index)} aria-pressed={personIndex === index}><Users size={15}/>{index + 1}<span>{person.name ? person.name.split(' ')[0] : 'Participante'}</span>{Object.keys(errors).some(key => key.startsWith(`participants.${index}.`)) && <b aria-label="Campos para revisar">!</b>}</button>)}</div><h3 className="participant-title">Participante {personIndex + 1} <span>de {draft.participants.length}</span></h3><PersonForm catalog={catalog} person={draft.participants[personIndex]} index={personIndex} set={setPerson} errors={errors}/>{draft.participants.length > 1 && <div className="person-navigation"><button disabled={personIndex === 0} onClick={() => setPersonIndex(personIndex - 1)}><ArrowLeft size={14}/> Anterior</button><button disabled={personIndex === draft.participants.length - 1} onClick={() => setPersonIndex(personIndex + 1)}>Próxima pessoa <ArrowRight size={14}/></button></div>}</>}
      {step === 3 && <><div className="review-participants"><div><h3>Participantes</h3><button onClick={() => setStep(2)}>Editar dados</button></div>{draft.participants.map((person, index) => <article key={index}><span>{index + 1}</span><p><strong>{person.name}</strong><small>{catalog.categories.find(x => x.id === person.categoryId)?.label} · Camisa {person.shirt}</small><small>{person.email}</small></p></article>)}</div><fieldset className="option-fieldset"><legend>{catalog.mode === 'demo' ? 'Como deseja simular o pagamento?' : 'Forma de pagamento'}</legend><div className="payment-options">{catalog.paymentMethods.map(method => { const Icon = { pix: Landmark, boleto: FileText, card: CreditCard }[method] || CreditCard; return <label key={method} className={draft.paymentMethod === method ? 'selected' : ''}><input type="radio" name="payment" checked={draft.paymentMethod === method} onChange={() => update({ paymentMethod: method, installments: 1 })}/><Icon size={24}/><strong>{paymentNames[method]}</strong><small>{method === 'card' ? `Até ${catalog.maxInstallments}x` : 'À vista'}</small></label>; })}</div></fieldset>{draft.paymentMethod === 'card' && <label className="signup-quantity">Parcelas<select value={draft.installments} onChange={e => update({ installments: Number(e.target.value) })}>{Array.from({ length: catalog.maxInstallments }, (_, index) => <option key={index} value={index + 1}>{index + 1}x de aproximadamente {currency(Math.ceil(quoteOrder(catalog, draft).totalCents / (index + 1)))}</option>)}</select></label>}<div className="payment-explanation"><FlaskConical size={20}/><p>{catalog.mode === 'demo' ? 'O próximo passo cria apenas um pedido de teste. Nenhum dado de cartão, chave Pix ou pagamento real será solicitado.' : 'O pagamento será realizado em ambiente seguro após a confirmação do pedido pela API.'}</p></div><label className="signup-check"><input type="checkbox" checked={draft.consent} onChange={e => update({ consent: e.target.checked })}/><span>{catalog.mode === 'demo' ? 'Entendi que esta é uma simulação e informei somente dados fictícios.' : 'Autorizo o tratamento dos dados informados para a gestão da inscrição, conforme as condições apresentadas pelo evento.'}</span></label>{errors.consent && <p className="field-error">{errors.consent}</p>}<label className="signup-check"><input type="checkbox" checked={draft.marketingConsent} onChange={e => update({ marketingConsent: e.target.checked })}/><span>Quero receber novidades sobre o evento. <small>Opcional.</small></span></label></>}
      <div className="signup-controls">{step > 1 ? <button className="back-step" disabled={busy} onClick={() => { setStep(step - 1); setFailure(''); }}><ArrowLeft size={16}/> Voltar</button> : <a className="back-step" href="/evento">Voltar ao evento</a>}<Button onClick={step === 3 ? submit : advance} disabled={busy}>{busy ? <><LoaderCircle size={16} className="loading-icon"/> Processando…</> : <>{step === 3 ? catalog.mode === 'demo' ? 'Criar pedido de teste' : 'Continuar para pagamento' : 'Continuar'}<ArrowRight size={16}/></>}</Button></div>
    </section><Summary catalog={catalog} draft={draft}/></div>
  </div>;
}

function OrderReceipt({ order, onUpdate }) {
  const receiptHeading = useRef(null);
  useEffect(() => { receiptHeading.current?.focus(); }, [order.id]);
  const demo = order.mode === 'demo';
  const closed = ['cancelled', 'expired', 'refunded'].includes(order.status);
  const heading = closed ? `${statusNames[order.status]}${demo ? ' na simulação' : ''}.` : order.status === 'confirmed' ? demo ? 'Pagamento simulado confirmado!' : 'Inscrição confirmada!' : demo ? 'Seu pedido de teste está pronto.' : 'Seu pedido está pronto.';
  return <section className="order-receipt"><div className={`receipt-icon ${closed ? 'cancelled' : ''}`}>{closed ? <XCircle size={37}/> : order.status === 'confirmed' ? <CheckCircle2 size={37}/> : <Ticket size={37}/>}</div><p className="eyebrow">{demo ? 'DEMONSTRAÇÃO · SEM VALIDADE COMO INGRESSO' : 'SUA INSCRIÇÃO'}</p><h1 ref={receiptHeading} tabIndex={-1}>{heading}</h1><p>{demo ? 'Nenhum pagamento foi realizado e nenhuma vaga real foi reservada.' : 'Acompanhe seu pedido por este código.'}</p><div className="receipt-code"><small>CÓDIGO DE ACOMPANHAMENTO</small><strong>{order.id}</strong></div><div className="receipt-details"><div><span>Participação</span><b>{order.accommodation}</b></div><div><span>Participantes</span><b>{order.participantCount}</b></div><div><span>Pagamento</span><b>{order.paymentLabel} {order.paymentMethod === 'card' ? `· ${order.installments}x` : ''}</b></div><div><span>{demo ? 'Total simulado' : 'Total'}</span><b>{currency(order.totalCents)}</b></div></div>
    {demo && <PaymentPanel key={order.id} order={order} onUpdate={onUpdate}/>}
    {!demo && /^https:\/\//.test(order.paymentUrl || '') && <Button href={order.paymentUrl}>Ir ao pagamento seguro</Button>}
    <div className="receipt-links"><a href={`/acompanhamento?codigo=${encodeURIComponent(order.id)}`}>Acompanhar inscrição <ArrowRight size={15}/></a><a href="/evento">Voltar ao evento</a></div>{demo && <p className="receipt-footnote">O pedido e os nomes fictícios ficam nesta aba enquanto a sessão estiver aberta, para testar o painel. CPF, contato, endereço e informações de saúde são descartados. Nenhum e-mail é enviado.</p>}
  </section>;
}
export function TrackingPage() {
  const initial = new URLSearchParams(location.search).get('codigo') || '';
  const [reference, setReference] = useState(initial), [order, setOrder] = useState(null), [recent, setRecent] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const refresh = () => service.recentOrders().then(setRecent).catch(() => {});
  async function find(code) { setBusy(true); setError(''); setOrder(null); try { setOrder(await service.getOrder(code)); } catch (error) { setError(error.message); } finally { setBusy(false); } }
  useEffect(() => { refresh(); if (initial) find(initial); }, []);
  return <Frame title="Acompanhar inscrição" active="tracking"><div className="registration-width tracking-page"><div className="signup-intro"><p className="eyebrow">SEU ENCONTRO, PASSO A PASSO</p><h1>Acompanhe sua inscrição.</h1><p>{service.mode === 'demo' ? 'Consulte os pedidos de demonstração criados nesta aba do navegador.' : 'Informe o código recebido ao fazer sua inscrição.'}</p></div><form className="tracking-search" onSubmit={e => { e.preventDefault(); find(reference); }}><label htmlFor="tracking-code">Código de acompanhamento<input id="tracking-code" value={reference} onChange={e => setReference(e.target.value)} required maxLength={80} placeholder={service.mode === 'demo' ? 'TESTE-XXXXXXXX' : 'Código da inscrição'}/></label><Button disabled={busy}>{busy ? 'Consultando…' : 'Consultar inscrição'}<ArrowRight size={16}/></Button></form>{error && <p className="signup-alert" role="alert">{error}</p>}{order && <OrderReceipt order={order} onUpdate={value => { setOrder(value); refresh(); }}/>}<section className="recent-orders"><h2>{service.mode === 'demo' ? 'Seus testes nesta aba' : 'Sua inscrição'}</h2>{recent.length ? recent.map(item => <button key={item.id} onClick={() => { setReference(item.id); find(item.id); }}><Ticket size={20}/><span><b>{item.id}</b><small>{item.participantCount} participante(s) · {currency(item.totalCents)}</small></span><em>{statusNames[item.status] || 'Pendente'}</em><ArrowRight size={16}/></button>) : <p>Nenhum teste por aqui ainda. <a href="/inscricao">Começar uma inscrição <ArrowRight size={14}/></a></p>}</section></div></Frame>;
}






