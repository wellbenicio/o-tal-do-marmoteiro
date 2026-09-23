# O Tal do Marmoteiro

Plataforma de contratação e gestão de atendimentos oraculares (perguntas avulsas
e consultas online), para o mercado brasileiro. As regras funcionais e
regulatórias completas estão em
[`o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`](./o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md)
— esse documento é a fonte da verdade; nenhuma decisão técnica deve
contradizê-lo.

### Para agentes de IA

O ponto de entrada obrigatório é [`AGENTS.md`](./AGENTS.md). O pacote de contexto
funcional está em [`docs/product/`](./docs/product), especialmente
[`docs/product/HANDOFF-AGENTE-IA.md`](./docs/product/HANDOFF-AGENTE-IA.md).

O [mapa técnico atualizado](./docs/architecture/README.md) reúne arquitetura, estado real das funcionalidades, contratos, custos, publicação e próximos passos. A prévia tem login administrativo real; os fluxos comerciais continuam demonstrativos. O deploy remoto depende de projeto/contas e banco configurados.

## Prévia navegável da interface

A interface do Figma, a área do consulente e o painel do prestador estão em `apps/web`. Para validar o visual sem serviços externos:

```bash
npm ci
npm run dev:web -- --port 3008
```

Abra `http://localhost:3008/login` e use **Explorar uma conta de demonstração**. São exemplos fictícios: acesso, agendamento, pagamento, correções e solicitações não operam contas reais. Os resumos jurídicos não substituem os documentos integrais publicáveis.

- [Rotas, regras, testes e pendências da prévia](docs/preview-area-cliente.md)
- [Análise de lacunas e desenho técnico conforme o handoff](docs/product/gap-analysis-interface.md)

```bash
npm run lint --workspace @marmoteiro/web
npm run typecheck --workspace @marmoteiro/web
npm run test --workspace @marmoteiro/web
npm run build --workspace @marmoteiro/web
```

## Arquitetura

Decisões de arquitetura são registradas como ADRs em [`docs/adr/`](./docs/adr).
A stack escolhida (monólito modular Node.js/TypeScript) está detalhada em
[`docs/adr/0001-escolha-da-stack-tecnologica.md`](./docs/adr/0001-escolha-da-stack-tecnologica.md).
A [ADR 0003](./docs/adr/0003-infraestrutura-baixo-custo-e-firebase.md) atualiza a direção de infraestrutura: Firebase Auth, PostgreSQL e containers Cloud Run, sem Redis obrigatório. Consulte [custos](./docs/architecture/custos.md), [deploy](./docs/architecture/deploy.md) e [handoff técnico](./docs/architecture/handoff.md).

## Estrutura do monorepo

```
apps/
  api/        NestJS — API HTTP, módulos de domínio, Prisma
  web/        Next.js — front-end (consulente e painel administrativo)
packages/
  shared/     Tipos, enums e contratos compartilhados entre api e web
docker-compose.yml   Postgres + Redis opcional para desenvolvimento local
docs/architecture/   Mapa técnico, contratos, custos, operação e handoff
docs/adr/            Registro de decisões de arquitetura (ADRs)
```

Os módulos de domínio da API (`apps/api/src/modules/*`) seguem os domínios
conceituais da especificação (seção 33/34): identity, customer, catalog,
ordering, payment, scheduling, question, fulfillment, cancellation, legal,
privacy, notification, administration e audit.

## Como rodar localmente

Pré-requisitos: Node.js 22+, npm 10+ e Docker.

```bash
# 1. Instalar dependências de todos os workspaces
npm install

# 2. Subir Postgres (Redis é opcional)
docker compose up -d postgres

# 3. Configurar variáveis de ambiente da API
cp apps/api/.env.example apps/api/.env

# 4. Gerar o Prisma Client e aplicar as migrações
npm run prisma:generate --workspace @marmoteiro/api
npm run prisma:migrate --workspace @marmoteiro/api

# 5. Rodar a API e o front-end (em terminais separados)
npm run dev:api
npm run dev:web
```

Outros comandos úteis, executados a partir da raiz e aplicados a todos os
workspaces:

```bash
npm run build   # build de produção (api e web)
npm run lint    # lint (api, web e shared)
npm run test    # testes dos workspaces
```

## Painel de gestão

Acesse `http://localhost:3008/gestao`: o painel exige login administrativo real, com conta provisionada pelo responsável no banco, sem cadastro público. Consulte [configuração e criação do primeiro acesso](./docs/acesso-administrativo.md). Não há senha padrão.

Agenda, pedidos, financeiro e comunicações da interface continuam demonstrativos, documentados em [docs/preview-gestao.md](./docs/preview-gestao.md). Os adaptadores Calendar/Meet e WhatsApp estão preparados no backend, desativados até conectar credenciais e transações reais de pagamento/agendamento. Não há envio externo na prévia.

## Fluxo de trabalho

- `main`: ambiente validado e estável.
- `dev`: integração ativa e base para validação.
- `feature/<descricao>`: implementação criada a partir de `dev`, integrada por PR e removida após merge.
- `release/<versao>`: preparação de uma versão; integração em `main` e retorno a `dev`.
- `hotfix/<descricao>`: correção urgente a partir de `main`, integrada também em `dev`.

Commits seguem o padrão semântico: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:` e `ci:`.

Consulte o [procedimento de Git Flow](./docs/architecture/git-flow.md) para sincronização, PRs, validação, tags e limpeza. `main` não acompanha cada feature de `dev`: recebe somente versões preparadas para release. O deploy é uma etapa separada.
