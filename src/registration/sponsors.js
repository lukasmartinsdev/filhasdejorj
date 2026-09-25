// Original logo bytes from https://ceod2027.demolayrj.org/, retained at the owner's request.
export const referenceSponsors = [
  ['supremo-conselho.png', 'Supremo Conselho do Grau 33 do Rito Escocês Antigo e Aceito', 'Corpos Filosóficos'],
  ['rito-brasileiro.png', 'Supremo Conclave do Rito Brasileiro', 'Corpos Filosóficos'],
  ['rito-adonhiramita.png', 'Excelso Conselho do Rito Adonhiramita', 'Corpos Filosóficos'],
  ['macons-marca.png', 'Grande Loja de Mestres Maçons da Marca do Estado do Rio de Janeiro', 'Corpos Filosóficos'],
  ['york.png', 'Corpo Filosófico — York', 'Corpos Filosóficos'],
  ['grande-oriente-brasil.png', 'Grande Oriente do Brasil', 'Potências Simbólicas'],
  ['grande-loja-rj.jpg', 'Grande Loja Maçônica do Estado do Rio de Janeiro', 'Potências Simbólicas'],
  ['grande-oriente-rj.png', 'Grande Oriente do Rio de Janeiro', 'Potências Simbólicas'],
  ['amorio.png', 'AMORIO – Associação do Oeste do Rio de Janeiro', 'Outros apoiadores'],
  ['fecomercio-rj.png', 'Fecomércio RJ', 'Outros apoiadores']
].map(([file, name, category], index) => ({ id: `reference-${index}`, active: true, sort_order: index, data: { name, category, logo: `/assets/sponsors/${file}`, url: '', description: name } }));
export function previewSponsors(existing = []) {
  return [...existing, ...referenceSponsors.filter(row => !existing.some(item => item.data.name === row.data.name))];
}
