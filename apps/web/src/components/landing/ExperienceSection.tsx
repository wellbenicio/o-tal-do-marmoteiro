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
          Tem pergunta que pede uma resposta. Tem situação que precisa ser
          olhada com mais calma.
        </p>
        <p>
          No atendimento, o Baralho Cigano entra como ferramenta para organizar
          caminhos, possibilidades e pontos que talvez ainda não estejam tão claros.
        </p>
        <div className="experience-values">
          <span>
            <HeartHandshake /> Espaço para falar sem julgamento
          </span>
          <span>
            <MessageCircle /> Conversa direta e individual
          </span>
          <span>
            <LockKeyhole /> Leitura focada na sua situação
          </span>
        </div>
        <Link href="/agendar" className="text-link">
          Entenda como funciona <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
