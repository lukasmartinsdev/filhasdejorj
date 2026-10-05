import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bot, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import { containsPersonalData, initialQuestions, replyToQuestion } from './knowledge';
import { safeUrl } from '../lib/safe';
import '../styles/assistant.css';

const welcome = { role: 'assistant', topic: 'greeting', text: 'Olá! Sou o assistente virtual das Filhas de Jó RJ. Sobre o que você gostaria de conversar?', sources: [], suggestions: initialQuestions };

function Conversation({ close, closeRef }) {
  const content = useContent();
  const [messages, setMessages] = useState([welcome]);
  const [draft, setDraft] = useState('');
  const input = useRef(null), log = useRef(null);
  const last = messages.at(-1);
  useEffect(() => {
    if (window.matchMedia('(min-width: 601px)').matches) input.current?.focus({ preventScroll: true });
    else closeRef.current?.focus({ preventScroll: true });
  }, [closeRef]);
  useEffect(() => {
    const container = log.current, latest = container?.lastElementChild;
    if (!container || !latest) return;
    // Long answers start at their first line; shorter answers keep the conversation in view.
    container.scrollTop = latest.offsetHeight > container.clientHeight
      ? container.scrollTop + latest.getBoundingClientRect().top - container.getBoundingClientRect().top - 12
      : container.scrollHeight;
  }, [messages]);
  function send(value) {
    const question = value.trim();
    if (!question || question.length > 500) return;
    const response = replyToQuestion(question, content, last?.topic);
    setMessages(previous => [...previous.slice(-38), { role: 'user', text: containsPersonalData(question) ? '[Dados pessoais ocultados]' : question }, { role: 'assistant', ...response }]);
    setDraft('');
    input.current?.focus({ preventScroll: true });
  }
  function reset() { setMessages([welcome]); setDraft(''); input.current?.focus({ preventScroll: true }); }
  return <>
    <header className="assistant-heading">
      <span className="assistant-avatar" aria-hidden="true"><Bot size={25}/></span>
      <div><h2 id="assistant-title">Filhas de Jó RJ</h2><p>Assistente virtual</p></div>
      <button type="button" className="assistant-icon" onClick={reset} aria-label="Limpar conversa" title="Limpar conversa"><Trash2 size={17}/></button>
      <button type="button" className="assistant-icon" ref={closeRef} onClick={close} aria-label="Fechar assistente"><X size={22}/></button>
    </header>
    <p className="assistant-intro">Conheça a nossa história. Tire suas dúvidas.</p>
    <div ref={log} className="assistant-messages" role="log" aria-label="Conversa com o assistente" aria-live="polite" aria-relevant="additions" tabIndex={0}>
      {messages.map((message, index) => <div className={`assistant-message assistant-message-${message.role}`} key={index}>
        <span className="assistant-speaker">{message.role === 'user' ? 'Você' : 'Assistente'}</span>
        <p>{message.text}</p>
        {!!message.sources?.length && <div className="assistant-sources" aria-label="Saiba mais">{message.sources.map((item, i) => {
          const href = safeUrl(item.href);
          return href ? <a key={i} href={href} {...(href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : { onClick: close })}>{item.label}<ArrowUpRight size={13} aria-hidden="true"/></a> : null;
        })}</div>}
      </div>)}
    </div>
    {!!last.suggestions?.length && <div className="assistant-suggestions" aria-label="Sugestões de perguntas">{last.suggestions.map(question => <button key={question} type="button" onClick={() => send(question)}>{question}</button>)}</div>}
    <form className="assistant-form" onSubmit={event => { event.preventDefault(); send(draft); }}>
      <label className="assistant-sr-only" htmlFor="assistant-question">Sua pergunta sobre as Filhas de Jó</label>
      <textarea id="assistant-question" ref={input} value={draft} onChange={event => setDraft(event.target.value)} maxLength={500} rows={2} placeholder="Digite sua pergunta…" onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); }
      }}/>
      <button type="submit" className="assistant-send" aria-label="Enviar pergunta" disabled={!draft.trim()}><Send size={18}/></button>
    </form>
    <div className="assistant-footnote"><span>Não envie dados pessoais. Respostas informativas.</span><span aria-label={`${draft.length} de 500 caracteres`}>{draft.length}/500</span></div>
  </>;
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null), closeRef = useRef(null);
  function close() { setOpen(false); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); }
  return <div className="site-assistant">
    {open && <section id="site-assistant-panel" className="assistant-panel" role="dialog" aria-labelledby="assistant-title" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}><Conversation close={close} closeRef={closeRef}/></section>}
    <button ref={trigger} type="button" className={`assistant-launcher ${open ? 'assistant-launcher-open' : ''}`} aria-expanded={open} aria-controls={open ? 'site-assistant-panel' : undefined} aria-label={open ? 'Fechar assistente das Filhas de Jó' : 'Conversar com o assistente das Filhas de Jó'} onClick={() => open ? close() : setOpen(true)}>
      {open ? <X size={23} aria-hidden="true"/> : <MessageCircle size={24} aria-hidden="true"/>}<span>Posso ajudar?</span>
    </button>
  </div>;
}
