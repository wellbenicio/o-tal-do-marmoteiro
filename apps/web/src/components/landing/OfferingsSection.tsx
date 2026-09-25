import { previewConfig } from "@/lib/preview-config";
import { DEMO_DURATION, DEMO_PRICE, money } from "@/lib/demo-bookings";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Video } from "lucide-react";
export function OfferingsSection() {
  return (
    <section className="home-offerings" id="modalidades">
      <div className="figma-shell">
        <div className="section-heading">
          <span className="section-eyebrow">DO SEU JEITO, NO SEU TEMPO</span>
          <h2>
            Às vezes, uma pergunta.
            <br />
            Às vezes, uma conversa.
          </h2>
          <p>Escolha o formato que faz mais sentido para o que você precisa agora.</p>
        </div>
        <div className="offering-grid">
          <article>
            <Video size={28} />
            <span>UM TEMPO SÓ SEU</span>
            <h3>Consulta online</h3>
            <strong>{money(DEMO_PRICE)} por videochamada</strong>
            <p>
              Uma conversa individual de {DEMO_DURATION} minutos para olhar sua
              situação com calma, abrir o jogo e aprofundar as questões que surgirem.
            </p>
            <Link href="/agendar">
              Escolher meu horário <ArrowUpRight size={19} />
            </Link>
          </article>
          <article>
            <MessageCircle size={28} />
            <span>UMA QUESTÃO DIRETA</span>
            <h3>Pergunta avulsa</h3>
            <strong>{money(previewConfig.question.amount)} por pergunta</strong>
            <p>
              Para quando você tem uma questão específica e quer uma leitura
              objetiva, sem precisar marcar uma consulta completa. A resposta é
              enviada por áudio, acompanhada da leitura realizada para a sua pergunta.
            </p>
            <Link href="/agendar?modalidade=pergunta">
              Fazer uma pergunta <ArrowUpRight size={19} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
