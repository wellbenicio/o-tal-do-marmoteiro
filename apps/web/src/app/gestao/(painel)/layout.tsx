import { requireAdmin } from "@/lib/server/admin-auth";
import { ManagementShell } from "@/components/management/ManagementShell";
import { ManagementProvider } from "@/components/management/ManagementProvider";
import { AdminAccess } from "@/components/management/AdminAccess";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return (
    <AdminAccess admin={admin}>
      <ManagementProvider>
        <ManagementShell>{children}</ManagementShell>
      </ManagementProvider>
    </AdminAccess>
  );
}
