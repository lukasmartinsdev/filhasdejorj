# Trabalhando em grupo no GitHub

Projeto acadêmico do grupo formado por Victor, Flávio e Lukas, conforme o enunciado fornecido. O histórico deve registrar a contribuição real de cada pessoa; este guia não atribui alterações a quem não as fez.

## Preparação

1. Cada integrante usa sua própria conta GitHub. O proprietário adiciona os usuários corretos em **Settings → Collaborators**; não compartilhem a senha da conta.
2. Clone o repositório: `git clone https://github.com/lukasmartinsdev/filhasdejorj.git`.
3. Execute `npm ci`, copie `.env.example` para `.env` e rode `npm run dev`.
4. Use **Issues** para dividir as tarefas. Cada tarefa deve dizer qual requisito atende e como será conferida.

## Uma alteração por branch

```sh
git switch main
git pull --ff-only
git switch -c feat/nome-da-tarefa
# Faça e confira sua alteração.
npm test
npm run build
git add caminho/do/arquivo
git commit -m "Descreve a alteração realizada"
git push -u origin feat/nome-da-tarefa
```

Abra um **Pull Request** para `main`, descreva o comportamento e peça revisão a outro integrante. O GitHub Actions executa os testes e o build. Depois da revisão, faça o merge e atualize sua cópia de `main`. Evite mudanças simultâneas na mesma parte de um arquivo; quando houver conflito, conversem e preservem as alterações necessárias dos dois lados. Não use `push --force` no trabalho compartilhado.

## Sugestão de divisão

- Interface, responsividade e acessibilidade.
- API, ViaCEP, autenticação e testes.
- Documentação, conferência do enunciado e apresentação.

O grupo decide quem assume cada tarefa. Commits, PRs e revisões são a evidência da colaboração; não criem autoria fictícia.

## Dados e acesso

Nunca adicione senhas administrativas, tokens pessoais ou dados de participantes ao repositório. `.env.example` contém somente a URL do projeto e uma chave **publicável**, cuja segurança depende das políticas de acesso do Supabase. As permissões administrativas são verificadas no servidor e no banco. Use dados fictícios nas inscrições demonstrativas.

## Referências oficiais

- [Colaboração com pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Fluxo de trabalho GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Resolução de conflitos](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github)
