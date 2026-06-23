import { Section } from "@/components/ui/Section";

export function FaqSection() {
  const faqs = [
    {
      q: "Quando meu horário fica confirmado?",
      a: "Somente depois da aprovação do pagamento. Antes disso, o sistema mantém uma reserva temporária."
    },
    {
      q: "O atendimento é presencial?",
      a: "Não. O serviço inicial é online e dura 30 minutos."
    },
    {
      q: "O que acontece se o pagamento não for aprovado?",
      a: "O agendamento não é confirmado e o horário volta a ficar disponível após a expiração da reserva."
    }
  ];

  return (
    <Section id="faq">
      <h2 className="font-display text-4xl">Perguntas frequentes</h2>
      <div className="mt-8 divide-y divide-marmoteiro-wine/15 rounded-md border border-marmoteiro-wine/15 bg-marmoteiro-paper">
        {faqs.map((faq) => (
          <details key={faq.q} className="group p-5">
            <summary className="cursor-pointer list-none font-semibold">{faq.q}</summary>
            <p className="mt-3 leading-7 text-marmoteiro-ink/70">{faq.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
