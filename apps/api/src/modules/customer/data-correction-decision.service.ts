import { Injectable } from '@nestjs/common';
import {
  DataCorrectionDecisionInput,
  validateDataCorrectionDecision,
} from './data-correction-decision';

/**
 * Ponto único de acesso à validação de decisões de correção cadastral
 * para o restante da aplicação. Ver
 * docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md.
 */
@Injectable()
export class DataCorrectionDecisionService {
  validateDecision(input: DataCorrectionDecisionInput): void {
    validateDataCorrectionDecision(input);
  }
}
