# ADR 0014: Retenção de gravação de consulta e legal hold (`RecordingRetention`)

**Status:** Aceita
**Data:** 2 de setembro de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seções 26.3, 26.4 e 35 (Segurança mínima esperada — retenção).

## Contexto

A seção 26 (Gravação de consultas) trata do consentimento separado para
gravação (26.1), da recusa (26.2), da retenção (26.3) e do legal hold
(26.4). O schema Prisma já modela `RecordingConsent` (consentimento,
vinculado 1:1 a `Appointment`) e `LegalHold` (mecanismo genérico
`subjectType`/`subjectId`/`active`, comentado como equivalente a
`legalHold = true`), mas nenhum código em `apps/api/src/` calcula o prazo
de retenção nem a suspensão por legal hold — os dois modelos existem,
porém sem lógica associada.

A seção 26.3 é uma transcrição literal e completa, sem ambiguidade:

> **até 90 dias após o atendimento**
>
> salvo existência de motivo concreto para retenção jurídica/probatória.

Sem qualificador "úteis" — ao contrário da seção 11.1 (SLA da Pergunta
Avulsa, ADR 0009), este prazo é em **dias corridos**, sem calendário
operacional envolvido.

A seção 26.4 completa a regra:

> Enquanto houver legal hold, a exclusão automática deve permanecer
> suspensa.

O `LegalHold.active: Boolean` já modela exatamente essa condição — nenhuma
migração de schema é necessária para esta ADR.

**Instante de referência ("o atendimento"):** a seção 26 aplica-se à
Consulta Online (`RecordingConsent.appointmentId`); "o atendimento" é,
portanto, a conclusão do `Appointment` vinculado (`AppointmentStatus.COMPLETED`,
ADR 0003). O model `Appointment` não possui hoje uma coluna de timestamp
dedicada para o instante dessa transição (apenas o valor de estado e,
para o caso específico de no-show, `noShowAt`) — replicando exatamente a
mesma situação já resolvida na ADR 0010 para `optionsPresentedAt`: em vez
de a função pura tentar derivar esse instante de um campo específico
(inexistente), ela aceita qualquer `Date` como parâmetro de entrada,
permanecendo agnóstica quanto à sua origem exata (`Appointment.updatedAt`
no momento da transição, evento de auditoria, ou um futuro campo
dedicado) — decisão de infraestrutura de persistência que cabe à camada
de aplicação, não a esta ADR (seção 38).

## Decisão

Implementar em `apps/api/src/modules/legal/recording-retention.ts`:

- `RECORDING_RETENTION_DAYS = 90` — constante de regra de negócio (seção
  26.3), em dias corridos.
- `calculateRecordingRetentionExpiresAt(appointmentCompletedAt)` — função
  pura que soma 90 dias corridos ao instante de conclusão do atendimento,
  retornando o prazo-limite de retenção padrão.
- `evaluateRecordingRetentionEligibility(appointmentCompletedAt, now, legalHoldActive)` —
  função pura que retorna `{ eligibleForDeletion: boolean; reasonCode }`,
  com `reasonCode` em:
  - `LEGAL_HOLD_ACTIVE` — quando `legalHoldActive` é `true` (seção 26.4);
    verificada **antes** e com precedência sobre o cálculo do prazo,
    porque a suspensão vale "independentemente" do tempo decorrido;
  - `RETENTION_PERIOD_NOT_ELAPSED` — quando `now` ainda está dentro dos 90
    dias corridos (seção 26.3);
  - `ELIGIBLE_FOR_DELETION` — quando o prazo já foi ultrapassado e não há
    legal hold ativo.

Exposto via `RecordingRetentionService` (NestJS) e
`RecordingRetentionController` (`POST /recording-consents/retention/expires-at`
e `POST /recording-consents/retention/eligibility`), seguindo o mesmo
padrão de ponto único de acesso e de controller HTTP fino das ADRs
0007–0011. `LegalModule` deixa de ser um stub vazio.

### Por que um resultado estruturado (`reasonCode`), não um booleano

Mesma razão já registrada na ADR 0010: um booleano simples esconderia o
motivo pelo qual uma gravação ainda não pode ser excluída (prazo não
decorrido vs. legal hold ativo), informação necessária para exibição no
painel administrativo (seção 23) e para justificar auditoria (seção 29).

### Por que a verificação do legal hold precede o cálculo do prazo

A seção 26.4 usa "enquanto houver legal hold" — uma condição de suspensão
absoluta, não uma extensão do prazo original. Calcular o prazo primeiro e
só depois checar o legal hold produziria o mesmo resultado funcional,
mas inverteria a ordem de leitura em relação ao texto normativo (a
suspensão é a regra primária; o prazo de 90 dias é a regra "padrão").

## Consequências

- Nenhuma migração de schema é necessária — `LegalHold.active` já cobre
  integralmente o insumo exigido pela seção 26.4.
- `packages/shared/src/*`: nenhum enum novo — esta ADR não introduz
  nenhum valor fechado além dos já existentes (`RecordingRetentionReasonCode`
  é um union type interno à API, não um enum Prisma).
- A quem cabe **chamar** `evaluateRecordingRetentionEligibility` (ex.: um
  job periódico de expurgo, ou verificação sob demanda) e como obter
  `appointmentCompletedAt` a partir da persistência real não é definido
  nesta ADR (fora de escopo: casos de uso/jobs, seção 38).

### Pontos em aberto

1. **Mecanismo técnico de exclusão** — a seção 26.3 define o prazo, mas
   não o mecanismo de exclusão em si (job agendado vs. verificação sob
   demanda) nem onde o arquivo de gravação é fisicamente armazenado
   (fora do escopo desta especificação funcional). Esta ADR calcula
   apenas *quando* a exclusão pode ocorrer, não *como*.
2. **Motivo concreto para retenção jurídica/probatória além do legal
   hold explícito** — a seção 26.3 cita "motivo concreto" como ressalva
   geral, e a seção 26.4 lista exemplos (reclamação, contestação,
   litígio, ameaça concreta de litígio, preservação de prova, exercício
   regular de direitos). Esta ADR assume que todo "motivo concreto" se
   materializa como um registro `LegalHold.active = true` — não há,
   sinalizado na especificação, uma via alternativa de retenção que não
   passe pelo mecanismo de legal hold.

## Alternativas consideradas

- **Adicionar `Appointment.completedAt: DateTime?`** para servir de
  origem única do instante de conclusão: rejeitada por ora — exigiria
  decidir, fora do escopo desta ADR, se essa coluna seria preenchida
  automaticamente na transição de `AppointmentStatus` (o que tocaria a
  ADR 0003, já aceita) ou por ação administrativa explícita (não descrita
  para a Consulta Online, ao contrário da Pergunta Avulsa — seção 11.5).
  Manter a função agnóstica quanto à origem do dado (mesmo padrão da ADR
  0010) evita essa decisão prematura.
- **Unificar com o Refund Policy Engine (ADR 0007) ou com a elegibilidade
  de reagendamento (ADR 0010)**: rejeitada — são decisões conceitualmente
  distintas (retenção de dado vs. reembolso vs. reagendamento), sem
  insumos ou saídas em comum.
- **Modelar `reasonCode` como exceção lançada**: rejeitada — assim como na
  ADR 0010, uma gravação ainda dentro do prazo de retenção (ou sob legal
  hold) é um resultado de negócio esperado e frequente, não uma condição
  excepcional/erro de uso.
