import { Button } from "@/components/ui/button";
import { CalendarDays, Phone } from "lucide-react";
import { Link } from "wouter";
import BookingWidget from "./booking-widget";

export default function HeroSection() {
  return (
    <section className="hero-bg min-h-screen flex items-center pt-24 pb-20 px-4 relative">
      {/* Noise overlay */}
      <div className="noise-overlay"></div>
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-white animate-fade-in-up">
            <div className="inline-block border border-coco-gold/30 px-4 py-1 rounded-full mb-6 backdrop-blur-sm">
              <p className="text-coco-gold text-[9px] tracking-[0.3em] uppercase font-bold">
                TRANSPORTE PREMIUM
              </p>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[0.9] mb-6 drop-shadow-2xl">
              Transporte <br />
              <span className="text-gradient-gold italic font-light">Premium</span> en <br />
              República Dominicana
            </h1>
            
            <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-light mb-8">
              Servicio de transporte turístico confiable y cómodo. Desde aeropuertos hasta destinos paradisíacos, te llevamos con seguridad y estilo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-coco-gold hover:text-black transition shadow-[0_0_20px_rgba(255,255,255,0.2)] font-bold uppercase text-xs tracking-[0.2em]"
                data-testid="button-book-now"
              >
                <Link href="/booking">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Reservar Ahora
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-coco-gold text-coco-gold hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
                data-testid="button-call-now"
              >
                <a href="tel:+18496542047">
                  <Phone className="w-5 h-5 mr-2" />
                  +1 (849) 654-2047
                </a>
              </Button>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="relative z-20 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <BookingWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
