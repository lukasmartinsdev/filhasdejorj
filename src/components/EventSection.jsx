import { CalendarDays,MapPin,Users,TicketCheck,List } from 'lucide-react';
import { Label,Button,Arrow,Reveal } from './Shared';
import { safeUrl } from '../lib/safe';
import { demoCatalog } from '../registration/catalog';
export default function EventSection({data}){
 return <section id="evento" className="event-section" style={{backgroundImage:`linear-gradient(90deg,#211126c9,#21112666),url("${safeUrl(data.image)}")`}}><div className="event-inner wrap"><Reveal className="event-copy"><Label>Nosso evento</Label><h2>{demoCatalog.name}</h2><p>Um sábado para aprender, celebrar e fortalecer a nossa irmandade.</p></Reveal><Reveal className="event-details"><div className="event-facts"><div><CalendarDays size={30} strokeWidth={1.4}/><strong>23 de janeiro de 2027</strong><small>Sábado · a partir das 8h</small></div><div><MapPin size={30} strokeWidth={1.4}/><strong>SESC Copacabana</strong><small>Local a confirmar</small></div><div><Users size={30} strokeWidth={1.4}/><strong>Inscrições</strong><small>Confira as informações</small></div></div><div className="event-banner-actions"><Button href="/inscricao">Fazer inscrição<Arrow/></Button><Button outline href="/acompanhamento"><TicketCheck size={16}/>Acompanhar inscrição</Button><Button outline href="/evento#programacao"><List size={16}/>Ver programação</Button></div></Reveal></div></section>
}

