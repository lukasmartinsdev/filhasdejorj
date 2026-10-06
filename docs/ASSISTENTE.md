# Ethel — assistente das Filhas de Jó RJ

Ethel homenageia Ethel T. Wead Mick, fundadora das Filhas de Jó. A interface identifica uma assistente virtual, sem se passar pela fundadora ou por uma dirigente. O botão “Fale com a Ethel” aparece nas páginas públicas.

## Integração com Gemini

`POST /api/chat` usa o AI SDK e o provedor Google Vertex AI. O modelo padrão é `gemini-3.8-flash`. A geração acontece exclusivamente no servidor; o pacote de IA e as credenciais não entram no JavaScript público.

**Estado da entrega:** integração preparada e testada com respostas simuladas do provedor. A ativação e o teste real dependem de login na conta Google, habilitação do projeto Cloud e configuração das credenciais na Vercel. Enquanto isso, o atendimento usa a base revisada e avisa que a IA está indisponível. Uma resposta local nunca recebe o selo “IA”.

Usamos Vertex AI padrão, sob as condições Google Cloud. A [API do AI Studio](https://ai.google.dev/gemini-api/terms) restringe aplicações dirigidas ou provavelmente acessadas por menores de 18 anos, incompatível com o público deste site. O modo Express também tem limitações próprias de dados e não foi habilitado.

### Configuração no servidor

No projeto Google Cloud, habilite a API Vertex AI e use uma conta de serviço dedicada com acesso mínimo necessário à inferência, por exemplo `roles/aiplatform.user`, sem papéis Owner/Editor. Guarde na Vercel, em Production:

| Variável | Conteúdo |
| --- | --- |
| `GOOGLE_CLOUD_PROJECT` | ID do projeto Google Cloud |
| `GOOGLE_CLOUD_LOCATION` | `global` |
| `GOOGLE_CLIENT_EMAIL` | E-mail da conta de serviço |
| `GOOGLE_PRIVATE_KEY` | Chave privada, como variável sensível |
| `AI_CHAT_MODEL` | `gemini-3.8-flash` |
| `AI_CHAT_ENABLED` | `true` após conferir acesso, cotas e custos |

Nunca use o prefixo `VITE_` para credenciais. Não salve o JSON de credenciais no repositório. Localmente, use `.env.local`, ignorado pelo Git, e `npm run dev`. A API independente pode ser iniciada com `node --env-file=.env --env-file=.env.local server/index.js`. Na Vercel, publique novamente depois de configurar as variáveis.

Nenhum cartão, assinatura ou recarga foi contratado nesta entrega. Vertex AI pode cobrar por uso; a ativação depende da configuração da conta. Configure cotas e orçamento no Google Cloud. Alertas de orçamento não bloqueiam gastos sozinhos.

## Base e limites

- `server/chat.js` monta a base pública a partir das respostas revisadas de `src/assistant/knowledge.js`, do conteúdo institucional ativo e do catálogo usado na página de evento. Não entrega ao modelo o objeto completo do CMS nem variáveis de ambiente.
- O Gemini recebe a pergunta e até oito mensagens anteriores, limitadas a 10 mil caracteres no total. Cada pergunta aceita até 500 caracteres. Histórico serve para contexto, não como fonte de fatos.
- O prompt restringe o tema, exige reconhecer lacunas e mantém inscrições e pagamentos como demonstração. O modelo não consulta pedidos, altera o CMS, envia mensagens ou cobra valores.
- A geração tem até 700 tokens de saída, prazo de 20 segundos e nenhuma repetição automática. Filtros do provedor são mantidos em nível restritivo.
- Links são selecionados por identificadores de fontes do servidor. O modelo não escolhe URLs livres. Respostas com HTML, URL livre ou dados pessoais reconhecidos são descartadas; a interface renderiza texto, sem HTML.
- Limite em memória de 15 perguntas por visitante e 100 por instância a cada 10 minutos. Na Vercel isso reduz rajadas, mas **não é um limite global distribuído nem teto financeiro**. Cotas do provedor e monitoramento de uso são necessários para ativação pública.
- Erros de cota, prazo, configuração e resposta inválida usam a base local, com aviso explícito. Um modelo pode errar; as fontes e o contato humano continuam disponíveis.

## Privacidade e interface

Perguntas são enviadas à API do site e, quando a IA está ativa, ao Gemini no Google Cloud. O aplicativo não persiste conversas no Supabase ou no armazenamento do navegador, nem registra perguntas/respostas nos logs. O tratamento pelo provedor segue os termos e a configuração Google Cloud; isso não equivale a prometer retenção zero em toda a infraestrutura.

Padrões comuns de CPF, telefone, e-mail e senhas são interceptados no navegador e conferidos no servidor antes da geração. Essa detecção é limitada: o aviso pede que não sejam enviados dados pessoais. Nenhuma informação de contas, pagamentos ou formulários é incluída automaticamente na conversa.

Fechar, limpar ou recarregar apaga o histórico do navegador. Limpar/fechar aborta a requisição em curso. O painel funciona com teclado, Escape, foco acessível, anúncio de novas mensagens, carregamento e telas pequenas.

## Redes sociais verificadas em 5 de outubro de 2026

- [Instagram @filhasdejorj](https://www.instagram.com/filhasdejorj/): a biografia identifica o perfil oficial das Filhas de Jó Rio de Janeiro.
- [Facebook do Bethel #001 Rio de Janeiro](https://www.facebook.com/Bethel001rj/): identificado como página do Bethel, sem apresentá-lo como canal da jurisdição estadual.
- Não foi confirmado um YouTube ou WhatsApp da jurisdição. Botões sem endereço não são exibidos. Os links cadastrados no CMS têm precedência sobre esses padrões.

## Fontes institucionais

- [Fundadora — JDI](https://jobsdaughtersinternational.org/our-founder/)
- [Instituição — JDI](https://jobsdaughtersinternational.org/about/)
- [Ingresso — JDI](https://jobsdaughtersinternational.org/join/)
- `src/data/history.js`: referências brasileiras exibidas na página de história.

A página de ingresso indica 10 a 19 anos; a seção de dúvidas usa a expressão 10 a 20. A resposta identifica a fonte e encaminha a confirmação ao Bethel. Os registros de Bethels são históricos, não um diretório atualizado de unidades ativas.

## Verificação

`npm test` cobre validação, privacidade, contexto, fontes, limites e indisponibilidade sem consumir a API real. `npm run build` compila o site. Para confirmar ativação, uma pergunta em produção precisa retornar `mode: "ai"`; uma resposta em modo `fallback` não comprova funcionamento do Gemini.
