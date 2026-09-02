import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaymentStatus } from '@marmoteiro/shared';

/** Insumos para iniciar uma cobrança junto ao provedor externo (seção 21.1). */
export interface PaymentChargeRequest {
  orderId: string;
  amount: number;
  currency: string;
}

/**
 * Resultado imediato (síncrono, na resposta HTTP do provedor) de iniciar
 * uma cobrança. `status` normalmente é `PENDING` — a seção 21.3 exige que
 * a confirmação definitiva venha de um evento servidor-servidor
 * (webhook), não desta resposta imediata nem da tela de retorno do
 * usuário.
 */
export interface PaymentChargeResult {
  /** Nome do provedor externo — mesmo valor gravado em `PaymentTransaction.provider`. */
  provider: string;
  /** Identificador na plataforma do provedor — mesmo valor gravado em `PaymentTransaction.providerReference`. */
  providerReference: string;
  status: PaymentStatus;
}

/** Insumos para solicitar o estorno de uma cobrança já aprovada. */
export interface PaymentRefundRequest {
  providerReference: string;
  amount: number;
}

/** Resultado imediato de solicitar um estorno — sujeito à mesma ressalva de confirmação assíncrona da seção 21.3. */
export interface PaymentRefundResult {
  providerReference: string;
  status: PaymentStatus;
}

/**
 * Porta de gateway de pagamento (seção 21.1: "o pagamento deverá ocorrer
 * por provedor externo"). Abstract class — não `interface` — para servir
 * também como token de injeção de dependência do NestJS, mesmo padrão de
 * `SessionStore`/`PasswordHasher` (ADR 0012). Desacopla o domínio
 * `Payment` do fornecedor real (PIX, cartão etc.), que ainda não foi
 * contratado pelo dono do produto.
 *
 * Só `FakePaymentGatewayAdapter` (em memória) é fornecida nesta ADR — a
 * escolha do provedor real é decisão de negócio pendente, a tratar em ADR
 * futura quando confirmada. Ver docs/adr/0013-portas-de-integracao-externa.md.
 */
export abstract class PaymentGatewayPort {
  abstract charge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
  abstract refund(request: PaymentRefundRequest): Promise<PaymentRefundResult>;
}

/**
 * Implementação fake (em memória) de `PaymentGatewayPort` — nunca produz
 * uma cobrança real, apenas simula uma resposta imediata `PENDING` com uma
 * referência opaca gerada localmente, registrando cada chamada recebida
 * (`charges`/`refunds`) para observação em teste. Adequada para viabilizar
 * casos de uso de ponta a ponta em desenvolvimento/teste sem depender do
 * provedor real ainda não escolhido.
 */
@Injectable()
export class FakePaymentGatewayAdapter extends PaymentGatewayPort {
  static readonly PROVIDER_NAME = 'fake';

  readonly charges: PaymentChargeRequest[] = [];
  readonly refunds: PaymentRefundRequest[] = [];

  charge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    this.charges.push(request);
    return Promise.resolve({
      provider: FakePaymentGatewayAdapter.PROVIDER_NAME,
      providerReference: randomUUID(),
      status: PaymentStatus.PENDING,
    });
  }

  refund(request: PaymentRefundRequest): Promise<PaymentRefundResult> {
    this.refunds.push(request);
    return Promise.resolve({
      providerReference: request.providerReference,
      status: PaymentStatus.REFUND_PENDING,
    });
  }
}
