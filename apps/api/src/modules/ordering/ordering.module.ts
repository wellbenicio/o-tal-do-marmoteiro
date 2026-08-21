import { Module } from '@nestjs/common';

/**
 * Domínio: Ordering (o que foi contratado).
 * Fonte: especificação funcional, seção 10 (Pedido, pagamento e atendimento
 * são domínios distintos). Máquina de estado do Pedido (`OrderStatus`)
 * definida em docs/adr/0002-maquina-de-estado-do-pedido.md.
 */
@Module({})
export class OrderingModule {}
