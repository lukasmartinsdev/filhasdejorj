import { ArrowLeft,ArrowUpRight,MapPin,CalendarDays,HeartHandshake } from 'lucide-react';
import { Label,Button,Reveal } from './Shared';
import { safeUrl } from '../lib/safe';
import { historyPageContent } from '../data/history';
import '../styles/history-page.css';
function Source({url,children}) {return safeUrl(url)?<a className="history-source" href={safeUrl(url)} target="_blank" rel="noreferrer">{children||'Consultar fonte'}<ArrowUpRight size={14}/></a>:null}
function Paragraphs({text}) {return (text||'').split('\n\n').map((p,i)=><p key={i}>{p}</p>)}
export default function HistoryPage({data,onContact}) {
  const history={...historyPageContent,...data};
  return <div className="history-page">
    <section className="history-page-hero"><div className="wrap">
      <a className="back-home" href="/#historia"><ArrowLeft size={16}/>Voltar ao início</a>
      <Label>Nossa história</Label><h1>{history.page_title}</h1><p>{history.page_intro}</p>
      <nav aria-label="Nesta página"><a href="#origem">A origem</a><a href="#brasil">No Brasil</a><a href="#bethels-rj">Bethels do Rio</a></nav>
    </div></section>
    <section className="history-origin wrap" id="origem">
      <figure className="founder-portrait"><img src={safeUrl(history.image)} alt="Ethel T. Wead Mick, fundadora das Filhas de Jó" width="290" height="350"/><figcaption><span className="script">Ethel T. Wead Mick</span><small>Mãe Mick · Nossa fundadora</small></figcaption></figure>
      <Reveal className="history-prose"><Label>O começo · 1920</Label><h2>Um ideal que ganhou o mundo</h2><Paragraphs text={history.origin_text}/><Source url={history.origin_source}>A fundadora · Job’s Daughters International</Source></Reveal>
    </section>
    <section className="history-brazil" id="brasil"><div className="wrap history-brazil-inner">
      <div className="history-prose"><Label>Brasil · 1993</Label><h2>O Rio abriu as portas<br/>para uma nova história.</h2><Paragraphs text={history.brazil_text}/><div className="history-sources"><Source url={history.brazil_source}>Data de instituição · JDI</Source><Source url={history.brazil_expansion_source}>Memória da expansão · ALESP</Source></div></div>
      <div className="history-brazil-symbol" aria-hidden="true"><img src="/assets/logo-filhas-de-jo-rj.png" alt=""/><span className="script">Foi aqui que<br/>tudo começou.</span></div>
    </div></section>
    <section className="history-milestones wrap"><Label>Através do tempo</Label><h2>Marcos da nossa caminhada</h2><ol>{history.timeline?.map((item,i)=><li key={i}><span className="milestone-date">{item.date}</span><h3>{item.title}</h3><p>{item.text}</p><Source url={item.source}/></li>)}</ol></section>
    <section className="history-bethels" id="bethels-rj"><div className="wrap"><div className="history-prose"><Label>Nossas raízes no Rio</Label><h2>Um Bethel, muitas histórias.</h2><Paragraphs text={history.rio_text}/></div><div className="bethel-grid">{history.bethels?.map((bethel,i)=><article className="bethel-card" key={i}><span className="bethel-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><h3>{bethel.name}</h3><div className="bethel-facts"><p><MapPin size={16}/>{bethel.city}</p><p><CalendarDays size={16}/><span>Fundação: {bethel.founded||'Data a confirmar'}</span></p></div><p>{bethel.text}</p><Source url={bethel.source}>{bethel.source_label||'Consultar registro histórico'}</Source></article>)}</div><p className="history-note">{history.bethels_note}</p></div></section>
    <section className="history-contribute wrap"><HeartHandshake size={36}/><div><Label>Essa história continua</Label><h2>Seu Bethel também faz parte dela.</h2><p>Compartilhe registros de fundação, fotos e memórias com a nossa equipe.</p></div><Button onClick={onContact}>Falar com a equipe<ArrowUpRight size={16}/></Button></section>
  </div>;
}
