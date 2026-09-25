import Image from "next/image";
import { MonitorSmartphone } from "lucide-react";

const services = [
  {
    title: "Relacionamentos",
    text: "Entenda sentimentos, intenções e próximos passos.",
  },
  {
    title: "Trabalho e Finanças",
    text: "Clareza para decisões profissionais e oportunidades.",
  },
  {
    title: "Orientação Espiritual",
    text: "Mensagens e direcionamentos para seu momento.",
  },
  {
    title: "Atendimento online",
    text: "Receba sua consulta sem sair de casa.",
  },
];

export function ServiceSection() {
  return (
    <section
      id="servico"
      className="service-section"
      aria-labelledby="service-title"
    >
      <div className="figma-shell">
        <div className="service-stage">
          <div className="service-phone" aria-hidden="true">
            <span className="service-camera" />
          </div>
          <div className="service-illustration" aria-hidden="true">
            <Image
              src="/assets/landing/service-art.webp"
              alt=""
              width={480}
              height={440}
              sizes="480px"
            />
          </div>
          <div className="service-copy">
            <h2 id="service-title">
              Simples, rápido
              <br />e online.
            </h2>
            <p>
              Encontre respostas para o amor, trabalho e suas principais dúvidas
              em uma sessão de cartomancia online de 30 minutos.
            </p>
          </div>
        </div>
        <div className="service-cards">
          {services.map(({ title, text }) => (
            <article className="service-card" key={title}>
              <MonitorSmartphone
                size={24}
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
