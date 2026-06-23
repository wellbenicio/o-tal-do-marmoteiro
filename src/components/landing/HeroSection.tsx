import { CalendarDays, Sparkles } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  return (
    <header className="overflow-hidden border-b border-marmoteiro-wine/10">
      <div className="mx-auto grid min-h-[620px] w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="space-y-7">
          <Badge>Cartomancia online</Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-5xl leading-[1.02] text-marmoteiro-ink sm:text-6xl lg:text-7xl">
              O Tal do Marmoteiro
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-marmoteiro-ink/78">
              Jogo de Cartomancia com Baralho Cigano para clareza, direção e reflexão.
              Um encontro online de 30 minutos com acolhimento, intuição e aquele
              humor que desarma o coração.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a className={buttonClassName("primary")} href="#agendamento">
              <CalendarDays size={18} />
              Agendar consulta
            </a>
            <a className={buttonClassName("secondary")} href="#como-funciona">
              <Sparkles size={18} />
              Como funciona
            </a>
          </div>
        </div>

        <div className="relative min-h-[430px]">
          <div className="absolute left-1/2 top-1/2 h-80 w-56 -translate-x-1/2 -translate-y-1/2 rotate-[-9deg] rounded-md border border-marmoteiro-gold/55 bg-marmoteiro-wine p-4 shadow-soft">
            <div className="flex h-full flex-col justify-between rounded-md border border-marmoteiro-gold/50 bg-marmoteiro-paper p-5 text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-marmoteiro-wine">
                Baralho
              </span>
              <span className="font-display text-7xl text-marmoteiro-gold">✦</span>
              <span className="text-sm text-marmoteiro-ink/70">Clareza e caminho</span>
            </div>
          </div>
          <div className="absolute left-[18%] top-[18%] h-72 w-48 rotate-[11deg] rounded-md border border-marmoteiro-wine/20 bg-marmoteiro-gold/80 p-4 shadow-soft">
            <div className="card-pattern h-full rounded-md border border-marmoteiro-paper/70" />
          </div>
          <div className="absolute bottom-[12%] right-[8%] h-64 w-44 rotate-[18deg] rounded-md border border-marmoteiro-wine/20 bg-marmoteiro-leaf p-4 shadow-soft">
            <div className="h-full rounded-md border border-marmoteiro-paper/70 bg-marmoteiro-paper/20" />
          </div>
        </div>
      </div>
    </header>
  );
}
