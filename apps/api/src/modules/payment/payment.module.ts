import { Module } from '@nestjs/common';
import { PaymentStatusService } from './payment-status.service';

/**
 * Domínio: Payment (movimentação financeira).
 * Fonte: especificação funcional, seção 21 (Pagamentos). Máquina de estado
 * do Pagamento (`PaymentStatus`) definida em
 * docs/adr/0004-maquina-de-estado-do-pagamento.md.
 */
@Module({
  providers: [PaymentStatusService],
  exports: [PaymentStatusService],
})
export class PaymentModule {}
