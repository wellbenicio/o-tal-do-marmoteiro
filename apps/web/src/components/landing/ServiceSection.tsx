import Image from "next/image";
import { MonitorSmartphone } from "lucide-react";

const services = [
  {
    title: "Relacionamentos",
    text: "Entenda melhor vínculos, conflitos, sentimentos e possibilidades.",
  },
  {
    title: "Trabalho e finanças",
    text: "Olhe para decisões profissionais, dinheiro, oportunidades e caminhos possíveis.",
  },
  {
    title: "Orientação espiritual",
    text: "Questões espirituais tratadas com respeito, responsabilidade e sem alarmismo.",
  },
  {
    title: "Atendimento online",
    text: "Faça sua consulta de onde estiver, com privacidade e horário reservado.",
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
              Você traz a situação. A gente conversa, abre o jogo e olha para o que
              as cartas mostram — com tempo para aprofundar o que realmente importa.
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
