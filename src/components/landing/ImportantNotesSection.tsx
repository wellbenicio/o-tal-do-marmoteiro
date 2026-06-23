import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { Section } from "@/components/ui/Section";

export function ImportantNotesSection() {
  const notes = [
    "A consulta tem finalidade espiritual, intuitiva e reflexiva.",
    "Não substitui orientação médica, psicológica, jurídica ou financeira.",
    "O agendamento só é confirmado após a aprovação do pagamento.",
    "A leitura deve apoiar reflexão, não substituir suas decisões pessoais."
  ];

  return (
    <div className="bg-black">
      <Section className="py-16 md:py-20">
        <div className="relative min-h-[420px] overflow-hidden rounded-[28px] bg-marmoteiro-red p-7 pb-44 text-white md:p-[66px]">
          <div className="relative z-10 max-w-[645px]">
            <div className="rounded-lg bg-white px-8 py-8 text-marmoteiro-red md:px-9">
              <div className="flex items-center gap-8">
                <AlertTriangle size={84} strokeWidth={2.4} />
                <h2 className="text-[2.35rem] font-black leading-tight">
                Avisos importantes antes da consulta:
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <p key={note} className="rounded-lg border border-white bg-marmoteiro-red px-5 py-4 text-base leading-6">
                  {note}
                </p>
              ))}
            </div>
          </div>
          <Image
            alt=""
            className="absolute bottom-0 right-4 h-auto w-[230px] md:right-10 md:w-[318px]"
            height={415}
            src="/assets/figma/warning-person.png"
            width={255}
          />
        </div>
      </Section>
    </div>
  );
}
