import Link from "next/link";
import { ArrowUpRight, MessageCircle, Video } from "lucide-react";
export function OfferingsSection() {
  return (
    <section className="home-offerings" id="modalidades">
      <div className="figma-shell">
        <div className="section-heading">
          <span className="section-eyebrow">DOIS JEITOS DE SE ENCONTRAR</span>
          <h2>
            Às vezes, uma pergunta.
            <br />
            Às vezes, uma conversa.
          </h2>
          <p>Escolha o espaço que faz sentido para o seu momento.</p>
        </div>
        <div className="offering-grid">
          <article>
            <Video size={28} />
            <span>UM TEMPO SÓ SEU</span>
            <h3>Consulta online</h3>
            <p>
              Uma conversa individual de 30 minutos, com horário marcado e
              espaço para aprofundar seus caminhos.
            </p>
            <Link href="/agendar">
              Escolher meu horário <ArrowUpRight size={19} />
            </Link>
          </article>
          <article>
            <MessageCircle size={28} />
            <span>UM NOVO OLHAR</span>
            <h3>Pergunta avulsa</h3>
            <p>
              Receba pelo WhatsApp a foto do jogo e um áudio com a
              interpretação. Até 48 horas úteis após confirmar o pagamento.
            </p>
            <Link href="/agendar?modalidade=pergunta">
              Conhecer a pergunta avulsa <ArrowUpRight size={19} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
