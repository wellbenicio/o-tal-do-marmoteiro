import { Section } from "@/components/ui/Section";

export function Footer() {
  return (
    <footer className="border-t border-marmoteiro-wine/10">
      <Section className="flex flex-col gap-3 py-8 text-sm text-marmoteiro-ink/64 sm:flex-row sm:items-center sm:justify-between">
        <p>O Tal do Marmoteiro</p>
        <p>Cartomancia online com responsabilidade e acolhimento.</p>
      </Section>
    </footer>
  );
}
