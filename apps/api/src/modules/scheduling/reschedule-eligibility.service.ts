import { Injectable } from '@nestjs/common';
import {
  RescheduleEligibilityInput,
  RescheduleEligibilityResult,
  calculateRescheduleOptionsExpireAt,
  evaluateCustomerRescheduleEligibility,
  isRescheduleChoiceExpired,
} from './reschedule-eligibility';

/**
 * Ponto único de acesso à elegibilidade e ao prazo de reagendamento da
 * Consulta Online para o restante da aplicação. Ver
 * docs/adr/0010-elegibilidade-e-prazo-de-reagendamento.md.
 */
@Injectable()
export class RescheduleEligibilityService {
  evaluateCustomerEligibility(
    input: RescheduleEligibilityInput,
  ): RescheduleEligibilityResult {
    return evaluateCustomerRescheduleEligibility(input);
  }

  calculateOptionsExpireAt(optionsPresentedAt: Date): Date {
    return calculateRescheduleOptionsExpireAt(optionsPresentedAt);
  }

  isChoiceExpired(optionsExpireAt: Date, now: Date): boolean {
    return isRescheduleChoiceExpired(optionsExpireAt, now);
  }
}
