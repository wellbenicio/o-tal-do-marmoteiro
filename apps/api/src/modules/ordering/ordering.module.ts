import { Module } from '@nestjs/common';
import { OrderStatusService } from './order-status.service';
import { OrderStatusController } from './order-status.controller';

/**
 * Domínio: Ordering (o que foi contratado).
 * Fonte: especificação funcional, seção 10 (Pedido, pagamento e atendimento
 * são domínios distintos). Máquina de estado do Pedido (`OrderStatus`)
 * definida em docs/adr/0002-maquina-de-estado-do-pedido.md. Controller HTTP
 * fino conforme ADR 0011.
 */
@Module({
  controllers: [OrderStatusController],
  providers: [OrderStatusService],
  exports: [OrderStatusService],
})
export class OrderingModule {}
