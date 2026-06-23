import Image from "next/image";
import { ArrowRightCircle, CircleHelp } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <header className="relative isolate overflow-hidden bg-black">
      <div className="figma-shell relative min-h-[520px] px-5 sm:px-8">
        <div className="absolute inset-y-0 right-0 -z-10 w-[78%] overflow-hidden opacity-90">
          <Image
            fill
            priority
            alt=""
            className="object-cover object-center"
            sizes="(max-width: 860px) 100vw, 720px"
            src="/assets/figma/hero-scene.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="flex min-h-[520px] max-w-[430px] flex-col justify-center py-10">
          <Image
            priority
            alt="O Tal do Marmoteiro"
            className="mb-9 h-auto w-36"
            height={73}
            src="/assets/figma/logo.png"
            width={160}
          />

          <h1 className="text-[2.35rem] font-medium leading-[1.12] tracking-[-0.02em] text-white sm:text-5xl">
            Baralho Cigano,{" "}
            <span className="font-semibold text-marmoteiro-amber">espiritualidade</span>,
            bate-papo e aquele{" "}
            <span className="font-semibold text-marmoteiro-amber">axé</span> com bom humor.
          </h1>
          <p className="mt-6 max-w-[390px] text-sm leading-6 text-white/82">
            Uma consulta online para quem busca direcionamento, clareza e
            aconselhamento intuitivo. Agende, pague e receba seu jogo com praticidade
            e acolhimento.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4">
            <a className={buttonClassName("primary") + " w-full max-w-[360px]"} href="#agendamento">
              Agendar meu jogo
              <ArrowRightCircle size={16} />
            </a>
            <a
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-marmoteiro-amber"
              href="#como-funciona"
            >
              Quero entender como funciona
              <CircleHelp size={16} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
