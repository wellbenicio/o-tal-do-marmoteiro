import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  type AdminIdentity,
  safeAdminReturn,
} from "../admin-routes";
export async function adminApi(
  path: string,
  options: { token?: string; body?: unknown; clientKey?: string } = {},
) {
  const secret = process.env.ADMIN_API_SECRET;
  const base = process.env.ADMIN_API_URL;
  if (!secret || secret.length < 32 || !base)
    throw new Error("ADMIN_UNAVAILABLE");
  const url = new URL(base);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("ADMIN_UNAVAILABLE");
  return fetch(new URL("/admin/" + path, url), {
    method: options.body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-service-key": secret,
      ...(options.token ? { Authorization: "Bearer " + options.token } : {}),
      ...(options.clientKey ? { "x-admin-client-key": options.clientKey } : {}),
    },
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
}
export const getAdmin = cache(async (): Promise<AdminIdentity | null> => {
  const token = (await cookies()).get(adminCookieName)?.value;
  if (!token) return null;
  try {
    const res = await adminApi("auth/session", { token });
    if (!res.ok) return null;
    return (await res.json()) as AdminIdentity;
  } catch {
    return null;
  }
});
export async function requireAdmin(returnTo = "/gestao") {
  const admin = await getAdmin();
  if (!admin)
    redirect(
      "/gestao/login?next=" + encodeURIComponent(safeAdminReturn(returnTo)),
    );
  return admin;
}
