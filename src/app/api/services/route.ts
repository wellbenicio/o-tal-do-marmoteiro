import { handleApiError, ok } from "@/lib/http";
import { getActiveServices } from "@/server/services/service.service";

export async function GET() {
  try {
    const services = await getActiveServices();
    return ok({ services });
  } catch (error) {
    return handleApiError(error);
  }
}
