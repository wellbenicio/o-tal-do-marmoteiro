import Link from "next/link";
import { Clock3 } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function PendingPage({
  searchParams
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-12">
      <Card className="mx-auto max-w-2xl">
        <Clock3 className="text-marmoteiro-gold" size={34} />
        <h1 className="mt-4 font-display text-4xl">Pagamento pendente</h1>
        <p className="mt-4 leading-7 text-marmoteiro-ink/72">
          A reserva ainda não está confirmada. A confirmação depende da aprovação
          do pagamento.
        </p>
        {booking ? (
          <Link className={buttonClassName("primary") + " mt-6"} href={`/agendamento/${booking}`}>
            Consultar status
          </Link>
        ) : null}
      </Card>
    </main>
  );
}
