import { Button } from "@/components/ui/button";
import { CalendarDays, Phone } from "lucide-react";
import { Link } from "wouter";
import BookingWidget from "./booking-widget";

export default function HeroSection() {
  return (
    <section className="hero-bg min-h-screen flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transporte <span className="text-secondary">Premium</span> en República Dominicana
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Servicio de transporte turístico confiable y cómodo. Desde aeropuertos hasta destinos paradisíacos, te llevamos con seguridad y estilo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90" data-testid="button-book-now">
                <Link href="/booking">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Reservar Ahora
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-primary"
                data-testid="button-call-now"
              >
                <a href="tel:+18496542047">
                  <Phone className="w-5 h-5 mr-2" />
                  +1 (849) 654-2047
                </a>
              </Button>
            </div>
          </div>
          
          <BookingWidget />
        </div>
      </div>
    </section>
  );
}
