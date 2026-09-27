import Link from "next/link";
import { Info, ArrowUpRight } from "lucide-react";
import "./lower-sections.css";
export function ImportantNotesSection() {
  return (
    <section className="home-notice figma-shell">
      <Info size={22} />
      <div>
        <h2>Acolhimento também é transparência.</h2>
        <p>
          O atendimento é um espaço de escuta e orientação através do Baralho
          Cigano. Não substitui acompanhamento médico, psicológico, jurídico
          ou financeiro profissional.
        </p>
      </div>
      <Link href="/termos">
        Entenda como funciona <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}
