import { Module } from '@nestjs/common';
import { DataCorrectionDecisionService } from './data-correction-decision.service';
import { DataCorrectionDecisionController } from './data-correction-decision.controller';

/**
 * Domínio: Customer (cadastro e dados do consulente).
 * Fonte: especificação funcional, seções 6 (Cadastro do consulente) e 22.4 (Minha conta).
 * Validação de decisão de correção cadastral definida em
 * docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md.
 * Controllers HTTP finos conforme ADR 0011.
 */
@Module({
  controllers: [DataCorrectionDecisionController],
  providers: [DataCorrectionDecisionService],
  exports: [DataCorrectionDecisionService],
})
export class CustomerModule {}
