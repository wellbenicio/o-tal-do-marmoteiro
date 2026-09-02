import { IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

/** Corpo de requisição para calcular o prazo-limite de retenção da gravação (ADR 0011 / ADR 0014). */
export class CalculateRecordingRetentionExpiresAtRequestDto {
  @IsDate()
  @Type(() => Date)
  appointmentCompletedAt!: Date;
}

/** Corpo de requisição para avaliar a elegibilidade de exclusão da gravação (ADR 0011 / ADR 0014). */
export class EvaluateRecordingRetentionEligibilityRequestDto {
  @IsDate()
  @Type(() => Date)
  appointmentCompletedAt!: Date;

  @IsDate()
  @Type(() => Date)
  now!: Date;

  @IsBoolean()
  legalHoldActive!: boolean;
}
