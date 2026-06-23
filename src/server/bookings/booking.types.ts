import type { BookingStatus } from "@prisma/client";

export type PublicBookingStatus = BookingStatus;

export type PublicBooking = {
  publicToken: string;
  status: PublicBookingStatus;
  scheduledStart: string;
  scheduledEnd: string;
  service: {
    name: string;
    durationMinutes: number;
    priceCents: number;
    currency: string;
  };
};
