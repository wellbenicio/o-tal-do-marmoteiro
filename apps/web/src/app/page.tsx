import type { Metadata } from "next";
import { OfferingsSection } from "@/components/landing/OfferingsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ImportantNotesSection } from "@/components/landing/ImportantNotesSection";
import { ServiceSection } from "@/components/landing/ServiceSection";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { ExperienceSection } from "@/components/landing/ExperienceSection";
import { ClosingSection } from "@/components/landing/ClosingSection";
import "@/components/landing/home-v2.css";
import { MobileBookingBar } from "@/components/landing/MobileBookingBar";
const title = "O Tal do Marmoteiro | Consulta de Baralho Cigano Online";
const description =
  "Consulta online de Baralho Cigano com atendimento individual. Um espaço para conversar, olhar possibilidades e entender melhor os caminhos da sua situação.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};
export default function Home() {
  return (
    <div className="home-v2">
      <SiteHeader />
      <main>
        <HeroSection />
        <ExperienceSection />
        <ServiceSection />
        <OfferingsSection />
        <HowItWorksSection />
        <FaqSection />
        <ImportantNotesSection />
        <ClosingSection />
      </main>
      <Footer />
      <MobileBookingBar />
    </div>
  );
}
