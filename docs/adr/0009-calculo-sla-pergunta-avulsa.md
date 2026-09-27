# ADR 0009: Cálculo do prazo de SLA da Pergunta Avulsa (`QuestionSla`)

**Status:** Aceita
**Data:** 22 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 11.1, 11.2, 37 e regra invariante nº 5 (seção 32).

## Contexto

A seção 11.1 define, de forma literal e não ambígua, o prazo máximo de
resposta da Pergunta Avulsa:

> "O prazo máximo de resposta é de: **48 horas úteis a partir da
> confirmação do pagamento**. A contagem não começa: na criação do
> carrinho; na criação do pedido; no início do checkout. A referência é:
> `payment.confirmedAt`."

A regra invariante nº 5 (seção 32) reforça: "Prioridade não altera o SLA
máximo de 48 horas úteis" — ou seja, o cálculo do prazo **não depende** de
`hasPriority` (a prioridade só afeta a ordem de atendimento, ADR 0008, não
a duração do SLA).

Diferente da duração da consulta, do preço, do calendário de horas úteis,
dos feriados e do horário de operação — todos explicitamente listados na
seção 37 como "parâmetros operacionais que deverão ser configuráveis" —
**as 48 horas do SLA da Pergunta Avulsa não constam nessa lista**: são um
valor fixo da regra de negócio (seção 11.1), não um parâmetro editável.

Por outro lado, a seção 11.2 exige explicitamente que a definição de "hora
útil" em si seja externa ao domínio:

> "O sistema deverá utilizar um calendário operacional configurável. A
> implementação não deverá hardcodar a definição de hora útil no
> domínio."

Ou seja: **o número 48 é fixo (regra de negócio); o que conta como "hora
útil" é injetado (parâmetro operacional, seção 37: "calendário de horas
úteis", "feriados", "horário de operação").**

## Decisão

Implementar em `apps/api/src/modules/question/question-sla.ts`:

- `QUESTION_SLA_HOURS = 48` — constante da regra de negócio (seção 11.1),
  não configurável (não consta na lista da seção 37).
- `BusinessHoursCalendar` — interface mínima (`isWithinBusinessHours(instant:
  Date): boolean`) que representa o "calendário operacional configurável"
  da seção 11.2. **Esta ADR não implementa um calendário concreto** (isso
  exigiria decidir dias de atendimento, horário de expediente e feriados
  reais — dados operacionais que a própria seção 37 diz que "deverão ser
  configuráveis" em uma etapa futura, fora do escopo funcional/regulatório
  deste documento). Implementar apenas a interface evita hardcodar a
  definição de hora útil no domínio, como a seção 11.2 exige.
- `calculateQuestionSlaDeadline(paymentConfirmedAt, calendar)` — função
  pura que avança a partir de `payment.confirmedAt`, consumindo somente
  os minutos em que `calendar.isWithinBusinessHours(...)` é verdadeiro,
  até completar 48 horas úteis (2.880 minutos), retornando o instante do
  prazo final.
- `isQuestionSlaExceeded(paymentConfirmedAt, now, calendar)` — função de
  conveniência que compara `now` com o prazo calculado.

Ambas ignoram `hasPriority` — não recebem esse parâmetro — em conformidade
direta com a regra invariante nº 5.

### Granularidade do avanço

O avanço é calculado em passos de 1 minuto (2.880 iterações no máximo, sem
impacto de desempenho relevante para uma função invocada por solicitação,
não em laço quente). Esta é uma **decisão técnica** desta ADR, não uma
citação literal — a especificação não define a granularidade do avanço,
apenas o resultado (48 horas úteis). Um calendário real (fora do escopo)
poderia, alternativamente, expor diretamente os intervalos de expediente
para um cálculo mais eficiente; a interface `BusinessHoursCalendar` pode
ser estendida futuramente sem alterar a assinatura pública destas duas
funções.

### `QuestionSlaService` não injeta um calendário concreto

Para manter o mesmo padrão de ponto único de acesso dos demais domínios
(`PaymentStatusService`, `RefundPolicyService`, `QuestionQueueOrderingService`),
esta ADR também expõe um `QuestionSlaService` fino. Diferença importante:
ele **não injeta um calendário concreto via construtor** — `calendar`
continua sendo parâmetro explícito de cada chamada, repassado tal como na
função pura. Como nenhum calendário operacional concreto está implementado
(depende de configuração ainda não definida — seção 37), não há o que
injetar. Um provedor NestJS que registre um calendário concreto (ex.:
token `BUSINESS_HOURS_CALENDAR`) fica para uma ADR futura, quando o
calendário operacional configurável for de fato implementado (painel
administrativo / catálogo, seções 23 e 31).

## Consequências

- Nenhuma migração de schema é necessária — `QuestionRequest` não
  armazena o prazo calculado (calculado sob demanda a partir de
  `payment.confirmedAt`, que corresponde ao instante em que
  `PaymentStatus` transiciona para `APPROVED`, ADR 0004).
- O ponto em que este prazo é efetivamente comparado (ex.: para alertas,
  fila administrativa, ou caracterização de descumprimento de SLA) não é
  definido nesta ADR — a especificação não descreve consequência
  automática para o estouro do prazo (diferente de no-show/cancelamento
  tardio, que têm regras financeiras explícitas). Sinalizado como ponto em
  aberto.
- Um calendário operacional concreto (dias úteis, feriados, horário de
  expediente) continua fora de escopo desta etapa, por decisão explícita
  da própria especificação (seção 37).

### Pontos em aberto

1. **Consequência do estouro do SLA** — a especificação não define uma
   ação automática (ex.: escalonamento, notificação, reembolso
   automático) quando as 48 horas úteis se esgotam sem entrega. Esta ADR
   apenas fornece o cálculo do prazo/verificação de estouro; a reação a
   esse evento é uma decisão de arquitetura futura.
2. **Calendário operacional concreto** — dias de atendimento, horário de
   expediente e feriados reais não são definidos aqui (seção 37); a
   interface `BusinessHoursCalendar` deve ser implementada quando esses
   parâmetros forem definidos operacionalmente.

## Alternativas consideradas

- **Hardcodar um calendário padrão (ex.: segunda a sexta, 9h-18h, sem
  feriados)** — rejeitada: contraria diretamente a seção 11.2 ("a
  implementação não deverá hardcodar a definição de hora útil no
  domínio").
- **Adiar toda e qualquer modelagem do SLA para quando o calendário
  concreto existir** — rejeitada: a constante de 48 horas e a mecânica de
  avanço (a única parte que já é regra de negócio fechada) podem e devem
  ser implementadas agora, isoladas por trás de uma interface, seguindo o
  mesmo princípio de centralização de regra de domínio já adotado nas
  ADRs 0007/0008.
- **Medir o SLA em dias corridos, não em minutos** — rejeitada: a
  interface `BusinessHoursCalendar` só pode responder "é hora útil?" para
  um instante específico; a granularidade de minuto é a mais simples que
  permite calendários com expediente parcial (ex.: horário de almoço,
  meio período em véspera de feriado) sem exigir uma API mais complexa da
  interface nesta etapa.
