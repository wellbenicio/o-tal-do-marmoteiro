import { Body, Controller, Post } from '@nestjs/common';
import { DataCorrectionDecisionService } from './data-correction-decision.service';
import { ValidateDataCorrectionDecisionRequestDto } from './data-correction-decision.dto';

/**
 * Exposição HTTP fina da validação de decisões de correção cadastral —
 * apenas orquestra `DataCorrectionDecisionService`, sem regra de negócio
 * própria. Ver ADR 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md)
 * e docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md.
 *
 * Lança `MissingDataCorrectionJustificationError` (HTTP 422) quando a
 * decisão informada exige justificativa e nenhuma foi fornecida — o
 * `DomainErrorFilter` global traduz esse erro para o formato de erro
 * padrão da API.
 */
@Controller('data-correction-requests/decision')
export class DataCorrectionDecisionController {
  constructor(
    private readonly dataCorrectionDecisionService: DataCorrectionDecisionService,
  ) {}

  @Post('validate')
  validate(@Body() body: ValidateDataCorrectionDecisionRequestDto): {
    valid: true;
  } {
    this.dataCorrectionDecisionService.validateDecision(body);
    return { valid: true };
  }
}
