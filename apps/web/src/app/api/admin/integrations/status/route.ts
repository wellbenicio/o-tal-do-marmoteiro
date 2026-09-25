import { NextRequest, NextResponse } from "next/server";
import { adminApi } from "@/lib/server/admin-auth";
import { adminCookieName } from "@/lib/admin-routes";
export async function GET(req: NextRequest) {
  const token = req.cookies.get(adminCookieName)?.value;
  const headers = { "Cache-Control": "no-store", Vary: "Cookie" };
  if (!token)
    return NextResponse.json(
      { message: "Sessão necessária." },
      { status: 401, headers },
    );
  try {
    const response = await adminApi("integrations/status", { token });
    return NextResponse.json(
      response.ok
        ? await response.json()
        : { message: "Não foi possível consultar as integrações." },
      { status: response.status, headers },
    );
  } catch {
    return NextResponse.json(
      { message: "Integrações indisponíveis." },
      { status: 503, headers },
    );
  }
}
