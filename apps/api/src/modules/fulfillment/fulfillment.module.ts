import { Module } from '@nestjs/common';

/**
 * Domínio: Fulfillment (execução do atendimento).
 * Fonte: especificação funcional, seções 11.5–11.7 (início, entrega e
 * conclusão da pergunta avulsa) e 10.3 (estados de Atendimento, comuns às
 * duas modalidades). A consulta online (seção 14) não descreve uma ação
 * equivalente de início/entrega — ver ADR 0018 e
 * docs/adr/0016-reconciliacao-service-execution.md.
 */
@Module({})
export class FulfillmentModule {}
