import { handleApiError, ok } from "@/lib/http";
import { publicTokenSchema } from "@/server/bookings/booking.schemas";
import { getPublicBooking } from "@/server/bookings/booking.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicToken: string }> }
) {
  try {
    const params = publicTokenSchema.parse(await context.params);
    const booking = await getPublicBooking(params.publicToken);

    return ok({ booking });
  } catch (error) {
    return handleApiError(error);
  }
}
