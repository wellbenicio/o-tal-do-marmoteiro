# ADR 0011: Contrato de API e convenção REST

**Status:** Aceita
**Data:** 2 de setembro de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seção 38 (item 5, "contratos de API").

## Contexto

A seção 38 lista "contratos de API" como item 5 do checklist da etapa
técnica — uma decisão técnica pura, que não depende de fornecedor externo
nem de dado operacional ainda não definido pelo dono do produto (ao
contrário do calendário operacional da ADR 0009 ou da escolha de gateway
de pagamento). Por isso pode avançar agora, sem violar a seção 38
("não inventar... regra de negócio").

Até esta ADR, o backend (`apps/api`) continha apenas regra de negócio pura:
máquinas de estado (ADRs 0002–0006) e motores de decisão (ADRs 0007–0010),
cada um exposto só como serviço NestJS interno, sem nenhum controller,
`main.ts` mínimo (sem prefixo, sem pipes, sem filtros) e nenhuma
dependência de validação de entrada — conforme o próprio README documentava
("Controllers, DTOs, autenticação/RBAC e integrações externas... continuam
fora de escopo").

Esta ADR define a convenção REST mínima para expor essas regras já
implementadas via HTTP, sem adicionar nenhuma regra de negócio nova.

## Decisão

### Prefixo global e versionamento

`app.setGlobalPrefix('api/v1')` em `apps/api/src/main.ts`. Todas as rotas
ficam sob `/api/v1/...`. Versionamento simples por prefixo de path (não o
mecanismo de `URI Versioning` do NestJS) — suficiente para uma API que
ainda não tem consumidor externo publicado; pode ser revisto quando houver
necessidade real de coexistência de versões.

### Validação de entrada

`ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`,
`transform: true`) usando `class-validator`/`class-transformer` (novas
dependências do workspace `@marmoteiro/api`; nenhuma outra biblioteca de
validação já existia no projeto). Cada endpoint recebe um DTO de entrada
decorado, colocado junto ao módulo de domínio dono (ex.
`order-status.dto.ts` ao lado de `order-status.controller.ts`), seguindo a
mesma convenção de arquivo único por conceito já usada para os serviços.

### Formato de erro padrão

Todas as respostas de erro seguem **RFC 7807 — "Problem Details for HTTP
APIs"** (`Content-Type: application/problem+json`):

```json
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "Transição inválida do Pedido: evento \"CANCEL\" não é permitido a partir do estado \"CANCELLED\" (ver docs/adr/0002-maquina-de-estado-do-pedido.md).",
  "code": "InvalidOrderStatusTransitionError",
  "instance": "/api/v1/orders/status/transition"
}
```

`title` é derivado de `http.STATUS_CODES` (nativo do Node, sem nova
dependência); `code` é o nome estável da classe do erro (ou da
`HttpException` do NestJS), pensado para tratamento programático pelo
cliente; `type` usa o valor-padrão `about:blank` do RFC por não haver ainda
um catálogo de tipos de problema publicado.

Um único filtro global (`DomainErrorFilter`, `@Catch()`) traduz qualquer
exceção lançada durante o processamento da requisição:

1. **`DomainError`** (nova classe-base, `apps/api/src/common/errors/domain-error.ts`)
   — usa o `httpStatus` que a própria classe já carrega.
2. **`HttpException`** do NestJS (inclui `BadRequestException` lançada pelo
   `ValidationPipe`) — usa o status/mensagem já existentes.
3. **Qualquer outro erro não previsto** — responde 500 genérico (sem vazar
   detalhes internos) e loga o erro real no servidor via `Logger`.

### `DomainError` — classe-base para erros de regra de domínio

As 7 classes de erro de domínio já existentes (`InvalidOrderStatusTransitionError`,
`InvalidPaymentStatusTransitionError`, `InvalidAppointmentStatusTransitionError`,
`InvalidAppointmentSlotStatusTransitionError`,
`InvalidRescheduleRequestStatusTransitionError`,
`InvalidQuestionStatusTransitionError`, `InvalidRefundPolicyInputError`)
passam a estender `DomainError` em vez de `Error`, informando o status HTTP
semanticamente correspondente:

- **409 Conflict** para as 6 classes `Invalid*TransitionError` — o estado
  atual do recurso conflita com o evento solicitado.
- **422 Unprocessable Entity** para `InvalidRefundPolicyInputError` — a
  entrada é sintaticamente válida, mas semanticamente inconsistente com as
  regras de domínio (ex.: `isNoShow` numa modalidade que não admite
  no-show).

Nenhum módulo de domínio precisa importar nada de HTTP além desta única
classe-base — o mapeamento de status continua centralizado no filtro
global, não espalhado pelos módulos.

### Controllers finos

Cada controller apenas recebe o DTO, chama o serviço de domínio já
existente e devolve o resultado — sem persistência, sem lógica adicional,
mesmo espírito do par função-pura/serviço já estabelecido (ADRs 0007–0009).
Como as máquinas de estado são hoje *stateless* (recebem `currentStatus`
explicitamente, não leem/gravam nada), os endpoints replicam essa forma:
`POST .../status/can-transition` e `POST .../status/transition`, recebendo
`{ currentStatus, event }` no corpo. Nenhum destes endpoints persiste o
novo status — isso depende do caso de uso completo (ex. "confirmar
pagamento do pedido"), que cruza múltiplos domínios e ainda não está
modelado (fora do escopo desta ADR).

Controllers criados (um por serviço de domínio já existente):

| Controller | Rota base | Serviço |
|---|---|---|
| `OrderStatusController` | `orders/status` | `OrderStatusService` (ADR 0002) |
| `PaymentStatusController` | `payments/status` | `PaymentStatusService` (ADR 0004) |
| `AppointmentStatusController` | `appointments/status` | `AppointmentStatusService` (ADR 0003) |
| `AppointmentSlotStatusController` | `appointment-slots/status` | `AppointmentSlotStatusService` (ADR 0005) |
| `RescheduleRequestStatusController` | `reschedule-requests/status` | `RescheduleRequestStatusService` (ADR 0003) |
| `RescheduleEligibilityController` | `reschedule-requests/eligibility` | `RescheduleEligibilityService` (ADR 0010) |
| `QuestionStatusController` | `questions/status` | `QuestionStatusService` (ADR 0006) |
| `QuestionQueueOrderingController` | `questions/queue` | `QuestionQueueOrderingService` (ADR 0008) |
| `RefundPolicyController` | `cancellations/refund-policy` | `RefundPolicyService` (ADR 0007) |

### Exclusão deliberada: `QuestionSlaService` não tem controller

`QuestionSlaService` (ADR 0009) exige um `BusinessHoursCalendar` concreto
como parâmetro de chamada. Não existe implementação concreta dessa
interface (depende do calendário operacional real, ainda não fornecido
pelo dono do produto — ver "Pontos em aberto" da ADR 0009). Expor um
endpoint HTTP para este serviço exigiria ou (a) inventar um calendário
concreto, ou (b) inventar uma representação HTTP-serializável de calendário
— ambas violariam a mesma restrição que a ADR 0009 já havia identificado.
Este controller fica para quando o calendário operacional for definido.

## Consequências

- `apps/api/src/main.ts` ganha prefixo global, `ValidationPipe` e
  `DomainErrorFilter`; nenhuma mudança em `AppModule` além do já existente
  (cada controller é registrado no seu próprio módulo de domínio).
- Novas dependências: `class-validator`, `class-transformer` (bibliotecas
  padrão recomendadas pela documentação oficial do NestJS para validação
  de DTOs; nenhuma nova biblioteca de validação alternativa foi
  necessária).
- Nenhuma migração de schema Prisma é necessária — os 9 controllers
  operam sobre as mesmas máquinas de estado/motores de decisão *stateless*
  já existentes, sem tocar em persistência.
- Autenticação/RBAC (ADR 0012) e portas de integração externa (ADR 0013)
  são tratadas em ADRs separadas — esta ADR não aplica nenhum guard aos 9
  controllers acima, porque decidir quais papéis (Visitante/Consulente/
  Administrador) podem chamar qual endpoint técnico depende do caso de uso
  completo (ainda não modelado), não apenas do mecanismo de autenticação.

### Pontos em aberto

1. **Persistência** — os controllers desta ADR não leem nem gravam no
   banco; isso será resolvido quando os casos de uso completos (ex.
   "confirmar pagamento") forem modelados, cruzando múltiplos domínios via
   Prisma.
2. **Autorização por endpoint** — nenhum destes 9 controllers está
   protegido por autenticação/RBAC ainda (ver ADR 0012); são endpoints
   técnicos que assumem um chamador já autorizado (ex. outro serviço
   interno, ou um futuro controller de caso de uso completo).
3. **`QuestionSlaService`** — sem controller até o calendário operacional
   real ser definido (ver ADR 0009, "Pontos em aberto").

## Alternativas consideradas

- **NestJS URI Versioning (`app.enableVersioning()`)** — rejeitada por ora:
  adiciona uma camada de configuração (`VERSION_NEUTRAL`, `@Version()` por
  controller) sem benefício atual, já que não existe ainda nenhum
  consumidor externo publicado nem uma segunda versão a coexistir. Prefixo
  simples de path é suficiente e pode evoluir para versionamento formal
  depois.
- **Formato de erro proprietário (ex.: `{ error: string, message: string }`
  do NestJS por padrão)** — rejeitado em favor do RFC 7807: é um padrão
  IETF já conhecido por clientes HTTP genéricos, sem exigir documentação
  própria, e já contempla nativamente um campo de status e um campo de
  detalhe por ocorrência.
- **Um controller por agregado (ex.: um único `OrdersController` cobrindo
  todos os aspectos do Pedido)** — rejeitada nesta etapa: não existe ainda
  um agregado "Pedido" persistido/CRUD-like, apenas a máquina de estado
  isolada; um controller por serviço de domínio já existente é mais fiel
  ao que de fato está implementado, evitando inventar rotas para
  funcionalidade que ainda não existe.
- **Manter os 7 erros de domínio como `extends Error` e mapear status HTTP
  num `switch` dentro do filtro** — rejeitada: exigiria que o filtro global
  conhecesse todos os tipos de erro de domínio individualmente (acoplamento
  inverso, o filtro passaria a depender de todos os módulos de domínio);
  `DomainError` inverte essa dependência, mantendo o filtro genérico.
