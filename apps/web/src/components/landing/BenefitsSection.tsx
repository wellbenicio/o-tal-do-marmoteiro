import { BookingLink } from "./BookingLink";

const benefits = [
  {
    title: "Atendimento acolhedor",
    text: "Um espaço de escuta e respeito para o seu momento.",
  },
  {
    title: "Leitura intuitiva com Baralho Cigano",
    text: "Clareza e direcionamento para suas perguntas.",
  },
  {
    title: "Experiência leve, humana e espiritual",
    text: "Uma conversa com acolhimento e bom humor.",
  },
  {
    title: "Praticidade total",
    text: "Acesse sua leitura online no horário agendado.",
  },
];

export function BenefitsSection() {
  return (
    <section className="benefits-section" aria-labelledby="benefits-title">
      <div className="figma-shell framed-panel benefits-panel">
        <h2 id="benefits-title">Por que consultar com o Marmoteiro?</h2>
        <div className="numbered-grid">
          {benefits.map((benefit, index) => (
            <article className="numbered-card benefit-card" key={benefit.title}>
              <span className="numbered-badge">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
        <div className="panel-action">
          <BookingLink />
        </div>
      </div>
    </section>
  );
}
