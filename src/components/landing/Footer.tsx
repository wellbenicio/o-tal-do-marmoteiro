import Image from "next/image";
import { Section } from "@/components/ui/Section";

export function Footer() {
  return (
    <footer className="bg-[#1f1f1f]">
      <Section className="flex flex-col gap-8 py-9 text-xs text-white/58 sm:flex-row sm:items-center sm:justify-between">
        <Image alt="O Tal do Marmoteiro" height={73} src="/assets/figma/logo.png" width={163} />
        <div>
          <p className="font-semibold text-white">Contato</p>
          <p className="mt-3">Nosso WhatsApp</p>
          <p>Agenda demonstração</p>
          <p>Central de ajuda</p>
        </div>
        <div>
          <p>Marmoteiro - Todos os direitos reservados</p>
          <p>Termos e Políticas de Privacidade</p>
        </div>
      </Section>
    </footer>
  );
}
