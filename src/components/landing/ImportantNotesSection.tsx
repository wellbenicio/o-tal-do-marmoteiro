import { AlertTriangle } from "lucide-react";
import { Section } from "@/components/ui/Section";

export function ImportantNotesSection() {
  return (
    <div className="bg-marmoteiro-gold/18">
      <Section className="py-10">
        <div className="flex flex-col gap-4 rounded-md border border-marmoteiro-gold/45 bg-marmoteiro-paper p-5 sm:flex-row">
          <AlertTriangle className="shrink-0 text-marmoteiro-wine" size={24} />
          <div className="space-y-2 text-sm leading-6 text-marmoteiro-ink/76">
            <p>A consulta tem finalidade espiritual, intuitiva e reflexiva.</p>
            <p>Não substitui orientação médica, psicológica, jurídica ou financeira.</p>
            <p>O agendamento só é confirmado após a aprovação do pagamento.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
