import { HttpStatus } from '@nestjs/common';
import { DataCorrectionRequestStatus } from '@marmoteiro/shared';
import { DomainError } from '../../common/errors/domain-error';

/**
 * Validação da decisão administrativa sobre uma solicitação de correção
 * cadastral — ver ADR 0015
 * (docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md). Função
 * pura, não uma máquina de estado: a decisão em si (aprovar, ajustar ou
 * recusar) é sempre um julgamento humano do administrador (seção 6.4);
 * esta função apenas valida se a decisão já tomada respeita a regra
 * textual de que decisões de ajuste ou recusa exigem justificativa.
 */

export interface DataCorrectionDecisionInput {
  /** Novo status decidido pelo administrador. */
  status: DataCorrectionRequestStatus;
  /** Justificativa registrada para a decisão (seção 6.4 "justificativa da decisão"). */
  decisionJustification?: string | null;
}

/**
 * Erro lançado quando uma decisão de ajuste ou recusa é registrada sem
 * justificativa (seção 6.4: "justificativa da decisão quando houver
 * recusa ou ajuste"). Estende `DomainError` com HTTP 422 (Unprocessable
 * Entity) — ver ADR 0011: a entrada é sintaticamente válida, mas
 * semanticamente inconsistente com as regras de domínio.
 */
export class MissingDataCorrectionJustificationError extends DomainError {
  constructor(status: DataCorrectionRequestStatus) {
    super(
      `Decisão "${status}" exige justificativa (seção 6.4 — ver docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md).`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = 'MissingDataCorrectionJustificationError';
  }
}

/**
 * Valida a decisão administrativa sobre uma solicitação de correção
 * cadastral, lançando `MissingDataCorrectionJustificationError` quando o
 * status é `ADJUSTED` ou `REJECTED` e nenhuma justificativa não vazia foi
 * informada. Não valida nem decide o valor de `status` em si — essa
 * escolha é sempre do administrador (seção 6.4), não uma regra
 * automatizável.
 */
export function validateDataCorrectionDecision(
  input: DataCorrectionDecisionInput,
): void {
  const requiresJustification =
    input.status === DataCorrectionRequestStatus.ADJUSTED ||
    input.status === DataCorrectionRequestStatus.REJECTED;

  if (requiresJustification && !input.decisionJustification?.trim()) {
    throw new MissingDataCorrectionJustificationError(input.status);
  }
}
