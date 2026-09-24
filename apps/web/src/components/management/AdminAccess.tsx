"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { AdminIdentity } from "@/lib/admin-routes";
import { clearAdminPreview } from "@/lib/preview-events";
const Context = createContext<AdminIdentity | null>(null);
export function AdminAccess({
  admin,
  children,
}: Readonly<{
  admin: AdminIdentity;
  children: React.ReactNode;
}>) {
  const path = usePathname();
  const [valid, setValid] = useState(true);
  useEffect(() => {
    let stopped = false;
    async function check() {
      try {
        const res = await fetch("/api/admin/auth/session", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Sessão administrativa inválida.");
      } catch {
        if (!stopped) {
          setValid(false);
          clearAdminPreview();
          window.location.replace("/gestao/login");
        }
      }
    }
    const visible = () => {
      if (document.visibilityState === "visible") void check();
    };
    void check();
    const timer = setInterval(visible, 30000);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [path]);
  if (!valid) return null;
  return <Context.Provider value={admin}>{children}</Context.Provider>;
}
export function useAdminIdentity() {
  const admin = useContext(Context);
  if (!admin) throw new Error("Administrative session required");
  return admin;
}
export async function adminLogout() {
  try {
    await fetch("/api/admin/auth/logout", { method: "POST" });
  } finally {
    clearAdminPreview();
    // A full reload discards the protected router cache and all in-memory administrative data.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/gestao/login");
  }
}
