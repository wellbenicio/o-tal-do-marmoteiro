import { Section } from "@/components/ui/Section";

export function HowItWorksSection() {
  const steps = [
    "Escolha um horário disponível.",
    "Preencha seus dados de contato.",
    "Faça o pagamento no checkout mockado.",
    "Consulte o status pelo link público do agendamento."
  ];

  return (
    <div className="bg-marmoteiro-wine text-white" id="como-funciona">
      <Section>
        <h2 className="font-display text-4xl">Como funciona</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-md border border-white/20 p-5">
              <span className="text-sm font-semibold text-marmoteiro-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 leading-7 text-white/82">{step}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
