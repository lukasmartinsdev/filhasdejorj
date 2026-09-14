# Entrega Filhas de Jó RJ

- [x] Projeto único React + Vite, conteúdo em português.
- [x] Logo oficial íntegra, sem criação de marca alternativa.
- [x] Paleta roxa/off-white/dourada e tipografia serifada.
- [x] Referência CEOD analisada antes de desenvolver; print fornecido adotado como composição visual prioritária.
- [x] Hero com quatro jovens, navegação sobreposta e recorte angular dourado.
- [x] Quem somos + história em dois blocos no desktop; empilhamento mobile.
- [x] Evento com data, local e inscrições ainda por definir.
- [x] Seis valores com ícones; galeria de cinco imagens e lightbox.
- [x] Apoiadores em quatro categorias e logo oficial em realização.
- [x] Faixa de contato com foto do Rio contínua e degradê integrado, conforme ajuste pedido.
- [x] Painel com Auth e autorização por admin_profiles; usuário comum não ganha acesso.
- [x] RLS nas tabelas novas, conteúdo público somente ativo e uploads administrativos.
- [x] Formulários com consentimento, persistência privada, validação e retorno de sucesso somente após gravação.
- [x] Histórico Promoinfo preservado.
- [x] Testes de RLS com transação revertida: leitura pública, formulários, negação de escrita comum, CRUD admin e prevenção de autoelevação.
- [x] Testes da interface administrativa com sessão simulada: evento, FAQ, reordenação. Autorização real verificada separadamente no banco.
- [x] Login exige autenticação; sete tamanhos verificados, sem erros JS ou imagens quebradas.
- [ ] Dados definitivos de evento, vídeo e contatos sociais aguardam a organização.
- [ ] Checkout e gateway serão implementados na próxima etapa.

Avisos de segurança revisados: tabelas legadas já possuíam RLS sem políticas; não foram modificadas. RPCs públicos de formulário usam SECURITY DEFINER intencional, com validação e sem retornar dados pessoais. A biblioteca de uploads é pública para leitura; escrita exige perfil admin ativo.
