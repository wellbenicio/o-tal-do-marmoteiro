import { ArrowDown } from "lucide-react";

export function FaqSection() {
  const faqs = [
    {
      q: "Quanto tempo dura e qual é o valor?",
      a: "A consulta individual de Baralho Cigano dura 30 minutos. O valor de referência desta versão é R$ 70, também exibido no resumo antes do pagamento.",
    },
    {
      q: "Posso remarcar?",
      a: "Sim. Você tem um reagendamento por sua iniciativa, sem cobrança adicional, solicitado com pelo menos 24 horas de antecedência. Após receber as opções, há 48 horas para escolher. O direito só é consumido ao confirmar o novo horário. Alterações provocadas pelo prestador não consomem esse direito.",
    },
    {
      q: "Onde ficam minhas consultas e anotações?",
      a: "Na sua área, você acompanha os próximos horários, o histórico de consultas, os pagamentos e os materiais compartilhados. Cada consulta poderá ter seu próprio link de anotações no Notion.",
    },
    {
      q: "Como funciona o atendimento?",
      a: "O atendimento é online. Você escolhe a modalidade, acessa sua conta, lê os documentos, configura seu atendimento e realiza o pagamento. Depois da confirmação, é só se preparar para a consulta no horário agendado.",
    },
  ];

  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-heading">
      <div className="figma-shell">
        <h2 id="faq-heading" className="faq-heading">
          Perguntas frequentes
        </h2>
        <p className="faq-subtitle">
          Confira as dúvidas mais comuns antes de agendar sua consulta online.
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
