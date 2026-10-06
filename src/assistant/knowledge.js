import { historyPageContent } from '../data/history.js';
import { demoCatalog, currency } from '../registration/catalog.js';
import { safeUrl } from '../lib/safe.js';
import { socialContact } from '../data/socials.js';

// Public information only. This assistant never reads accounts, orders or messages.
export const initialQuestions = ['O que são as Filhas de Jó?', 'Como participar?', 'História no Brasil', 'Bethels no Rio', 'Próximo evento', 'Falar com a equipe'];
const official = 'https://jobsdaughtersinternational.org/';
const source = (label, href) => ({ label, href: safeUrl(href) });
const institution = source('Sobre a instituição · JDI', `${official}about/`);
const joining = source('Participação · JDI', `${official}join/`);
const historyLink = source('Nossa história e referências', '/historia');
const eventLink = source('Informações do evento', '/evento');
const contactLink = source('Falar com a equipe', '/#contato');
const active = (content, table) => (Array.isArray(content?.[table]) ? content[table] : []).filter(row => row.active === true);
const first = (content, table) => active(content, table)[0]?.data || {};
const clean = value => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim().slice(0, 2200) : '';
export const normalizeQuestion = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/betheis|bethels|betel(s)?/g, 'bethel').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
export const containsPersonalData = value => /[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\d[\s().+-]*){10,}|\b(?:minha senha|meu cpf|meu cartao|meu cartão)\b/i.test(value);
const answer = (topic, text, sources = [], suggestions = []) => ({ topic, text, sources: sources.filter(item => item.href), suggestions });
const has = (query, pattern) => pattern.test(query);
const stop = new Set('a as o os de da das do dos e em no na nos nas um uma que qual quais como quando onde sao ser por para pra sobre me eu quero saber pode voces filhas filha jo favor gostaria'.split(' '));
const tokens = value => [...new Set(normalizeQuestion(value).split(' ').filter(word => word.length > 2 && !stop.has(word)))];

function faqMatch(question, content) {
  const query = normalizeQuestion(question), words = tokens(question);
  const matches = active(content, 'faq').map(row => {
    const title = clean(row.data?.question), response = clean(row.data?.answer);
    const terms = tokens(title), overlap = terms.filter(term => words.includes(term)).length;
    const score = query === normalizeQuestion(title) ? 1 : words.length >= 2 && terms.length >= 2 ? overlap / Math.max(words.length, terms.length) : 0;
    return { title, response, score };
  }).filter(item => item.title && item.response && item.score >= .7).sort((a, b) => b.score - a.score);
  if (!matches.length || matches[0].score === matches[1]?.score) return null;
  return answer('faq', matches[0].response, [source('Conteúdo publicado pela equipe', '/#contato')], ['Falar com a equipe']);
}

export function replyToQuestion(question, content = {}, previousTopic = '') {
  const raw = String(question || '').trim();
  if (!raw || raw.length > 500) return answer('help', 'Escreva uma pergunta de até 500 caracteres ou escolha um dos assuntos abaixo.', [], initialQuestions.slice(0, 4));
  if (containsPersonalData(raw)) return answer('privacy', 'Para sua privacidade, não envie CPF, senha, telefone ou dados de pagamento nesta conversa. Posso orientar sobre as Filhas de Jó e indicar os canais de atendimento.', [contactLink], ['Como participar?', 'Falar com a equipe']);
  const q = normalizeQuestion(raw);
  const history = { ...historyPageContent, ...first(content, 'history_content') };
  const eventWords = /\b(evento|encontro|recepcao|supremo|ingresso|inscricao|inscrever|pix|boleto|pagamento|hospedagem|quarto|programacao|sesc|copacabana)\b/;
  const membershipContext = ['join', 'age', 'membership-cost', 'masonry'].includes(previousTopic) && !has(q, eventWords);
  const eventContext = ['event', 'schedule', 'venue', 'price', 'registration', 'payment', 'lodging', 'tracking'].includes(previousTopic) && !has(q, /\b(bethel|membro|instituicao|filhas de jo)\b/);
  if (/^(oi|ola|bom dia|boa tarde|boa noite|oi tudo bem|ola tudo bem|tudo bem|ajuda|menu)$/.test(q)) return answer('greeting', 'Olá! Sou a Ethel, assistente virtual das Filhas de Jó RJ. Posso ajudar com a história, a participação nos Bethels e as informações do evento. O que você gostaria de saber?', [], initialQuestions);
  if (has(q, /\b(quem e voce|seu nome|se chama|voce e a fundadora|por que ethel)\b/)) return answer('identity', 'Sou a Ethel, assistente virtual deste site. Meu nome homenageia Ethel T. Wead Mick, fundadora das Filhas de Jó. Não sou a fundadora nem uma representante humana da organização.', [source('Conheça a fundadora', `${official}our-founder/`)], ['Quem fundou as Filhas de Jó?']);
  if (/^(obrigad[oa]|muito obrigad[oa]|valeu|obg|ok|entendi|tchau|ate mais)$/.test(q)) return answer('thanks', 'Por nada! Se surgir outra dúvida sobre as Filhas de Jó, é só perguntar.', [], initialQuestions.slice(0, 3));
  if (has(q, /\b(senha|token|api key|administrador|admin|prompt|ignore|ignorar|instrucoes internas)\b/)) return answer('scope', 'Posso ajudar com informações públicas sobre as Filhas de Jó. Para acesso administrativo ou atendimento de uma solicitação, fale diretamente com a equipe.', [contactLink], ['Falar com a equipe']);
  if (has(q, /\b(contato|whatsapp|telefone|email|e mail|instagram|redes sociais|facebook|youtube|atendente|humano|equipe|organizacao do evento)\b/)) {
    const contact = socialContact(first(content, 'contact_info')), sources = [contactLink];
    if (/^\d{10,15}$/.test(String(contact.whatsapp || '').replace(/\D/g, ''))) sources.push(source('WhatsApp da organização', `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`));
    if (safeUrl(contact.instagram)?.startsWith('https://')) sources.push(source('Instagram da organização', contact.instagram));
    if (safeUrl(contact.facebook)?.startsWith('https://')) sources.push(source(contact.facebook_label, contact.facebook));
    return answer('contact', 'Você pode falar com a organização pelo formulário em “Contato”, no site. Abra a seção e escolha “Enviar mensagem”. A equipe poderá confirmar informações sobre participação e atendimento local.', sources);
  }
  if (has(q, /\b(acompanhar|acompanhamento|protocolo|pedido|reembolso|estorno|cancelar|confirmacao|paguei|pago|paga)\b/)) return answer('tracking', 'Use a página “Acompanhar inscrição” e o código gerado na simulação. Eu não consulto pedidos ou dados pessoais. Neste momento, os pedidos são demonstrativos e não representam pagamento, ingresso ou reserva real.', [source('Acompanhar inscrição', '/acompanhamento'), contactLink], ['A inscrição é de verdade?']);
  if (has(q, /\b(preco|precos|valor|valores|custa|custo|custos|pagar|mensalidade|taxa|taxas|gratuito|gratis|quanto)\b/) && !has(q, /\b(principios|ideais)\b/) && (!has(q, /\b(pix|boleto|cartao)\b/) || has(q, /\b(preco|custa|custo|valor)\b/))) {
    if (has(q, /\b(mensalidade|membro|iniciacao|bethel)\b/) || membershipContext) return answer('membership-cost', 'Não há uma tabela de taxas dos Bethels publicada aqui. Confirme com a equipe local os custos de ingresso, materiais e eventuais contribuições. Os valores da inscrição de evento neste site são apenas de demonstração.', [contactLink], ['Como participar?']);
    if (has(q, eventWords) || eventContext) return answer('price', `Os preços exibidos na inscrição são fictícios, usados para testar o fluxo. No primeiro lote de teste: ${demoCatalog.categories.map(item => `${item.label}: ${currency(item.priceCents)}`).join('; ')}.\n\nEles não são uma oferta de venda. Valores e cobrança reais precisam de confirmação da organização.`, [source('Inscrição demonstrativa', '/inscricao'), contactLink], ['A inscrição é de verdade?', 'Quais as formas de pagamento?']);
    if (has(q, /\b(preco|custa|custo|pagar|quanto|taxa|gratuito|gratis)\b/)) return answer('cost-choice', 'Você quer saber sobre as taxas de participação em um Bethel ou sobre os valores demonstrativos do evento?', [], ['Quanto custa participar de um Bethel?', 'Quanto custa o evento?']);
  }
  if (has(q, /\b(pix|boleto|cartao|pagamento|parcelar|parcelamento|cobranca)\b/)) return answer('payment', 'A inscrição permite simular Pix, boleto e cartão. Não há cobrança, chave Pix para transferência ou transação bancária. Uma operação real só poderá acontecer quando a organização ativar e confirmar o sistema de pagamentos.', [source('Inscrição demonstrativa', '/inscricao')], ['A inscrição é de verdade?', 'Acompanhar inscrição']);
  if (has(q, /\b(hospedagem|hotel|quarto|dormir|acomodacao|acomodacoes|pernoite)\b/)) return answer('lodging', 'A demonstração oferece participação sem hospedagem e opções de quartos compartilhados. Essas escolhas servem para testar o formulário e não reservam vagas. Confirme hospedagem e disponibilidade reais com a organização.', [source('Ver opções demonstrativas', '/inscricao'), contactLink]);
  if (has(q, /\b(programacao|cronograma|palestra|palestras|cafe|almoco|coquetel|treinamentos)\b/)) return answer('schedule', `A programação publicada para ${demoCatalog.name} é:\n\n${demoCatalog.schedule.map(item => `${item.time} — ${item.title}`).join('\n')}\n\n${demoCatalog.notice}`, [source('Programação do evento', '/evento#programacao')], ['Onde será o evento?', 'Como me inscrever no evento?']);
  if (has(q, /\b(inscricao|inscricoes|inscrever|ingresso|ingressos|cadastro|cadastrar|reserva|simulacao|ficticio|demonstracao)\b/) || (eventContext && has(q, /\b(participar|entrar|verdade|real)\b/))) return answer('registration', 'A inscrição funciona dentro do site: você escolhe as opções, preenche os participantes e acompanha o resumo. Por enquanto, todo esse fluxo é demonstrativo: use dados fictícios. Ele não garante participação, não gera ingresso e não cobra pagamento.', [source('Abrir inscrição demonstrativa', '/inscricao'), source('Acompanhar inscrição', '/acompanhamento')], ['Quanto custa o evento?', 'Falar com a equipe']);
  if (has(q, /\b(idade|idades|anos|menor|maior|crianca|criancas|adulta)\b/)) return answer('age', 'A página de ingresso da JDI apresenta a participação para meninas de 10 a 19 anos e opções de apoio para pessoas a partir de 20 anos. O Bethel local deve orientar sobre os requisitos e a situação de cada interessada. Se você for menor de idade, converse com sua família ou responsável.', [joining, contactLink], ['Como participar?', 'Precisa ter parente maçom?']);
  if (has(q, /\b(macom|macons|maconaria|parentesco|parente|patrocinio)\b/)) return answer('masonry', 'Segundo a JDI, o ingresso pode envolver parentesco ou indicação/patrocínio. Quem não tem um parente maçom pode buscar orientação sobre indicação com um Bethel. Confirme o procedimento com a equipe local.', [institution, contactLink], ['Como participar?', 'Qual a idade para participar?']);
  if (has(q, /\b(religiao|religiosa|religioso|igreja|seita|fe|deus|crenca)\b/)) return answer('religion', 'A JDI informa que não é uma religião nem a substitui. Seus princípios incluem a crença em um poder superior e o respeito à prática religiosa de cada integrante.', [institution], ['De onde vem o nome Filhas de Jó?', 'Como participar?']);
  if (has(q, /\b(entrar|ingressar|participar|visitar|visita|associar|tornar|ser uma filha|ser filha|minha filha)\b/) && !has(q, eventWords)) return answer('join', 'O primeiro passo é conversar com um Bethel da sua região. A equipe orienta sobre os requisitos e a ficha de ingresso. Se você for menor de idade, envolva seu responsável nessa conversa. O formulário de evento do site é uma simulação e não realiza ingresso na instituição.', [joining, contactLink], ['Qual a idade para participar?', 'Precisa ter parente maçom?', 'Bethels no Rio']);
  if (has(q, /\b(onde|endereco|local|chegar|sesc|copacabana)\b/) && (has(q, eventWords) || eventContext)) return answer('venue', `A página de “${demoCatalog.name}” informa ${demoCatalog.dateLabel.toLowerCase()} e indica ${demoCatalog.venue} como local. A reserva ainda aguarda confirmação. Não há endereço definitivo confirmado para eu informar. Consulte a organização antes de planejar o deslocamento.`, [eventLink, contactLink], ['Ver programação', 'Falar com a equipe']);
  if (has(q, eventWords) || (eventContext && has(q, /\b(quando|data|dia|horario|onde)\b/))) return answer('event', `A página do evento apresenta “${demoCatalog.name}” para ${demoCatalog.dateLabel.toLowerCase()}, com atividades a partir das ${demoCatalog.schedule[0].time}. O local indicado é ${demoCatalog.venue}, ainda a confirmar.\n\nA inscrição e o pagamento disponíveis no site são demonstrativos. Consulte a equipe para confirmar sua participação.`, [eventLink], ['Ver programação', 'Onde será o evento?', 'Como me inscrever no evento?']);
  if (has(q, /\b(susie|holmes|mater|iraja|olaria)\b/)) {
    const bethel = history.bethels?.find(item => has(q, /\b(susie|holmes|iraja|olaria)\b/) ? /susie/i.test(item.name) : /mater/i.test(item.name));
    if (bethel) return answer('rio', `${clean(bethel.name)}\nFundação registrada: ${clean(bethel.founded) || 'data a confirmar'}.\n\n${clean(bethel.text)}\n\nEste é um registro histórico. Funcionamento e endereço atuais precisam ser confirmados.`, [historyLink, source('Registro histórico citado', bethel.source), contactLink], ['Bethels no Rio']);
  }
  if (has(q, /\b(brasil|brasileir[oa]|brasileiras|mansur)\b/) || (has(q, /\b(rio|rj)\b/) && has(q, /\b(historia|fundacao|fundou|comecou|primeiro)\b/))) return answer('brazil', clean(history.brazil_text), [historyLink, source('Fonte da história no Brasil', history.brazil_source)], ['Bethels no Rio', 'Quem fundou as Filhas de Jó?']);
  if (has(q, /\b(bethel|rio|rj|niteroi|petropolis|duque de caxias)\b/)) {
    if (has(q, /\b(o que|significa|significado|definicao)\b/) && has(q, /\bbethel\b/) && !has(q, /\b(rio|rj)\b/)) return answer('bethel', 'Bethel é o nome dado a um grupo local das Filhas de Jó. É nele que as integrantes se reúnem, organizam atividades e desenvolvem sua liderança.', [institution], ['Bethels no Rio', 'Como participar?']);
    return answer('rio', `O acervo do site apresenta ${history.bethels?.map(item => clean(item.name)).filter(Boolean).join(' e ') || 'registros históricos de Bethels do Rio'}.\n\n${clean(history.bethels_note) || 'É um acervo histórico, não um cadastro atualizado de todos os Bethels ativos.'} Para encontrar um Bethel perto de você, fale com a equipe.`, [source('História dos Bethels do Rio', '/historia#bethels-rj'), contactLink], ['O que é um Bethel?', 'Como participar?']);
  }
  if (has(q, /\b(biblia|livro de jo|biblico|de onde vem o nome|origem do nome|por que (o nome|se chama|chamam))\b/)) return answer('name', 'O nome faz referência às filhas de Jó, do livro bíblico de Jó. A história e seus ensinamentos inspiraram Ethel T. Wead Mick na criação da organização.', [source('A fundadora · JDI', `${official}our-founder/`)], ['Quem fundou as Filhas de Jó?', 'As Filhas de Jó são uma religião?']);
  if (has(q, /\b(historia|fundou|fundada|fundador|fundadora|fundacao|origem|ethel|mick|1920|surgiu|criou)\b/)) return answer('origin', clean(history.origin_text), [historyLink, source('A fundadora · JDI', history.origin_source)], ['História no Brasil', 'Bethels no Rio']);
  if (has(q, /\b(vestido|roupa|capa|coroa|tunica|branco|uniforme)\b/)) return answer('uniform', 'Segundo a JDI, as vestes brancas simbolizam igualdade entre as integrantes. Capas e coroas usadas pelas principais oficiais também lembram suas responsabilidades de liderança.', [institution]);
  if (has(q, /\b(valores|principios|ideais|lideranca|amizade|servico|confianca|tradicao|responsabilidade)\b/)) return answer('values', `Os valores apresentados no site são:\n\n${active(content, 'values').map(row => `${clean(row.data?.title)}: ${clean(row.data?.description)}`).join('\n') || 'Liderança, amizade, confiança, serviço, tradição e responsabilidade.'}`, [source('Nossos valores', '/#valores')], ['O que as integrantes fazem?']);
  if (has(q, /\b(atividades|fazem|reunioes|aprendem|filantropia|voluntariado|ajudar|doar|doacao)\b/)) return answer('activities', 'As integrantes organizam atividades em seus Bethels, exercitam a comunicação e participam de ações de serviço. Para conhecer a agenda local ou formas de ajudar, converse com a equipe.', [institution, contactLink], ['Como participar?', 'Falar com a equipe']);
  const faq = faqMatch(q, content);
  if (faq) return faq;
  if (has(q, /^(o que (sao|e)|quem sao|me (fale|conte)|fale|conte|conhecer|sobre)( as| a| um pouco sobre| sobre)? (filhas|filha|organizacao|instituicao)/) || /^(filhas de jo|filhas|quem somos)$/.test(q)) return answer('about', clean(first(content, 'about_content').text) || 'As Filhas de Jó são uma organização internacional dedicada ao desenvolvimento de jovens mulheres, com foco em liderança, amizade e serviço à comunidade.', [source('Quem somos', '/#sobre'), institution], ['Como participar?', 'Quem fundou as Filhas de Jó?', 'O que é um Bethel?']);
  return answer('unknown', 'Não encontrei uma informação confirmada para essa pergunta. Posso ajudar com a história, participação, Bethels e evento das Filhas de Jó. Para uma dúvida específica, a equipe pode orientar você.', [contactLink], initialQuestions.slice(1, 5));
}
