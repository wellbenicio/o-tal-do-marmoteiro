import { AppError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createOrUpdateCustomer } from "@/server/customers/customer.service";
import { getActiveServiceOrThrow } from "@/server/services/service.service";
import { createMockCheckoutPreference } from "@/server/payments/mercado-pago.client";
import { createPendingPayment } from "@/server/payments/payment.repository";
import {
  createPendingBooking,
  findBlockingBooking,
  findPublicBooking
} from "./booking.repository";
import type { PublicBooking } from "./booking.types";

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function toPublicBooking(booking: NonNullable<Awaited<ReturnType<typeof findPublicBooking>>>): PublicBooking {
  return {
    publicToken: booking.publicToken,
    status: booking.status,
    scheduledStart: booking.scheduledStart.toISOString(),
    scheduledEnd: booking.scheduledEnd.toISOString(),
    service: {
      name: booking.service.name,
      durationMinutes: booking.service.durationMinutes,
      priceCents: booking.service.priceCents,
      currency: booking.service.currency
    }
  };
}

export async function createCheckout(input: {
  serviceId: string;
  scheduledStart: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}) {
  const env = getEnv();
  const service = await getActiveServiceOrThrow(input.serviceId);
  const scheduledStart = new Date(input.scheduledStart);

  if (Number.isNaN(scheduledStart.getTime())) {
    throw new AppError("Horário inválido.");
  }

  if (scheduledStart <= new Date()) {
    throw new AppError("Escolha um horário futuro.");
  }

  const scheduledEnd = addMinutes(scheduledStart, service.durationMinutes);
  const blockingBooking = await findBlockingBooking({
    serviceId: service.id,
    scheduledStart,
    scheduledEnd
  });

  if (blockingBooking) {
    throw new AppError("Horário indisponível.", 409);
  }

  const customer = await createOrUpdateCustomer(input.customer);
  const slotLockExpiresAt = addMinutes(new Date(), env.BOOKING_LOCK_MINUTES);

  const checkout = await prisma.$transaction(async (tx) => {
    const booking = await createPendingBooking(tx, {
      customerId: customer.id,
      serviceId: service.id,
      scheduledStart,
      scheduledEnd,
      slotLockExpiresAt
    });

    const preference = await createMockCheckoutPreference({
      publicToken: booking.publicToken
    });

    await createPendingPayment(tx, {
      bookingId: booking.id,
      amountCents: service.priceCents,
      currency: service.currency,
      gatewayPreferenceId: preference.gatewayPreferenceId
    });

    return {
      booking,
      checkoutUrl: preference.checkoutUrl
    };
  });

  return {
    booking: {
      publicToken: checkout.booking.publicToken,
      status: checkout.booking.status,
      scheduledStart: checkout.booking.scheduledStart.toISOString(),
      scheduledEnd: checkout.booking.scheduledEnd.toISOString()
    },
    checkoutUrl: checkout.checkoutUrl
  };
}

export async function getPublicBooking(publicToken: string) {
  const booking = await findPublicBooking(publicToken);

  if (!booking) {
    throw new AppError("Agendamento não encontrado.", 404);
  }

  return toPublicBooking(booking);
}
