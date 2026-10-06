import { useEffect,useId,useRef } from 'react';
import { motion,useReducedMotion } from 'framer-motion';
import { ArrowRight,Crown,Users,Heart,HandHeart,Landmark,Star,X,Instagram,Youtube,Facebook,Mail,MessageCircle } from 'lucide-react';
import { safeUrl } from '../lib/safe';
import { socialContact } from '../data/socials';
import '../styles/socials.css';
export const icons={Crown,Users,Heart,HandHeart,Landmark,Star};
export function Reveal({children,className=''}){const reduce=useReducedMotion();return <motion.div className={className} initial={reduce?false:{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.5}}>{children}</motion.div>}
export function Label({children}){return <p className="eyebrow">{children}</p>}
export function Button({children,href,onClick,outline=false,...props}){const cls=`button ${outline?'button-outline':''}`;return href?<a className={cls} href={safeUrl(href,'#inicio')} {...props}>{children}</a>:<button className={cls} onClick={onClick} {...props}>{children}</button>}
export function Arrow(){return <ArrowRight size={15} aria-hidden="true"/>}
export function Brand({site,footer=false}){return <a href="/#inicio" className={`brand ${footer?'brand-footer':''}`} aria-label="Filhas de Jó RJ — Início"><img src={safeUrl(site.logo)} alt="Logo oficial Filhas de Jó Rio de Janeiro" width="64" height="64"/><span><strong>{site.name}</strong><small>{site.tagline}</small></span></a>}
export function Socials({contact,footer=false}){
 const data=socialContact(contact);
 const entries=footer?[['instagram',Instagram,'Instagram das Filhas de Jó RJ'],['facebook',Facebook,'Facebook'],['youtube',Youtube,'YouTube']]:[['whatsapp',MessageCircle,'WhatsApp'],['instagram',Instagram,'Instagram das Filhas de Jó RJ'],['facebook',Facebook,'Facebook'],['youtube',Youtube,'YouTube'],['email',Mail,'E-mail']];
 return <div className="socials">{entries.map(([key,Icon,title])=>{
  const val=data[key];
  const href=key==='email'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)?'mailto:'+val:key==='whatsapp'&&/^\d{10,15}$/.test(val?.replace(/\D/g,'')||'')?'https://wa.me/'+val.replace(/\D/g,''):safeUrl(val);
  const label=key==='facebook'?data.facebook_label:title;
  return href?<a key={key} href={href} aria-label={label} title={label} className={key==='facebook'&&!contact?.facebook?'social-bethel':''} target="_blank" rel="noopener noreferrer"><Icon size={18}/>{key==='facebook'&&!contact?.facebook&&<span>Bethel 001</span>}</a>:null;
 })}</div>;
}
export function Modal({title,children,onClose,wide=false}){const ref=useRef(null);const id=useId();useEffect(()=>{const previous=document.activeElement;const dialog=ref.current;dialog.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=overflow;previous?.focus()}},[]);return <dialog ref={ref} className={`modal ${wide?'modal-wide':''}`} aria-labelledby={id} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><button className="modal-close" onClick={onClose} aria-label="Fechar"><X/></button><h2 id={id}>{title}</h2>{children}</dialog>}
