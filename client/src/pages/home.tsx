import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import FleetSection from "@/components/fleet-section";
import ToursSection from "@/components/tours-section";
import TestimonialsSection from "@/components/testimonials-section";
import ContactSection from "@/components/contact-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <FleetSection />
      <ToursSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
}
