import { getAdmin } from "@/lib/server/admin-auth";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/management/AdminLogin";
import { safeAdminReturn } from "@/lib/admin-routes";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Acesso administrativo | O Tal do Marmoteiro",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const target = safeAdminReturn((await searchParams).next);
  if (await getAdmin()) redirect(target);
  return <AdminLogin returnTo={target} />;
}
