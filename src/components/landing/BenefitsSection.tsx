import { HeartHandshake, ShieldCheck, SmilePlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export function BenefitsSection() {
  const benefits = [
    {
      icon: HeartHandshake,
      title: "Acolhimento",
      text: "Uma leitura humana, respeitosa e sem julgamento."
    },
    {
      icon: SmilePlus,
      title: "Linguagem acessível",
      text: "Espiritualidade com leveza, presença e conversa boa."
    },
    {
      icon: ShieldCheck,
      title: "Privacidade",
      text: "Coleta mínima de dados e status público sem informações sensíveis."
    }
  ];

  return (
    <Section>
      <h2 className="font-display text-4xl">O que você encontra aqui</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.title}>
            <benefit.icon className="text-marmoteiro-rose" size={24} />
            <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-6 text-marmoteiro-ink/70">{benefit.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
