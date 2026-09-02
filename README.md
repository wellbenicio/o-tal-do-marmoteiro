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
- O Motor de Política de Reembolso (Refund Policy Engine) está detalhado em
  [`docs/adr/0007-motor-de-politica-de-reembolso.md`](./docs/adr/0007-motor-de-politica-de-reembolso.md).
- A ordenação da fila de Perguntas Avulsas (prioridade) está detalhada em
  [`docs/adr/0008-ordenacao-da-fila-de-perguntas.md`](./docs/adr/0008-ordenacao-da-fila-de-perguntas.md).
- O cálculo do prazo de SLA da Pergunta Avulsa (48 horas úteis) está
  detalhado em
  [`docs/adr/0009-calculo-sla-pergunta-avulsa.md`](./docs/adr/0009-calculo-sla-pergunta-avulsa.md).
- A elegibilidade e o prazo de reagendamento da Consulta Online estão
  detalhados em
  [`docs/adr/0010-elegibilidade-e-prazo-de-reagendamento.md`](./docs/adr/0010-elegibilidade-e-prazo-de-reagendamento.md).
- O contrato de API/convenção REST (prefixo de versão, validação de entrada,
  formato de erro RFC 7807, controllers finos) está detalhado em
  [`docs/adr/0011-contrato-de-api-e-convencao-rest.md`](./docs/adr/0011-contrato-de-api-e-convencao-rest.md).
- O mecanismo de autenticação/RBAC (hashing de senha, sessão por token
  opaco, guards HTTP) está detalhado em
  [`docs/adr/0012-autenticacao-e-rbac.md`](./docs/adr/0012-autenticacao-e-rbac.md).
- As portas de integração externa (gateway de pagamento, envio de
  notificação) estão detalhadas em
  [`docs/adr/0013-portas-de-integracao-externa.md`](./docs/adr/0013-portas-de-integracao-externa.md).
- A retenção de gravação de consulta e o legal hold estão detalhados em
  [`docs/adr/0014-retencao-de-gravacao-e-legal-hold.md`](./docs/adr/0014-retencao-de-gravacao-e-legal-hold.md).
- O status da solicitação de correção cadastral (`DataCorrectionRequestStatus`)
  está detalhado em
  [`docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md`](./docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md).
- A reconciliação entre `ServiceExecution` e os campos de execução já
  existentes em `QuestionRequest`/`Appointment` está detalhada em
  [`docs/adr/0016-reconciliacao-service-execution.md`](./docs/adr/0016-reconciliacao-service-execution.md).

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
`PaymentStatusService` e `QuestionStatusService`.

O Motor de Política de Reembolso (ADR 0007) já está implementado como
função pura de decisão (não uma máquina de estado) em
`apps/api/src/modules/cancellation/refund-policy.ts`, exposto via o
serviço NestJS `RefundPolicyService`.

A ordenação da fila de Perguntas Avulsas por prioridade (ADR 0008) também
está implementada como função pura em
`apps/api/src/modules/question/question-queue-ordering.ts`, exposta via o
serviço NestJS `QuestionQueueOrderingService`.

O cálculo do prazo de SLA da Pergunta Avulsa (ADR 0009 — 48 horas úteis a
partir da confirmação do pagamento) está implementado como função pura em
`apps/api/src/modules/question/question-sla.ts`, exposto via o serviço
NestJS `QuestionSlaService`. A definição concreta do calendário de horas
úteis (expediente, feriados) é uma abstração (`BusinessHoursCalendar`)
sem implementação de produção ainda, pois depende de configuração
operacional futura (seção 37).

A elegibilidade do reagendamento por iniciativa do consulente (24h de
antecedência, único reagendamento contratual — ADR 0010) e o cálculo do
prazo de 48 horas corridas para escolha de uma nova opção estão
implementados como funções puras em
`apps/api/src/modules/scheduling/reschedule-eligibility.ts`, expostos via
o serviço NestJS `RescheduleEligibilityService`.

Controllers HTTP finos (um por serviço de domínio acima), validação de
entrada e formato de erro padrão (RFC 7807) já estão implementados (ADR
0011). Autenticação/RBAC — hashing de senha (`PasswordHasher`), sessão por
token opaco (`SessionStore`) e guards HTTP (`AuthGuard`, `RolesGuard`) —
também já estão implementados (ADR 0012), em
`apps/api/src/modules/identity/`. Portas de integração externa
(`PaymentGatewayPort`, `NotificationPort`) já estão implementadas com
adapters fake/em memória (ADR 0013); a escolha e integração dos provedores
reais (PIX/cartão, WhatsApp Business API) permanece fora de escopo — é
decisão de negócio ainda pendente do dono do produto.

O prazo de retenção da gravação de consulta e o efeito do legal hold (ADR
0014 — até 90 dias corridos após o atendimento, salvo `legalHold = true`)
estão implementados como funções puras em
`apps/api/src/modules/legal/recording-retention.ts`, expostas via o
serviço NestJS `RecordingRetentionService`.

A validação da decisão de correção cadastral (ADR 0015 — justificativa
obrigatória quando o administrador ajusta ou recusa a solicitação) está
implementada como função pura em
`apps/api/src/modules/customer/data-correction-decision.ts`, exposta via o
serviço NestJS `DataCorrectionDecisionService`.

O domínio `fulfillment` não possui model de persistência próprio (ADR
0016) — opera sobre os campos de execução já existentes em
`QuestionRequest` (pergunta avulsa) e sobre `AppointmentStatus`/
`AppointmentSlot` (consulta online).

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

