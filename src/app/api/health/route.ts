import { ok } from "@/lib/http";

export function GET() {
  return ok({ status: "ok" });
}
