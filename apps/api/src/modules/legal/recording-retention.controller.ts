import { Body, Controller, Post } from '@nestjs/common';
import type { RecordingRetentionEligibility } from './recording-retention';
import { RecordingRetentionService } from './recording-retention.service';
import {
  CalculateRecordingRetentionExpiresAtRequestDto,
  EvaluateRecordingRetentionEligibilityRequestDto,
} from './recording-retention.dto';

/**
 * Exposição HTTP fina da retenção de gravação de consulta — apenas
 * orquestra `RecordingRetentionService`, sem regra de negócio própria. Ver
 * ADR 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0014-retencao-de-gravacao-e-legal-hold.md.
 *
 * Não define como/quando `appointmentCompletedAt` é obtido — permanece de
 * responsabilidade do futuro caso de uso que consultar esta rota (ver
 * "Pontos em aberto" da ADR 0014).
 */
@Controller('recording-consents/retention')
export class RecordingRetentionController {
  constructor(
    private readonly recordingRetentionService: RecordingRetentionService,
  ) {}

  @Post('expires-at')
  calculateExpiresAt(
    @Body() body: CalculateRecordingRetentionExpiresAtRequestDto,
  ): { expiresAt: Date } {
    return {
      expiresAt: this.recordingRetentionService.calculateExpiresAt(
        body.appointmentCompletedAt,
      ),
    };
  }

  @Post('eligibility')
  evaluateEligibility(
    @Body() body: EvaluateRecordingRetentionEligibilityRequestDto,
  ): RecordingRetentionEligibility {
    return this.recordingRetentionService.evaluateEligibility(
      body.appointmentCompletedAt,
      body.now,
      body.legalHoldActive,
    );
  }
}
