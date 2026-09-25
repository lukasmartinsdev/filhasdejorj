// Demonstration catalog only. Production inventory and prices must come from the API.
export const demoCatalog = {
  id: 'recepcao-supremo-time-2027', revision: 'demo-1', mode: 'demo',
  name: 'Recepção do Supremo Time',
  subtitle: 'Filhas de Jó Internacional · Rio de Janeiro',
  date: '2027-01-23', dateLabel: 'Sábado, 23 de janeiro de 2027',
  stayLabel: '23 a 25 de janeiro de 2027', venue: 'SESC Copacabana',
  notice: 'Programação informada pela organização. O local solicitado é o SESC Copacabana, cuja reserva aguarda confirmação.',
  schedule: [
    { time: '08:00', title: 'Café', description: 'Começamos o dia juntas.' },
    { time: '09:30', title: 'Abertura', description: 'Boas-vindas à nossa irmandade.' },
    { time: '10:30', title: 'Palestra', description: 'Um momento para ouvir e aprender.' },
    { time: '12:00', title: 'Almoço', description: 'Pausa para compartilhar a mesa.' },
    { time: '13:30', title: 'Treinamentos', description: 'Conhecimento e desenvolvimento em conjunto.' },
    { time: '17:00', title: 'Encerramento', description: 'Conclusão das atividades do dia.' },
    { time: '18:00', title: 'Coquetel em homenagem ao Supremo Time', description: 'Uma celebração especial para finalizar o encontro.' }
  ],
  accommodations: [
    { id: 'evento', label: 'Somente o evento', description: 'Participação sem hospedagem', occupants: 0 },
    { id: 'duplo', label: 'Quarto duplo', description: '2 participantes no mesmo pedido', occupants: 2 },
    { id: 'triplo', label: 'Quarto triplo', description: '3 participantes no mesmo pedido', occupants: 3 },
    { id: 'quadruplo', label: 'Quarto quádruplo', description: '4 participantes no mesmo pedido', occupants: 4 },
    { id: 'quintuplo', label: 'Quarto quíntuplo', description: '5 participantes no mesmo pedido', occupants: 5 },
    { id: 'coletivo-feminino', label: 'Coletivo feminino', description: '1 vaga demonstrativa · a partir de 12 anos', occupants: 1, minimumAge: 12 },
    { id: 'coletivo-masculino', label: 'Coletivo masculino', description: '1 vaga demonstrativa · a partir de 12 anos', occupants: 1, minimumAge: 12 }
  ],
  categories: [
    { id: 'filha', label: 'Filha de Jó', priceCents: 15000 },
    { id: 'conselho', label: 'Conselho / voluntariado', priceCents: 18000 },
    { id: 'convidado', label: 'Familiar ou convidado', priceCents: 20000 },
    { id: 'crianca', label: 'Criança até 9 anos', priceCents: 8000 }
  ],
  lots: [{ id: 'primeiro', label: '1º lote de teste', extraCents: 0 }, { id: 'segundo', label: '2º lote de teste', extraCents: 3000 }],
  shirts: ['P', 'M', 'G', 'GG', 'XG'],
  paymentMethods: ['pix', 'boleto', 'card'], maxInstallments: 10,
  supportNeeds: ['Nenhuma', 'Restrição alimentar', 'Mobilidade reduzida', 'Visual', 'Auditiva', 'Neurodivergência / necessidade social', 'Saúde / medicação contínua', 'Outra']
};

export const paymentNames = { pix: 'Pix', boleto: 'Boleto', card: 'Cartão de crédito' };
export const currency = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const newParticipant = () => ({ name: '', cpf: '', birthDate: '', categoryId: '', shirt: '', phone: '', email: '', cep: '', street: '', number: '', complement: '', district: '', city: '', state: '', bethel: '', memberId: '', sameAddress: false, supportNeed: 'Nenhuma', supportDetails: '', guardianName: '', guardianPhone: '' });

export function ageAt(birthDate, eventDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || '') || birthDate > eventDate) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  if (parsed.toISOString().slice(0, 10) !== birthDate || y < 1900) return null;
  const [ey, em, ed] = eventDate.split('-').map(Number);
  return ey - y - (em < m || (em === m && ed < d) ? 1 : 0);
}

export function validCpf(value) {
  const digits = (value || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  for (const size of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < size; i++) sum += Number(digits[i]) * (size + 1 - i);
    const digit = (sum * 10) % 11;
    if (Number(digits[size]) !== (digit === 10 ? 0 : digit)) return false;
  }
  return true;
}

export function quoteOrder(catalog, draft) {
  const lot = catalog.lots.find(x => x.id === draft.lotId);
  const accommodation = catalog.accommodations.find(x => x.id === draft.accommodationId);
  if (!lot || !accommodation) throw new Error('Escolha um tipo de inscrição e um lote.');
  const lines = draft.participants.map((person, index) => {
    const category = catalog.categories.find(x => x.id === person.categoryId);
    return { participant: index + 1, label: category?.label || 'Categoria a selecionar', amountCents: category ? category.priceCents + lot.extraCents : 0 };
  });
  return { currency: 'BRL', lines, totalCents: lines.reduce((sum, line) => sum + line.amountCents, 0), complete: lines.every((_, i) => catalog.categories.some(c => c.id === draft.participants[i].categoryId)) };
}

export function validateDraft(catalog, draft, step = 3) {
  const errors = {};
  const accommodation = catalog.accommodations.find(x => x.id === draft.accommodationId);
  if (!accommodation) errors.accommodationId = 'Selecione um tipo de inscrição.';
  if (!catalog.lots.some(x => x.id === draft.lotId)) errors.lotId = 'Selecione um lote.';
  if (!draft.participants.length || draft.participants.length > 5 || (accommodation?.occupants && draft.participants.length !== accommodation.occupants)) errors.participants = 'Confira a quantidade de participantes para esta acomodação.';
  if (step < 2) return errors;
  const cpfs = new Set();
  draft.participants.forEach((person, i) => {
    const prefix = `participants.${i}.`;
    const add = (key, text) => { errors[prefix + key] = text; };
    if (person.name.trim().split(/\s+/).length < 2) add('name', 'Informe nome e sobrenome.');
    // Test mode deliberately accepts synthetic 11-digit identifiers, never requests a real CPF.
    if (catalog.mode === 'demo' ? !/^\d{11}$/.test(person.cpf.replace(/\D/g, '')) : !validCpf(person.cpf)) add('cpf', catalog.mode === 'demo' ? 'Use 11 dígitos fictícios para o teste.' : 'Informe um CPF válido.');
    const cpf = person.cpf.replace(/\D/g, '');
    if (cpfs.has(cpf)) add('cpf', 'Cada participante precisa ter um CPF diferente.');
    cpfs.add(cpf);
    const age = ageAt(person.birthDate, catalog.date);
    if (age === null || age > 120) add('birthDate', 'Confira a data de nascimento.');
    if (accommodation?.minimumAge && age !== null && age < accommodation.minimumAge) add('birthDate', `Nesta opção de teste, a idade mínima é ${accommodation.minimumAge} anos na data do evento.`);
    if (!catalog.categories.some(x => x.id === person.categoryId)) add('categoryId', 'Selecione uma categoria.');
    if (person.categoryId === 'crianca' && age !== null && age >= 10) add('categoryId', 'Esta categoria é para crianças de até 9 anos.');
    if (!catalog.shirts.includes(person.shirt)) add('shirt', 'Selecione o tamanho.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) add('email', 'Confira o e-mail.');
    if (person.phone.replace(/\D/g, '').length < 10) add('phone', 'Informe DDD e telefone.');
    const address = i > 0 && person.sameAddress ? draft.participants[0] : person;
    if (!(i > 0 && person.sameAddress)) {
      for (const key of ['street', 'number', 'district', 'city']) if (!address[key].trim()) add(key, 'Preencha este campo.');
      if (!/^\d{8}$/.test(address.cep.replace(/\D/g, ''))) add('cep', 'Informe os 8 dígitos do CEP.');
      if (!/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(address.state)) add('state', 'Selecione o estado.');
    }
    if (age !== null && age < 18) {
      if (person.guardianName.trim().split(/\s+/).length < 2) add('guardianName', 'Informe o nome do responsável.');
      if (person.guardianPhone.replace(/\D/g, '').length < 10) add('guardianPhone', 'Informe o contato do responsável.');
    }
    if (!catalog.supportNeeds.includes(person.supportNeed)) add('supportNeed', 'Selecione uma opção.');
    if (person.supportNeed !== 'Nenhuma' && !person.supportDetails.trim()) add('supportDetails', 'Descreva o apoio necessário.');
  });
  if (step < 3) return errors;
  if (!catalog.paymentMethods.includes(draft.paymentMethod)) errors.paymentMethod = 'Selecione a forma de pagamento.';
  if (!Number.isInteger(draft.installments) || draft.installments < 1 || draft.installments > catalog.maxInstallments || (draft.paymentMethod !== 'card' && draft.installments !== 1)) errors.installments = 'Confira o parcelamento.';
  if (!draft.consent) errors.consent = 'Confirme a ciência sobre o uso dos dados.';
  return errors;
}

export function exampleParticipant(index = 0) {
  return { ...newParticipant(), name: `Participante Exemplo ${index + 1}`, cpf: String(10000000000 + index), birthDate: '2007-05-15', categoryId: 'filha', shirt: 'M', phone: '21900000000', email: `participante${index + 1}@example.invalid`, cep: '22000000', street: 'Rua de Exemplo', number: '100', district: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', bethel: 'Bethel de demonstração' };
}
