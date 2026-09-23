import { requireAdmin } from "@/lib/server/admin-auth";
import { Overview } from "@/components/management/Overview";
export default async function Page() {
  await requireAdmin();
  return <Overview />;
}
