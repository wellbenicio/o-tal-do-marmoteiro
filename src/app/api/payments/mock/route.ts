import { z } from "zod";
import { handleApiError, ok } from "@/lib/http";
import { applyMockPayment } from "@/server/payments/payment.service";

const mockPaymentSchema = z.object({
  publicToken: z.string().min(1),
  action: z.enum(["approve", "reject", "pending"])
});

export async function POST(request: Request) {
  try {
    const body = mockPaymentSchema.parse(await request.json());
    const result = await applyMockPayment(body);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
