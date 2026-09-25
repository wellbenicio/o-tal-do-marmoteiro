# ADR 0008: Ordenação da fila de Perguntas Avulsas (`QuestionQueueOrdering`)

**Status:** Aceita
**Data:** 22 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seção 12 (Prioridade de fila), regras invariantes nº 2-6 (seção 32).

## Contexto

A seção 12.3 já define, literalmente, a regra de ordenação da fila:

> "Regra determinística recomendada:
> 1. atendimentos prioritários aguardando execução;
> 2. atendimentos regulares aguardando execução;
> 3. dentro da mesma classe, ordem por confirmação de pagamento.
>
> A arquitetura técnica poderá otimizar essa lógica sem alterar seu
> resultado funcional."

Ou seja: a regra **em si** já está fechada (não é uma decisão desta ADR);
esta ADR apenas formaliza sua implementação como função pura, análoga em
espírito ao Refund Policy Engine (ADR 0007) — um cálculo determinístico,
não uma máquina de estado.

Restrições adicionais que a ordenação deve respeitar (seção 12.2, regras
invariantes nº 2-5):

- "não interrompe atendimento já iniciado" — a prioridade nunca reordena
  algo que já está `IN_PROGRESS`; a ordenação só se aplica a itens
  **aguardando execução**, ou seja, em `QUEUED` (regra invariante nº 2:
  "Nenhuma pergunta é considerada iniciada apenas por estar na fila";
  regra nº 4: "Prioridade não interrompe serviço já iniciado").
- "não aumenta o SLA máximo" / "permanece sujeita ao prazo máximo de 48
  horas úteis" (regra invariante nº 5) — este ponto não afeta a *ordem* da
  fila; é uma restrição sobre o SLA de entrega, tratada separadamente (fora
  do escopo desta função, que só decide ordem de atendimento).
- "Pergunta somente inicia por ação administrativa explícita" (regra
  invariante nº 3) — reforça que esta função apenas **sugere a ordem**;
  quem efetivamente dispara `START_EXECUTION` (ADR 0006) é uma ação
  administrativa, não esta função.

"Confirmação de pagamento" (critério de desempate dentro da mesma classe)
é representada por `QuestionRequest.queuedAt`, já existente no schema
Prisma: a transição `PAID --ENTER_QUEUE--> QUEUED` é automática (seção
11.4, sem intervenção manual entre a confirmação do pagamento e a entrada
na fila — ver `question-status.machine.ts`), portanto `queuedAt` é
equivalente, para fins de ordenação, ao instante de confirmação do
pagamento.

## Decisão

Implementar `orderQuestionQueue` como função pura em
`apps/api/src/modules/question/question-queue-ordering.ts`, mais um
serviço NestJS (`QuestionQueueOrderingService`) como ponto único de acesso.

Entrada: lista de `QuestionQueueItem` (`id`, `status: QuestionStatus`,
`hasPriority: boolean`, `queuedAt: Date`) — espelhando os campos
homônimos de `QuestionRequest` no schema Prisma, para que o chamador possa
mapear diretamente sem transformação adicional.

Saída: subconjunto contendo somente os itens com `status === QUEUED`
(demais estados não são "aguardando execução" e, portanto, não fazem
parte desta ordenação — regra invariante nº 2/4), ordenado por:

1. `hasPriority` descendente (prioritários primeiro);
2. dentro da mesma classe, `queuedAt` ascendente (ordem de chegada/FIFO).

A função não muta a lista de entrada (retorna uma nova lista ordenada) e
não persiste nada — apenas calcula a ordem recomendada para a próxima ação
administrativa de "iniciar atendimento" (ADR 0006, evento
`START_EXECUTION`).

## Consequências

- Nenhuma migração de schema é necessária: `hasPriority` e `queuedAt` já
  existem em `QuestionRequest`.
- Esta função não decide **quando** iniciar um atendimento (isso continua
  sendo uma ação administrativa explícita — regra invariante nº 3); ela
  apenas define a ordem recomendada para essa ação.
- O controle do SLA de 48 horas úteis (seção 11.2, regra invariante nº 5)
  permanece fora do escopo desta função; é uma verificação independente,
  não uma prioridade de fila.

## Alternativas consideradas

- **Ordenar diretamente via `ORDER BY` no banco de dados (ex.:
  `hasPriority DESC, queuedAt ASC`)** — tecnicamente equivalente e
  explicitamente permitido pela seção 12.3 ("a arquitetura técnica poderá
  otimizar essa lógica sem alterar seu resultado funcional"). Optou-se por
  expor também uma função pura testável em TypeScript para manter a regra
  de negócio centralizada e verificável independentemente do mecanismo de
  persistência escolhido, no mesmo espírito do Refund Policy Engine (ADR
  0007) e da regra invariante nº 17.
- **Incluir itens `IN_PROGRESS` no resultado (ex.: no topo)** — rejeitada:
  a seção 12.3 qualifica ambas as classes como "aguardando execução",
  excluindo por definição o que já está em execução (regra invariante nº
  4).
