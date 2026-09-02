import { Injectable } from '@nestjs/common';
import {
  RecordingRetentionEligibility,
  calculateRecordingRetentionExpiresAt,
  evaluateRecordingRetentionEligibility,
} from './recording-retention';

/**
 * Ponto único de acesso ao cálculo de retenção de gravação de consulta
 * para o restante da aplicação. Ver
 * docs/adr/0014-retencao-de-gravacao-e-legal-hold.md.
 */
@Injectable()
export class RecordingRetentionService {
  calculateExpiresAt(appointmentCompletedAt: Date): Date {
    return calculateRecordingRetentionExpiresAt(appointmentCompletedAt);
  }

  evaluateEligibility(
    appointmentCompletedAt: Date,
    now: Date,
    legalHoldActive: boolean,
  ): RecordingRetentionEligibility {
    return evaluateRecordingRetentionEligibility(
      appointmentCompletedAt,
      now,
      legalHoldActive,
    );
  }
}
