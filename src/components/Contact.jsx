import { Label,Button,Socials } from './Shared';
import { safeUrl } from '../lib/safe';
export default function Contact({data,onContact,onMissing}){return <section id="contato" className="contact-section" style={{backgroundImage:`linear-gradient(90deg,#211126f5 0%,#211126de 30%,#21112682 60%,#21112666 100%),url("${safeUrl(data.image)}")`}}><div className="contact-copy"><Label>Fale conosco</Label><h2>{data.title}</h2><p>{data.description}</p><div className="contact-actions"><Button onClick={onContact}>Enviar mensagem</Button><Socials contact={data} onMissing={onMissing}/></div></div><div className="contact-image" aria-hidden="true"/></section>}

