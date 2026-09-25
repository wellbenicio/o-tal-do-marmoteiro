import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DataCorrectionRequestStatus } from '@marmoteiro/shared';

/** Corpo de requisição para validar uma decisão de correção cadastral (ADR 0011 / ADR 0015). */
export class ValidateDataCorrectionDecisionRequestDto {
  @IsEnum(DataCorrectionRequestStatus)
  status!: DataCorrectionRequestStatus;

  @IsOptional()
  @IsString()
  decisionJustification?: string;
}
