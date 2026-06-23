import { handleApiError, ok } from "@/lib/http";
import { checkoutSchema } from "@/server/bookings/booking.schemas";
import { createCheckout } from "@/server/bookings/booking.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = checkoutSchema.parse(body);
    const checkout = await createCheckout(input);

    return ok(checkout, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
