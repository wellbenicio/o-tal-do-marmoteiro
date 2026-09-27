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

- A stack escolhida (monólito modular Node.js/TypeScript) está detalhada em
  [`docs/adr/0001-escolha-da-stack-tecnologica.md`](./docs/adr/0001-escolha-da-stack-tecnologica.md).
- A máquina de estado do Pedido (`OrderStatus`) está detalhada em
  [`docs/adr/0017-maquina-de-estado-do-pedido.md`](./docs/adr/0017-maquina-de-estado-do-pedido.md).
- A máquina de estado do Atendimento da Consulta Online (`AppointmentStatus`
  e `RescheduleRequestStatus`) está detalhada em
  [`docs/adr/0018-maquina-de-estado-do-atendimento.md`](./docs/adr/0018-maquina-de-estado-do-atendimento.md).
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

Controllers de cálculo, validação de entrada e erros RFC 7807 estão em
`/api/v1` (ADR 0011); não persistem transações nem aprovam pagamentos reais.
Rotas administrativas e internas existentes mantêm suas URLs. As portas
`PasswordHasher` e `SessionStore` reutilizam o hash administrativo e as
sessões PostgreSQL (ADR 0012); sessão em memória é somente dublê de teste.
As portas de integração da ADR 0013 são demonstrativas e coexistem com os
adaptadores Calendar/Meet e WhatsApp existentes, ainda desativados até
homologação. A autenticação real de consulentes permanece na direção Firebase.

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

O histórico `ServiceExecution` é preservado (ADR 0016 revisada). A migration
`20260925140000_reconcile_domain_enums` converte os estados conhecidos sem
remover colunas, contas, sessões ou registros de execução. Valores desconhecidos
interrompem a migration para revisão, com rollback transacional.

## Como rodar localmente

Pré-requisitos: Node.js 22+, npm 10+ e Docker.

Defina `POSTGRES_PASSWORD` no ambiente local antes de iniciar o Compose e use
o mesmo valor em `DATABASE_URL` da API. Não versione a senha. Para volumes já
existentes, informe a senha atual do banco; a variável não altera credenciais
de um banco inicializado.

```bash
# 1. Instalar dependências de todos os workspaces
npm ci --ignore-scripts

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
