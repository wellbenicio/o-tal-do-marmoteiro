import Image from "next/image";
import { ChartNoAxesColumnIncreasing, Handshake, Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export function ServiceSection() {
  const items = [
    {
      icon: Heart,
      title: "Relacionamentos",
      text: "Entenda sentimentos, intenções e próximos passos."
    },
    {
      icon: ChartNoAxesColumnIncreasing,
      title: "Trabalho e Finanças",
      text: "Clareza para decisões profissionais e oportunidades."
    },
    {
      icon: MessageCircle,
      title: "Orientação Espiritual",
      text: "Mensagens e direcionamentos para seu momento."
    },
    {
      icon: Handshake,
      title: "Atendimento imediato",
      text: "Receba sua consulta sem sair de casa."
    }
  ];

  return (
    <Section id="servico" className="pb-10 pt-20">
      <div className="relative mx-auto max-w-[650px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-marmoteiro-amber p-8 text-white shadow-soft sm:min-h-[300px]">
          <div className="absolute bottom-0 left-3 hidden w-64 sm:block">
            <Image alt="" height={350} src="/assets/figma/service-person.png" width={280} />
          </div>
          <div className="ml-auto max-w-[330px] py-8">
            <p className="text-4xl font-black leading-[0.88] text-white/30 sm:text-5xl">
              Marmo teiro
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Simples, rápido e online.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/85">
              Encontre respostas para o amor, trabalho e suas principais dúvidas em
              uma sessão de cartomancia online de 30 minutos.
            </p>
          </div>
        </div>

        <div className="-mt-12 grid gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <Card key={item.title} className="relative z-10 !bg-[#4d3500]/95 p-4 shadow-amber">
              <item.icon className="text-marmoteiro-amber" size={18} />
              <h3 className="mt-4 text-sm font-semibold text-marmoteiro-amber">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-white/72">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
