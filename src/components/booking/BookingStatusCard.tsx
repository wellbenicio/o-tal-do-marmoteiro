import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/format";

export type BookingStatusCardData = {
  publicToken: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  service: {
    name: string;
    durationMinutes: number;
    priceCents: number;
    currency: string;
  };
};

export function BookingStatusCard({ booking }: { booking: BookingStatusCardData }) {
  return (
    <Card className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-marmoteiro-rose">
        Status do agendamento
      </p>
      <h1 className="mt-3 font-display text-4xl text-marmoteiro-ink">
        {getStatusLabel(booking.status)}
      </h1>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-marmoteiro-ink">Serviço</dt>
          <dd className="mt-1 text-marmoteiro-ink/70">{booking.service.name}</dd>
        </div>
        <div>
          <dt className="font-semibold text-marmoteiro-ink">Valor</dt>
          <dd className="mt-1 text-marmoteiro-ink/70">
            {formatCurrency(booking.service.priceCents, booking.service.currency)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-marmoteiro-ink">Início</dt>
          <dd className="mt-1 text-marmoteiro-ink/70">{formatDateTime(booking.scheduledStart)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-marmoteiro-ink">Duração</dt>
          <dd className="mt-1 text-marmoteiro-ink/70">
            {booking.service.durationMinutes} minutos
          </dd>
        </div>
      </dl>
      <p className="mt-6 rounded-md bg-marmoteiro-gold/15 p-3 text-sm leading-6 text-marmoteiro-ink/72">
        Token público: {booking.publicToken}
      </p>
    </Card>
  );
}
