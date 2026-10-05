# Filhas de Jó RJ

Site institucional e projeto acadêmico do grupo Victor, Flávio e Lukas, com React, API Node.js, ViaCEP e painel administrativo.

- Site: https://promoinfo.vercel.app
- GitHub: https://github.com/lukasmartinsdev/filhasdejorj
- [Requisitos e roteiro de conferência](docs/REQUISITOS.md)
- [Como trabalhar em grupo no GitHub](CONTRIBUTING.md)
- [API e autenticação](docs/API.md)
- [Assistente virtual e manutenção das respostas](docs/ASSISTENTE.md)

## Arquitetura

React 19, Vite e JavaScript no frontend; API própria em Node.js; Supabase para PostgreSQL, autenticação e imagens; Vercel para hospedagem. O plano da Vercel foi confirmado como **Hobby** em 25/09/2026.

```text
Navegador React → /api/* (Node.js local ou Vercel Function) → Supabase com RLS
Formulário de cadastro → /api/cep/:cep → ViaCEP
Login e upload de imagens → Supabase Auth / Storage
```

O mesmo backend funciona localmente e na Vercel. O banco e o ViaCEP precisam de internet. A URL e a chave `sb_publishable_` dos arquivos de exemplo são públicas por design; não concedem acesso administrativo. Senhas e tokens administrativos não fazem parte do código.

## Executar

Use Node.js 22 ou superior. Execute `npm ci`, copie `.env.example` para `.env` e execute `npm run dev`. O site e a API abrem em `http://127.0.0.1:5173`.

Para executar apenas o backend, use `npm run dev:api`: `http://127.0.0.1:3001`. Consulte os exemplos em [API.md](docs/API.md).

- `npm test`: testes Node, sem senha ou acesso ao banco de produção.
- `npm run build`: compilação do frontend.
- O GitHub Actions executa ambos em pushes e pull requests.

## Páginas e administração

Páginas públicas: `/`, `/historia`, `/evento`, `/inscricao`, `/acompanhamento` e `/conta`, acessíveis pelo menu ou links do site.

O painel fica em `/admin`, sem links públicos, e exige login mais um perfil administrativo ativo. Permite inserir, consultar, atualizar e excluir conteúdo pela API própria; também reorganiza seções e consulta mensagens. Edições usam controle de versão para evitar sobrescrever alterações de outra pessoa. Seções únicas possuem edição; listas como FAQ, galeria e apoiadores têm CRUD completo.

`/admin/reservas` exige a mesma autorização real, embora os pedidos e pagamentos continuem demonstrativos. A senha é definida fora do repositório. Não mostre senhas, tokens ou dados de contato de terceiros durante a apresentação.

## Inscrições demonstrativas

Cadastro, acomodações, preços, pagamentos Pix/boleto/cartão, reservas e estornos são simulações. Não há cobrança, ingresso, reserva ou envio de e-mail real. O formulário usa ViaCEP para preencher rua, bairro, cidade e UF, mantendo número e complemento editáveis.

CPF, contato, endereço, informações de saúde e responsáveis existem apenas em memória e são descartados ao concluir a simulação. A aba guarda somente resumos demonstrativos; veja [INSCRICOES.md](docs/INSCRICOES.md). Cobranças reais exigem backend de pedidos, validação de preços, gateway e webhooks; não basta inserir uma chave no frontend.

## Publicação

O projeto Vercel vinculado é `promoinfo`. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em Production e Preview usando os valores públicos de `.env.example`. Na raiz, execute `npx vercel deploy --prod`.

**Publique o frontend e a API juntos, não apenas `dist/`.** `api/handler.js` reutiliza `server/app.js`; `vercel.json` encaminha `/api/:path*` explicitamente para essa função antes do fallback React. O vínculo local `.vercel/` fica fora do Git.

## Conteúdo e dados

O CMS usa o Supabase `godvzqqmsrkyvlflmadd`. As tabelas legadas foram preservadas. As migrações ficam em `supabase/migrations`; não reaplique a migração inicial em banco já configurado. As tabelas novas têm RLS, e uploads no bucket público `site-assets` exigem administrador. Formulários de contato e interesse salvam registros privados pelos RPCs existentes.

A identidade visual utiliza a logo fornecida e tons de roxo, branco e dourado. Imagens ilustrativas não são registros de eventos reais. Fontes históricas e referências: [REFERENCIAS.md](docs/REFERENCIAS.md). Informações do evento ainda sujeitas à confirmação são identificadas no site.
