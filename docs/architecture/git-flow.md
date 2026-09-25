# Git Flow e versionamento

Política adotada em 22/09/2026 e atualizada em 25/09/2026 para `wellbenicio/o-tal-do-marmoteiro`. O repositório mantém duas branches permanentes. `main` é a branch padrão no GitHub e representa a linha de produção/releases; `dev` integra o desenvolvimento. Estarem sincronizadas com seus respectivos remotos não significa terem os mesmos commits. Mudar a branch padrão não promove código nem realiza deploy.

## Branches e destinos

| Branch | Criada de | PR de destino | Encerramento |
| --- | --- | --- | --- |
| `feature/<descricao>` | `dev` atualizada | `dev` | Excluir após merge validado |
| `release/<versao>` | `dev` atualizada | `main` e `dev` | Tag anotada `v<versao>` em `main`; excluir após ambos os merges |
| `hotfix/<descricao>` | `main` atualizada | `main` e `dev` | Nova versão de correção; excluir após ambos os merges |

A branch padrão do repositório não altera o destino dos PRs de feature: selecionar explicitamente `dev` como base. `main` recebe apenas releases e hotfixes validados.

Usar nomes curtos em minúsculas e hífens. O prefixo é `feature/`, no singular. Documentação e infraestrutura seguem o mesmo caminho. Não criar novas branches `features/`, `copilot/`, `docs/` ou branches pessoais permanentes. Não reutilizar branch cuja entrega já foi integrada.

Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `ci:` ou `chore:` com descrição concreta. Agrupar alterações relacionadas, sem incluir trabalho alheio. Manter `package-lock.json` junto de mudanças de dependências e usar `npm ci`.

## Começar ou retomar uma feature

```bash
git status --short --branch
git fetch origin --prune
git switch dev
git pull --ff-only origin dev
git switch -c feature/descricao-da-entrega
```

Se houver alterações locais, preservar em sua branch de trabalho antes de trocar a base. Nunca usar `reset --hard`, `clean -fd` ou force push como rotina de atualização. Um stash é uma cópia local temporária, não uma publicação nem um backup remoto.

Antes do PR, integrar o `dev` mais recente na feature compartilhada:

```bash
git fetch origin --prune
git merge origin/dev
# Resolver conflitos, revisar o resultado, testar e então fazer commit.
git push -u origin feature/descricao-da-entrega
```

Resolver conflitos não é escolher todos os arquivos de um lado: preservar contratos, migrations e decisões vigentes. Quando uma branch antiga divergir semanticamente da autenticação, dos enums ou do baseline, manter o PR em rascunho e registrar a reconciliação necessária. Não integrar apenas para tornar o gráfico verde.

## Integração em dev

1. Revisar diff, escopo e ausência de segredos; abrir PR `feature/*` → `dev`.
2. Explicar comportamento entregue, validação, migração e limitações. Rascunho preserva trabalho ainda não pronto.
3. Concluir os checks `git-flow` e `validate`: direção das branches, instalação reproduzível, auditoria de dependências de produção, Prisma/migrations em Postgres de teste, lint, testes e builds.
4. Conferir revisão e base atualizadas. Integrar por **merge commit**, preservando a ancestralidade da feature. Não usar squash/rebase como método de merge nesta política.
5. Atualizar a cópia local de `dev` e remover a feature concluída:

```bash
git fetch origin --prune
git switch dev
git pull --ff-only origin dev
git merge-base --is-ancestor feature/descricao-da-entrega dev
git branch -d feature/descricao-da-entrega
# Se a exclusão remota automática ainda não ocorreu, após verificar o merge:
git push origin --delete feature/descricao-da-entrega
git fetch origin --prune
```

`merge-base --is-ancestor` deve terminar com código zero antes da exclusão normal. Um PR antigo integrado por squash exige conferir o PR e a equivalência do conteúdo; a ausência de ancestralidade sozinha não prova perda de trabalho. Nunca excluir PR aberto sem preservação e encaminhamento explícito.

## Release, hotfix e tags

Criar `release/<versao>` a partir de `dev` quando houver uma versão a homologar. Atualizar changelog, versões pertinentes, contratos de configuração e plano de migração/rollback. Só correções da release entram nessa branch. Aprovar os checks e abrir PR para `main`; depois reintegrar a mesma branch em `dev`.

Antes de integrar o primeiro PR de uma release/hotfix, manter os dois PRs abertos para preservar o segundo destino. A exclusão automática é uma conveniência; verificar que ambos os merges aconteceram antes de excluir a referência. Se necessário, recriar a referência a partir do SHA do PR para concluir a reintegração.

Depois do merge em `main`, criar tag anotada no commit validado, por exemplo `git tag -a v0.1.0 <sha-do-merge> -m 'Release 0.1.0'`, e publicar somente essa tag com `git push origin v0.1.0`. O exemplo não declara que essa versão existe. Nunca mover tags publicadas. Versionamento semântico: patch para correção compatível, minor para funcionalidade compatível e major para quebra de contrato; pré-lançamentos podem usar `-rc.1`.

Hotfix parte de `main` e retorna a `main` e `dev` (e à release aberta, quando aplicável). Não copiar todo `dev` para `main` para corrigir um incidente. Release de código, deploy de ambiente e lançamento comercial são etapas distintas. As integrações comerciais demonstrativas atuais não se tornam produtivas por merge.

## Preservação do histórico antigo

Branches descartadas com commits exclusivos podem ser arquivadas em tags anotadas `archive/<descricao>-<data>` antes de sua remoção. Confirmar que a tag remota aponta exatamente para o antigo tip. Essas tags não são releases e não devem disparar deploy. A arquitetura MySQL do PR #1 foi substituída pela base PostgreSQL; não reintegrar esse código por conveniência de limpeza.

O trabalho antigo de máquinas de estado do PR #3 foi preservado, sem reescrever seus 19 commits, no [PR #6](https://github.com/wellbenicio/o-tal-do-marmoteiro/pull/6), `feature/regras-de-negocio`. A reconciliação com o `dev` do PR #7 preserva as URLs administrativas, usa sessões PostgreSQL e hashing compatível, mantém `OWNER`, substitui migrations não integradas destrutivas por conversão transacional e renumera as ADRs de pedido/atendimento para 0017/0018. O histórico de execução não é removido, e o reembolso preserva avaliação legal e revisão manual. O status de integração é o registrado no PR; antes de excluir a feature, confirmar o merge e a ancestralidade. O PR #3 foi encerrado com link para o sucessor.

A antiga `features/mvp-implementation`, encerrada sem merge no PR #1, está preservada na tag remota `archive/implementacao-inicial-2026-09-22`, apontando para `776e5ed`. As branches dos PRs #2 e #4 foram removidas após confirmar a integração (ancestralidade no primeiro, equivalência da árvore do squash no segundo). A consolidação da plataforma e desta política está no [PR #5](https://github.com/wellbenicio/o-tal-do-marmoteiro/pull/5). Um stash local anterior permanece preservado; não o reaplicar automaticamente sobre a plataforma atual.

## Configuração e limites do GitHub

Configuração aplicada e verificada: `main` como branch padrão, merge commits habilitados, squash/rebase desabilitados e `delete_branch_on_merge=true`. A opção nativa do GitHub remove a branch remota de origem após o merge do PR, inclusive `feature/*` → `dev`; não possui filtro por prefixo. Preservar PRs ainda abertos e observar os dois destinos de releases/hotfixes. A remoção da branch local continua sendo feita com `git branch -d`, após verificar a integração.

O workflow valida convenções em PRs e executa os checks de aplicação em PRs e pushes de `dev`/`main`. Ele não publica na nuvem.

Em 22/09/2026, a API de regras do repositório privado respondeu **403: requer GitHub Pro ou repositório público**. Portanto não há proteção efetiva contra push direto ou merge com check falhando no plano atual. O CI detecta problemas, mas não impede sozinho o administrador de ignorá-los. O repositório permanece privado; nenhuma troca de plano foi realizada.

Quando houver plano elegível, proteger `main` e `dev`: exigir PR, checks `git-flow`/`validate`, base atualizada, resolução de conversas, impedir force push e exclusão. Calibrar revisão humana para a equipe existente; não exigir aprovação externa inexistente em projeto de um único mantenedor. Não prometer enforcement antes de verificar as regras aplicadas.

## Conferência ao terminar uma entrega

```bash
git fetch origin --prune
git status --short --branch
git branch -vv
git rev-list --left-right --count dev...origin/dev
git rev-list --left-right --count main...origin/main
gh pr list --repo wellbenicio/o-tal-do-marmoteiro --state open
```

Branches permanentes locais devem indicar `0 0` contra seus remotos. A árvore deve estar limpa; branches concluídas removidas; PRs pendentes devem informar claramente o que falta. Atualizar o handoff quando mudar o estado de integração, CI ou release.
