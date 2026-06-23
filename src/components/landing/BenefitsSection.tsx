import { ArrowRightCircle } from "lucide-react";
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
    <Section className="py-20 md:py-24">
      <div className="rounded-[28px] border border-marmoteiro-amber px-6 py-14 md:px-[60px] md:py-[66px]">
        <h2 className="text-center text-[2.35rem] font-normal leading-tight md:text-[2.75rem]">
          Por que consultar com o Marmoteiro?
        </h2>
        <div className="mt-16 grid gap-7 md:grid-cols-2 md:gap-x-8 md:gap-y-9">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="figma-glow min-h-[232px] !rounded-lg !border-[#f4df00] !bg-[#4b3100] p-8"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-marmoteiro-amber text-sm font-black text-black">
                {benefit.number}
              </span>
              <h3 className="mt-8 text-[2rem] font-normal leading-tight">{benefit.title}</h3>
              <p className="mt-4 text-base leading-7 text-white/84">{benefit.text}</p>
            </Card>
          ))}
        </div>
        <div className="-mb-8 mt-16 flex items-center justify-center gap-14">
          <span className="hidden h-px flex-1 bg-marmoteiro-amber/55 sm:block" />
          <a
            className="orange-cta figma-glow inline-flex min-h-[68px] w-full max-w-[488px] items-center justify-center gap-3 rounded-full border border-marmoteiro-yellow px-8 text-base font-semibold text-white transition hover:brightness-110"
            href="#agendamento"
          >
            Agendar meu jogo
            <ArrowRightCircle size={18} />
          </a>
          <span className="hidden h-px flex-1 bg-marmoteiro-amber/55 sm:block" />
        </div>
      </div>
    </Section>
  );
}
