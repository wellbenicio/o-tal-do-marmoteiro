import { Section } from "@/components/ui/Section";

export function FaqSection() {
  const faqs = [
    {
      q: "Como recebo a confirmação?",
      a: "A confirmação aparece no status público do agendamento depois que o pagamento for aprovado."
    },
    {
      q: "Posso remarcar?",
      a: "Sim. Entre em contato pelo WhatsApp para avaliarmos uma nova disponibilidade."
    },
    {
      q: "A consulta é gravada?",
      a: "O MVP não inclui gravação automática. Combine detalhes diretamente no atendimento."
    },
    {
      q: "Como funciona o atendimento?",
      a: "Você agenda, paga e recebe a orientação online no horário marcado."
    }
  ];

  return (
    <Section id="faq" className="pb-20 pt-16">
      <h2 className="text-center text-4xl font-medium">Perguntas frequentes</h2>
      <p className="mt-3 text-center text-xs text-white/50">
        Confira as dúvidas mais comuns antes de agendar sua consulta online.
      </p>
      <div className="mt-10 divide-y divide-white/10">
        {faqs.map((faq) => (
          <details key={faq.q} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-white/80">
              {faq.q}
              <span className="text-marmoteiro-amber transition group-open:rotate-180">↓</span>
            </summary>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/58">{faq.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
