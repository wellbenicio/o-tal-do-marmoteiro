import type { PaymentStatus } from "@prisma/client";

export type MockPaymentAction = "approve" | "reject" | "pending";

export type PaymentTransition = {
  paymentStatus: PaymentStatus;
  bookingStatus: "CONFIRMED" | "PAYMENT_REJECTED" | "PENDING_PAYMENT";
};
