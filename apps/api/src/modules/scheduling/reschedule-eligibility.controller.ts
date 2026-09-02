import { Body, Controller, Post } from '@nestjs/common';
import type { RescheduleEligibilityResult } from './reschedule-eligibility';
import { RescheduleEligibilityService } from './reschedule-eligibility.service';
import {
  CalculateRescheduleOptionsExpireAtRequestDto,
  EvaluateRescheduleEligibilityRequestDto,
  IsRescheduleChoiceExpiredRequestDto,
} from './reschedule-eligibility.dto';

/**
 * Exposição HTTP fina da elegibilidade e do prazo de reagendamento —
 * apenas orquestra `RescheduleEligibilityService`, sem regra de negócio
 * própria. Ver ADR 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md)
 * e docs/adr/0010-elegibilidade-e-prazo-de-reagendamento.md.
 *
 * Não define quando `optionsPresentedAt` é atribuído (fluxo automático vs.
 * curadoria administrativa) — ponto em aberto da própria ADR 0010, que
 * permanece de responsabilidade do futuro caso de uso que abrir a
 * `RescheduleRequest`.
 */
@Controller('reschedule-requests/eligibility')
export class RescheduleEligibilityController {
  constructor(
    private readonly rescheduleEligibilityService: RescheduleEligibilityService,
  ) {}

  @Post('evaluate')
  evaluate(
    @Body() body: EvaluateRescheduleEligibilityRequestDto,
  ): RescheduleEligibilityResult {
    return this.rescheduleEligibilityService.evaluateCustomerEligibility(body);
  }

  @Post('options-expiration')
  calculateOptionsExpireAt(
    @Body() body: CalculateRescheduleOptionsExpireAtRequestDto,
  ): { optionsExpireAt: Date } {
    return {
      optionsExpireAt:
        this.rescheduleEligibilityService.calculateOptionsExpireAt(
          body.optionsPresentedAt,
        ),
    };
  }

  @Post('is-choice-expired')
  isChoiceExpired(@Body() body: IsRescheduleChoiceExpiredRequestDto): {
    expired: boolean;
  } {
    return {
      expired: this.rescheduleEligibilityService.isChoiceExpired(
        body.optionsExpireAt,
        body.now,
      ),
    };
  }
}
