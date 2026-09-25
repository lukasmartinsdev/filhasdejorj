# Inscrições do evento

## Versão de teste

A recepção acontece em **23 de janeiro de 2027, sábado**, conforme a programação informada pelo usuário. O coquetel começa às 18h; esse horário não representa o fim do coquetel. O ofício solicita o SESC Copacabana, mas não confirma a reserva. As 20 acomodações entre 23 e 25 de janeiro citadas no ofício se referem à hospedagem solicitada para a comitiva, não à duração da recepção nem a um estoque confirmado para venda.

Rotas: `/evento`, `/inscricao`, `/acompanhamento`, `/conta` e `/admin/reservas`. O site institucional possui links para inscrição, acompanhamento e programação. Em 16/09/2026, o usuário solicitou a publicação na Vercel; o site está em produção em `https://promoinfo.vercel.app`, no projeto `promoinfo`. A publicação não ativa inscrições ou pagamentos reais: o modo permanece `demo`.

O formulário oferece participação sem hospedagem e modelos de quarto inspirados no CEOD, de um a cinco participantes; categoria, lote, camisa, contato, endereço compartilhado, vínculo com Bethel, registro, acessibilidade e responsável para menores. Tipos de quarto, restrições etárias, categorias, valores e parcelamento são exemplos, sujeitos à definição da organização.

`src/registration/catalog.js` contém o catálogo demonstrativo e a programação. O modo padrão é `demo`. CPF, nascimento, telefone, e-mail do participante, endereço, responsáveis e dados de saúde existem apenas em memória e são descartados após gerar o pedido. `sessionStorage` guarda até 200 pedidos de demonstração com nomes fictícios, categoria, camisa, Bethel, presença, código, totais, acomodação, conta vinculada e histórico. Não há compartilhamento de dados entre abas ou dispositivos. Contas de teste aceitam somente e-mails @example.invalid e um código fictício de seis dígitos, guardado como hash com salt; isso não é autenticação de produção. Não há gravação no Supabase, cobrança, e-mail, reserva, QR Code válido ou emissão de ingresso. Se o armazenamento for bloqueado, a tela atual mantém o resumo em memória.

As imagens dos 10 patrocinadores da referência foram extraídas sem alterar os bytes e estão em `public/assets/sponsors`. A logo oficial das Filhas de Jó e os apoiadores ativos cadastrados permanecem; o apoio DeMolay Brasil foi desativado a pedido do usuário. Os parceiros da referência são adicionados à apresentação do site, sem alterar o CMS, em `src/registration/sponsors.js`.

## Integração à API preparada

`src/registration/service.js` expõe a mesma interface para o simulador e a futura API. A API **ainda precisa ser implementada e conectada ao banco**. Alterar as variáveis sem disponibilizar o backend exibirá indisponibilidade; não haverá sucesso simulado como alternativa.

```dotenv
VITE_REGISTRATION_MODE=api
VITE_REGISTRATION_API_URL=/api/registrations
```

Variáveis `VITE_*` são públicas. Nunca colocar credenciais administrativas, segredo do gateway ou `service_role` no frontend. Para usar uma API externa, configure uma URL HTTPS e a autenticação/CORS apropriados. O adaptador usa cookies somente na mesma origem.

### Contrato

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/catalog` | Objeto com `id`, `revision`, `name`, `date`, `dateLabel`, `venue`, `accommodations`, `categories`, `lots`, `shirts`, `supportNeeds`, `paymentMethods` e `maxInstallments`, no formato do catálogo de teste |
| POST | `/orders` | Pedido validado com preço calculado no servidor e URL segura do gateway |
| GET | `/orders/:id` | Resumo do pedido autorizado para a sessão do participante, sem expor dados pessoais de terceiros |

O POST recebe `eventId`, `catalogRevision`, `accommodationId`, `lotId`, `participants`, `paymentMethod`, `installments`, `consent` e `marketingConsent`. O header `Idempotency-Key` identifica a tentativa e deve impedir cobranças/pedidos duplicados quando o cliente repetir uma requisição. O cliente não envia um total a ser confiado. Endereços compartilhados são resolvidos antes do envio.

Cada participante contém `name`, `cpf`, `birthDate`, `categoryId`, `shirt`, `phone`, `email`, `cep`, `street`, `number`, `complement`, `district`, `city`, `state`, `bethel`, `memberId`, `sameAddress`, `supportNeed`, `supportDetails`, `guardianName` e `guardianPhone`. O servidor precisa limitar tamanhos, validar CPF, data, idade, quantidade, consentimento e compatibilidade de categoria.

Resposta do pedido:

```json
{
  "id": "opaque_order_id",
  "mode": "api",
  "status": "pending",
  "createdAt": "2027-01-01T12:00:00Z",
  "eventName": "Recepção do Supremo Time",
  "accommodation": "Somente o evento",
  "lot": "1º lote",
  "participantCount": 1,
  "totalCents": 15000,
  "paymentMethod": "pix",
  "paymentLabel": "Pix",
  "installments": 1,
  "paymentUrl": "https://gateway.example/checkout/opaque_session_id"
}
```

O valor no exemplo é ilustrativo. A consulta aceita `pending`, `confirmed` e `cancelled`. Retornar 401 sem sessão, 403 para pedido de outra pessoa, 409 para estoque/lote alterado e 422 para dados inválidos. Confirmação deve acontecer por webhook autenticado do provedor e nunca por uma ação pública de “aprovar pagamento”. Os métodos `setDemoStatus` e `recentOrders` do simulador não representam endpoints de produção.

### Banco para a próxima etapa

Separar eventos, categorias, lotes/estoque, pedidos, participantes e eventos de pagamento. Relacionar pedidos à identidade autorizada; armazenar valores em centavos; aplicar restrições únicas na chave de idempotência e no identificador do evento do gateway. Reservar estoque em transação e definir expiração para pedidos pendentes. Confirmar o pagamento e emitir ingressos de forma idempotente. Dados pessoais, CPF, responsáveis e informações de saúde devem ficar em tabelas privadas com acesso restrito à equipe autorizada. Nenhuma migração ou escrita no banco de produção foi realizada nesta etapa.

Antes de ativar vendas: definir tarifas, categorias e hospedagem reais, confirmar o local, implementar autenticação e consulta privada, integrar gateway em sandbox, testar webhooks e reconciliação, revisar consentimentos e política do evento e somente então habilitar produção.

## Cadastro, painel e pagamentos demonstrativos

O CTA “Inscrições” do site institucional abre `/evento`, com as informações e a programação, e daí segue para `/inscricao`. `/conta` simula cadastro, login e vínculo dos novos pedidos à conta. Não envia recuperação de acesso por e-mail nem cria conta real. `/admin/reservas` é um painel de demonstração aberto; o botão de entrada não concede acesso ao CMS real em `/admin`.

O painel mostra reservas, participantes, cadastros, busca por código ou nome, filtros de status e método, totais confirmados, exportação CSV e estoque ilustrativo. É possível cadastrar uma reserva pelo mesmo formulário, carregar três exemplos sem duplicá-los, aprovar ou recusar pagamentos, cancelar, expirar, estornar e marcar presença. A presença exige confirmação do pedido. Expiração é manual na simulação. Um estorno remove as presenças e libera a disponibilidade de teste. Estoque de demonstração está em `demoService.js`; não representa vagas confirmadas no SESC.

Pix e boleto mostram uma referência textual sem valor de pagamento. Cartão usa uma representação fictícia terminada em 0000 e parcelamento de até 10x. Recusa permite nova tentativa e troca de método; aprovação e cancelamento bloqueiam novas tentativas. Estorno é uma ação exclusiva do painel simulado. Cada mudança atualiza o histórico do mesmo pedido e a consulta pública na mesma sessão.

O painel administrativo da referência não é público. A implementação reproduz o fluxo público observado e acrescenta a gestão demonstrativa solicitada pelo usuário; não é uma cópia do backend ou de regras privadas do CRM Cronos.

Na integração real, implementar também conta/sessão e serviços administrativos autorizados: listagem paginada de pedidos e contas, estoque transacional, controle de presença, auditoria, cancelamento e estorno via gateway. Os controles de simulação não devem existir na API pública. O modo `api` desativa as páginas demonstrativas de conta e painel até essa integração; não basta mudar a variável para habilitar operação real.

### Verificação

`npm test`: 19 testes de validação, identidade demonstrativa, vínculo de pedidos, idempotência, estoque, estados de pagamento, presença, exportação e contrato da API. Verificação de navegador: cadastro, compra para duas pessoas, endereço compartilhado, cartão em três parcelas, recusa e aprovação, consulta após recarregar, painel, estorno, cadastro listado e disponibilidade.

## Fontes

- Estrutura e logotipos: https://ceod2027.demolayrj.org/
- Campos e fluxo: https://inscricao.crmcronos.cloud/inscricao/
- Ofício de solicitação do SESC Copacabana fornecido pelo usuário, datado de 15/08/2026.
- Programação de 23/01 e manutenção de logotipos: instruções diretas do usuário nesta tarefa.



## Adequação ao trabalho de frontend — 25/09/2026

O cadastro consulta ViaCEP por `/api/cep/:cep`, com preenchimento automático e tratamento de falhas. Os links administrativos foram retirados da navegação pública. `/admin/reservas` exige a sessão administrativa real antes de liberar os dados demonstrativos. A API própria controla o CRUD institucional e não ativa pagamentos reais. Consulte `API.md` e `REQUISITOS.md`.
