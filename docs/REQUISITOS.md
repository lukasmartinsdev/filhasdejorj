# Conferência do enunciado de frontend

Referência: imagem enviada em 25/09/2026. Grupo 01: Victor, Flávio e Lukas.

| Requisito | Implementação / evidência |
| --- | --- |
| Tema definido | Site institucional Filhas de Jó RJ |
| Projeto no GitHub | Repositório público `lukasmartinsdev/filhasdejorj`, com código, documentação e histórico |
| Formulário com ViaCEP | `/inscricao`, etapa Participantes, consulta `/api/cep/:cep`, trata falhas e permite digitação manual |
| API local | `server/app.js`, executável por `npm run dev:api` e integrado por `npm run dev` |
| Rotas, menu, links e quatro páginas | Início, História, Evento, Inscrição, Acompanhamento e Conta |
| Hospedagem gratuita | Vercel Hobby, plano conferido em 25/09/2026 |
| Painel em rota oculta com senha | `/admin`, sem links públicos; autenticação e autorização no backend |
| Inserir, atualizar, selecionar e excluir | CRUD `/api/admin/content/:tabela/:id`, consumido pelo painel |
| Pesquisa de colaboração no GitHub | `CONTRIBUTING.md`, modelo de PR e workflow de testes em `.github/` |

## Roteiro para conferir

1. Navegue entre pelo menos quatro páginas usando o menu e os botões do site publicado.
2. Em `/inscricao`, avance até Participantes e digite `01001-000` no CEP. Confira o endereço preenchido pelo ViaCEP e informe o número manualmente.
3. Digite `/admin` na barra do navegador e mostre o login obrigatório.
4. Após entrar, em Perguntas frequentes, crie uma pergunta de demonstração **inativa**, consulte a lista, edite a resposta e exclua o mesmo item. A aba Network mostra POST, GET, PATCH e DELETE. Não exponha o cabeçalho de autorização.
5. Execute `npm run dev:api` e consulte `http://127.0.0.1:3001/api/health`. O servidor roda localmente e o banco PostgreSQL fica no Supabase.
6. Mostre no GitHub os arquivos da API, os testes e as instruções de branches, commits e revisão por pull request.

## Verificação

- `npm test`: 24 testes, incluindo autenticação, validação de dados e ViaCEP.
- `npm run build`: compilação React/Vite.
- `scripts/api-smoke.mjs`: CRUD persistido, item oculto, conflito de versão e ViaCEP real.
- `scripts/requirements-qa.cjs`: fluxo no navegador, links administrativos ocultos, área de reservas protegida, ViaCEP e CRUD pela interface.

## Limites

As atividades da plataforma e o prazo do enunciado dependem do grupo. O guia de colaboração não prova participação: cada integrante precisa produzir os próprios commits e revisões. Nenhuma autoria foi fabricada.

Inscrições e pagamentos continuam demonstrativos por decisão do usuário. O CRUD institucional é real e persistido. A API local usa internet para o banco e o ViaCEP; um banco totalmente offline não foi solicitado no enunciado.

Ocultar links não substitui segurança: a API valida a sessão e o perfil administrativo, e o banco mantém RLS. Detalhes em [API.md](API.md).
