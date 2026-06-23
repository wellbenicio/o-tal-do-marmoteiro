import Image from "next/image";
import { ArrowRightCircle, CircleHelp } from "lucide-react";

export function HeroSection() {
  return (
    <header className="relative isolate overflow-hidden bg-black">
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-[62vw] max-w-[860px] overflow-hidden opacity-95 md:block">
        <Image
          fill
          priority
          alt=""
          className="object-cover object-left"
          sizes="62vw"
          src="/assets/figma/hero-scene.png"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="absolute inset-x-0 top-0 -z-10 h-[390px] md:hidden">
        <Image
          fill
          priority
          alt=""
          className="object-cover object-center opacity-65"
          sizes="100vw"
          src="/assets/figma/hero-scene.png"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/76 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/25 to-black/35" />
      </div>

      <div className="figma-shell relative min-h-[760px] md:min-h-[730px]">
        <div className="flex min-h-[760px] max-w-[540px] flex-col pb-16 pt-10 md:min-h-[730px] md:pt-[98px]">
          <Image
            priority
            alt="O Tal do Marmoteiro"
            className="mb-12 h-auto w-[146px] md:mb-14 md:w-[162px]"
            height={73}
            src="/assets/figma/logo.png"
            width={163}
          />

          <h1 className="max-w-[540px] text-[2.55rem] font-normal leading-[1.18] text-white sm:text-[3.35rem] md:text-[3.55rem]">
            Baralho Cigano,{" "}
            <span className="font-medium text-marmoteiro-amber">espiritualidade</span>,
            bate-papo e aquele{" "}
            <span className="font-medium text-marmoteiro-amber">axé</span> com bom humor.
          </h1>
          <p className="mt-7 max-w-[500px] text-base leading-7 text-white/88 md:text-[17px]">
            Uma consulta online para quem busca direcionamento, clareza e
            aconselhamento intuitivo. Agende, pague e receba seu jogo com praticidade
            e acolhimento.
          </p>

          <div className="mt-11 flex w-full max-w-[488px] flex-col items-center gap-7">
            <a
              className="orange-cta figma-glow inline-flex min-h-[68px] w-full items-center justify-center gap-3 rounded-full border border-marmoteiro-yellow px-8 text-base font-semibold text-white transition hover:brightness-110"
              href="#agendamento"
            >
              Agendar meu jogo
              <ArrowRightCircle size={18} />
            </a>
            <a
              className="inline-flex items-center gap-3 text-base text-white/90 hover:text-marmoteiro-amber"
              href="#como-funciona"
            >
              Quero entender como funciona
              <CircleHelp size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
