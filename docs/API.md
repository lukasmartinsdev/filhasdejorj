# API do projeto

A API própria é implementada em Node.js em `server/app.js`. O mesmo código atende localmente e em uma Vercel Function (`api/[...path].js`). O banco e a autenticação usam o Supabase; é necessário acesso à internet para essas integrações e para o ViaCEP. “API local” significa que o processo HTTP roda no computador, não que o banco inteiro funcione offline.

## Executar

Use Node.js 22 ou superior, `npm ci` e copie `.env.example` para `.env`.

- `npm run dev`: abre o site e a API em `http://127.0.0.1:5173`.
- `npm run dev:api`: abre apenas a API em `http://127.0.0.1:3001`. `API_PORT` permite alterar a porta.
- `npm test`: testes do servidor, autenticação, validação, ViaCEP e inscrições demonstrativas.

Exemplo no PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/health
Invoke-RestMethod http://127.0.0.1:3001/api/cep/01001000
```

## Endpoints

| Método e rota | Acesso | Operação |
| --- | --- | --- |
| `GET /api/health` | Público | Estado do servidor |
| `GET /api/content` | Público | Conteúdo ativo do site |
| `GET /api/cep/01001000` | Público | Consulta ViaCEP e devolve endereço normalizado |
| `GET /api/admin/session` | Administrador | Valida sessão e permissão |
| `GET /api/admin/content` | Administrador | Carrega o conteúdo do painel, incluindo registros ocultos |
| `GET /api/admin/content/:tabela` | Administrador | Lista registros |
| `GET /api/admin/content/:tabela/:id` | Administrador | Consulta um registro |
| `POST /api/admin/content/:tabela` | Administrador | Insere um registro |
| `PATCH /api/admin/content/:tabela/:id` | Administrador | Atualiza um registro |
| `DELETE /api/admin/content/:tabela/:id` | Administrador | Exclui um registro |
| `POST /api/admin/sections/swap` | Administrador | Troca a ordem de duas seções de forma atômica |
| `GET /api/admin/inbox/contact` | Administrador | Consulta mensagens |
| `GET /api/admin/inbox/interest` | Administrador | Consulta lista de interesse |

As tabelas aceitas correspondem aos editores do painel: `site_settings`, `hero_content`, `about_content`, `history_content`, `event_info`, `values`, `schedule_items`, `guests`, `gallery`, `sponsors`, `faq`, `contact_info`, `social_links`, `registration_settings`, `registration_lots` e `sections`. Seções fixas e conteúdos únicos não podem ser excluídos ou duplicados pela API. Não há acesso genérico a tabelas legadas, usuários ou perfis administrativos.

O corpo de criação contém `data`, `active` e `sort_order`. Edição e exclusão exigem o `updated_at` recebido na consulta anterior. Uma versão antiga retorna **409** para evitar que uma pessoa sobrescreva o trabalho de outra. Dados inválidos retornam **400**, ausência de sessão retorna **401**, falta de permissão retorna **403**, registro inexistente retorna **404** e payload acima de 128 KiB retorna **413**.

## Autenticação

O frontend autentica e-mail e senha no Supabase e envia o access token no cabeçalho `Authorization: Bearer ...`. A API verifica o token com `auth.getUser()` e exige um `admin_profiles` ativo com papel `admin`. Cada consulta ao banco usa a identidade do usuário, preservando o RLS. Não se usa chave `service_role`, senha fixa no código ou autorização baseada em metadados editáveis pelo usuário. Respostas administrativas não são armazenadas em cache.

O painel fica em `/admin`, sem links na navegação pública. A rota `/admin/reservas` também exige a sessão administrativa real, embora seus dados continuem demonstrativos. Ocultar o link é uma exigência de apresentação, não a proteção de segurança; a proteção é a autenticação e a autorização.

## ViaCEP

O formulário consulta após oito dígitos e preenche rua, bairro, cidade e UF. O usuário informa número e complemento. Requisições anteriores são canceladas quando o CEP ou participante muda. CEP inválido, inexistente, timeout e indisponibilidade têm mensagens próprias; o preenchimento manual permanece possível. Somente o CEP é enviado ao [ViaCEP](https://viacep.com.br/), sem CPF ou outros dados do formulário.

## Publicação

Na Vercel, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para build e runtime. O servidor também aceita `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. Execute `vercel deploy --prod` a partir da raiz. Não publique somente `dist/`: esta versão precisa da pasta `api/` e do backend. `vercel.json` preserva `/api/*` antes do fallback das páginas React.

O script `scripts/api-smoke.mjs` testa o CRUD com um registro temporário inativo, verifica controle de concorrência e remove o registro ao terminar. Recebe `TEST_ADMIN_EMAIL` e `TEST_ADMIN_PASSWORD` somente por variáveis de ambiente; opcionalmente `QA_BASE_URL` seleciona o endereço publicado. Nunca coloque esses valores no Git.
