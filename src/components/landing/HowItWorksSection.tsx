import { ArrowRightCircle } from "lucide-react";
import { Section } from "@/components/ui/Section";

export function HowItWorksSection() {
  const steps = [
    {
      title: "Escolha seu horário",
      text: "Selecione o melhor horário para sua consulta."
    },
    {
      title: "Informe seus dados",
      text: "Preencha suas informações para contato."
    },
    {
      title: "Realize o pagamento",
      text: "Pagamento rápido e totalmente seguro."
    },
    {
      title: "Receba sua consulta",
      text: "Acesse sua leitura online no horário agendado."
    }
  ];

  return (
    <div className="bg-marmoteiro-charcoal text-white">
      <Section id="como-funciona" className="py-24 md:py-[90px]">
        <div className="mx-auto max-w-[1122px]">
          <div className="rounded-[28px] border border-marmoteiro-amber px-6 pb-20 pt-14 md:px-[60px] md:pb-[88px] md:pt-[62px]">
            <h2 className="text-center text-[2.35rem] font-normal leading-tight md:text-[2.75rem]">
              Sua consulta{" "}
              <span className="font-medium text-marmoteiro-amber">em 4 passos</span>
            </h2>

            <div className="mt-16 grid gap-7 md:grid-cols-2 md:gap-x-8 md:gap-y-9">
              {steps.map((step, index) => {
                const active = index === 3;
                return (
                  <div
                    key={step.title}
                    className={`min-h-[194px] rounded-lg border border-marmoteiro-amber p-6 md:p-8 ${
                      active ? "bg-marmoteiro-amber text-white" : "bg-transparent"
                    }`}
                  >
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-black ${
                        active ? "bg-white text-marmoteiro-amber" : "bg-marmoteiro-amber text-black"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-8 text-[2rem] font-normal leading-tight">{step.title}</p>
                    <p className={`mt-4 text-base leading-7 ${active ? "text-white/88" : "text-white/82"}`}>
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="-mt-8 flex items-center justify-center gap-14 px-6">
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
    </div>
  );
}
