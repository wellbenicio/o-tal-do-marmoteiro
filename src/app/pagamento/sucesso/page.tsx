import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-12">
      <Card className="mx-auto max-w-2xl">
        <CheckCircle2 className="text-marmoteiro-amber" size={34} />
        <h1 className="mt-4 font-display text-4xl">Pagamento aprovado</h1>
        <p className="mt-4 leading-7 text-white/72">
          Seu agendamento foi confirmado no ambiente mockado. Consulte o status
          público para acompanhar os detalhes.
        </p>
        {booking ? (
          <Link className={buttonClassName("primary") + " mt-6"} href={`/agendamento/${booking}`}>
            Ver agendamento
          </Link>
        ) : null}
      </Card>
    </main>
  );
}
