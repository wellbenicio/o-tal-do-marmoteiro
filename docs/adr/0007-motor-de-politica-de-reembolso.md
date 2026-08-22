# ADR 0007: Motor de Política de Reembolso (`RefundPolicyEngine`)

**Status:** Aceita
**Data:** 22 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 13, 15.7, 16, 17, 18, 19, 20 e regras invariantes 6, 11, 12, 16 e 17 (seção 32).

## Contexto

A especificação exige que a regra de reembolso seja **centralizada** e
proíbe explicitamente lógica de reembolso espalhada:

> "A regra de reembolso deverá ser centralizada. Não deverá existir lógica
> de reembolso espalhada em controllers ou telas." (seção 20.2)
>
> "Reembolso deve ser calculado centralmente por regra de domínio." (regra
> invariante nº 17, seção 32)

Diferentemente das ADRs 0002-0006, este documento **não define uma máquina
de estado** (não há um "estado de reembolso" que transita por eventos).
Trata-se de uma **função de decisão pura**: a especificação já enumera as
quatro saídas possíveis (`RefundDecisionType`, seção 20.3, já transcrito em
`packages/shared/src/refund.ts`) e os onze insumos que o mecanismo deve
considerar (seção 20.2):

> "modalidade; data da contratação; data do cancelamento; status da
> execução; data/hora do agendamento; no-show; reagendamento; direito de
> arrependimento; exceções; valor total pago; regras legais prioritárias."

Esta ADR decide **a árvore de precedência** entre essas regras — ou seja,
o que fazer quando mais de uma condição poderia se aplicar simultaneamente
— porque a especificação descreve cada regra isoladamente, mas não
apresenta uma tabela de precedência única.

### Regras textuais identificadas

1. **Direito de arrependimento (7 dias corridos, seção 19.1)** — quando
   juridicamente aplicável, prevalece sobre cancelamento tardio, no-show,
   início de atendimento, prioridade e reagendamento (seção 19.3, regra
   invariante nº 12). Aplicação depende do momento da execução:
   - `QUEUED`/pré-execução (13.1) ou `IN_PROGRESS`/durante a execução e
     antes da entrega (13.2): **reembolso integral automático** ("a
     política operacional adotará, por segurança, reembolso integral
     quando o direito legal for aplicável").
   - Serviço já **entregue/concluído** (13.3, "`DELIVERED`"): o sistema
     **não deve negar automaticamente, nem conceder automaticamente** —
     encaminha para `MANUAL_REVIEW_REQUIRED`, com decisão administrativa
     "com base na regra legal aplicável ao caso concreto".
2. **Situações excepcionais (seção 18)** — emergência médica, acidente,
   falecimento, indisponibilidade generalizada de serviço essencial,
   eventos imprevisíveis/inevitáveis ou "outras situações relevantes de
   boa-fé" exigem **análise administrativa manual**, sempre. A seção 19.3
   lista exaustivamente as políticas que cedem ao direito legal
   (cancelamento tardio, no-show, início de atendimento, prioridade,
   reagendamento) — "situações excepcionais" **não consta nessa lista**,
   ou seja, o mecanismo automático não tenta resolver o caso sozinho
   quando uma exceção é reportada; ele delega para revisão humana antes de
   avaliar qualquer outra regra automática.
3. **Reagendamento provocado pelo prestador (seção 15.7)** — quando a causa
   é do prestador, o cliente pode optar por **restituição integral** pelo
   serviço não realizado. Por não ser culpa do cliente, esta ADR posiciona
   esta regra acima das penalidades de no-show/cancelamento tardio.
4. **No-show (seção 17)** — tolerância de 15 minutos (17.1); caracterização
   sujeita a exclusões (falha do prestador, falha da plataforma, situação
   excepcional comprovada — 17.2, já tratadas como responsabilidade do
   chamador desta função, não desta ADR); consequência financeira de
   **retenção de 50% / restituição de 50%** "inexistindo regra legal
   obrigatória em sentido diverso" (17.3); encerra a contratação (17.4).
5. **Cancelamento tardio (seção 16)** — caracterizado por solicitação com
   **menos de 24 horas de antecedência** do horário agendado (16.1,
   "ressalvadas hipóteses legais de tratamento diferente"); consequência
   financeira de **retenção de 30% / restituição de 70%** "quando
   aplicável" (16.2).
6. **Regra invariante nº 11** — "No-show e cancelamento tardio são eventos
   distintos": não devem ser combinados nem confundidos; o chamador informa
   qual (quando algum) efetivamente ocorreu, nunca ambos ao mesmo tempo
   para a mesma solicitação.
7. **Cancelamento sem nenhuma das condições acima** — a especificação não
   descreve penalidade para cancelamento **com** antecedência (≥ 24 horas)
   fora do prazo de arrependimento. Por exclusão do texto da seção 16.1
   (a retenção de 30% é definida apenas para o caso "tardio"; nenhuma outra
   retenção é mencionada para cancelamento antecipado), esta ADR assume
   **reembolso integral por exclusão/padrão**. Este ponto é sinalizado como
   inferência (não há trecho que declare isso explicitamente) — ver seção
   "Pontos em aberto".
8. **Serviço já prestado, sem direito legal aplicável e sem exceção** — a
   seção 20.3 afirma que "a decisão `NO_REFUND` somente poderá ocorrer
   quando juridicamente e contratualmente válida"; nesse cenário específico
   (nada mais se aplica) não há fundamento textual para qualquer
   devolução, portanto `NO_REFUND` é a decisão automática.

## Decisão

Implementar `RefundPolicyEngine` como **função pura**
(`evaluateRefundPolicy`) em `apps/api/src/modules/cancellation/refund-policy.ts`,
mais um serviço NestJS (`RefundPolicyService`) que a expõe como ponto único
de acesso para os demais módulos (`ordering`, `scheduling`, `question`,
`payment`), sem XState — não há "estados" a transitar, apenas uma decisão
determinística sobre um conjunto de insumos.

### Entrada (`RefundPolicyInput`)

| Campo | Tipo | Origem (seção 20.2) |
|---|---|---|
| `modality` | `ServiceOfferingType` | "modalidade" |
| `contractedAt` | `Date` | "data da contratação" |
| `cancellationRequestedAt` | `Date` | "data do cancelamento" |
| `isServiceAlreadyRendered` | `boolean` | "status da execução" |
| `totalPaidAmount` | `number` | "valor total pago" (deve já incluir eventual valor de prioridade — regra invariante nº 6, seção 13.1) |
| `scheduledAt?` | `Date` | "data/hora do agendamento" (somente `APPOINTMENT`) |
| `isNoShow?` | `boolean` | "no-show" (somente `APPOINTMENT`) |
| `providerCausedRescheduleRefundChosen?` | `boolean` | "reagendamento" (seção 15.7, somente `APPOINTMENT`) |
| `exceptionalCircumstanceReported?` | `boolean` | "exceções" (seção 18) |

`isServiceAlreadyRendered`/`isNoShow`/exclusões do 17.2 são calculados pelo
chamador (que já conhece o `AppointmentStatus`/`QuestionStatus` concreto) —
o motor permanece agnóstico aos enums de execução para não duplicar as
máquinas de estado das ADRs 0002/0003/0006; ele só recebe os fatos já
qualificados. "Regras legais prioritárias" (último item da lista da seção
20.2) não é um campo adicional: é o **próprio direito de arrependimento**
(seção 19.3), já coberto por `contractedAt`/`cancellationRequestedAt`.

### Saída (`RefundPolicyDecision`)

| Campo | Tipo | Observação |
|---|---|---|
| `decision` | `RefundDecisionType` | `packages/shared/src/refund.ts` (seção 20.3) |
| `reasonCode` | `RefundReasonCode` | Valores alinhados aos exemplos do comentário de `RefundDecision.reasonCode` no schema Prisma (`NO_SHOW`, `LATE_CANCELLATION`, `WITHDRAWAL_RIGHT`, `PROVIDER_RESCHEDULE`) mais os complementares desta ADR |
| `refundAmount` | `number` | "valor calculado de reembolso" (seção 20.1) |
| `retainedAmount` | `number` | "valor retido" (seção 20.1) |

Para `MANUAL_REVIEW_REQUIRED`, `refundAmount`/`retainedAmount` retornam `0`
— são apenas valores de espera até uma decisão administrativa (que gera um
novo `RefundDecision` com `automatic: false` e `overrideOfId` apontando
para a decisão automática, conforme o auto-relacionamento já modelado em
`schema.prisma`). Esta função **não implementa** o fluxo de override
manual em si — apenas a decisão automática (`automatic: true`).

### Ordem de precedência

```text
1. exceptionalCircumstanceReported          → MANUAL_REVIEW_REQUIRED   (EXCEPTIONAL_CIRCUMSTANCE)
2. direito de arrependimento aplicável
   (cancellationRequestedAt − contractedAt ≤ 7 dias)
   2a. E serviço já prestado / no-show      → MANUAL_REVIEW_REQUIRED   (WITHDRAWAL_RIGHT)
   2b. E serviço ainda não prestado         → FULL_REFUND              (WITHDRAWAL_RIGHT)
3. providerCausedRescheduleRefundChosen      → FULL_REFUND              (PROVIDER_RESCHEDULE)
4. isNoShow                                  → PARTIAL_REFUND 50%/50%   (NO_SHOW)
5. cancelamento tardio (< 24h do agendamento) → PARTIAL_REFUND 30%/70%  (LATE_CANCELLATION)
6. isServiceAlreadyRendered (sem 1/2/3/4/5)  → NO_REFUND                (ALREADY_RENDERED)
7. default (nenhuma condição acima)          → FULL_REFUND              (STANDARD_CANCELLATION)
```

Passo 1 antes do passo 2: seção 19.3 lista exaustivamente as políticas que
cedem ao direito legal (tardio, no-show, início de atendimento, prioridade,
reagendamento) — "situações excepcionais" não está nessa lista, portanto
não é subordinada ao direito de arrependimento; o motor prefere sempre
enviar para revisão humana quando uma exceção é reportada, mesmo que o
prazo de 7 dias também esteja tecnicamente satisfeito (uma exceção pode
alterar a própria contagem do prazo, o que exige julgamento humano).

Passo 3 antes de 4/5: seção 19.3 inclui "reagendamento" na lista de
políticas subordinadas ao direito legal, mas a causa aqui é do prestador,
não do cliente — não faz sentido textual aplicar uma penalidade pensada
para proteger o prestador (no-show/tardio) quando a falha é do próprio
prestador.

### Validações de entrada

A função lança `InvalidRefundPolicyInputError` para combinações
logicamente inconsistentes que a especificação não descreve e que
indicariam erro do chamador, não uma regra de negócio:

- `isNoShow` ou `providerCausedRescheduleRefundChosen` ou `scheduledAt`
  informados com `modality !== APPOINTMENT` (no-show e reagendamento são
  exclusivos da consulta online — seções 15 e 17 estão sob "Consulta
  online"; a Pergunta avulsa trata cancelamento pelos próprios estados de
  `QuestionStatus`, ADR 0006).
- `isServiceAlreadyRendered && isNoShow` simultaneamente (no-show, por
  definição, significa que o serviço **não** foi prestado).
- `cancellationRequestedAt` anterior a `contractedAt` (data de cancelamento
  não pode preceder a contratação).
- `totalPaidAmount` negativo.

## Consequências

- `CancellationRequest`/`RefundDecision` (schema Prisma) já modelam todos
  os campos necessários para persistir a saída desta função; nenhuma
  migração é necessária.
- O motor não decide sozinho a transição do `PaymentStatus` — apenas
  calcula a decisão. O chamador deve, em seguida, disparar o evento
  `REQUEST_REFUND` da máquina de Pagamento (ADR 0004) quando a decisão for
  `FULL_REFUND` ou `PARTIAL_REFUND`, e registrar a `RefundDecision`
  correspondente — isso mantém a separação de responsabilidades entre "que
  decisão tomar" (este motor) e "como isso afeta o ciclo de vida do
  pagamento" (máquina de estado).
- Controllers, DTOs de API e a integração com a fila administrativa de
  `MANUAL_REVIEW_REQUIRED` continuam fora do escopo desta etapa (mesma
  limitação já registrada no `README.md` para as ADRs anteriores).

### Pontos em aberto (sinalizados para confirmação futura do responsável funcional)

1. **Cancelamento antecipado sem nenhuma condição especial (passo 7)** —
   a especificação não afirma explicitamente "reembolso integral" para
   esse caso; é uma inferência por exclusão do texto da seção 16.1. Se o
   responsável funcional pretender uma regra diferente (ex.: uma pequena
   taxa administrativa), esta ADR precisará ser revisada.
2. **No-show/serviço já prestado durante o prazo de arrependimento (passo
   2a)** — a seção 13.3 descreve esse encaminhamento para `MANUAL_REVIEW`
   apenas para a Pergunta avulsa (`DELIVERED`). Esta ADR generaliza o
   mesmo princípio para a Consulta online (`COMPLETED`/no-show), por
   analogia direta de texto (regra invariante nº 12 + seção 19.3), mas a
   especificação não trata esse cruzamento (arrependimento × no-show)
   explicitamente.
3. **Cálculo do prazo de 7 dias** — implementado como diferença exata de
   tempo (`≤ 7 × 24h` em milissegundos) entre `contractedAt` e
   `cancellationRequestedAt`, não contagem de dias corridos de calendário
   (que dependeria de fuso horário). Consistente com o restante do sistema
   usar campos `DateTime` precisos, mas é uma decisão técnica, não uma
   citação literal.

## Alternativas consideradas

- **Modelar como máquina XState** (estado "PendingDecision" com eventos por
  regra) — rejeitada: não há estado persistido entre as avaliações; é uma
  função determinística de entrada→saída, avaliada uma única vez por
  solicitação. Usar XState aqui contradiria a própria ADR 0001, que reserva
  XState para os "fluxos" de Pedido/Pagamento/Atendimento, não para regras
  de decisão pontuais.
- **Deixar cada módulo (ordering/scheduling/question) calcular seu próprio
  reembolso** — rejeitada explicitamente pela seção 20.2 ("não deverá
  existir lógica de reembolso espalhada em controllers ou telas").
- **Aceitar um `manualOverrideDecision` como parâmetro de entrada desta
  função** — rejeitada: overrides administrativos são um ato distinto (uma
  segunda `RefundDecision` com `overrideOfId`), não uma variação do cálculo
  automático; misturar os dois conceitos no mesmo ponto de entrada
  tornaria ambíguo qual decisão é "automática" (`automatic: true`) para
  fins de auditoria (seção 29, regra invariante nº 16).
- **Tratar exceções (passo 1) depois do direito de arrependimento** —
  rejeitada porque a seção 19.3 não inclui "situações excepcionais" na
  lista de políticas subordinadas ao direito legal, e a natureza
  case-a-case das exceções (seção 18) sugere que nenhuma regra automática,
  incluindo o próprio cálculo do prazo de 7 dias, deveria prevalecer sem
  revisão humana quando uma exceção é reportada.
