import { BookingForm } from "@/components/booking/BookingForm";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ImportantNotesSection } from "@/components/landing/ImportantNotesSection";
import { ServiceSection } from "@/components/landing/ServiceSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ServiceSection />
      <HowItWorksSection />
      <BookingForm />
      <BenefitsSection />
      <ImportantNotesSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
