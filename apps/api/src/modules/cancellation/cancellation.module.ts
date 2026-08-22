import { Module } from '@nestjs/common';
import { RefundPolicyService } from './refund-policy.service';

/**
 * Domínio: Cancellation (cancelamento e Refund Policy Engine).
 * Fonte: especificação funcional, seções 16 (Cancelamento tardio), 17 (No-show),
 * 18 (Situações excepcionais), 19 (Direito de arrependimento) e
 * 20 (Cancelamento e reembolso como domínios próprios).
 * Ver docs/adr/0007-motor-de-politica-de-reembolso.md.
 */
@Module({
  providers: [RefundPolicyService],
  exports: [RefundPolicyService],
})
export class CancellationModule {}
