import { handleApiError, ok } from "@/lib/http";
import { handleMercadoPagoWebhook } from "@/server/payments/payment.service";

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const result = await handleMercadoPagoWebhook(payload);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
