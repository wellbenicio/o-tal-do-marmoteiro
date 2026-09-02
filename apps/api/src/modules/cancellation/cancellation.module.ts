import { Module } from '@nestjs/common';
import { RefundPolicyService } from './refund-policy.service';
import { RefundPolicyController } from './refund-policy.controller';

/**
 * Domínio: Cancellation (cancelamento e Refund Policy Engine).
 * Fonte: especificação funcional, seções 16 (Cancelamento tardio), 17 (No-show),
 * 18 (Situações excepcionais), 19 (Direito de arrependimento) e
 * 20 (Cancelamento e reembolso como domínios próprios).
 * Ver docs/adr/0007-motor-de-politica-de-reembolso.md. Controller HTTP
 * fino conforme ADR 0011.
 */
@Module({
  controllers: [RefundPolicyController],
  providers: [RefundPolicyService],
  exports: [RefundPolicyService],
})
export class CancellationModule {}
