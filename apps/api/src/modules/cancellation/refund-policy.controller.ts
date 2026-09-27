import { Body, Controller, Post } from '@nestjs/common';
import type { RefundPolicyDecision } from './refund-policy';
import { RefundPolicyService } from './refund-policy.service';
import { EvaluateRefundPolicyRequestDto } from './refund-policy.dto';

/**
 * Exposição HTTP fina do Refund Policy Engine — apenas orquestra
 * `RefundPolicyService`, sem regra de negócio própria. Ver ADR 0011
 * (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0007-motor-de-politica-de-reembolso.md.
 */
@Controller('cancellations/refund-policy')
export class RefundPolicyController {
  constructor(private readonly refundPolicyService: RefundPolicyService) {}

  @Post('evaluate')
  evaluate(@Body() body: EvaluateRefundPolicyRequestDto): RefundPolicyDecision {
    return this.refundPolicyService.evaluate(body);
  }
}
