# ADR 0016: Reconciliação `ServiceExecution` vs. `QuestionRequest`/`Appointment`

**Status:** Aceita
**Data:** 2 de setembro de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 11.5–11.7 (execução da pergunta avulsa), 10.3 (estados de Atendimento), 33 e 34 (domínios conceituais e arquitetura funcional recomendada).

## Contexto

O model `ServiceExecution` (`apps/api/prisma/schema.prisma`) foi criado como
uma "visão unificada entre modalidades" da execução do serviço, com o
comentário original "ADR pendente: fronteira exata entre este registro e os
campos específicos já presentes em QuestionRequest/Appointment precisa ser
reconciliada na etapa de arquitetura (risco de duplicidade)". As ADRs 0002,
0003 e 0005 já sinalizaram explicitamente este ponto como fora de escopo:

> "Fora do escopo desta ADR: a fronteira exata entre `Appointment` e
> `ServiceExecution` (sinalizada como "ADR pendente" no model
> `ServiceExecution`, risco de duplicidade entre os dois registros) não é
> resolvida aqui — seguirá aberta para uma ADR de reconciliação estrutural
> antes da implementação do módulo `fulfillment`." (ADR 0003)

Nenhum código em `apps/api/src/` referencia `ServiceExecution` hoje — o
model existe apenas no schema, sem uso.

### A seção 33 lista `ServiceExecution`, mas delega a decisão técnica final

A seção 33 ("Domínios conceituais esperados") lista `ServiceExecution` como
entidade do domínio `Fulfillment`. Isso poderia sugerir que o model deve
ser mantido literalmente. Porém, a própria seção 33/34 já qualifica essa
lista:

> "A modelagem técnica poderá utilizar nomes diferentes." (seção 33)
>
> "A decisão técnica final caberá à etapa de arquitetura." (seção 34)

Ou seja, a especificação delega explicitamente à etapa de arquitetura (esta
ADR) a decisão sobre nomes e estrutura técnica, desde que os **limites de
domínio conceituais** — aqui, "o Fulfillment cobre o rastreamento da
execução do serviço contratado" — continuem representados. Manter ou não
uma tabela chamada literalmente `ServiceExecution` é, portanto, decisão
técnica em aberto, não uma obrigação textual.

### Comparação campo a campo por modalidade

**Pergunta avulsa** (`QuestionRequest`, seções 11.5–11.7): já possui, de
forma literal e mais granular que `ServiceExecution`:

| Evento (seção) | Campo em `QuestionRequest` | Campo equivalente em `ServiceExecution` |
| --- | --- | --- |
| Início da execução (11.5) | `executionStartedAt`, `executionStartedByAdminId` | `startedAt` (sem admin) |
| Entrega (11.6) | `deliveredAt`, `deliveryChannel`, `deliveredByAdminId` | *(inexistente)* |
| Conclusão (11.7) | `completedAt` | `completedAt` |

`ServiceExecution` é, para a Pergunta avulsa, simultaneamente **redundante**
(duplica início/conclusão) e **incompleto** (não cobre o evento de entrega,
que a seção 11.6 transcreve literalmente com canal e responsável). Manter
as duas estruturas obrigaria sincronizar dois registros para o mesmo fato,
sem ganho — o risco de duplicidade que o comentário original já
antecipava.

**Consulta online** (`Appointment`): não possui campos de execução além de
`status` (`AppointmentStatus`) e `noShowAt`. A ADR 0003 já analisou esta
lacuna e concluiu, ao rejeitar um estado `IN_PROGRESS`:

> "ao contrário da Pergunta Avulsa (seção 11.5, ação administrativa
> explícita "Iniciar atendimento"), a especificação não descreve nenhuma
> ação equivalente para a Consulta online (seção 23.5 lista apenas agenda,
> reagendamento, cancelamento, no-show, conclusão, exceções — sem "iniciar
> atendimento"). Adicionar `IN_PROGRESS` seria inventar uma transição não
> descrita na especificação." (ADR 0003, Alternativas consideradas)

O mesmo raciocínio se aplica a `ServiceExecution.startedAt`/
`performedByAdminId` para a modalidade Consulta online: não há base textual
para um instante de "início" administrativo distinto do próprio horário
agendado (`AppointmentSlot.startsAt`), e a "conclusão" já é integralmente
representada por `AppointmentStatus.COMPLETED` (seção 10.3, exemplo
`ATENDIMENTO: CONCLUÍDO`). Adicionar um segundo registro de conclusão
(`ServiceExecution.completedAt`) para a mesma modalidade duplicaria um fato
já fechado pela máquina de estado da ADR 0003, sem nenhuma informação nova.

## Decisão

**Remover o model `ServiceExecution` do schema.** O domínio `Fulfillment`
continua existindo como módulo de orquestração (`FulfillmentModule`), mas
sem tabela própria — ele opera sobre os campos já existentes em
`QuestionRequest` (pergunta avulsa) e sobre `AppointmentStatus`/
`AppointmentSlot` (consulta online), conforme a comparação acima.

Isso resolve, junto, os dois pontos que dependiam desta reconciliação:

1. **`CancellationRequest.executionStatusAtRequest`** (sinalizado nas ADRs
   0002/0003): permanece como `String`, mas não por indefinição — é uma
   restrição técnica permanente, já que o Prisma não oferece um tipo de
   coluna soma (union) que acomode `QuestionStatus | AppointmentStatus` a
   depender de `CancellationRequest.modality`. O comentário do schema foi
   atualizado para deixar essa razão explícita.
2. **Comentário "ADR pendente"** no schema: substituído por um comentário
   explicando a ausência de model próprio do domínio `Fulfillment` e
   apontando para esta ADR.

### O que esta ADR **não** resolve (permanece em aberto)

- **Liberação de `AppointmentSlot` de `BOOKED` para `AVAILABLE`** quando a
  consulta associada é cancelada, sofre no-show ou é substituída por
  reagendamento — a ADR 0005 já sinalizou este ponto como análogo, mas
  distinto:

  > "Este ponto é análogo ao já sinalizado na ADR 0003 sobre a fronteira
  > `Appointment`/`ServiceExecution`, e deverá ser resolvido antes da
  > implementação completa dos módulos `scheduling` (ação de
  > reagendamento) e `cancellation`." (ADR 0005)

  Diferente da questão resolvida aqui (existência de uma *tabela*), a
  liberação de slot é lógica de **caso de uso** (o que a ação de cancelar/
  reagendar deve fazer), a ser implementada quando esses casos de uso forem
  modelados — não uma decisão de modelagem estrutural do schema.
- **Autorização por endpoint** para os futuros endpoints de fulfillment
  (ex.: "iniciar atendimento", "confirmar entrega" da Pergunta avulsa)
  continua dependendo de modelagem de caso de uso completa, como já
  registrado na ADR 0012.

As ADRs 0002, 0003 e 0005 não foram editadas — permanecem como registro
histórico das decisões tomadas em cada momento; esta ADR é o documento que
resolve o ponto que elas deixaram em aberto.

## Consequências

- `apps/api/prisma/schema.prisma`: model `ServiceExecution` removido, junto
  com os campos de relação `Order.serviceExecution` e
  `AdminUser.serviceExecutionsPerformed`. Comentário de
  `CancellationRequest.executionStatusAtRequest` atualizado para citar a
  restrição técnica (tipo soma) em vez de "reconciliação pendente".
  Comentário do cabeçalho do domínio `fulfillment` atualizado para explicar
  a ausência de model.
- Migração `20260902220000_remove_service_execution`: `DROP TABLE
  "ServiceExecution"` (com as duas `FOREIGN KEY` associadas). Sem model
  correspondente e sem nenhuma referência em `apps/api/src/`, a remoção não
  afeta nenhum código existente.
- `apps/api/src/modules/fulfillment/fulfillment.module.ts`: comentário de
  cabeçalho corrigido — a citação anterior à "seção 14" estava incorreta
  (seção 14 trata de escolha/reserva de agenda, não de execução); substituída
  pela seção 10.3, que descreve os estados de Atendimento comuns às duas
  modalidades.
- Implementações futuras de fulfillment (ex.: endpoint para registrar
  início/entrega da pergunta avulsa) devem gravar diretamente em
  `QuestionRequest`, não recriar uma tabela paralela.

## Alternativas consideradas

- **Manter `ServiceExecution` e usá-la como fonte única de verdade,
  migrando os campos de `QuestionRequest` para ela:** rejeitada — exigiria
  adicionar campos de entrega (`deliveredAt`/`deliveryChannel`/
  `deliveredByAdminId`) que a seção 11.6 já associa a `QuestionRequest`, sem
  nenhum ganho sobre manter os campos onde já estão; também não resolve a
  ausência de base textual para o "início" da Consulta online.
- **Manter `ServiceExecution` apenas para a Consulta online** (já que
  `Appointment` não tem campos de execução) **e usar `QuestionRequest` para
  a Pergunta avulsa:** rejeitada — introduziria uma assimetria de modelagem
  sem necessidade, e ainda careceria de base textual para
  `startedAt`/`performedByAdminId` na Consulta online (mesma razão pela
  qual a ADR 0003 rejeitou `IN_PROGRESS`).
- **Adicionar `startedAt`/`performedByAdminId` a `Appointment` diretamente**
  (em vez de via `ServiceExecution`), por simetria com `QuestionRequest`:
  rejeitada pelo mesmo motivo que a ADR 0003 rejeitou `IN_PROGRESS` — não
  há ação equivalente descrita na especificação para a Consulta online.
- **Resolver também a liberação de `AppointmentSlot` nesta ADR:** rejeitada
  — é lógica de caso de uso (ação de cancelamento/reagendamento), fora do
  escopo estrutural desta reconciliação; permanece sinalizada na ADR 0005
  até que esses casos de uso sejam modelados.
