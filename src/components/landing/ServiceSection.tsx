import Image from "next/image";
import { MonitorSmartphone } from "lucide-react";
import { Section } from "@/components/ui/Section";

export function ServiceSection() {
  const items = [
    {
      title: "Relacionamentos",
      text: "Entenda sentimentos, intenções e próximos passos."
    },
    {
      title: "Trabalho e Finanças",
      text: "Clareza para decisões profissionais e oportunidades."
    },
    {
      title: "Orientação Espiritual",
      text: "Mensagens e direcionamentos para seu momento."
    },
    {
      title: "Atendimento Imediato",
      text: "Receba sua consulta sem sair de casa."
    }
  ];

  return (
    <Section id="servico" className="pb-24 pt-4 md:-mt-8 md:pb-28 md:pt-0">
      <div className="relative mx-auto max-w-[1122px]">
        <div className="relative mx-auto overflow-visible md:min-h-[520px]">
          <div className="relative min-h-[590px] overflow-hidden rounded-[32px] border border-[#5b55ce] bg-marmoteiro-amber md:absolute md:inset-x-[56px] md:top-0 md:min-h-[430px] md:rounded-[48px]">
            <p className="pointer-events-none absolute left-8 top-9 text-[5.5rem] font-black leading-[0.86] text-white/20 md:left-14 md:text-[7.5rem]">
              Marmo
              <br />
              teiro
            </p>

            <Image
              priority
              alt="Marmoteiro em atendimento online pelo celular"
              className="absolute bottom-0 left-1/2 z-10 h-auto w-[410px] max-w-none -translate-x-1/2 md:left-0 md:w-[480px] md:translate-x-0"
              height={430}
              src="/assets/figma/service-person-large.png"
              width={437}
            />

            <span className="absolute right-8 top-1/2 hidden h-[126px] w-10 -translate-y-1/2 rounded-full bg-black md:block" />
          </div>

          <div className="absolute left-8 right-8 top-10 z-20 text-white md:left-auto md:right-[112px] md:top-[132px] md:max-w-[470px]">
            <h2 className="text-[3rem] font-normal leading-[1.16] md:text-[3.35rem]">
              Simples, rápido
              <br />e online.
            </h2>
            <p className="mt-7 max-w-[430px] text-base leading-7 text-white/90 md:text-[17px]">
              Encontre respostas para o amor, trabalho e suas principais dúvidas em
              uma sessão de cartomancia online de 30 minutos.
            </p>
          </div>

          <div className="relative z-30 mt-5 grid gap-5 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="figma-glow min-h-[186px] rounded-lg border border-[#f4df00] bg-[#4b3100] p-7 text-white"
              >
                <MonitorSmartphone className="text-marmoteiro-amber" size={24} strokeWidth={1.8} />
                <h3 className="mt-7 text-[1.28rem] font-normal leading-tight text-marmoteiro-amber">
                  {item.title}
                </h3>
                <p className="mt-7 text-[15px] leading-6 text-white/92">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
