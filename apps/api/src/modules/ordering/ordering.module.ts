import { Module } from '@nestjs/common';

/**
 * Domínio: Ordering (o que foi contratado).
 * Fonte: especificação funcional, seção 10 (Pedido, pagamento e atendimento
 * são domínios distintos). ADR pendente: enum de status do Pedido (ver
 * packages/shared e prisma/schema.prisma).
 */
@Module({})
export class OrderingModule {}
