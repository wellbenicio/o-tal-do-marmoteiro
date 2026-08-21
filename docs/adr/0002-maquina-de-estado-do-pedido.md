# ADR 0002: Máquina de estado do Pedido (`OrderStatus`)

**Status:** Aceita
**Data:** 21 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 9, 10, 30 e 32.

## Contexto

A seção 10 da especificação exige que Pedido, Pagamento e Atendimento sejam
tratados como **domínios de estado independentes** — "não deverá existir um
único status tentando representar os três ciclos". O Pedido representa,
especificamente, "o que foi contratado" (seção 10.1).

A especificação não enumera exaustivamente os estados do Pedido. Ela apresenta
apenas dois valores, como exemplo (seção 10):

```text
PEDIDO: CONFIRMADO
PAGAMENTO: PAGO
ATENDIMENTO: AGENDADO
```

"Posteriormente" (mesmo cenário, avançado no tempo):

```text
PEDIDO: CONFIRMADO
PAGAMENTO: PAGO
ATENDIMENTO: CONCLUÍDO
```

"Ou" (cenário alternativo):

```text
PEDIDO: CANCELADO
PAGAMENTO: REEMBOLSO_PENDENTE
ATENDIMENTO: NÃO_INICIADO
```

Este é exatamente o ponto sinalizado como "ADR pendente" em
`apps/api/prisma/schema.prisma` (model `Order`) e em
`apps/api/src/modules/ordering/ordering.module.ts`: o enum completo — e não
apenas os dois exemplos — precisa ser decidido antes de implementar a lógica
do módulo `ordering`.

Evidências textuais adicionais usadas nesta decisão:

- Seção 30 (Timeline de contratação) trata "Pedido criado" como um evento
  **distinto e anterior** a "Pagamento aprovado" — ou seja, o registro do
  Pedido existe antes da confirmação financeira.
- Seção 9.2 (Fluxo comum) mostra "Resumo da contratação" e "Pagamento" como
  passos sequenciais, também antes da "Confirmação".
- Os dois exemplos sequenciais da seção 10 (acima) mostram o Pedido
  permanecendo `CONFIRMADO` enquanto o Atendimento evolui de `AGENDADO` para
  `CONCLUÍDO` — isto é, o Pedido **não** acompanha o ciclo de vida da
  execução do serviço.
- `QuestionStatus` (seção 11.3, já implementado) usa `CREATED` como estado
  inicial equivalente para a Pergunta Avulsa, o que dá precedente de
  vocabulário para um estado "criado, aguardando confirmação financeira".

## Decisão

Adotar um enum `OrderStatus` com três estados:

```text
CREATED
  ↓
CONFIRMED
  ↓
CANCELLED (também alcançável a partir de CREATED)
```

| Estado      | Significado                                                                                     | Transcrição/base textual                                                        |
| ----------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `CREATED`   | Pedido registrado; pagamento ainda não confirmado.                                                | Inferência técnica — seção 30 ("Pedido criado" como evento anterior ao pagamento); vocabulário alinhado a `QuestionStatus.CREATED` (seção 11.3). |
| `CONFIRMED` | Pagamento aprovado; a contratação é considerada válida e **permanece neste estado** durante toda a execução do atendimento (agendado, em andamento, entregue, concluído ou até no-show). | Transcrição literal de "CONFIRMADO" (seção 10.1).                                 |
| `CANCELLED` | O pedido não será cumprido — por abandono do pagamento antes da confirmação, ou por cancelamento aprovado após a confirmação (arrependimento, cancelamento tardio, decisão administrativa etc.). | Transcrição literal de "CANCELADO" (seção 10.1).                                  |

Transições:

- `CREATED → CONFIRMED`: quando `PaymentTransaction.status` torna-se
  `APPROVED` (seção 21.3 — confirmação orientada por webhook do provedor).
- `CREATED → CANCELLED`: pagamento rejeitado, cancelado ou abandonado antes da
  aprovação (espelha `PaymentStatus.REJECTED`/`CANCELLED`).
- `CONFIRMED → CANCELLED`: cancelamento aprovado via `CancellationRequest` —
  cobre direito de arrependimento (seção 19), cancelamento tardio (seção 16),
  no-show quando este encerra a contratação (seção 17.4: "encerra aquela
  contratação"), reagendamento provocado pelo prestador quando o cliente opta
  por restituição integral em vez de novo horário (seção 15.7), ou decisão
  administrativa de exceção (seção 18).

`CONFIRMED` e `CANCELLED` são estados terminais para o eixo Pedido — a partir
daí, qualquer detalhe adicional (motivo do cancelamento, valor retido, se foi
automático ou override) é responsabilidade dos domínios Payment,
Cancellation/RefundDecision, não do `OrderStatus`.

**Por que não existe um `COMPLETED`/`CONCLUÍDO` no Pedido:** os dois exemplos
sequenciais da seção 10 mostram o Pedido permanecendo `CONFIRMADO` enquanto o
Atendimento avança de `AGENDADO` para `CONCLUÍDO`. Adicionar um estado
`COMPLETED` ao Pedido duplicaria informação que já pertence ao eixo
Atendimento (`AppointmentStatus`/`QuestionStatus`), contrariando
explicitamente a seção 10.

## Consequências

- `apps/api/prisma/schema.prisma`: campo `Order.status` passa de `String`
  para o enum `OrderStatus`, com `@default(CREATED)`.
- `packages/shared/src/order-status.ts`: novo enum TypeScript espelhando o
  enum do Prisma, para uso compartilhado entre `apps/api` e `apps/web`.
- O módulo `ordering` pode agora ser implementado (em rodada futura) sobre um
  contrato de estados fechado, sem inventar valores ad hoc.
- `CancellationRequest.executionStatusAtRequest` continua como `String` —
  esse campo registra o status do **Atendimento** (não do Pedido) no momento
  da solicitação, e precisa acomodar tanto `QuestionStatus` quanto
  `AppointmentStatus` (ver ADR 0003); a unificação desse campo continua em
  aberto e não faz parte desta decisão.
- Esta decisão não define o merge diagram de erros/timeouts de pagamento
  (ex.: reprocessamento de webhook duplicado) — permanece como detalhe de
  implementação do módulo `payment`.

## Alternativas consideradas

- **Espelhar `QuestionStatus` com um estado `AWAITING_PAYMENT` distinto de
  `CREATED`:** rejeitada. Isso duplicaria o papel do `PaymentStatus.PENDING`
  dentro do eixo Pedido, contrariando a exigência da seção 10 de que o Pedido
  não deve tentar representar o ciclo de Pagamento.
- **Dividir `CANCELLED` em `CANCELLED` (pós-confirmação) e `EXPIRED`
  (abandono pré-pagamento):** considerada, mas não adotada agora — a
  especificação cita apenas "CANCELADO" (singular) como exemplo, e o motivo
  da não confirmação já é rastreável via `PaymentStatus`
  (`REJECTED`/`CANCELLED`) e via `CancellationRequest`/`RefundDecision`. Fica
  como ponto em aberto para reavaliação caso o backoffice (seção 23.3)
  precise distinguir os dois casos operacionalmente.
- **Enum único para Pedido+Pagamento+Atendimento:** rejeitada por violar
  diretamente a seção 10 ("não deverá existir um único status").
