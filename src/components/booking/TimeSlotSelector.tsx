import { clsx } from "clsx";

export function TimeSlotSelector({
  slots,
  selectedSlot,
  onSelect,
  loading
}: {
  slots: string[];
  selectedSlot: string;
  onSelect: (slot: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-marmoteiro-ink/64">Carregando horários...</p>;
  }

  if (!slots.length) {
    return (
      <p className="rounded-md border border-marmoteiro-wine/15 bg-white p-3 text-sm text-marmoteiro-ink/68">
        Nenhum horário disponível para esta data.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const label = new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo"
        }).format(new Date(slot));

        return (
          <button
            className={clsx(
              "min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition",
              selectedSlot === slot
                ? "border-marmoteiro-wine bg-marmoteiro-wine text-white"
                : "border-marmoteiro-wine/20 bg-white text-marmoteiro-ink hover:border-marmoteiro-rose"
            )}
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
