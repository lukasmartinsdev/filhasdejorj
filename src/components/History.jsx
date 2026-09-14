import { Label,Button,Reveal } from './Shared';
import { safeUrl } from '../lib/safe';
export default function History({data}) {
  return <section id="historia" className="history">
    <Reveal className="history-copy"><Label>Nossa história</Label><h2>{data.title}</h2><p>{data.text}</p><Button outline href="/historia">Conheça nossa história</Button></Reveal>
    <figure className="history-portrait">
      <img src={safeUrl(data.image)} alt="Retrato de Ethel T. Wead Mick, fundadora das Filhas de Jó" loading="lazy" width="290" height="350"/>
      <figcaption><span className="script">Ethel T. Wead Mick</span><small>Nossa fundadora</small></figcaption>
    </figure>
  </section>;
}
