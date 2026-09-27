"use client";
import { LockKeyhole, MessageCircle } from "lucide-react";
import type { DemoBooking } from "@/lib/demo-bookings";
import { useAdminIdentity } from "./AdminAccess";
export function PrivateQuestion({
  booking,
  customerName,
  phone,
}: Readonly<{
  booking: DemoBooking;
  customerName: string;
  phone: string;
}>) {
  useAdminIdentity();
  if (booking.modality !== "QUESTION") return null;
  return (
    <section
      className="mg-private-question"
      aria-label={`Pergunta de ${customerName}`}
    >
      <div>
        <span>
          <LockKeyhole size={14} />
          PERGUNTA DO CONSULENTE
        </span>
        <span>Conteúdo restrito</span>
      </div>
      {booking.question?.text ? (
        <>
          <blockquote>{booking.question.text}</blockquote>
          {booking.question.context && (
            <details>
              <summary>Contexto informado</summary>
              <p>{booking.question.context}</p>
            </details>
          )}
        </>
      ) : (
        <p>
          A pergunta não foi registrada neste exemplo antigo. Novos pedidos
          coletam o texto antes do pagamento; o atendimento só poderá ser
          iniciado quando houver pergunta.
        </p>
      )}
      <footer>
        <MessageCircle size={16} />
        <span>
          Responder pelo WhatsApp de {customerName}: <strong>{phone}</strong>
        </span>
      </footer>
    </section>
  );
}
