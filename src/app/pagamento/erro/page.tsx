import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function ErrorPage({
  searchParams
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-12">
      <Card className="mx-auto max-w-2xl">
        <XCircle className="text-marmoteiro-rose" size={34} />
        <h1 className="mt-4 font-display text-4xl">Pagamento não concluído</h1>
        <p className="mt-4 leading-7 text-marmoteiro-ink/72">
          O agendamento não foi confirmado. Você pode voltar para a landing e tentar
          escolher um novo horário.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className={buttonClassName("primary")} href="/">
            Voltar para agendar
          </Link>
          {booking ? (
            <Link className={buttonClassName("secondary")} href={`/agendamento/${booking}`}>
              Consultar status
            </Link>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
