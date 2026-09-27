# ADR 0006: Máquina de estado da Pergunta Avulsa (`QuestionStatus`)

**Status:** Aceita
**Data:** 22 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 10, 11, 12, 13, 19 e 23.4.

## Contexto

Diferentemente do Pedido (ADR 0017), do Atendimento da consulta online
(ADR 0018), do Pagamento (ADR 0004) e do Slot de agenda (ADR 0005), a
especificação **já enumera exaustivamente** os doze valores de
`QuestionStatus` (seção 11.3) — sete do fluxo principal e cinco
"auxiliares". Esses valores já estão transcritos literalmente em
`packages/shared/src/question-status.ts` e no enum Prisma `QuestionStatus`
(`apps/api/prisma/schema.prisma`, model `QuestionRequest`) desde a
estruturação técnica anterior, com a nota explícita: "Transcrito
literalmente da especificação — não deve ser reinterpretado ou
simplificado". Esta ADR, portanto, **não decide os estados** (já fechados),
apenas o grafo de eventos/transições entre eles — igual em espírito à ADR
0004, mas com uma árvore de decisão mais ramificada por combinar, em um
único enum, tanto o ciclo de execução quanto o de cancelamento/reembolso.

Fluxo principal (seção 11.3, transcrição literal):

```text
CREATED → AWAITING_PAYMENT → PAID → QUEUED → IN_PROGRESS → DELIVERED → COMPLETED
```

Estados auxiliares (seção 11.3, transcrição literal, sem diagrama):

```text
CANCELLATION_REQUESTED
CANCELLED
REFUND_PENDING
REFUNDED
MANUAL_REVIEW
```

Evidências textuais usadas para reconstruir o grafo de transições:

- Seção 11.4: "Somente pedidos com pagamento confirmado podem entrar na
  fila operacional" — `QUEUED` só é alcançado depois de `PAID`, sem gate
  manual adicional descrito; a entrada na fila é automática.
- Seção 11.5: "A execução será considerada iniciada somente quando o
  administrador realizar explicitamente a ação: **Iniciar atendimento**"
  — `QUEUED → IN_PROGRESS` é ação administrativa explícita, nunca
  automática.
- Seção 11.6: entrega via WhatsApp seguida da ação administrativa
  **Marcar como entregue** — `IN_PROGRESS → DELIVERED` também é ação
  administrativa explícita.
- Seção 11.7 + seção 23.4 (lista de ações do painel administrativo para
  Perguntas: "iniciar atendimento; marcar entrega; **concluir**; cancelar;
  encaminhar para revisão") — confirma que `DELIVERED → COMPLETED`
  também é ação administrativa explícita (`concluir`), e não uma
  transição automática por tempo — mesmo padrão do `COMPLETE` já adotado
  em `AppointmentStatus` (ADR 0018).
- Seção 13.1: "O cliente poderá solicitar cancelamento enquanto o
  atendimento estiver em `QUEUED`... Quando houver direito de
  arrependimento legalmente aplicável: o pedido deverá ser cancelado; o
  atendimento não deverá iniciar; o reembolso será integral" — cancelamento
  a partir de `QUEUED` passa por um pedido do cliente e resulta em
  cancelamento com reembolso integral.
- Seção 13.2: "O estado `IN_PROGRESS` não deverá, isoladamente, eliminar
  automaticamente direitos previstos em lei... a execução deverá ser
  interrompida... a política operacional adotará, por segurança, reembolso
  integral quando o direito legal for aplicável" — mesma lógica de 13.1,
  agora a partir de `IN_PROGRESS`.
- Seção 13.3: "Se a pergunta já estiver em `DELIVERED` e houver pedido de
  cancelamento ou arrependimento... o sistema não deverá negar
  automaticamente; deverá encaminhar para `MANUAL_REVIEW`" — **diferença
  textual deliberada**: a partir de `DELIVERED`, o pedido de cancelamento
  não gera `CANCELLATION_REQUESTED` (esse valor é usado apenas nos casos
  de 13.1/13.2, antes da entrega); vai direto para `MANUAL_REVIEW`, porque
  o serviço já foi prestado e a decisão de reembolsar (ou não) deixa de
  ser automática.
- Seção 23.4: confirma que "cancelar" e "encaminhar para revisão" também
  são ações administrativas do painel — o administrador participa
  ativamente da resolução de `CANCELLATION_REQUESTED`/`MANUAL_REVIEW`, não
  apenas o cliente as inicia.
- ADR 0004 (`PaymentStatus`): o par `REFUND_PENDING → REFUNDED` já modela
  exatamente esse sub-fluxo de reembolso no eixo do Pagamento; esta ADR
  replica o mesmo par no eixo da Pergunta porque a especificação inclui
  ambos os valores no mesmo enum `QuestionStatus` (ao contrário do Pedido,
  cujo `OrderStatus.CANCELLED` é terminal e não replica os estados de
  reembolso do Pagamento).

## Decisão

Adotar a seguinte máquina para `QuestionStatus`:

```text
CREATED
  │ PROCEED_TO_PAYMENT
  ▼
AWAITING_PAYMENT ──PAYMENT_DECLINED──────────────────────┐
  │ PAYMENT_APPROVED                                     │
  ▼                                                       │
PAID                                                      │
  │ ENTER_QUEUE                                           │
  ▼                                                       │
QUEUED ──────────────REQUEST_CANCELLATION──┐              │
  │ START_EXECUTION                        │              │
  ▼                                        ▼              │
IN_PROGRESS ──────────REQUEST_CANCELLATION─▶ CANCELLATION_REQUESTED
  │ MARK_DELIVERED                                        │ CONFIRM_CANCELLATION
  ▼                                                        ▼
DELIVERED ──────────REQUEST_CANCELLATION──▶ MANUAL_REVIEW  CANCELLED
  │ COMPLETE               REJECT_CANCELLATION│    │ REQUEST_REFUND      │ REQUEST_REFUND
  ▼                              (volta p/DELIVERED)   ▼                  ▼
COMPLETED                                        REFUND_PENDING ◀─────────┘
                                                       │ CONFIRM_REFUND
                                                       ▼
                                                    REFUNDED
```

(Diagrama textual simplificado — ver tabela de transições abaixo para a
lista precisa e não ambígua.)

| Estado                   | Significado                                                                                                    | Transcrição/base textual |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `CREATED`                 | Pergunta registrada; checkout ainda não iniciado.                                                              | Transcrição literal (seção 11.3). |
| `AWAITING_PAYMENT`        | Checkout iniciado; `PaymentTransaction` criada, aguardando confirmação do provedor.                             | Transcrição literal (seção 11.3). |
| `PAID`                    | Pagamento aprovado (`payment.confirmedAt` preenchido — seção 11.1); ainda não entrou na fila.                   | Transcrição literal (seção 11.3). |
| `QUEUED`                  | Na fila operacional, aguardando início da execução (seção 11.4); ordenação por prioridade/FIFO (seção 12.3).    | Transcrição literal (seção 11.3). |
| `IN_PROGRESS`             | Execução iniciada por ação administrativa explícita (seção 11.5).                                              | Transcrição literal (seção 11.3). |
| `DELIVERED`               | Resposta entregue via WhatsApp e marcada pelo administrador (seção 11.6).                                       | Transcrição literal (seção 11.3). |
| `COMPLETED`               | Atendimento concluído por ação administrativa (seção 11.7; seção 23.4 "concluir").                              | Transcrição literal (seção 11.3). |
| `CANCELLATION_REQUESTED`  | Cliente solicitou cancelamento enquanto `QUEUED` ou `IN_PROGRESS` (seções 13.1–13.2), aguardando confirmação.   | Transcrição literal (seção 11.3). |
| `CANCELLED`               | Cancelamento confirmado — atendimento não ocorrerá (ou foi interrompido antes da entrega).                      | Transcrição literal (seção 11.3). |
| `REFUND_PENDING`          | Reembolso solicitado ao provedor (integral, seções 13.1/13.2, ou conforme decisão de `MANUAL_REVIEW`).          | Transcrição literal (seção 11.3). |
| `REFUNDED`                | Reembolso confirmado como processado.                                                                          | Transcrição literal (seção 11.3). |
| `MANUAL_REVIEW`           | Pedido de cancelamento/arrependimento após `DELIVERED` (seção 13.3); decisão cabe ao administrador, caso a caso. | Transcrição literal (seção 11.3). |

Transições:

- `CREATED → AWAITING_PAYMENT` (evento `PROCEED_TO_PAYMENT`): cliente
  avança para o pagamento no checkout.
- `AWAITING_PAYMENT → PAID` (evento `PAYMENT_APPROVED`): webhook do
  provedor confirma o pagamento (mesmo evento usado em `OrderStatus`/
  `AppointmentStatus`/`AppointmentSlotStatus`).
- `AWAITING_PAYMENT → CANCELLED` (evento `PAYMENT_DECLINED`): pagamento
  rejeitado, cancelado ou abandonado antes da aprovação (espelha
  `OrderStatus.CREATED → CANCELLED`, ADR 0017).
- `PAID → QUEUED` (evento `ENTER_QUEUE`): entrada automática na fila,
  imediatamente após a confirmação do pagamento (seção 11.4 — "somente
  pedidos com pagamento confirmado", sem outro gate descrito).
- `QUEUED → IN_PROGRESS` (evento `START_EXECUTION`): ação administrativa
  "Iniciar atendimento" (seção 11.5; seção 23.4).
- `QUEUED → CANCELLATION_REQUESTED` (evento `REQUEST_CANCELLATION`):
  cliente solicita cancelamento em fila (seção 13.1).
- `IN_PROGRESS → DELIVERED` (evento `MARK_DELIVERED`): ação administrativa
  "Marcar como entregue" (seção 11.6; seção 23.4).
- `IN_PROGRESS → CANCELLATION_REQUESTED` (evento `REQUEST_CANCELLATION`):
  arrependimento durante a execução, antes da entrega (seção 13.2).
- `DELIVERED → COMPLETED` (evento `COMPLETE`): ação administrativa
  "concluir" (seção 11.7; seção 23.4).
- `DELIVERED → MANUAL_REVIEW` (evento `REQUEST_CANCELLATION`): pedido de
  cancelamento/arrependimento após a entrega — encaminhado para revisão
  manual, nunca negado automaticamente (seção 13.3).
- `CANCELLATION_REQUESTED → CANCELLED` (evento `CONFIRM_CANCELLATION`):
  confirmação do cancelamento (ação administrativa "cancelar", seção
  23.4), aplicável quando o direito de arrependimento é legalmente
  cabível (seções 13.1/13.2, 19.1).
- `CANCELLED → REFUND_PENDING` (evento `REQUEST_REFUND`): reembolso
  integral solicitado ao provedor (seções 13.1/13.2 — "o reembolso será
  integral").
- `REFUND_PENDING → REFUNDED` (evento `CONFIRM_REFUND`): provedor confirma
  o processamento do reembolso.
- `MANUAL_REVIEW → REFUND_PENDING` (evento `REQUEST_REFUND`): administrador
  decide reembolsar após revisão manual (seção 13.3).
- `MANUAL_REVIEW → DELIVERED` (evento `REJECT_CANCELLATION`): administrador
  decide manter a entrega (nega o pedido de cancelamento/reembolso); o
  atendimento permanece `DELIVERED` e segue disponível para `COMPLETE`.

`COMPLETED` e `REFUNDED` são terminais. `CANCELLED` não obriga a transição
para `REFUND_PENDING` — permanece como estado estável quando não houver
reembolso devido (ex.: decisão `NO_REFUND` do Refund Policy Engine, seção
20.3, aplicada a um caso concreto), sem necessidade de um valor adicional
só para essa combinação.

**Por que `DELIVERED` não usa `CANCELLATION_REQUESTED`:** a seção 13.3 é
textualmente distinta de 13.1/13.2 — usa o verbo "encaminhar para
`MANUAL_REVIEW`" diretamente, nunca menciona `CANCELLATION_REQUESTED` para
esse caso, e explicitamente proíbe negativa automática ("não deverá negar
automaticamente"). Reaproveitar `CANCELLATION_REQUESTED` aqui sugeriria
(incorretamente) uma resolução simétrica e automática igual à de
QUEUED/IN_PROGRESS.

**Por que a aprovação de `MANUAL_REVIEW` vai para `REFUND_PENDING`, não
para `CANCELLED`:** em `DELIVERED`, o serviço já foi prestado — não há
"atendimento" a cancelar, apenas uma decisão financeira de reembolsar ou
não. Rotear por `CANCELLED` misturaria semanticamente "serviço não
prestado" (uso correto de `CANCELLED` nos casos QUEUED/IN_PROGRESS) com
"serviço prestado, mas reembolsado por decisão legal/administrativa".

## Consequências

- `apps/api/prisma/schema.prisma`: `QuestionRequest.status` já é o enum
  `QuestionStatus` com `@default(CREATED)` — nenhuma migração adicional é
  necessária; esta ADR apenas fecha o grafo de transições.
- O módulo `question` ganha `question-status.machine.ts` (lógica pura de
  transição, XState) e `QuestionStatusService` (NestJS), seguindo o mesmo
  padrão de `ordering`/`payment`/`scheduling` (ADR 0017/0004/0005).
- **Ponto sinalizado para confirmação do responsável funcional** (mesmo
  espírito da ressalva já registrada na ADR 0018 para `AppointmentStatus`):
  esta ADR assume que uma solicitação de cancelamento a partir de `QUEUED`
  ou `IN_PROGRESS` **sempre** resulta em `CANCELLED` (via
  `CANCELLATION_REQUESTED`), sem um caminho de "negativa" de volta à fila
  ou à execução — a especificação (13.1/13.2) descreve apenas o cenário em
  que o direito de arrependimento é aplicável, sem tratar explicitamente
  um pedido de cancelamento sem amparo legal nesses dois estados. Caso o
  responsável funcional confirme que deve existir uma negativa nesses
  casos também (espelhando o tratamento de `DELIVERED`), a migração é
  simples — estados já fechados, sem dados em produção ainda.
- Esta decisão não define o mecanismo técnico de auditoria (administrador
  responsável, justificativa) exigido nas transições administrativas —
  isso é campo de dados (`QuestionRequest.executionStartedByAdminId`,
  `deliveredByAdminId` etc., já presentes no schema) e responsabilidade de
  implementação do módulo `question`, não da máquina de estado em si.

## Alternativas consideradas

- **Reaproveitar `CANCELLATION_REQUESTED` também para o caso de
  `DELIVERED`:** rejeitada — contraria a distinção textual explícita da
  seção 13.3 (ver nota acima).
- **Rotear a aprovação de `MANUAL_REVIEW` por `CANCELLED` antes de
  `REFUND_PENDING`:** rejeitada — ver nota acima sobre a diferença
  semântica entre "não prestado" e "prestado, porém reembolsado".
- **Adicionar um estado de negativa explícito (`CANCELLATION_DENIED`) para
  QUEUED/IN_PROGRESS:** não adotada — sem base textual; a especificação
  não descreve esse desfecho para esses dois estados (ao contrário de
  `DELIVERED`, coberto por `MANUAL_REVIEW`). Ver ponto sinalizado acima.
- **Enum único para Pedido+Pagamento+Atendimento+Pergunta:** rejeitada
  pelos mesmos motivos já registrados nas ADR 0017–0004 (seção 10).
