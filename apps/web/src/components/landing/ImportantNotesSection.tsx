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
          A consulta tem finalidade espiritual, intuitiva e reflexiva. Não
          substitui orientação médica, psicológica, jurídica ou financeira. Seu
          horário é confirmado após a aprovação do pagamento.
        </p>
      </div>
      <Link href="/termos">
        Orientações da consulta <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}
