# ADR 0005: Máquina de estado do Slot de Agenda (`AppointmentSlotStatus`)

**Status:** Aceita
**Data:** 22 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 14.1, 14.2, 15 e 32.

## Contexto

A seção 14.2 exige um mecanismo de reserva temporária para "evitar dupla
venda do mesmo horário" da consulta online — regra invariante nº 8 (seção
32: "o mesmo horário não deverá ser vendido definitivamente para dois
pedidos"). Ao contrário do Pedido (ADR 0002), do Atendimento (ADR 0003) e
do Pagamento (ADR 0004), a especificação já apresenta o diagrama completo
de estados e transições para o slot, sem apenas exemplos soltos:

```text
AVAILABLE
  ↓
HELD
  ↓
BOOKED
```

"Pagamento aprovado: `HELD → BOOKED`."
"Pagamento expirado, abandonado ou não aprovado: `HELD → AVAILABLE`."

Esses três valores já estão transcritos literalmente em
`packages/shared/src/appointment-slot-status.ts` e no enum Prisma
`AppointmentSlotStatus` (`apps/api/prisma/schema.prisma`, model
`AppointmentSlot`, com campos de apoio `heldAt`/`heldUntil`) desde a
estruturação técnica anterior. Esta ADR fecha o grafo de eventos que
disparam essas transições, seguindo o mesmo padrão das ADR 0002–0004.

Evidências textuais adicionais usadas nesta decisão:

- Seção 14.1: "Antes do pagamento, o cliente deverá selecionar horário
  disponível" — a transição `AVAILABLE → HELD` ocorre na seleção do
  horário, antes do pagamento propriamente dito.
- Seção 14.2: "O horário poderá permanecer temporariamente reservado
  durante o processo de pagamento" e "o tempo de retenção temporária será
  definido tecnicamente/configuravelmente" — confirma que o hold tem prazo
  configurável (seção 37: "tempo de hold do slot durante checkout"), e que
  a expiração desse prazo é uma das causas de `HELD → AVAILABLE`.
- ADR 0003 (`AppointmentStatus`): `NOT_STARTED → SCHEDULED` ocorre no
  evento `PAYMENT_APPROVED`, textualmente ligado ao slot em `BOOKED`
  ("Horário confirmado (slot em `BOOKED`)") — confirma que a aprovação do
  pagamento é o evento comum que move tanto `AppointmentStatus` quanto
  `AppointmentSlotStatus`.
- ADR 0004 (`PaymentStatus`): `PENDING → APPROVED` (webhook do provedor) e
  `PENDING → REJECTED`/`CANCELLED` (recusa/abandono) são os três desfechos
  possíveis do pagamento antes da aprovação — mapeiam diretamente para o
  evento único `HELD → AVAILABLE` ("expirado, abandonado ou não
  aprovado"), que agrupa os três motivos em uma única transição.

## Decisão

Adotar a seguinte máquina para `AppointmentSlotStatus`:

```text
AVAILABLE --HOLD--> HELD ──┬──PAYMENT_APPROVED──▶ BOOKED
                            └──RELEASE───────────▶ AVAILABLE
```

| Estado      | Significado                                                                                     | Transcrição/base textual |
| ----------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| `AVAILABLE` | Horário livre, exibido como opção de agendamento (seção 14.1).                                    | Transcrição literal (seção 14.2). |
| `HELD`      | Horário retido temporariamente durante o checkout, indisponível para outros pedidos.               | Transcrição literal (seção 14.2). |
| `BOOKED`    | Horário vendido definitivamente — pagamento aprovado.                                             | Transcrição literal (seção 14.2). |

Transições:

- `AVAILABLE → HELD` (evento `HOLD`): cliente seleciona o horário no
  checkout, antes do pagamento (seção 14.1). O chamador é responsável por
  também gravar `heldAt`/`heldUntil` (campos já presentes no model
  `AppointmentSlot`) — esta ADR define apenas o eixo de estado, não a
  política de expiração em si (parâmetro configurável, seção 37).
- `HELD → BOOKED` (evento `PAYMENT_APPROVED`): pagamento aprovado
  (`PaymentStatus.PENDING → APPROVED`, ADR 0004) — mesmo evento que
  confirma `AppointmentStatus.NOT_STARTED → SCHEDULED` (ADR 0003).
- `HELD → AVAILABLE` (evento `RELEASE`): cobre, sem distinção de estado,
  os três motivos citados literalmente na seção 14.2 — hold expirado
  (prazo configurável decorrido), checkout abandonado pelo cliente, ou
  pagamento explicitamente não aprovado
  (`PaymentStatus.PENDING → REJECTED`/`CANCELLED`, ADR 0004). A
  especificação não distingue esses três motivos operacionalmente para o
  eixo do slot (apresenta-os como uma única seta `HELD → AVAILABLE`);
  distingui-los exigiria estados adicionais não previstos no texto.

`BOOKED` é terminal para esta máquina.

**Por que `AVAILABLE` não aceita eventos além de `HOLD`:** a seção 14.2 não
descreve nenhuma transição a partir de `AVAILABLE` além da retenção; um
horário livre só deixa de ser livre quando alguém o seleciona no checkout.

**Por que `BOOKED` é tratado como terminal nesta ADR:** a seção 14.2 não
apresenta nenhuma seta saindo de `BOOKED`. O que acontece com o slot após
uma consulta já `BOOKED` ser cancelada, sofrer no-show, ou ser trocada por
reagendamento (seção 15 — `RescheduleRequest.newSlotId`/`originalSlotId`)
não é descrito textualmente nesta seção, e fica **fora do escopo desta
ADR** — ver nota abaixo.

## Consequências

- `apps/api/prisma/schema.prisma`: `AppointmentSlot.status` já é o enum
  `AppointmentSlotStatus` com `@default(AVAILABLE)` — nenhuma migração
  adicional é necessária; esta ADR apenas fecha o grafo de transições.
- O módulo `scheduling` ganha `appointment-slot-status.machine.ts` (lógica
  pura de transição, XState) e `AppointmentSlotStatusService` (NestJS),
  seguindo o mesmo padrão de `ordering`/`payment` (ADR 0002/0004).
- **Fora do escopo, sinalizado para ADR futura:** a liberação de um slot
  `BOOKED` de volta para `AVAILABLE` quando a consulta associada é
  cancelada (seção 16), sofre no-show (seção 17) ou é substituída por um
  novo horário via reagendamento (seção 15 — o `originalSlotId` fica
  presumivelmente livre após a confirmação do `newSlotId`) não é modelada
  aqui. Este ponto é análogo ao já sinalizado na ADR 0003 sobre a
  fronteira `Appointment`/`ServiceExecution`, e deverá ser resolvido antes
  da implementação completa dos módulos `scheduling` (ação de
  reagendamento) e `cancellation`.
- Esta decisão não define o valor/estratégia do tempo de hold
  (`heldUntil`) nem o mecanismo técnico de expiração (job agendado vs.
  verificação em leitura) — permanece parâmetro operacional configurável
  (seção 37) e detalhe de implementação do módulo `scheduling`.

## Alternativas consideradas

- **Distinguir `HELD → AVAILABLE` por motivo (ex.: `EXPIRED` vs.
  `RELEASED` vs. `PAYMENT_DECLINED`) com estados/valores separados:**
  rejeitada — a seção 14.2 apresenta uma única seta para os três motivos;
  criar estados adicionais duplicaria informação que já é rastreável via
  `PaymentStatus` (ADR 0004) e via logs/auditoria (seção 29), sem base
  textual para um novo valor fechado no eixo do slot.
- **Modelar liberação de `BOOKED → AVAILABLE` nesta mesma ADR:** rejeitada
  por ora — exigiria decidir regras ainda não fechadas de cancelamento
  tardio/no-show/reagendamento aplicadas ao **slot** (e não apenas ao
  Atendimento), o que caberá à ADR de fronteira mencionada acima, junto
  com a implementação dos módulos `scheduling`/`cancellation`.
