import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceOfferingType } from '@marmoteiro/shared';

/** Corpo de requisição para avaliar o Refund Policy Engine (ADR 0011 / ADR 0007). */
export class EvaluateRefundPolicyRequestDto {
  @IsEnum(ServiceOfferingType)
  modality!: ServiceOfferingType;

  @IsDate()
  @Type(() => Date)
  contractedAt!: Date;

  @IsDate()
  @Type(() => Date)
  cancellationRequestedAt!: Date;

  @IsBoolean()
  isServiceAlreadyRendered!: boolean;

  @IsNumber()
  totalPaidAmount!: number;

  @IsOptional()
  @IsIn(['APPLICABLE', 'NOT_APPLICABLE', 'UNDETERMINED'])
  withdrawal?: 'APPLICABLE' | 'NOT_APPLICABLE' | 'UNDETERMINED';

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledAt?: Date;

  @IsOptional()
  @IsBoolean()
  isNoShow?: boolean;

  @IsOptional()
  @IsBoolean()
  providerCausedRescheduleRefundChosen?: boolean;

  @IsOptional()
  @IsBoolean()
  exceptionalCircumstanceReported?: boolean;
}
