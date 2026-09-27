# ADR 0015: Status de solicitação de correção cadastral (`DataCorrectionRequestStatus`)

**Status:** Aceita
**Data:** 2 de setembro de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seção 6.4.

## Contexto

A seção 6.4 (Dados bloqueados para edição direta) exige a ação
**Solicitar correção cadastral** para campos que o consulente não pode
alterar diretamente (nome civil, nome social, data de nascimento, nome da
mãe, identidade de gênero). A solicitação deve registrar, entre outros
campos já transcritos literalmente no model `DataCorrectionRequest`:

> - status;
> - administrador responsável;
> - data/hora da decisão;
> - **justificativa da decisão quando houver recusa ou ajuste.**

Esse último item é a evidência textual central desta ADR: a especificação
distingue explicitamente dois desfechos de decisão diferentes de uma
simples aprovação — **recusa** e **ajuste** — cada um exigindo
justificativa. Um ajuste (`ADJUSTED`) é conceitualmente distinto de uma
aprovação integral (`APPROVED`): a aprovação concede o valor exatamente
como solicitado pelo consulente, enquanto o ajuste implica que o
administrador decidiu aplicar um valor diferente do `requestedValue`
original — daí a exigência de justificativa também nesse caso, e não
apenas na recusa.

Isso é exatamente o ponto sinalizado como "ADR pendente" em
`apps/api/prisma/schema.prisma` (model `DataCorrectionRequest`, campo
`status: String`).

Precedente direto: a ADR 0012 (`AdminRole`) já resolveu um campo
placeholder `String` idêntico em espírito (`AdminUser.role`), adotando o
mesmo padrão de migração (`DROP COLUMN` + `ADD COLUMN ... DEFAULT`).

**Por que não uma máquina de estado XState (ao contrário de
Pedido/Pagamento/Atendimento/Slot/Pergunta/Reagendamento):**
`DataCorrectionRequest` não é um fluxo de múltiplas transições
observáveis ao longo do tempo — é um único ponto de decisão (`PENDING`
até o administrador decidir; então um dos três desfechos terminais). Esse
formato é estruturalmente idêntico ao já resolvido para
`CancellationRequest`/`RefundDecision` (ADR 0007): uma decisão pontual do
administrador, não uma máquina de estado com eventos encadeados. Por
isso esta ADR segue o padrão de função pura de validação de decisão (ADR
0007), não o padrão de máquina de estado (ADRs 0002–0003, 0006).

## Decisão

Adotar um enum `DataCorrectionRequestStatus` com quatro valores:

```text
PENDING
  ↓         ↓           ↓
APPROVED  ADJUSTED   REJECTED
```

| Estado     | Significado                                                                 | Transcrição/base textual |
| ---------- | ---------------------------------------------------------------------------- | --------------------------- |
| `PENDING`  | Solicitação registrada, aguardando decisão do administrador.                  | Inferência técnica — estado inicial, vocabulário alinhado a `RescheduleRequestStatus.PENDING` (ADR 0018). |
| `APPROVED` | Administrador aprovou a correção exatamente com o `requestedValue` informado. | Inferência técnica — desfecho "positivo" implícito por exclusão (a especificação só nomeia justificativa para recusa/ajuste, o que implica um desfecho positivo sem justificativa obrigatória). |
| `ADJUSTED` | Administrador aplicou um valor diferente do `requestedValue` original.        | Transcrição literal de "ajuste" (seção 6.4). |
| `REJECTED` | Administrador recusou a correção.                                             | Transcrição literal de "recusa" (seção 6.4). |

`APPROVED`, `ADJUSTED` e `REJECTED` são estados terminais.

Implementar em `apps/api/src/modules/customer/data-correction-decision.ts`:

- `validateDataCorrectionDecision({ status, decisionJustification })` —
  função pura que lança `MissingDataCorrectionJustificationError` quando
  `status` é `ADJUSTED` ou `REJECTED` e `decisionJustification` está
  ausente ou em branco. **Não decide** o valor de `status` — essa escolha
  é sempre um julgamento humano do administrador sobre o mérito da
  solicitação (nome civil, data de nascimento etc.), não uma regra
  automatizável; a função apenas garante que a decisão já tomada respeita
  a exigência textual de justificativa.

Exposto via `DataCorrectionDecisionService` e
`DataCorrectionDecisionController`
(`POST /data-correction-requests/decision/validate`), seguindo o mesmo
padrão de ponto único de acesso e de controller HTTP fino das ADRs
0007–0011. `CustomerModule` deixa de ser um stub vazio.

### Por que a validação lança exceção, não retorna um resultado estruturado

Ao contrário da elegibilidade de reagendamento (ADR 0010) ou do Refund
Policy Engine (ADR 0007) — que **decidem** um desfecho de negócio a
partir de fatos objetivos —, esta função **valida a integridade de uma
decisão humana já tomada**. Uma justificativa ausente é uma entrada
malformada em relação à regra da seção 6.4 (equivalente, em espírito, às
combinações inconsistentes que `InvalidRefundPolicyInputError` já cobre
na ADR 0007), não um resultado de negócio esperado — por isso segue o
mesmo padrão de erro de domínio (`DomainError`, HTTP 422) da ADR 0007, em
vez do padrão de `reasonCode` da ADR 0010.

### Por que não adicionar um campo para o valor efetivamente aplicado no ajuste

Esta ADR resolve apenas o enum de status. Nenhum campo novo foi
adicionado para registrar qual valor foi de fato aplicado quando
`ADJUSTED` (distinto de `requestedValue`) — o model `DataCorrectionRequest`
é a trilha de decisão/auditoria da solicitação (seção 6.4: "toda alteração
aprovada deverá ser auditável"), não a fonte da verdade do dado corrigido
em si, que reside em `Customer`/`Identity`. Adicionar esse campo exigiria
definir também como e quando o valor ajustado é de fato gravado no
cadastro do consulente — uma decisão de caso de uso completo, fora do
escopo desta ADR (seção 38).

## Consequências

- `apps/api/prisma/schema.prisma`: campo `DataCorrectionRequest.status`
  passa de `String` para o enum `DataCorrectionRequestStatus`, com
  `@default(PENDING)`.
- Nova migração
  `20260902210000_add_data_correction_request_status_enum` — mesmo
  padrão de `DROP COLUMN`/`ADD COLUMN ... DEFAULT` já usado na migração
  da ADR 0012 (`AdminRole`).
- `packages/shared/src/data-correction-request-status.ts`: novo enum
  TypeScript espelhando o enum do Prisma.
- O módulo `customer` pode agora ser implementado (em rodada futura)
  sobre um contrato de estados fechado para a decisão de correção
  cadastral, sem inventar valores ad hoc.
- Esta decisão não define quem/quando chama `validateDataCorrectionDecision`
  (controller/caso de uso que persiste a decisão) — fora de escopo (seção
  38).

### Pontos em aberto

1. **Campo obrigatório vs. opcional na aprovação integral** — esta ADR
   assume, por exclusão textual, que `APPROVED` não exige justificativa.
   A especificação não afirma isso explicitamente (apenas afirma o
   inverso, que recusa/ajuste exigem); se o responsável funcional
   entender que toda decisão deve ser justificada, a mudança é aditiva
   (remover a condição `requiresJustification` e sempre exigir).
2. **Valor efetivamente aplicado no ajuste** — ver nota acima; permanece
   em aberto para uma ADR/caso de uso futuro que decida como registrar e
   aplicar o valor ajustado ao cadastro do consulente.

## Alternativas consideradas

- **Modelar como máquina de estado XState** (mesmo padrão de
  Pedido/Pagamento/Atendimento): rejeitada — não há transições
  intermediárias nem eventos encadeados a modelar; é uma decisão pontual
  binária de "decidido ou não", estruturalmente idêntica ao caso já
  resolvido por função pura em `CancellationRequest`/`RefundDecision`
  (ADR 0007).
- **Dois estados apenas (`APPROVED`/`REJECTED`), tratando ajuste como uma
  aprovação com valor diferente**: rejeitada — colapsaria a distinção que
  a própria especificação faz ao citar "ajuste" separadamente de
  "recusa", perdendo a possibilidade de relatórios/painel administrativo
  (seção 23) distinguirem quantas correções foram aceitas integralmente
  das que foram aceitas com ressalvas.
- **Exigir justificativa também em `APPROVED`**: considerada, mas não
  adotada — a especificação cita justificativa apenas para "recusa ou
  ajuste"; exigi-la sempre seria adicionar uma restrição não presente no
  texto. Sinalizado como ponto em aberto acima.
