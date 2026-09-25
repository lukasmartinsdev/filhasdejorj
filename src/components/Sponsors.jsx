import { Label } from './Shared';
import { safeUrl } from '../lib/safe';
import '../styles/sponsors.css';
export default function Sponsors({ items }) {
 const sequence = ['Realização','Apoio Institucional','Corpos Filosóficos','Potências Simbólicas','Patrocínio','Parceiros','Outros apoiadores'];
 const categories = [...new Set(items.map(x=>x.data.category))].sort((a,b)=>sequence.indexOf(a)-sequence.indexOf(b));

 return <section id="patrocinadores" className="sponsors-section sponsors-refined"><div className="wrap sponsors-refined-inner"><div className="sponsors-heading"><Label>QUEM FAZ PARTE</Label><h2>Realização e apoio</h2><p>Instituições que caminham com as Filhas de Jó.</p></div><div className="sponsors-groups">{categories.map(category=><div data-category={category} className={`sponsor-group ${['Realização','Apoio Institucional'].includes(category)?'sponsor-group-featured':''}`} key={category}><h3>{category}</h3><div className="sponsor-logos">{items.filter(x=>x.data.category===category).map(({id,data})=>{const content=<div className="sponsor-logo-shell">{data.logo?<img src={safeUrl(data.logo)} alt={data.name} className={data.logo.includes('grande-loja-rj.jpg')?'round-sponsor-logo':''} loading="lazy"/>:<strong className="sponsor-wordmark">{data.name}</strong>}</div>;const href=data.url?.startsWith('#')?`/${data.url}`:safeUrl(data.url);return href?<a className="sponsor-tile" href={href} key={id} target={href.startsWith('/')?undefined:'_blank'} rel="noreferrer" title={data.name}>{content}</a>:<div className="sponsor-tile" key={id} title={data.name}>{content}</div>})}</div></div>)}</div></div></section>;
}

