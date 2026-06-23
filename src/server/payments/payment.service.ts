import { PaymentStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { findBookingWithPayments, updateBookingStatus } from "@/server/bookings/booking.repository";
import { createGoogleCalendarEvent } from "@/server/calendar/google-calendar.client";
import { updateLatestPaymentStatus } from "./payment.repository";
import type { MockPaymentAction, PaymentTransition } from "./payment.types";

function mapMockAction(action: MockPaymentAction): PaymentTransition {
  if (action === "approve") {
    return {
      paymentStatus: "APPROVED",
      bookingStatus: "CONFIRMED"
    };
  }

  if (action === "reject") {
    return {
      paymentStatus: "REJECTED",
      bookingStatus: "PAYMENT_REJECTED"
    };
  }

  return {
    paymentStatus: "IN_PROCESS",
    bookingStatus: "PENDING_PAYMENT"
  };
}

export async function applyMockPayment(input: {
  publicToken: string;
  action: MockPaymentAction;
}) {
  const env = getEnv();

  if (env.ENABLE_MOCK_PAYMENTS !== "true") {
    throw new AppError("Pagamento mockado indisponível.", 403);
  }

  const transition = mapMockAction(input.action);

  const result = await prisma.$transaction(async (tx) => {
    const booking = await findBookingWithPayments(input.publicToken);

    if (!booking) {
      throw new AppError("Agendamento não encontrado.", 404);
    }

    const payment = booking.payments[0];

    if (!payment) {
      throw new AppError("Pagamento não encontrado.", 404);
    }

    await updateLatestPaymentStatus(tx, {
      paymentId: payment.id,
      status: transition.paymentStatus,
      approvedAt: transition.paymentStatus === PaymentStatus.APPROVED ? new Date() : null,
      rawPayload: {
        source: "mock",
        action: input.action
      }
    });

    await updateBookingStatus(tx, booking.publicToken, transition.bookingStatus);

    return {
      publicToken: booking.publicToken,
      status: transition.bookingStatus,
      scheduledStart: booking.scheduledStart,
      scheduledEnd: booking.scheduledEnd,
      service: booking.service
    };
  });

  if (transition.bookingStatus === "CONFIRMED") {
    await createGoogleCalendarEvent({
      bookingPublicToken: result.publicToken,
      title: result.service.name,
      startsAt: result.scheduledStart,
      endsAt: result.scheduledEnd
    });
  }

  return {
    publicToken: result.publicToken,
    bookingStatus: result.status,
    paymentStatus: transition.paymentStatus
  };
}

export async function handleMercadoPagoWebhook(payload: unknown) {
  return {
    received: true,
    provider: "MERCADO_PAGO",
    mock: true,
    payloadType: typeof payload
  };
}
