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
    return <p className="text-sm text-white/70">Carregando horários...</p>;
  }

  if (!slots.length) {
    return (
      <p className="min-h-12 rounded border border-white/55 bg-transparent p-3 text-sm text-white/70">
        Nenhum horário disponível para esta data.
      </p>
    );
  }

  return (
    <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto pr-1">
      {slots.map((slot) => {
        const label = new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo"
        }).format(new Date(slot));

        return (
          <button
            className={clsx(
              "min-h-12 rounded border px-2 py-2 text-sm font-semibold transition",
              selectedSlot === slot
                ? "border-marmoteiro-amber bg-marmoteiro-amber text-black"
                : "border-white/20 bg-black/25 text-white hover:border-marmoteiro-amber"
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
