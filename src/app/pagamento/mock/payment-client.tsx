"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function MockPaymentClient() {
  const searchParams = useSearchParams();
  const publicToken = searchParams.get("booking") ?? "";
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function simulate(action: "approve" | "reject" | "pending") {
    setMessage("");
    setLoadingAction(action);

    try {
      const response = await fetch("/api/payments/mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          publicToken,
          action
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível simular o pagamento.");
      }

      const target =
        action === "approve"
          ? "/pagamento/sucesso"
          : action === "reject"
            ? "/pagamento/erro"
            : "/pagamento/pendente";

      window.location.href = `${target}?booking=${publicToken}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao simular pagamento.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <Card className="mx-auto max-w-2xl">
        <div className="flex items-start gap-4">
          <AlertTriangle className="shrink-0 text-marmoteiro-gold" size={28} />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-marmoteiro-rose">
              Ambiente local
            </p>
            <h1 className="mt-2 font-display text-4xl">Pagamento mockado</h1>
            <p className="mt-4 leading-7 text-marmoteiro-ink/72">
              Esta tela não representa uma cobrança real. Ela existe para validar o
              fluxo do MVP antes da integração com Mercado Pago.
            </p>
          </div>
        </div>

        <p className="mt-6 rounded-md bg-marmoteiro-gold/15 p-3 text-sm text-marmoteiro-ink/72">
          Token do agendamento: {publicToken || "não informado"}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button disabled={!publicToken || loadingAction !== null} onClick={() => simulate("approve")}>
            <CheckCircle2 size={18} />
            Aprovar
          </Button>
          <Button
            disabled={!publicToken || loadingAction !== null}
            variant="secondary"
            onClick={() => simulate("pending")}
          >
            <Clock3 size={18} />
            Pendente
          </Button>
          <Button
            disabled={!publicToken || loadingAction !== null}
            variant="secondary"
            onClick={() => simulate("reject")}
          >
            <XCircle size={18} />
            Rejeitar
          </Button>
        </div>

        {message ? (
          <p className="mt-4 rounded-md border border-marmoteiro-rose/30 bg-marmoteiro-rose/10 p-3 text-sm text-marmoteiro-wine">
            {message}
          </p>
        ) : null}

        {publicToken ? (
          <Link className="mt-6 inline-flex text-sm font-semibold text-marmoteiro-wine" href={`/agendamento/${publicToken}`}>
            Consultar agendamento
          </Link>
        ) : null}
      </Card>
    </main>
  );
}
