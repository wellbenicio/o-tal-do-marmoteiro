import { ArrowRightCircle } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export function BenefitsSection() {
  const benefits = [
    {
      number: "01",
      title: "Atendimento acolhedor",
      text: "Selecione o melhor horário para sua consulta."
    },
    {
      number: "02",
      title: "Leitura intuitiva com Baralho Cigano",
      text: "Preencha suas informações para contato."
    },
    {
      number: "03",
      title: "Experiência leve, humana e espiritual",
      text: "Pagamento rápido e totalmente seguro."
    },
    {
      number: "04",
      title: "Praticidade total",
      text: "Acesse sua leitura online no horário agendado."
    }
  ];

  return (
    <Section>
      <div className="rounded-2xl border border-marmoteiro-amber/55 px-6 py-8 sm:px-10">
        <h2 className="text-center text-2xl font-medium">Por que consultar com o Marmoteiro?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="!bg-[#4d3500] shadow-amber">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-marmoteiro-amber text-[10px] font-black text-black">
                {benefit.number}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/62">{benefit.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <a className={buttonClassName("primary") + " w-full max-w-[300px]"} href="#agendamento">
            Agendar meu jogo
            <ArrowRightCircle size={16} />
          </a>
        </div>
      </div>
    </Section>
  );
}
