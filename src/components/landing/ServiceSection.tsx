import { Clock, CreditCard, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export function ServiceSection() {
  const items = [
    {
      icon: Clock,
      title: "30 minutos",
      text: "Tempo direto para olhar a questão principal com calma e foco."
    },
    {
      icon: Video,
      title: "Online",
      text: "Atendimento remoto para você participar de onde estiver."
    },
    {
      icon: CreditCard,
      title: "Pagamento antes",
      text: "A confirmação só acontece depois da aprovação do pagamento."
    }
  ];

  return (
    <Section id="servico">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-marmoteiro-rose">
            Serviço inicial
          </p>
          <h2 className="mt-3 font-display text-4xl text-marmoteiro-ink">
            Jogo de Cartomancia — 30 minutos
          </h2>
          <p className="mt-4 text-base leading-7 text-marmoteiro-ink/72">
            Uma consulta online com Baralho Cigano para direcionamento, clareza e
            reflexão espiritual/intuitiva. A proposta é acolher sem prometer milagre
            e orientar sem substituir decisões profissionais.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <Card key={item.title}>
              <item.icon className="text-marmoteiro-wine" size={24} />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-marmoteiro-ink/70">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
