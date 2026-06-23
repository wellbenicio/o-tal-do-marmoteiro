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
      <Section className="py-8">
        <div className="relative overflow-hidden rounded-xl bg-marmoteiro-red p-6 text-white sm:p-8">
          <div className="relative z-10 max-w-[470px] rounded-md bg-white p-5 text-marmoteiro-red">
            <div className="flex items-center gap-4">
              <AlertTriangle size={46} />
              <h2 className="text-2xl font-black leading-tight">
                Avisos importantes antes da consulta:
              </h2>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {notes.map((note) => (
                <p key={note} className="rounded border border-marmoteiro-red/35 p-3 text-xs leading-5">
                  {note}
                </p>
              ))}
            </div>
          </div>
          <Image
            alt=""
            className="absolute bottom-0 right-4 hidden h-auto w-56 sm:block"
            height={415}
            src="/assets/figma/warning-person.png"
            width={255}
          />
        </div>
      </Section>
    </div>
  );
}
