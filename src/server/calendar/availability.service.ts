import { AppError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { listBlockingBookingsForDay } from "@/server/bookings/booking.repository";
import { getActiveServiceOrThrow } from "@/server/services/service.service";

function zonedDate(date: string, hour: number, minute = 0) {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-03:00`);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function overlaps(
  start: Date,
  end: Date,
  blocked: { scheduledStart: Date; scheduledEnd: Date }
) {
  return start < blocked.scheduledEnd && end > blocked.scheduledStart;
}

export async function getAvailability(input: { serviceId: string; date: string }) {
  const env = getEnv();
  const service = await getActiveServiceOrThrow(input.serviceId);

  if (env.BUSINESS_OPEN_HOUR >= env.BUSINESS_CLOSE_HOUR) {
    throw new AppError("Horário de funcionamento inválido.", 500);
  }

  const dayStart = zonedDate(input.date, 0);
  const dayEnd = zonedDate(input.date, 24);
  const openAt = zonedDate(input.date, env.BUSINESS_OPEN_HOUR);
  const closeAt = zonedDate(input.date, env.BUSINESS_CLOSE_HOUR);
  const now = new Date();

  const blockedBookings = await listBlockingBookingsForDay({
    serviceId: service.id,
    dayStart,
    dayEnd,
    now
  });

  const slots: string[] = [];

  for (
    let start = openAt;
    addMinutes(start, service.durationMinutes) <= closeAt;
    start = addMinutes(start, env.BOOKING_SLOT_MINUTES)
  ) {
    const end = addMinutes(start, service.durationMinutes);
    const isFuture = start > now;
    const isBlocked = blockedBookings.some((booking) => overlaps(start, end, booking));

    if (isFuture && !isBlocked) {
      slots.push(start.toISOString());
    }
  }

  return {
    serviceId: service.id,
    date: input.date,
    slots
  };
}
