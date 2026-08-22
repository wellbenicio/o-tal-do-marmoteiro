# O Tal do Marmoteiro

Plataforma de contratação e gestão de atendimentos oraculares (perguntas avulsas
e consultas online), para o mercado brasileiro. As regras funcionais e
regulatórias completas estão em
[`o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`](./o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md)
— esse documento é a fonte da verdade; nenhuma decisão técnica deve
contradizê-lo.

## Arquitetura

Decisões de arquitetura são registradas como ADRs em [`docs/adr/`](./docs/adr).

- A stack escolhida (monólito modular Node.js/TypeScript) está detalhada em
  [`docs/adr/0001-escolha-da-stack-tecnologica.md`](./docs/adr/0001-escolha-da-stack-tecnologica.md).
- A máquina de estado do Pedido (`OrderStatus`) está detalhada em
  [`docs/adr/0002-maquina-de-estado-do-pedido.md`](./docs/adr/0002-maquina-de-estado-do-pedido.md).
- A máquina de estado do Atendimento da Consulta Online (`AppointmentStatus`
  e `RescheduleRequestStatus`) está detalhada em
  [`docs/adr/0003-maquina-de-estado-do-atendimento.md`](./docs/adr/0003-maquina-de-estado-do-atendimento.md).
- A máquina de estado do Pagamento (`PaymentStatus`) está detalhada em
  [`docs/adr/0004-maquina-de-estado-do-pagamento.md`](./docs/adr/0004-maquina-de-estado-do-pagamento.md).
- A máquina de estado do Slot de Agenda (`AppointmentSlotStatus`) está
  detalhada em
  [`docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md`](./docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md).
- A máquina de estado da Pergunta Avulsa (`QuestionStatus`) está detalhada
  em
  [`docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md`](./docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md).

## Estrutura do monorepo

```
apps/
  api/        NestJS — API HTTP, módulos de domínio, Prisma
  web/        Next.js — front-end (consulente e painel administrativo)
packages/
  shared/     Tipos, enums e contratos compartilhados entre api e web
docker-compose.yml   Postgres + Redis para desenvolvimento local
docs/adr/            Registro de decisões de arquitetura (ADRs)
```

Os módulos de domínio da API (`apps/api/src/modules/*`) seguem os domínios
conceituais da especificação (seção 33/34): identity, customer, catalog,
ordering, payment, scheduling, question, fulfillment, cancellation, legal,
privacy, notification, administration e audit.

As máquinas de estado do Pedido (`OrderStatus`), do Atendimento
(`AppointmentStatus`, `RescheduleRequestStatus`), do Pagamento
(`PaymentStatus`), do Slot de Agenda (`AppointmentSlotStatus`) e da
Pergunta Avulsa (`QuestionStatus`) já estão implementadas com XState (ADR
0001), como lógica pura de transição em
`apps/api/src/modules/ordering/order-status.machine.ts`,
`apps/api/src/modules/scheduling/appointment-status.machine.ts` /
`reschedule-request-status.machine.ts` /
`appointment-slot-status.machine.ts`,
`apps/api/src/modules/payment/payment-status.machine.ts` e
`apps/api/src/modules/question/question-status.machine.ts`, expostas via
os serviços NestJS `OrderStatusService`, `AppointmentStatusService`,
`RescheduleRequestStatusService`, `AppointmentSlotStatusService`,
`PaymentStatusService` e `QuestionStatusService`. Controllers, DTOs,
autenticação/RBAC e integrações externas (PIX, WhatsApp) continuam fora de
escopo.

## Como rodar localmente

Pré-requisitos: Node.js 22+, npm 10+ e Docker.

```bash
# 1. Instalar dependências de todos os workspaces
npm install

# 2. Subir Postgres e Redis
docker compose up -d

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
npm run test    # testes (api)
```

## Fluxo de trabalho

- `main`: ambiente validado e estável.
- `dev`: integração ativa e base para validação.
- `features/{implementacao}`: branches de implementação criadas a partir de `dev`.

Commits seguem o padrão semântico: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:` e `ci:`.

