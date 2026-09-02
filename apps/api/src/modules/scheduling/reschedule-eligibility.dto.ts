import { IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

/** Corpo de requisição para avaliar a elegibilidade de reagendamento do consulente (ADR 0011 / ADR 0010). */
export class EvaluateRescheduleEligibilityRequestDto {
  @IsDate()
  @Type(() => Date)
  scheduledAt!: Date;

  @IsDate()
  @Type(() => Date)
  requestedAt!: Date;

  @IsBoolean()
  rescheduleUsed!: boolean;
}

/** Corpo de requisição para calcular o prazo-limite de escolha das opções de reagendamento (ADR 0011 / ADR 0010). */
export class CalculateRescheduleOptionsExpireAtRequestDto {
  @IsDate()
  @Type(() => Date)
  optionsPresentedAt!: Date;
}

/** Corpo de requisição para verificar se o prazo de escolha já expirou (ADR 0011 / ADR 0010). */
export class IsRescheduleChoiceExpiredRequestDto {
  @IsDate()
  @Type(() => Date)
  optionsExpireAt!: Date;

  @IsDate()
  @Type(() => Date)
  now!: Date;
}
