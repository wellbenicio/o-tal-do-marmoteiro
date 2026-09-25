import { NextRequest, NextResponse } from "next/server";
import { adminApi } from "@/lib/server/admin-auth";
import { adminCookieName, type AdminIdentity } from "@/lib/admin-routes";
const headers = { "Cache-Control": "no-store", Vary: "Cookie" };
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers });
}
function sameOrigin(req: NextRequest) {
  const origin = process.env.APP_ORIGIN;
  return (
    !!origin &&
    req.headers.get("origin") === new URL(origin).origin &&
    req.headers.get("sec-fetch-site") !== "cross-site"
  );
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  if ((await params).action !== "session")
    return json({ message: "Não encontrado." }, 404);
  const token = req.cookies.get(adminCookieName)?.value;
  if (!token) return json({ message: "Sessão necessária." }, 401);
  try {
    const res = await adminApi("auth/session", { token });
    if (res.ok) return json(await res.json());
    return json({ message: "Sessão encerrada." }, res.status === 401 ? 401 : 503);
  } catch {
    return json({ message: "Acesso temporariamente indisponível." }, 503);
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const action = (await params).action;
  if (!["login", "logout"].includes(action))
    return json({ message: "Não encontrado." }, 404);
  if (!sameOrigin(req)) return json({ message: "Origem não autorizada." }, 403);
  if (action === "logout") return logout(req);
  return login(req);
}
async function logout(req: NextRequest) {
  const token = req.cookies.get(adminCookieName)?.value;
  try {
    if (token) await adminApi("auth/logout", { token, body: {} });
  } catch {
    /* This browser must lose access even if the API is unavailable. */
  }
  const res = json({ ok: true });
  res.cookies.set(adminCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
function loginFailure(status: number) {
  if (status === 429)
    return json({ message: "Muitas tentativas. Aguarde 15 minutos e tente novamente." }, 429);
  if (status === 401)
    return json({ message: "E-mail ou senha inválidos." }, 401);
  return json({ message: "Acesso temporariamente indisponível." }, 503);
}
async function login(req: NextRequest) {
  try {
    const raw = await req.text();
    if (raw.length > 4096) return json({ message: "Dados inválidos." }, 400);
    const body = JSON.parse(raw) as { email?: unknown; password?: unknown };
    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.email.length > 254 ||
      body.password.length > 128
    )
      return json({ message: "E-mail ou senha inválidos." }, 400);
    const clientKey =
      process.env.TRUST_PROXY_HEADERS === "true"
        ? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "shared"
        : "shared";
    const upstream = await adminApi("auth/login", {
      body: { email: body.email, password: body.password },
      clientKey,
    });
    if (!upstream.ok) return loginFailure(upstream.status);
    const result = (await upstream.json()) as {
      token: string;
      expiresAt: string;
      admin: AdminIdentity;
    };
    const response = json({ admin: result.admin });
    response.cookies.set(adminCookieName, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(result.expiresAt),
    });
    return response;
  } catch (error) {
    return json(
      {
        message:
          error instanceof SyntaxError
            ? "Dados inválidos."
            : "Acesso temporariamente indisponível. Tente novamente em instantes.",
      },
      error instanceof SyntaxError ? 400 : 503,
    );
  }
}
