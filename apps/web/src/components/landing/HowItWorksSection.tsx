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
    text: "Uma consulta online ou uma pergunta pelo WhatsApp.",
  },
  {
    icon: UserRound,
    title: "Entre no seu espaço",
    text: "Acesse sua conta, leia os documentos e configure seu atendimento.",
  },
  {
    icon: CreditCard,
    title: "Confirme o pagamento",
    text: "Revise o resumo e escolha a forma de pagamento.",
  },
  {
    icon: Sparkles,
    title: "Chegue como você é",
    text: "Acompanhe tudo e acesse sua consulta pela sua conta.",
  },
];
export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="home-steps">
      <div className="figma-shell">
        <div className="section-heading">
          <span className="section-eyebrow">DO SEU JEITO, NO SEU TEMPO</span>
          <h2>Seu próximo passo pode ser simples.</h2>
          <p>
            Da escolha do atendimento ao acompanhamento, tudo no mesmo lugar.
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
