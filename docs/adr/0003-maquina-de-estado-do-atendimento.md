# ADR 0003: Máquina de estado do Atendimento da Consulta Online (`AppointmentStatus`)

**Status:** Aceita
**Data:** 21 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 10, 14–17, 29 e 30.

## Contexto

A seção 10 trata Atendimento como o terceiro eixo de estado independente:
"Representa a execução do serviço" (seção 10.3). Assim como no caso do
Pedido (ADR 0002), a especificação não enumera exaustivamente os estados do
Atendimento — apresenta apenas exemplos (`AGENDADO`, `CONCLUÍDO`,
`NÃO_INICIADO`, seção 10) e trata reagendamento, cancelamento tardio e
no-show como **eventos e regras financeiras** (seções 15–17), não como
valores fechados de um único campo `status`. Esse é exatamente o ponto
sinalizado como "ADR pendente" no model `Appointment` de
`apps/api/prisma/schema.prisma`.

**Escopo desta ADR:** aplica-se apenas à modalidade **Consulta online**
(model `Appointment`). A Pergunta Avulsa já possui seu eixo de atendimento
integralmente coberto pelo enum `QuestionStatus`, transcrito literalmente da
seção 11.3 na estruturação técnica anterior — esta ADR não o altera.

Evidências textuais usadas nesta decisão:

- Seção 10, cenário 1: `PEDIDO: CONFIRMADO / PAGAMENTO: PAGO / ATENDIMENTO: AGENDADO`.
- Seção 10, cenário 2 ("Posteriormente", mesmo caso): `ATENDIMENTO: CONCLUÍDO`.
- Seção 10, cenário 3 ("Ou", caso alternativo): `PEDIDO: CANCELADO / PAGAMENTO: REEMBOLSO_PENDENTE / ATENDIMENTO: NÃO_INICIADO`.
- Seção 14.2: reserva do horário segue `AVAILABLE → HELD → BOOKED`
  (`AppointmentSlotStatus`, já definido) — a seleção do horário ocorre
  **antes** do pagamento (seção 14.1).
- Seção 17 (No-show): tolerância de 15 minutos (17.1); consequência
  financeira de retenção de 50% (17.3); "não gera direito a reagendamento;
  encerra aquela contratação" (17.4).
- Seção 29 (Auditoria), exemplo literal: `Consulta #456 / BOOKED → NO_SHOW`
  — evidência de que o estado imediatamente anterior ao no-show é descrito,
  em linguagem de auditoria, como "reservado/agendado".
- Seção 30 (Timeline), exemplo literal: "27/08 — Atendimento concluído".
- Seção 15 (Reagendamento): direito a um único reagendamento por iniciativa
  do consulente (15.1), com prazo de escolha de 48h (15.4) e consumo apenas
  após confirmação efetiva do novo horário (15.5) — tratado como sub-fluxo
  próprio (`RescheduleRequest`), não como estado do Atendimento.

## Decisão

### `AppointmentStatus`

```text
NOT_STARTED
  ↓
SCHEDULED  ──────┬──────────────┬───────────────┐
                 ↓              ↓               ↓
             COMPLETED       NO_SHOW        CANCELLED
```

| Estado        | Significado                                                                                                                   | Transcrição/base textual |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `NOT_STARTED` | Estado inicial (pagamento ainda não aprovado) **e** estado final quando o pedido é cancelado antes de a consulta chegar a ser agendada — nesse segundo caso o valor simplesmente nunca avança. | Transcrição literal de "NÃO_INICIADO" (seção 10, cenário 3). |
| `SCHEDULED`   | Horário confirmado (slot em `BOOKED`); consulta aguardando a data marcada.                                                    | Transcrição de "AGENDADO" (seção 10, cenário 1); citado como "BOOKED" na trilha de auditoria da seção 29 — ver nota abaixo. |
| `COMPLETED`   | Consulta realizada.                                                                                                            | Transcrição literal de "CONCLUÍDO" (seção 10, cenário 2; seção 30). |
| `NO_SHOW`     | Cliente não compareceu/não respondeu dentro da tolerância de 15 minutos (seção 17.1–17.2); consequência financeira própria (retenção de 50%, seção 17.3); encerra a contratação (17.4). | Transcrição literal (seção 17; exemplo de auditoria da seção 29). |
| `CANCELLED`   | Consulta cancelada **depois de já agendada** — cancelamento tardio (seção 16), arrependimento pós-agendamento (seções 13.2, 19), reagendamento provocado pelo prestador quando o cliente opta por restituição em vez de novo horário (seção 15.7), ou decisão administrativa de exceção (seção 18). | Inferência técnica — ver nota abaixo. |

**Nota sobre `SCHEDULED` vs. "BOOKED":** a seção 29 usa "BOOKED" no exemplo de
auditoria para descrever o atendimento antes do no-show, mas `BOOKED` já é um
valor literal de `AppointmentSlotStatus` (seção 14.2), que descreve o
**slot**, não o **atendimento** — são eixos distintos por design (é
exatamente a duplicidade que o comentário "ADR pendente" do model
`Appointment` pede para evitar). Por isso este enum usa o identificador
técnico `SCHEDULED`, equivalente a "AGENDADO"/"BOOKED" em prosa, sem colidir
com `AppointmentSlotStatus.BOOKED`.

**Nota sobre `CANCELLED` (ponto sinalizado para confirmação):** a seção 10
usa `NÃO_INICIADO` apenas no cenário em que o cancelamento ocorre **antes**
do agendamento. Ela não apresenta um exemplo textual para o caso em que uma
consulta já `AGENDADA` é posteriormente cancelada (cancelamento tardio,
arrependimento pós-agendamento etc.). Duas leituras são possíveis:

1. Reaproveitar `NOT_STARTED` também para esse caso (menor vocabulário, mas
   mistura "nunca chegou a ser agendado" com "foi agendado e depois
   desfeito", o que dificulta a exibição correta em "Meus atendimentos",
   seção 22.2, e no painel administrativo, seção 23.5).
2. Introduzir `CANCELLED` como estado próprio (adotado nesta ADR), por
   consistência com os demais eixos do domínio (`OrderStatus.CANCELLED`,
   `PaymentStatus.CANCELLED`, `QuestionStatus.CANCELLED`) e por preservar a
   distinção auditável entre "não chegou a ser agendado" e "foi agendado e
   cancelado".

Esta ADR adota a leitura 2, mas — como não há transcrição literal da seção
10 para este valor específico — o item fica registrado aqui como decisão
técnica sujeita a confirmação do responsável funcional antes da
implementação da lógica do módulo `scheduling`/`cancellation`, conforme o
critério da seção 38 do documento-fonte.

**Fora do escopo desta ADR:** a fronteira exata entre `Appointment` e
`ServiceExecution` (sinalizada como "ADR pendente" no model
`ServiceExecution`, risco de duplicidade entre os dois registros) não é
resolvida aqui — seguirá aberta para uma ADR de reconciliação estrutural
antes da implementação do módulo `fulfillment`.

### Decisão vinculada: `RescheduleRequestStatus`

A máquina de `AppointmentStatus` só é implementável se o sub-fluxo de
reagendamento (seção 15.3–15.5) também tiver estados fechados — por isso
esta ADR também decide o enum de `RescheduleRequest.status`:

```text
PENDING
  ↓         ↓
CONFIRMED  EXPIRED
```

| Estado      | Significado                                                                          | Base textual |
| ----------- | --------------------------------------------------------------------------------------- | -------------- |
| `PENDING`   | Solicitação registrada, opções apresentadas, aguardando escolha do cliente.              | Seção 15.3–15.4. |
| `CONFIRMED` | Novo horário escolhido e confirmado — reagendamento considerado "consumido".              | Seção 15.5 ("somente será considerado utilizado após confirmação efetiva"). |
| `EXPIRED`   | Prazo de 48h decorrido sem escolha do cliente.                                           | Seção 15.4 ("a solicitação poderá expirar"). |

Ao confirmar (`CONFIRMED`), `Appointment.slotId` passa a apontar para o novo
`AppointmentSlot`, mas `AppointmentStatus` **permanece** `SCHEDULED` — o
reagendamento é um evento sobre o Atendimento, não uma transição de estado
dele, confirmando a leitura da nota "ADR pendente" original ("reagendamento…
tratados como eventos… não como valores fechados de um único campo
status").

## Consequências

- `apps/api/prisma/schema.prisma`: `Appointment.status` passa de `String`
  para `AppointmentStatus`, com `@default(NOT_STARTED)`; `RescheduleRequest.status`
  passa de `String` para `RescheduleRequestStatus`, com `@default(PENDING)`.
- `packages/shared/src/appointment-status.ts`: novos enums TypeScript
  (`AppointmentStatus`, `RescheduleRequestStatus`) espelhando o Prisma.
- Os módulos `scheduling` e `cancellation` podem ser implementados (em
  rodada futura) sobre um contrato de estados fechado.
- A distinção entre `NOT_STARTED` e `CANCELLED` (ver nota acima) deve ser
  validada com o responsável funcional antes da implementação da lógica de
  cancelamento; se rejeitada, a migração de reversão é simples (states
  fechados, sem dados em produção ainda).
- `CancellationRequest.executionStatusAtRequest` continua como `String`
  (não como `AppointmentStatus`/`QuestionStatus`), pois precisa acomodar o
  snapshot de qualquer uma das duas modalidades — reconciliar esse campo
  também fica para a ADR de fronteira `Appointment`/`ServiceExecution`
  mencionada acima.

## Alternativas consideradas

- **Modelar reagendamento como valor de `AppointmentStatus`** (ex.:
  `RESCHEDULING`): rejeitada — o comentário original de "ADR pendente" já
  orienta para tratar reagendamento como evento/sub-fluxo, e a seção 15.5
  confirma que o reagendamento só é "consumido" quando um novo horário é
  confirmado, sem necessidade de um estado intermediário fechado no
  Atendimento.
- **Incluir `IN_PROGRESS` para simetria com `QuestionStatus`:** rejeitada —
  ao contrário da Pergunta Avulsa (seção 11.5, ação administrativa explícita
  "Iniciar atendimento"), a especificação não descreve nenhuma ação
  equivalente para a Consulta online (seção 23.5 lista apenas agenda,
  reagendamento, cancelamento, no-show, conclusão, exceções — sem "iniciar
  atendimento"). Adicionar `IN_PROGRESS` seria inventar uma transição não
  descrita na especificação.
- **`RescheduleRequestStatus.CANCELLED`** (desistência do cliente antes do
  prazo expirar): não adotado — a especificação não descreve essa ação
  separadamente da expiração; se necessário, pode ser adicionada depois sem
  quebrar os estados já definidos.
