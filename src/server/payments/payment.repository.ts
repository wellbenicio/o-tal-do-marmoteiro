import type { PaymentStatus, Prisma } from "@prisma/client";

export function createPendingPayment(
  tx: Prisma.TransactionClient,
  input: {
    bookingId: string;
    amountCents: number;
    currency: string;
    gatewayPreferenceId?: string;
  }
) {
  return tx.payment.create({
    data: {
      bookingId: input.bookingId,
      gateway: "MERCADO_PAGO",
      gatewayPreferenceId: input.gatewayPreferenceId,
      status: "PENDING",
      amountCents: input.amountCents,
      currency: input.currency
    }
  });
}

export function updateLatestPaymentStatus(
  tx: Prisma.TransactionClient,
  input: {
    paymentId: string;
    status: PaymentStatus;
    rawPayload?: Prisma.InputJsonValue;
    approvedAt?: Date | null;
  }
) {
  return tx.payment.update({
    where: { id: input.paymentId },
    data: {
      status: input.status,
      rawPayload: input.rawPayload,
      approvedAt: input.approvedAt
    }
  });
}
