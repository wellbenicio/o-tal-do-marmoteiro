import { DEMO_DURATION, DEMO_PRICE, money } from "@/lib/demo-bookings";
import { ArrowDown } from "lucide-react";

export function FaqSection() {
  const faqs = [
    {
      q: "Quanto tempo dura a consulta e qual é o valor?",
      a: `A consulta individual dura ${DEMO_DURATION} minutos e custa ${money(DEMO_PRICE)}. Durante esse tempo, podemos conversar e abrir o Baralho Cigano para as questões que fizerem sentido dentro do atendimento.`,
    },
    {
      q: "Posso remarcar?",
      a: "Sim. Você tem um reagendamento por sua iniciativa, sem cobrança adicional, solicitado com pelo menos 24 horas de antecedência. Após receber as opções, há 48 horas para escolher. O direito só é consumido ao confirmar o novo horário. Alterações provocadas pelo prestador não consomem esse direito.",
    },
    {
      q: "Preciso saber exatamente o que perguntar?",
      a: "Não. Você pode chegar com uma pergunta específica ou simplesmente explicar a situação que está vivendo. A partir da conversa, organizamos juntos os pontos que vale a pena olhar no jogo.",
    },
    {
      q: "Como funciona o atendimento?",
      a: "A consulta acontece online, individualmente e com horário reservado. Primeiro conversamos sobre a situação e, a partir dela, fazemos a leitura das cartas e aprofundamos os pontos que surgirem.",
    },
    {
      q: "O Baralho Cigano prevê o futuro?",
      a: "A leitura pode apontar tendências, possibilidades e dinâmicas presentes na situação, mas não trato as cartas como uma sentença definitiva. Escolhas, circunstâncias e caminhos podem mudar.",
    },
    {
      q: "Que tipo de assunto posso levar para a consulta?",
      a: "Relacionamentos, trabalho, dinheiro, decisões, conflitos, caminhos pessoais e questões espirituais são alguns exemplos. Se houver algum tema que eu não atenda, isso será informado com transparência.",
    },
  ];

  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-heading">
      <div className="figma-shell">
        <h2 id="faq-heading" className="faq-heading">
          Perguntas frequentes
        </h2>
        <p className="faq-subtitle">
          Confira as dúvidas mais comuns antes de agendar seu atendimento.
        </p>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.q} className="faq-item" open={index === 0}>
              <summary className="faq-question">
                <span>{faq.q}</span>
                <ArrowDown
                  aria-hidden="true"
                  className="faq-arrow"
                  size={26}
                  strokeWidth={1.2}
                />
              </summary>
              <p className="faq-answer">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
