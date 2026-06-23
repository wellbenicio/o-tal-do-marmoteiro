import type { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function findBlockingBooking(input: {
  serviceId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  return prisma.booking.findFirst({
    where: {
      serviceId: input.serviceId,
      scheduledStart: { lt: input.scheduledEnd },
      scheduledEnd: { gt: input.scheduledStart },
      OR: [
        { status: "CONFIRMED" },
        {
          status: "PENDING_PAYMENT",
          slotLockExpiresAt: { gt: now }
        }
      ]
    }
  });
}

export function listBlockingBookingsForDay(input: {
  serviceId: string;
  dayStart: Date;
  dayEnd: Date;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  return prisma.booking.findMany({
    where: {
      serviceId: input.serviceId,
      scheduledStart: { lt: input.dayEnd },
      scheduledEnd: { gt: input.dayStart },
      OR: [
        { status: "CONFIRMED" },
        {
          status: "PENDING_PAYMENT",
          slotLockExpiresAt: { gt: now }
        }
      ]
    },
    select: {
      scheduledStart: true,
      scheduledEnd: true
    }
  });
}

export function findPublicBooking(publicToken: string) {
  return prisma.booking.findUnique({
    where: { publicToken },
    include: {
      service: true
    }
  });
}

export function findBookingWithPayments(publicToken: string) {
  return prisma.booking.findUnique({
    where: { publicToken },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1
      },
      service: true
    }
  });
}

export function createPendingBooking(
  tx: Prisma.TransactionClient,
  input: {
    customerId: string;
    serviceId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    slotLockExpiresAt: Date;
  }
) {
  return tx.booking.create({
    data: {
      customerId: input.customerId,
      serviceId: input.serviceId,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
      status: "PENDING_PAYMENT",
      slotLockExpiresAt: input.slotLockExpiresAt
    }
  });
}

export function updateBookingStatus(
  tx: Prisma.TransactionClient,
  publicToken: string,
  status: BookingStatus
) {
  return tx.booking.update({
    where: { publicToken },
    data: { status }
  });
}
