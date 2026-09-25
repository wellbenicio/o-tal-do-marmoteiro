import { DEMO_DURATION, DEMO_PRICE, money } from "@/lib/demo-bookings";
import Image from "next/image";
import { ArrowDown, Clock3, Video, Sparkles } from "lucide-react";
import { BookingLink } from "./BookingLink";

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-art" aria-hidden="true">
        <Image
          src="/assets/landing/hero-scene.webp"
          alt=""
          width={1109}
          height={1231}
          priority
          sizes="(max-width: 700px) 700px, 1109px"
        />
      </div>
      <div className="figma-shell hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span /> UM MOMENTO SÓ SEU
          </p>
          <h1 id="hero-title">
            Um pouco de clareza.
            <br />
            Uma boa conversa.
            <br />
            <em>E aquele axé.</em>
          </h1>
          <p>
            Baralho Cigano, escuta e bom humor para olhar com mais carinho para
            o seu momento.
          </p>
          <div className="hero-facts">
            <span>
              <Clock3 size={16} /> {DEMO_DURATION} minutos
            </span>
            <span>
              <Video size={17} /> Online e individual
            </span>
          </div>
          <div className="hero-actions">
            <BookingLink />
            <p className="hero-price">
              Sua consulta por <strong>{money(DEMO_PRICE)}</strong>
              <span>Horários de Brasília</span>
            </p>
          </div>
          <a className="hero-explain" href="#sobre">
            Conheça a experiência <ArrowDown size={15} />
          </a>
        </div>
      </div>
      <div className="hero-signature">
        <Sparkles size={15} />
        <span>Espiritualidade com os pés no chão.</span>
      </div>
    </section>
  );
}
