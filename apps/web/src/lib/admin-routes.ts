export const adminCookieName =
  process.env.NODE_ENV === "production"
    ? "__Host-marmoteiro-admin"
    : "marmoteiro-admin";
export function safeAdminReturn(value: unknown) {
  return typeof value === "string" &&
    /^\/gestao(?:\/[a-z-]+)?(?:\?[^\\\r\n]*)?$/.test(value) &&
    !value.startsWith("/gestao/login")
    ? value
    : "/gestao";
}
export type AdminIdentity = {
  id: string;
  name: string;
  email: string;
  role: string;
  expiresAt: string;
};
