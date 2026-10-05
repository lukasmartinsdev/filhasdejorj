# Assistente das Filhas de Jó RJ

O botão “Posso ajudar?” abre uma conversa nas páginas públicas. O atendimento automático cobre história, participação, valores, Bethels, evento, programação e o funcionamento da inscrição demonstrativa. Perguntas sem resposta confirmada recebem um encaminhamento para a equipe.

## Funcionamento e manutenção

- `src/assistant/knowledge.js` contém as intenções, respostas, sugestões e referências. A busca reconhece variações de perguntas e mantém contexto para perguntas curtas sobre custos e local.
- As respostas institucionais consultam o conteúdo público já carregado pelo site. Novas perguntas e respostas ativas cadastradas no FAQ do painel podem ser encontradas pela conversa. O assistente exige correspondência forte e evita desempates arbitrários.
- Informações de evento têm precedência sobre FAQs antigas. Usam `src/registration/catalog.js`, a mesma origem da página de evento. Preços e inscrições continuam explicitamente demonstrativos. Para ativar uma operação real no futuro, revise o catálogo, o serviço de inscrição e essas respostas juntos.
- Histórico de Bethels não é tratado como lista atualizada de unidades ativas ou de endereços. Informações não confirmadas são encaminhadas à equipe.

O atendimento usa uma base de respostas revisadas e busca local. Não utiliza um modelo generativo, não exige chave de API e não tem cobrança por mensagem. Não há promessa de compreensão de qualquer pergunta.

## Privacidade e acessibilidade

As perguntas não são enviadas ao servidor, não são gravadas no Supabase e não ficam em localStorage ou sessionStorage. O navegador mantém até 20 trocas enquanto a janela permanece aberta. Fechar, limpar ou recarregar a página descarta a conversa. O campo limita mensagens a 500 caracteres. Padrões comuns de telefone, CPF, e-mail e senha são ocultados da conversa e recebem orientação, mas essa detecção não substitui o cuidado de não enviar dados pessoais.

O assistente não consulta pedidos, contas ou dados administrativos. Conteúdo é renderizado como texto e links passam pela validação de URLs. Há suporte a teclado, Escape, identificação acessível de controles e anúncio de novas respostas. A janela se adapta à altura da tela e ao teclado móvel.

## Referências consultadas em 5 de outubro de 2026

- [Fundadora e origem — JDI](https://jobsdaughtersinternational.org/our-founder/)
- [Sobre a instituição e dúvidas — JDI](https://jobsdaughtersinternational.org/about/)
- [Ingresso — JDI](https://jobsdaughtersinternational.org/join/)
- `src/data/history.js`: referências brasileiras já publicadas na página de história.

A página de ingresso apresenta a faixa de 10 a 19 anos, enquanto a seção de dúvidas usa a expressão 10 a 20. A resposta identifica a página de ingresso como fonte e encaminha a confirmação do caso individual ao Bethel, sem decidir elegibilidade.

Verificação: `npm test`, `npm run build` e teste da conversa no navegador em telas grandes e pequenas.
