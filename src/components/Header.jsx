import { useEffect,useState } from 'react';
import { Menu,X,Instagram,Youtube } from 'lucide-react';
import { Brand,Button } from './Shared';
import { safeUrl } from '../lib/safe';
import { useSectionNavigation } from '../hooks/useSectionNavigation';
export default function Header({site,sections,contact,registration,onModal}){
 const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(false);
 const links=sections.filter(s=>s.active).sort((a,b)=>a.sort_order-b.sort_order).map(s=>({...s,anchor:s.slug==='hero'?'inicio':s.slug}));
 const page=/^\/historia\/?$/.test(location.pathname)?'historia':'';
 const {active,navigate}=useSectionNavigation(links.map(s=>s.anchor),page);
 function follow(event,section){
  setOpen(false);
  if(page||['historia','evento'].includes(section.slug)||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  if(navigate(section.anchor)){event.preventDefault();if(location.hash!==`#${section.anchor}`)history.pushState(null,'',`/#${section.anchor}`);}
 }
 useEffect(()=>{const handler=()=>setScrolled(window.scrollY>30);handler();window.addEventListener('scroll',handler,{passive:true});return()=>window.removeEventListener('scroll',handler)},[]);
 useEffect(()=>{if(!open)return;const listener=e=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener)},[open]);
 return <header className={`header ${scrolled||open?'header-scrolled':''}`}><div className="header-inner"><Brand site={site}/><button className="menu-toggle" aria-label={open?'Fechar menu':'Abrir menu'} aria-expanded={open} aria-controls="main-nav" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav id="main-nav" aria-label="Menu principal" className={open?'nav nav-open':'nav'}>{links.map(s=><a className={active===s.anchor?'active':''} aria-current={active===s.anchor?(page?'page':'location'):undefined} key={s.slug} href={s.slug==='historia'?'/historia':s.slug==='evento'?'/evento':`/#${s.anchor}`} onClick={event=>follow(event,s)}>{s.title}</a>)}<a className="mobile-event-link" href="/inscricao">Inscrições</a></nav><div className="header-actions">{[['instagram',Instagram],['youtube',Youtube]].map(([key,Icon])=>safeUrl(contact[key])?<a key={key} href={safeUrl(contact[key])} target="_blank" rel="noreferrer" aria-label={key}><Icon size={17}/></a>:<button key={key} aria-label={key} onClick={()=>onModal('channel')}><Icon size={17}/></button>)}<Button href="/inscricao">Inscrições</Button></div></div></header>
}
