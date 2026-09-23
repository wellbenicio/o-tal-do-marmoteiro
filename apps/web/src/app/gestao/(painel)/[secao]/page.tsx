import { requireAdmin } from "@/lib/server/admin-auth";
import { notFound } from "next/navigation";
import { Agenda } from "@/components/management/Agenda";
import { Questions } from "@/components/management/Questions";
import { Orders } from "@/components/management/Orders";
import { Finance } from "@/components/management/Finance";
import { Customers } from "@/components/management/Customers";
import { Notifications } from "@/components/management/Notifications";
import { Integrations } from "@/components/management/Integrations";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ secao: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { secao } = await params;
  await requireAdmin("/gestao/" + secao);
  const query = await searchParams;
  switch (secao) {
    case "agenda":
      return <Agenda />;
    case "perguntas":
      return <Questions />;
    case "pedidos":
      return (
        <Orders
          key={JSON.stringify(query)}
          initialQuery={query.busca}
          initialFilter={query.filtro}
          initialOrder={query.pedido}
        />
      );
    case "financeiro":
      return <Finance />;
    case "consulentes":
      return <Customers initialFilter={query.filtro} />;
    case "notificacoes":
      return <Notifications />;
    case "integracoes":
      return <Integrations />;
    default:
      notFound();
  }
}
