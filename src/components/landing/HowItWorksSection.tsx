import { ArrowRightCircle } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
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
    <div className="bg-marmoteiro-charcoal text-white" id="como-funciona">
      <Section>
        <div className="rounded-2xl border border-marmoteiro-amber/55 px-6 py-8 sm:px-10">
          <h2 className="text-center text-2xl font-medium">
            Sua consulta <span className="font-semibold text-marmoteiro-amber">em 4 passos</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => {
              const active = index === 3;
              return (
                <div
                  key={step.title}
                  className={`rounded-md border border-marmoteiro-amber/55 p-5 ${
                    active ? "bg-marmoteiro-amber text-white" : "bg-transparent"
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                      active ? "bg-white text-marmoteiro-amber" : "bg-marmoteiro-amber text-black"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-5 text-lg font-semibold">{step.title}</p>
                  <p className={`mt-2 text-xs leading-5 ${active ? "text-white/85" : "text-white/60"}`}>
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <a className={buttonClassName("primary") + " w-full max-w-[300px]"} href="#agendamento">
              Agendar meu jogo
              <ArrowRightCircle size={16} />
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
