import { lazy,Suspense,useState,useEffect } from 'react';
import { ChevronLeft,ChevronRight } from 'lucide-react';
import { useContent } from './hooks/useContent';
import { first } from './data/defaults';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import History from './components/History';
import HistoryPage from './components/HistoryPage';
import EventSection from './components/EventSection';
import Values from './components/Values';
import Gallery from './components/Gallery';
import Sponsors from './components/Sponsors';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { Modal,Button } from './components/Shared';
import { PublicForm } from './components/PublicForms';
import { Schedule,Guests,Faq } from './components/ExtraSections';
import { safeUrl,money } from './lib/safe';
import { previewSponsors } from './registration/sponsors';
const AccountPage=lazy(()=>import('./registration/AccountPages').then(m=>({default:m.AccountPage})));
const ReservationsPage=lazy(()=>import('./registration/AccountPages').then(m=>({default:m.ReservationsPage})));
const Admin=lazy(()=>import('./admin/Admin'));
const EventPage=lazy(()=>import('./registration/EventPage'));
const SignupPage=lazy(()=>import('./registration/RegistrationPages').then(m=>({default:m.SignupPage})));
const TrackingPage=lazy(()=>import('./registration/RegistrationPages').then(m=>({default:m.TrackingPage})));
export default function App(){const path=location.pathname.replace(/\/$/,'')||'/';const Page=path==='/admin/reservas'?ReservationsPage:path==='/conta'?AccountPage:path.startsWith('/admin')?Admin:path==='/evento'?EventPage:path==='/inscricao'?SignupPage:path==='/acompanhamento'?TrackingPage:PublicSite;return <Suspense fallback={<p className="loading" role="status">Carregando…</p>}><Page/></Suspense>}
function PublicSite(){
 const historyRoute=/^\/historia\/?$/.test(location.pathname);
 const content=useContent(),site=first(content,'site_settings'),hero=first(content,'hero_content'),about=first(content,'about_content'),history=first(content,'history_content'),contact=first(content,'contact_info'),reg=first(content,'registration_settings'),event=first(content,'event_info');
 const [modal,setModal]=useState(''),[photo,setPhoto]=useState(0);
 const sections=content.sections.filter(s=>s.active).sort((a,b)=>a.sort_order-b.sort_order);
 const gallery=content.gallery;
 const galleryOpen=i=>{setPhoto(i);setModal('gallery')};
 const movePhoto=n=>setPhoto(i=>(i+n+gallery.length)%gallery.length);
 useEffect(()=>{document.title=historyRoute?'Nossa história no Brasil e no Rio — Filhas de Jó RJ':`${site.name||'Filhas de Jó RJ'} — Irmandade, liderança e serviço`;for(const [key,value]of [['--purple',site.primary_color],['--gold',site.gold_color],['--dark',site.dark_color]])if(/^#[\da-f]{6}$/i.test(value))document.documentElement.style.setProperty(key,value)},[site,historyRoute]);
 useEffect(()=>{if(modal!=='gallery')return;const listener=e=>{if(e.key==='ArrowRight')setPhoto(i=>(i+1)%gallery.length);if(e.key==='ArrowLeft')setPhoto(i=>(i-1+gallery.length)%gallery.length)};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener)},[modal,gallery.length]);
 const renderSection=slug=>({hero:<Hero data={hero} onVideo={()=>setModal('video')}/>,sobre:<About data={about} values={content.values} onMore={()=>setModal('about')}/>,historia:<History data={history}/>,evento:<EventSection data={event} registration={reg} lots={content.registration_lots} onNotify={()=>setModal('notify')} onRegistration={()=>setModal('registration')}/>,valores:<Values items={content.values}/>,galeria:<Gallery items={gallery} onOpen={galleryOpen}/>,patrocinadores:<Sponsors items={previewSponsors(content.sponsors)} onContact={()=>setModal('contact')}/>,contato:<Contact data={contact} onContact={()=>setModal('contact')} onMissing={()=>setModal('channel')}/>,programacao:<Schedule items={content.schedule_items}/>,convidados:<Guests items={content.guests}/>,faq:<Faq items={content.faq}/>})[slug];
 const blocks=[];for(let i=0;i<sections.length;i++){const slug=sections[i].slug;if(slug==='sobre'&&sections[i+1]?.slug==='historia'){blocks.push(<div className="about-history" key="about-history">{renderSection(slug)}{renderSection('historia')}</div>);i++}else blocks.push(<div key={slug} className={`section-shell shell-${slug}`}>{renderSection(slug)}</div>)}
 const titles={video:'Nosso vídeo institucional',history:'Nossa história',about:'Uma irmandade que transforma',registration:reg.open?'Inscrições':'Inscrições em breve',channel:'Nossos canais',contact:'Fale com a gente',notify:'O próximo encontro começa aqui',privacy:'Política de Privacidade',terms:'Termos de Uso',gallery:gallery[photo]?.data.caption};
 return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><Header site={site} sections={content.sections} contact={contact} registration={reg} onModal={setModal}/><main id="conteudo">{historyRoute?<HistoryPage data={history} onContact={()=>setModal('contact')}/>:blocks}</main><Footer site={site} sections={content.sections} contact={contact} onModal={setModal}/>{modal&&<Modal title={titles[modal]} onClose={()=>setModal('')} wide={modal==='gallery'||modal==='video'}>{modal==='history'&&<>{history.timeline?.map((item,i)=><div className="timeline-item" key={i}><b>{item.date}</b><h3>{item.title}</h3><p>{item.text}</p></div>)}<a href="https://jobsdaughtersinternational.org/history/" target="_blank" rel="noreferrer">História oficial — Job’s Daughters International</a></>}{modal==='about'&&<><p>{about.text}</p><p>Em nossos Bethels, aprendemos a trabalhar em equipe, a nos comunicar com confiança e a servir à comunidade. Essa jornada une a força da juventude a uma tradição que atravessa gerações.</p><Button onClick={()=>setModal('contact')}>Quero conhecer mais</Button></>}{modal==='video'&&(safeUrl(hero.video_url)?<><p>Assista ao vídeo no canal indicado pela organização.</p><Button href={safeUrl(hero.video_url)} target="_blank" rel="noreferrer">Abrir vídeo institucional</Button></>:<p>Nosso vídeo institucional será disponibilizado em breve.</p>)}{modal==='registration'&&<><p>{reg.notes}</p><p>{money(reg.price)}</p>{reg.open&&safeUrl(reg.external_url)&&<Button href={safeUrl(reg.external_url)} target="_blank" rel="noreferrer">{reg.button_text}</Button>}{!reg.open&&<Button onClick={()=>setModal('notify')}>Registrar interesse</Button>}</>}{modal==='channel'&&<><p>Os canais oficiais do Rio de Janeiro serão divulgados em breve. Você já pode enviar uma mensagem para a equipe pelo site.</p><Button onClick={()=>setModal('contact')}>Enviar mensagem</Button></>}{modal==='contact'&&<PublicForm/>}{modal==='notify'&&<PublicForm interest/>}{modal==='gallery'&&gallery[photo]&&<div className="lightbox"><img src={safeUrl(gallery[photo].data.image)} alt={gallery[photo].data.caption}/><div className="lightbox-controls"><button aria-label="Foto anterior" onClick={()=>movePhoto(-1)}><ChevronLeft/></button><span>{photo+1} / {gallery.length}{gallery[photo].data.illustrative?' · Imagem ilustrativa':''}</span><button aria-label="Próxima foto" onClick={()=>movePhoto(1)}><ChevronRight/></button></div></div>}{modal==='privacy'&&<><p>Ao enviar o formulário de contato, você fornece nome, e-mail e mensagem para que a equipe possa responder. Na lista de interesse, forneça apenas seu e-mail para informações sobre o encontro.</p><p>Esses dados ficam armazenados no Supabase e são acessíveis apenas à equipe administrativa autorizada. Não são exibidos publicamente. A inscrição na lista não reserva nem compra ingressos.</p><p>Você pode solicitar a retirada do seu cadastro pelo formulário de contato. O site não utiliza publicidade ou análise de navegação. O painel administrativo utiliza armazenamento de sessão para manter o acesso seguro.</p><Button onClick={()=>setModal('contact')}>Falar com a equipe</Button></>}{modal==='terms'&&<><p>Este site apresenta informações institucionais das Filhas de Jó RJ. Datas, local, programação e valores de eventos serão divulgados quando definidos pela organização.</p><p>As inscrições e os pagamentos são demonstrativos e não emitem ingressos. As imagens identificadas como ilustrativas não representam registros de eventos reais.</p><p>A logo foi fornecida para este projeto. A história institucional usa fontes públicas da Job’s Daughters International.</p></>}</Modal>}</>
}

