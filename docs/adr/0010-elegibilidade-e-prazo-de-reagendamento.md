# ADR 0010: Elegibilidade e prazo de reagendamento da Consulta Online (`RescheduleEligibility`)

**Status:** Aceita
**Data:** 22 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 15.1, 15.2, 15.4, 15.6, 15.7 e regras invariantes nº 9 e 10 (seção 32).

## Contexto

A máquina de estado da Solicitação de Reagendamento (`RescheduleRequestStatus`,
ADR 0003) já modela os estados `PENDING`/`CONFIRMED`/`EXPIRED` e cita as
regras da seção 15 qualitativamente, mas nenhuma ADR anterior implementou
os **cálculos/validações determinísticos** que a seção 15 exige antes e
depois de uma transição:

1. **Elegibilidade para solicitar** (antes de criar a solicitação):
   - Seção 15.1: "Cada contratação de consulta online permite um único
     reagendamento por iniciativa do consulente, sem cobrança adicional."
   - Seção 15.2: "O pedido deverá ocorrer com pelo menos: 24 horas de
     antecedência do horário agendado."
   - Seção 15.6: "Depois de consumido o único reagendamento, não existe
     direito contratual a nova alteração por iniciativa do consulente."
   - Regras invariantes nº 9 e 10 (seção 32): "Reagendamento do cliente só
     é consumido após novo horário confirmado" / "Reagendamento provocado
     pelo prestador não consome o direito do cliente."
2. **Prazo de expiração das opções apresentadas** (após a solicitação ser
   aberta e opções serem apresentadas):
   - Seção 15.4: "Após a apresentação de novas opções, o cliente terá: 48
     horas para escolher um novo horário. Sem manifestação no prazo, a
     solicitação poderá expirar."

O schema Prisma já possui os campos necessários para essas duas
validações, sem exigir nenhuma migração:

- `Appointment.rescheduleUsed: Boolean` — já comentado no schema como
  "um único reagendamento por iniciativa do consulente (seção 15.1)".
- `RescheduleRequest.optionsExpireAt: DateTime?` — já comentado no schema
  como "data/hora de expiração — seção 15.4 (48h)".
- `RescheduleRequest.requestedByCustomerId: String?` — já comentado como
  "nulo quando provocado pelo prestador (seção 15.7)", confirmando que a
  regra de elegibilidade abaixo só se aplica quando este campo não é nulo.

Importante: a seção 15.4 especifica **"48 horas"** (sem o qualificador
"úteis"), ao contrário da seção 11.1 (SLA da Pergunta Avulsa, ADR 0009,
que usa explicitamente "48 horas úteis"). Esta ADR trata, portanto, o
prazo de escolha como **horas corridas** — não há calendário operacional
envolvido aqui, diferente da ADR 0009.

A seção 15.7 (reagendamento provocado pelo prestador) não impõe
antecedência mínima nem restrição de "já consumido" — o cliente não
solicita nada nesse fluxo, é o prestador quem provoca a alteração. Por
isso a validação de elegibilidade desta ADR aplica-se **apenas** ao
reagendamento por iniciativa do consulente.

## Decisão

Implementar em `apps/api/src/modules/scheduling/reschedule-eligibility.ts`:

- `RESCHEDULE_MINIMUM_NOTICE_HOURS = 24` e
  `RESCHEDULE_OPTIONS_CHOICE_WINDOW_HOURS = 48` — constantes de regra de
  negócio (seções 15.2 e 15.4, respectivamente), ambas em horas corridas.
- `evaluateCustomerRescheduleEligibility(input)` — função pura que recebe
  `{ scheduledAt, requestedAt, rescheduleUsed }` e retorna
  `{ eligible: boolean; reasonCode }`, com `reasonCode` em:
  - `RESCHEDULE_ALREADY_USED` — quando `rescheduleUsed` é `true` (seções
    15.1/15.6, regra invariante nº 9);
  - `INSUFFICIENT_NOTICE` — quando a diferença entre `scheduledAt` e
    `requestedAt` é menor que 24 horas (seção 15.2);
  - `ELIGIBLE` — caso nenhuma das restrições acima se aplique.
  A ordem de checagem prioriza `RESCHEDULE_ALREADY_USED`: se o direito já
  foi consumido, a antecedência do novo pedido é irrelevante — não há o
  que solicitar. Esta função **não** deve ser usada para o reagendamento
  provocado pelo prestador (seção 15.7); o chamador é responsável por não
  invocá-la quando `requestedByCustomerId` for nulo.
- `calculateRescheduleOptionsExpireAt(optionsPresentedAt)` — função pura
  que soma 48 horas corridas ao instante de apresentação das opções
  (seção 15.4), retornando o valor a ser persistido em
  `RescheduleRequest.optionsExpireAt`.
- `isRescheduleChoiceExpired(optionsExpireAt, now)` — função de
  conveniência que compara `now` com o prazo calculado, para decidir
  quando disparar o evento `EXPIRE` da máquina `RescheduleRequestStatus`
  (ADR 0003).

Exposto via `RescheduleEligibilityService` (NestJS), seguindo o mesmo
padrão de ponto único de acesso das ADRs 0007–0009.

### Por que um resultado estruturado (`reasonCode`), não um booleano

Um booleano simples ("pode solicitar?") esconderia o motivo da rejeição,
forçando quem consome a função a redescobrir a causa por conta própria
(ex.: para exibir a mensagem correta ao consulente). O mesmo padrão já foi
adotado no `RefundPolicyDecision` (ADR 0007).

## Consequências

- Nenhuma migração de schema é necessária.
- A quem cabe **chamar** `evaluateCustomerRescheduleEligibility` antes de
  criar um `RescheduleRequest`, e `calculateRescheduleOptionsExpireAt` ao
  apresentar as opções, não é definido nesta ADR (fora de escopo:
  controllers/casos de uso, seção 38).
- Continua em aberto qual evento marca precisamente "apresentação de
  novas opções" (`optionsPresentedAt`) — a especificação não distingue
  explicitamente esse instante de `requestedAt` (seção 15.3 lista ambos
  como dados a registrar, sem detalhar se são simultâneos). Esta ADR
  aceita qualquer `Date` como parâmetro de entrada, deixando a decisão de
  qual instante usar para a camada de aplicação.

### Pontos em aberto

1. **Instante de "apresentação das opções"** — se é sempre igual a
   `requestedAt` (fluxo automático) ou pode ocorrer depois (ex.:
   apresentação manual pelo administrador) não é definido pela
   especificação; sinalizado acima.
2. **Ação ao expirar** — a seção 15.4 diz apenas que a solicitação
   "poderá expirar" e que "deverão ser aplicadas as regras contratuais
   pertinentes", sem detalhar essas regras além do que já consta nas
   seções 15.1–15.7 (ex.: se a expiração consome ou não o único
   reagendamento contratual). Não coberto por esta ADR.

## Alternativas consideradas

- **Unificar esta validação com o `RefundPolicyEngine` (ADR 0007)** —
  rejeitada: são decisões conceitualmente distintas (uma decide se uma
  solicitação de reagendamento pode ser aberta; a outra decide o
  reembolso de um cancelamento), com fontes funcionais e formatos de
  saída diferentes, e a ADR 0007 já é a maior das ADRs de motor de
  decisão — misturar aumentaria o acoplamento sem necessidade.
- **Modelar `reasonCode` como exceção lançada** (em vez de valor de
  retorno) — rejeitada para o caso de inelegibilidade: diferente de
  entradas contraditórias (que são erro de uso, ver ADR 0007), um cliente
  tentando reagendar fora do prazo é um resultado de negócio esperado e
  frequente, não uma condição excepcional.
