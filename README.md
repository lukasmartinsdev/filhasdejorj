# Filhas de Jó RJ

Projeto único em React + Vite + JavaScript. Backend no Supabase existente `godvzqqmsrkyvlflmadd`, renomeado para `filhasdejorj`.

## Executar

Use Node 22+; `npm install`, copie `.env.example` para `.env` e execute `npm run dev`. `npm run build` gera `dist/`. O host precisa redirecionar rotas desconhecidas para `index.html` para suportar `/admin`.

## Conteúdo e administração

`/admin` usa Supabase Auth. Autenticação não implica autorização: o usuário deve ter registro ativo em `admin_profiles`. A tabela de administradores não pode ser alterada por clientes. Nunca incluir service_role no frontend.

O CMS permite editar identidade/logo, hero, apresentação, história e linha do tempo, evento, valores, programação, convidados, galeria, apoiadores, FAQ, contato, links, inscrições e lotes. As seções podem ser ocultadas e reordenadas. Uploads de até 8 MB para `site-assets` aceitam PNG, JPG, WebP e GIF e exigem administrador. Formulários de contato e interesse salvam registros privados; não enviam e-mails automaticamente. Vídeo e canais sociais aguardam os dados oficiais.

As migrações estão em `supabase/migrations/`. Não reaplicar a migração inicial num projeto que já tenha o CMS. Os dados antigos da Promoinfo e suas permissões foram preservados; nenhuma tabela foi excluída.

## Ingressos

`registration_settings` e `registration_lots` reservam valor, vagas, prazo e link externo. Não há checkout ou gateway de pagamentos nesta etapa, conforme solicitado. Para a próxima fase, criar pedidos e ingressos com emissão no backend, webhooks autenticados e validação de pagamento; valores nunca devem ser confiados ao cliente.

## Segurança e validação

RLS em todas as tabelas novas. Conteúdo ativo pode ser lido publicamente. Escrita de conteúdo e uploads são permitidos somente a um perfil administrativo ativo. `private.is_admin` usa SECURITY INVOKER e consulta exclusivamente o perfil do usuário. Os dois RPCs públicos de formulários usam SECURITY DEFINER intencionalmente para oferecer inserção validada sem expor leitura de dados pessoais. Fixam search_path, validam consentimento e tamanho, impedem duplicação de interesse e aplicam intervalo por e-mail ao contato. Os avisos do advisor sobre esses dois RPCs são esperados pelo desenho de escrita pública controlada: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable .

Verificações visuais e funcionais registradas em `docs/qa/report.json`; fontes e origem das imagens em `docs/REFERENCIAS.md`. Chaves `sb_publishable_` são públicas por design; a proteção dos dados é feita por RLS.
