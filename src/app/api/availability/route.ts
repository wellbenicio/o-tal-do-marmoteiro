import { handleApiError, ok } from "@/lib/http";
import { availabilityQuerySchema } from "@/server/bookings/booking.schemas";
import { getAvailability } from "@/server/calendar/availability.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = availabilityQuerySchema.parse({
      serviceId: searchParams.get("serviceId"),
      date: searchParams.get("date")
    });

    const availability = await getAvailability(query);
    return ok(availability);
  } catch (error) {
    return handleApiError(error);
  }
}
