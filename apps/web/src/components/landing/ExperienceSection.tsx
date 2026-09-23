import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
} from "lucide-react";

export function ExperienceSection() {
  return (
    <section id="sobre" className="experience-section figma-shell">
      <div className="experience-art">
        <Image
          src="/assets/marmoteiro-baralho.png"
          width={663}
          height={677}
          alt="Personagem do Marmoteiro com seu Baralho Cigano"
          sizes="(max-width: 760px) 100vw, 460px"
        />
        <span className="experience-caption">
          O TAL DO MARMOTEIRO <span>Cartomancia, conversa e acolhimento.</span>
        </span>
      </div>
      <div className="experience-copy">
        <span className="section-eyebrow">MAIS DO QUE VIRAR CARTAS</span>
        <h2>
          Uma conversa com
          <br />
          <em>espaço para você.</em>
        </h2>
        <p>
          Tem pergunta que pede uma pausa. Aqui, o Baralho Cigano é um convite
          para refletir sobre relacionamentos, trabalho e os caminhos que fazem
          sentido para o seu momento.
        </p>
        <p>
          Uma consulta individual, com leveza e acolhimento, sem sair de casa.
        </p>
        <div className="experience-values">
          <span>
            <HeartHandshake /> Escuta sem julgamento
          </span>
          <span>
            <MessageCircle /> Conversa de verdade
          </span>
          <span>
            <LockKeyhole /> Um espaço reservado
          </span>
        </div>
        <Link href="/agendar" className="text-link">
          Escolher meu horário <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
