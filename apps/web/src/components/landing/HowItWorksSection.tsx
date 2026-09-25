import {
  CalendarDays,
  UserRound,
  CreditCard,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { BookingLink } from "./BookingLink";
const steps = [
  {
    icon: CalendarDays,
    title: "Escolha seu atendimento",
    text: "Decida entre uma consulta completa ou uma pergunta avulsa.",
  },
  {
    icon: UserRound,
    title: "Escolha seu horário",
    text: "Veja os horários disponíveis e reserve o que funciona melhor para você.",
  },
  {
    icon: CreditCard,
    title: "Confirme o pagamento",
    text: "Finalize sua reserva pelo meio de pagamento disponível.",
  },
  {
    icon: Sparkles,
    title: "Chegue como você é",
    text: "No horário marcado, entre na chamada e traga o que você quiser conversar.",
  },
];
export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="home-steps">
      <div className="figma-shell">
        <div className="section-heading">
          <span className="section-eyebrow">SEM COMPLICAÇÃO</span>
          <h2>Seu próximo passo pode ser simples.</h2>
          <p>
            Da escolha do atendimento até a conversa, você resolve tudo online.
          </p>
        </div>
        <ol className="home-steps-grid">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <div className="home-step-top">
                <span className="home-step-icon">
                  <Icon size={24} />
                </span>
                <span className="home-step-number">0{i + 1}</span>
                {i < 3 && <ArrowRight className="home-step-arrow" size={18} />}
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="home-center-cta">
          <BookingLink />
        </div>
      </div>
    </section>
  );
}
