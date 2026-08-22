import { RefundDecisionType, ServiceOfferingType } from '@marmoteiro/shared';

/**
 * Motor de Política de Reembolso (Refund Policy Engine) — ver ADR 0007
 * (docs/adr/0007-motor-de-politica-de-reembolso.md). Função pura, não uma
 * máquina de estado: calcula, a partir dos insumos exigidos pela seção
 * 20.2, qual das quatro decisões da seção 20.3 se aplica, além dos valores
 * calculado/retido (seção 20.1).
 *
 * Não persiste nada e não decide sozinha a transição do `PaymentStatus`
 * (ADR 0004) — apenas centraliza o cálculo da decisão automática
 * (`RefundDecision.automatic = true`).
 */

/** Códigos de motivo — alinhados aos exemplos de `RefundDecision.reasonCode` no schema Prisma. */
export type RefundReasonCode =
  | 'EXCEPTIONAL_CIRCUMSTANCE'
  | 'WITHDRAWAL_RIGHT'
  | 'PROVIDER_RESCHEDULE'
  | 'NO_SHOW'
  | 'LATE_CANCELLATION'
  | 'ALREADY_RENDERED'
  | 'STANDARD_CANCELLATION';

export interface RefundPolicyInput {
  /** Modalidade do serviço contratado (seção 20.2 "modalidade"). */
  modality: ServiceOfferingType;
  /** Data da contratação (seção 20.2 "data da contratação"; base do prazo de arrependimento, seção 19.1). */
  contractedAt: Date;
  /** Data/hora da solicitação de cancelamento (seção 20.2 "data do cancelamento"). */
  cancellationRequestedAt: Date;
  /**
   * Indica se o serviço já foi integralmente prestado no momento da
   * solicitação (`DELIVERED`/`COMPLETED` conforme a modalidade — seção
   * 20.2 "status da execução"). Calculado pelo chamador a partir do
   * `QuestionStatus`/`AppointmentStatus` concreto.
   */
  isServiceAlreadyRendered: boolean;
  /** Valor total pago, já incluindo eventual valor de prioridade (seção 20.2 "valor total pago"; regra invariante nº 6, seção 32). */
  totalPaidAmount: number;
  /** Data/hora do agendamento (seção 20.2; somente `APPOINTMENT`). */
  scheduledAt?: Date;
  /**
   * Indica se houve no-show já caracterizado (seção 20.2 "no-show";
   * somente `APPOINTMENT`). As exclusões da seção 17.2 (falha do
   * prestador, falha da plataforma, situação excepcional) já devem ter
   * sido aplicadas pelo chamador antes de informar `true`.
   */
  isNoShow?: boolean;
  /**
   * Indica que o reagendamento foi provocado pelo prestador e o cliente
   * optou pela restituição integral em vez de novo horário (seção 15.7;
   * somente `APPOINTMENT`).
   */
  providerCausedRescheduleRefundChosen?: boolean;
  /** Indica se uma situação excepcional (seção 18) foi reportada para este caso (seção 20.2 "exceções"). */
  exceptionalCircumstanceReported?: boolean;
}

export interface RefundPolicyDecision {
  decision: RefundDecisionType;
  reasonCode: RefundReasonCode;
  /** Valor calculado de reembolso (seção 20.1). `0` quando `MANUAL_REVIEW_REQUIRED`. */
  refundAmount: number;
  /** Valor retido (seção 20.1). `0` quando `MANUAL_REVIEW_REQUIRED`. */
  retainedAmount: number;
}

/** Prazo legal do direito de arrependimento (seção 19.1). */
const WITHDRAWAL_RIGHT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Antecedência mínima abaixo da qual o cancelamento é tardio (seção 16.1). */
const LATE_CANCELLATION_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/** Percentual retido em cancelamento tardio (seção 16.2). */
const LATE_CANCELLATION_RETENTION_RATIO = 0.3;

/** Percentual retido em no-show (seção 17.3). */
const NO_SHOW_RETENTION_RATIO = 0.5;

/**
 * Erro lançado para combinações de entrada logicamente inconsistentes com
 * a especificação (não representa uma decisão de negócio — ver ADR 0007,
 * seção "Validações de entrada").
 */
export class InvalidRefundPolicyInputError extends Error {
  constructor(message: string) {
    super(
      `Entrada inválida para o Refund Policy Engine: ${message} (ver docs/adr/0007-motor-de-politica-de-reembolso.md).`,
    );
    this.name = 'InvalidRefundPolicyInputError';
  }
}

function validateInput(input: RefundPolicyInput): void {
  const isAppointment = input.modality === ServiceOfferingType.APPOINTMENT;

  if (!isAppointment) {
    if (input.isNoShow) {
      throw new InvalidRefundPolicyInputError(
        'no-show é exclusivo da modalidade APPOINTMENT (seção 17, "Consulta online")',
      );
    }
    if (input.providerCausedRescheduleRefundChosen) {
      throw new InvalidRefundPolicyInputError(
        'reagendamento provocado pelo prestador é exclusivo da modalidade APPOINTMENT (seção 15)',
      );
    }
    if (input.scheduledAt) {
      throw new InvalidRefundPolicyInputError(
        'data/hora do agendamento é exclusiva da modalidade APPOINTMENT (seção 14)',
      );
    }
  }

  if (input.isServiceAlreadyRendered && input.isNoShow) {
    throw new InvalidRefundPolicyInputError(
      'isServiceAlreadyRendered e isNoShow não podem ser ambos verdadeiros (no-show implica serviço não prestado — seção 17.4)',
    );
  }

  if (input.cancellationRequestedAt.getTime() < input.contractedAt.getTime()) {
    throw new InvalidRefundPolicyInputError(
      'cancellationRequestedAt não pode ser anterior a contractedAt',
    );
  }

  if (input.totalPaidAmount < 0) {
    throw new InvalidRefundPolicyInputError(
      'totalPaidAmount não pode ser negativo',
    );
  }
}

function isWithdrawalRightApplicable(input: RefundPolicyInput): boolean {
  const elapsedMs =
    input.cancellationRequestedAt.getTime() - input.contractedAt.getTime();
  return elapsedMs <= WITHDRAWAL_RIGHT_WINDOW_MS;
}

function isLateCancellation(input: RefundPolicyInput): boolean {
  if (
    input.modality !== ServiceOfferingType.APPOINTMENT ||
    !input.scheduledAt
  ) {
    return false;
  }
  const noticeMs =
    input.scheduledAt.getTime() - input.cancellationRequestedAt.getTime();
  return noticeMs < LATE_CANCELLATION_THRESHOLD_MS;
}

function fullRefund(
  totalPaidAmount: number,
): Pick<RefundPolicyDecision, 'refundAmount' | 'retainedAmount'> {
  return { refundAmount: totalPaidAmount, retainedAmount: 0 };
}

function noRefund(
  totalPaidAmount: number,
): Pick<RefundPolicyDecision, 'refundAmount' | 'retainedAmount'> {
  return { refundAmount: 0, retainedAmount: totalPaidAmount };
}

function partialRefund(
  totalPaidAmount: number,
  retentionRatio: number,
): Pick<RefundPolicyDecision, 'refundAmount' | 'retainedAmount'> {
  const retainedAmount = totalPaidAmount * retentionRatio;
  return { refundAmount: totalPaidAmount - retainedAmount, retainedAmount };
}

/**
 * Avalia a política de reembolso para uma solicitação de cancelamento,
 * seguindo a ordem de precedência definida na ADR 0007. Lança
 * `InvalidRefundPolicyInputError` para combinações de entrada
 * inconsistentes com a especificação.
 */
export function evaluateRefundPolicy(
  input: RefundPolicyInput,
): RefundPolicyDecision {
  validateInput(input);

  // 1. Situação excepcional reportada (seção 18) — sempre revisão manual,
  // antes de qualquer outra regra automática (seção 19.3 não lista
  // "situações excepcionais" entre as políticas subordinadas ao direito
  // de arrependimento).
  if (input.exceptionalCircumstanceReported) {
    return {
      decision: RefundDecisionType.MANUAL_REVIEW_REQUIRED,
      reasonCode: 'EXCEPTIONAL_CIRCUMSTANCE',
      refundAmount: 0,
      retainedAmount: 0,
    };
  }

  // 2. Direito de arrependimento (seção 19.1, prazo de 7 dias; regra
  // invariante nº 12: prevalece sobre retenções contratuais).
  if (isWithdrawalRightApplicable(input)) {
    if (input.isServiceAlreadyRendered || input.isNoShow) {
      // Seção 13.3: serviço já entregue — não nega nem concede
      // automaticamente, encaminha para revisão manual.
      return {
        decision: RefundDecisionType.MANUAL_REVIEW_REQUIRED,
        reasonCode: 'WITHDRAWAL_RIGHT',
        refundAmount: 0,
        retainedAmount: 0,
      };
    }
    // Seções 13.1/13.2: reembolso integral automático.
    return {
      decision: RefundDecisionType.FULL_REFUND,
      reasonCode: 'WITHDRAWAL_RIGHT',
      ...fullRefund(input.totalPaidAmount),
    };
  }

  // 3. Reagendamento provocado pelo prestador (seção 15.7) — não é culpa
  // do cliente, prevalece sobre no-show/cancelamento tardio.
  if (input.providerCausedRescheduleRefundChosen) {
    return {
      decision: RefundDecisionType.FULL_REFUND,
      reasonCode: 'PROVIDER_RESCHEDULE',
      ...fullRefund(input.totalPaidAmount),
    };
  }

  // 4. No-show (seção 17.3): retenção de 50%.
  if (input.isNoShow) {
    return {
      decision: RefundDecisionType.PARTIAL_REFUND,
      reasonCode: 'NO_SHOW',
      ...partialRefund(input.totalPaidAmount, NO_SHOW_RETENTION_RATIO),
    };
  }

  // 5. Cancelamento tardio (seção 16.2): retenção de 30%.
  if (isLateCancellation(input)) {
    return {
      decision: RefundDecisionType.PARTIAL_REFUND,
      reasonCode: 'LATE_CANCELLATION',
      ...partialRefund(
        input.totalPaidAmount,
        LATE_CANCELLATION_RETENTION_RATIO,
      ),
    };
  }

  // 6. Serviço já prestado sem nenhuma das condições acima (sem direito
  // legal aplicável, sem exceção): sem fundamento para devolução (seção
  // 20.3, NO_REFUND só quando "juridicamente e contratualmente válida").
  if (input.isServiceAlreadyRendered) {
    return {
      decision: RefundDecisionType.NO_REFUND,
      reasonCode: 'ALREADY_RENDERED',
      ...noRefund(input.totalPaidAmount),
    };
  }

  // 7. Padrão: cancelamento com antecedência, sem penalidade descrita
  // (seção 16.1, por exclusão — ver ADR 0007, "Pontos em aberto").
  return {
    decision: RefundDecisionType.FULL_REFUND,
    reasonCode: 'STANDARD_CANCELLATION',
    ...fullRefund(input.totalPaidAmount),
  };
}
