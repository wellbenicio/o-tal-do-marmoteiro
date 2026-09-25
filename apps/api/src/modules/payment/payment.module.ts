import { Module } from '@nestjs/common';
import { PaymentStatusService } from './payment-status.service';
import { PaymentStatusController } from './payment-status.controller';
import {
  PaymentGatewayPort,
  FakePaymentGatewayAdapter,
} from './payment-gateway';

/**
 * Domínio: Payment (movimentação financeira).
 * Fonte: especificação funcional, seção 21 (Pagamentos). Máquina de estado
 * do Pagamento (`PaymentStatus`) definida em
 * docs/adr/0004-maquina-de-estado-do-pagamento.md. Controller HTTP fino
 * conforme ADR 0011. Porta de gateway de pagamento (`PaymentGatewayPort`)
 * definida em docs/adr/0013-portas-de-integracao-externa.md — só a
 * implementação fake está registrada; o provedor real (PIX/cartão) é
 * decisão de negócio pendente.
 */
@Module({
  controllers: [PaymentStatusController],
  providers: [
    PaymentStatusService,
    { provide: PaymentGatewayPort, useClass: FakePaymentGatewayAdapter },
  ],
  exports: [PaymentStatusService, PaymentGatewayPort],
})
export class PaymentModule {}
