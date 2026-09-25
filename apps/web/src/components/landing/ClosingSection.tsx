import { DEMO_DURATION, DEMO_PRICE, money } from "@/lib/demo-bookings";
import { Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";
export function ClosingSection() {
  return (
    <section className="closing-section figma-shell">
      <span className="closing-symbol">
        <Sparkles size={35} />
      </span>
      <div>
        <span className="section-eyebrow">VAMOS CONVERSAR?</span>
        <h2>Reserve um momento para você.</h2>
        <p>
          {DEMO_DURATION} minutos · Atendimento online · {money(DEMO_PRICE)}
        </p>
      </div>
      <Link href="/agendar" className="product-button">
        Escolher meu horário <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
