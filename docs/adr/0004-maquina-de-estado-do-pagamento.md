# ADR 0004: Máquina de estado do Pagamento (`PaymentStatus`)

**Status:** Aceita
**Data:** 22 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 10, 11.1, 20 e 21.

## Contexto

A seção 10 exige que Pagamento seja tratado como eixo de estado
independente de Pedido e Atendimento: "Representa a movimentação
financeira" (seção 10.2). A ADR 0001 já registra a decisão de usar XState
"para os fluxos de Pedido, Pagamento e Atendimento" — as máquinas de Pedido
(ADR 0002) e Atendimento (ADR 0003) já foram implementadas; esta ADR fecha
o terceiro eixo.

Diferentemente do Pedido e do Atendimento, a seção 21.2 já enumera um
conjunto concreto de estados (e não apenas dois exemplos soltos):

```text
PENDING
APPROVED
REJECTED
CANCELLED
REFUND_PENDING
PARTIALLY_REFUNDED
REFUNDED
```

Esses sete valores já estão transcritos literalmente em
`packages/shared/src/payment-status.ts` e no enum Prisma `PaymentStatus`
(`apps/api/prisma/schema.prisma`, model `PaymentTransaction`) desde a
estruturação técnica anterior. O que falta — e é o objeto desta ADR — é o
**grafo de transições** entre esses estados, que a seção 21 não desenha
explicitamente (ao contrário da seção 14.2, que já traz o diagrama
`AVAILABLE → HELD → BOOKED` para o slot de agenda).

Evidências textuais adicionais usadas nesta decisão:

- Seção 21.3: "A confirmação de pagamento deverá ser orientada por
  informação confiável do provedor, preferencialmente webhook/evento
  servidor-servidor" — as transições `PENDING → APPROVED` e
  `PENDING → REJECTED` são, portanto, eventos externos (webhook do
  provedor), não ações do usuário.
- Seção 11.1: `payment.confirmedAt` é a referência oficial do SLA da
  pergunta avulsa — confirma que existe um instante de confirmação bem
  definido, coincidente com a transição para `APPROVED`.
- ADR 0002 (`OrderStatus`): `CREATED → CONFIRMED` ocorre quando
  `PaymentTransaction.status` se torna `APPROVED`; `CREATED → CANCELLED`
  ocorre quando o pagamento é "rejeitado, cancelado ou abandonado antes da
  aprovação (espelha `PaymentStatus.REJECTED`/`CANCELLED`)". Ou seja, a
  ADR 0002 já pressupõe que `REJECTED` e `CANCELLED` são desfechos
  possíveis a partir de `PENDING`, sem passar por `APPROVED`.
- Seção 20.2 (Refund Policy Engine): o motor de reembolso é centralizado e
  produz uma decisão (`FULL_REFUND`/`PARTIAL_REFUND`/`NO_REFUND`/
  `MANUAL_REVIEW_REQUIRED`, seção 20.3) a partir de um pagamento já
  `APPROVED`. Isso indica que `REFUND_PENDING` só é alcançável a partir de
  `APPROVED`, nunca de `PENDING`/`REJECTED`/`CANCELLED`.
- A própria ordem de apresentação da seção 21.2 (`PENDING, APPROVED,
  REJECTED, CANCELLED, REFUND_PENDING, PARTIALLY_REFUNDED, REFUNDED`)
  agrupa `REJECTED`/`CANCELLED` logo após `APPROVED` (desfechos de
  pré-aprovação) e só depois apresenta o sub-fluxo de reembolso
  (`REFUND_PENDING → PARTIALLY_REFUNDED`/`REFUNDED`), coerente com a
  leitura acima.
- O model `PaymentTransaction` tem cardinalidade `Order 1—N
  PaymentTransaction` (`apps/api/prisma/schema.prisma`): uma nova tentativa
  de pagamento após rejeição/cancelamento cria uma **nova**
  `PaymentTransaction`, em vez de reabrir a transação anterior — o que
  permite tratar `REJECTED` e `CANCELLED` como terminais para uma dada
  transação, sem perder a possibilidade de retentativa no nível do Pedido.

## Decisão

Adotar a seguinte máquina para `PaymentStatus`:

```text
PENDING ──┬──APPROVE────────────▶ APPROVED ──REQUEST_REFUND──▶ REFUND_PENDING ──┬─CONFIRM_PARTIAL_REFUND─▶ PARTIALLY_REFUNDED
          ├──REJECT─────────────▶ REJECTED                                       └─CONFIRM_FULL_REFUND────▶ REFUNDED
          └──CANCEL─────────────▶ CANCELLED
```

| Estado               | Significado                                                                                                 | Transcrição/base textual |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `PENDING`             | Transação criada junto ao provedor externo; aguardando confirmação (webhook/evento servidor-servidor).       | Transcrição literal (seção 21.2); "orientada por... webhook" (seção 21.3). |
| `APPROVED`            | Provedor confirmou a aprovação; `confirmedAt` é preenchido (referência do SLA, seção 11.1).                  | Transcrição literal (seção 21.2). |
| `REJECTED`            | Provedor recusou o pagamento (saldo insuficiente, cartão recusado etc.).                                     | Transcrição literal (seção 21.2). |
| `CANCELLED`           | Pagamento abandonado ou expirado antes de qualquer confirmação do provedor.                                  | Transcrição literal (seção 21.2). |
| `REFUND_PENDING`      | Refund Policy Engine decidiu `FULL_REFUND` ou `PARTIAL_REFUND` (seção 20.3); reembolso solicitado ao provedor, aguardando processamento. | Transcrição literal (seção 21.2); ligação com seção 20.2/20.3. |
| `PARTIALLY_REFUNDED`  | Provedor confirmou reembolso parcial processado — desfecho de uma decisão `PARTIAL_REFUND`.                  | Transcrição literal (seção 21.2). |
| `REFUNDED`            | Provedor confirmou reembolso integral processado — desfecho de uma decisão `FULL_REFUND`.                    | Transcrição literal (seção 21.2). |

Transições:

- `PENDING → APPROVED` (evento `APPROVE`): webhook do provedor confirma o
  pagamento (seção 21.3). Dispara `OrderStatus.CREATED → CONFIRMED`
  (ADR 0002) e, para consulta online, `AppointmentStatus.NOT_STARTED →
  SCHEDULED` (ADR 0003).
- `PENDING → REJECTED` (evento `REJECT`): webhook do provedor informa
  recusa.
- `PENDING → CANCELLED` (evento `CANCEL`): abandono/expiração do checkout
  antes de qualquer confirmação do provedor.
- `APPROVED → REFUND_PENDING` (evento `REQUEST_REFUND`): Refund Policy
  Engine decide `FULL_REFUND` ou `PARTIAL_REFUND` (seção 20.3) e o
  reembolso é solicitado ao provedor.
- `REFUND_PENDING → PARTIALLY_REFUNDED` (evento
  `CONFIRM_PARTIAL_REFUND`): provedor confirma o processamento do
  reembolso parcial.
- `REFUND_PENDING → REFUNDED` (evento `CONFIRM_FULL_REFUND`): provedor
  confirma o processamento do reembolso integral.

`REJECTED`, `CANCELLED`, `PARTIALLY_REFUNDED` e `REFUNDED` são estados
terminais para uma dada `PaymentTransaction`.

**Por que `REJECTED`/`CANCELLED` não alimentam diretamente um novo
`PENDING`:** uma nova tentativa de pagamento é modelada como uma **nova**
linha de `PaymentTransaction` associada ao mesmo `Order` (cardinalidade já
definida no schema), não como reabertura da transação anterior — mantém
cada transação com um histórico de estado imutável para fins de auditoria
(seção 29).

**Por que não existe transição direta `APPROVED → CANCELLED`/`REJECTED`:**
esses dois estados representam exclusivamente desfechos do processo de
_confirmação_ do pagamento (antes da aprovação). Uma vez `APPROVED`,
qualquer reversão financeira segue obrigatoriamente o sub-fluxo de
reembolso centralizado da seção 20 (`REFUND_PENDING → …`), nunca os
estados de pré-aprovação — isso preserva a regra da seção 20.2 de que
"não deverá existir lógica de reembolso espalhada" fora do Refund Policy
Engine.

## Consequências

- `apps/api/prisma/schema.prisma`: `PaymentTransaction.status` já é o enum
  `PaymentStatus` com `@default(PENDING)` — nenhuma migração adicional é
  necessária; esta ADR apenas fecha o grafo de transições que faltava.
- O módulo `payment` ganha `payment-status.machine.ts` (lógica pura de
  transição, XState) e `PaymentStatusService` (NestJS), seguindo
  exatamente o padrão de `ordering`/`scheduling` (ADR 0002/0003).
- Esta decisão não modela o "merge diagram" de reprocessamento de webhook
  duplicado (ex.: dois eventos `APPROVE` para a mesma transação) — a
  função `transitionPaymentStatus` lança
  `InvalidPaymentStatusTransitionError` nesse caso, cabendo ao chamador
  (módulo `payment`, em rodada futura) decidir se trata isso como no-op
  idempotente ou como erro operacional. Esse ponto já era citado como
  aberto na ADR 0002.
- Não modela, ainda, a hipótese de um reembolso parcial ser seguido de um
  reembolso complementar até atingir o total (ex.: uma revisão manual —
  seção 18 — que amplie uma decisão `PARTIAL_REFUND` anterior para
  integral). A especificação não descreve esse caso explicitamente; fica
  como ponto em aberto para reavaliação futura, sem necessidade de migração
  de dados caso venha a ser adotado (estado fechado, sem dados em produção
  ainda).

## Alternativas consideradas

- **Permitir `PENDING → REFUND_PENDING` diretamente:** rejeitada — a seção
  20.2 condiciona a decisão do Refund Policy Engine ao "valor total pago"
  e a um pagamento já confirmado; um pagamento nunca aprovado não tem o
  que reembolsar (o caminho correto para abandono pré-aprovação é
  `CANCELLED`).
- **Tratar `PARTIALLY_REFUNDED` como não terminal, permitindo nova
  solicitação de reembolso até `REFUNDED`:** considerada, mas não
  adotada agora pelos motivos citados em "Consequências" — sem exemplo
  textual de reembolso complementar na especificação.
- **Enum único para Pedido+Pagamento+Atendimento:** rejeitada por violar
  diretamente a seção 10, pelos mesmos motivos já registrados nas ADR
  0002 e 0003.
