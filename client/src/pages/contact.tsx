import ContactSection from "@/components/contact-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export default function Contact() {
  const operatingHours = [
    { day: "Lunes - Viernes", hours: "6:00 AM - 10:00 PM" },
    { day: "Sábados", hours: "6:00 AM - 10:00 PM" },
    { day: "Domingos", hours: "6:00 AM - 10:00 PM" },
  ];

  const serviceAreas = [
    {
      area: "Punta Cana",
      details: "Aeropuerto PUJ, Zona Hotelera, Cap Cana, Bávaro, Uvero Alto",
      coverage: "100%",
    },
    {
      area: "Santo Domingo",
      details: "Aeropuerto SDQ, Zona Colonial, Malecón, Polanco, Naco",
      coverage: "100%",
    },
    {
      area: "Puerto Plata",
      details: "Aeropuerto POP, Centro, Costa Dorada, Playa Dorada",
      coverage: "100%",
    },
    {
      area: "La Romana",
      details: "Aeropuerto LRM, Casa de Campo, Bayahibe, Dominicus",
      coverage: "100%",
    },
  ];

  const emergencyContacts = [
    {
      title: "Emergencias 24/7",
      number: "+1 (809) 444-8800",
      description: "Para emergencias durante tu viaje",
    },
    {
      title: "WhatsApp Inmediato",
      number: "+1 (809) 444-8800",
      description: "Respuesta en menos de 5 minutos",
    },
    {
      title: "Coordinador de Viajes",
      number: "+1 (809) 444-8800",
      description: "Para cambios de última hora",
    },
  ];

  return (
    <div className="min-h-screen bg-void pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            CONTACTO
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Contáctanos
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
            Estamos aquí para ayudarte 24/7. Nuestro equipo de expertos está
            listo para hacer de tu experiencia en República Dominicana algo
            inolvidable.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30">
            <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-coco-gold" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Llámanos</h3>
            <p className="text-sm text-gray-500 mb-3">Disponible 24/7</p>
            <a
              href={`tel:${COMPANY_INFO.phone}`}
              className="text-coco-gold hover:text-coco-gold/80 transition font-medium"
              data-testid="link-quick-phone"
            >
              {COMPANY_INFO.phone}
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30">
            <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-coco-gold" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Email</h3>
            <p className="text-sm text-gray-500 mb-3">Respuesta en 2h</p>
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="text-coco-gold hover:text-coco-gold/80 transition font-medium"
              data-testid="link-quick-email"
            >
              {COMPANY_INFO.email}
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30">
            <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fab fa-whatsapp text-coco-gold text-2xl"></i>
            </div>
            <h3 className="font-semibold mb-2 text-white">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-3">Respuesta inmediata</p>
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-coco-gold hover:text-coco-gold/80 transition font-medium"
              data-testid="link-quick-whatsapp"
            >
              Enviar mensaje
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30">
            <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-coco-gold" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Ubicación</h3>
            <p className="text-sm text-gray-500 mb-3">Toda RD</p>
            <span className="text-coco-gold font-medium">
              República Dominicana
            </span>
          </Card>
        </div>

        {/* Main Contact Section */}
        <ContactSection />

        {/* Operating Hours */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 glass-panel border-white/10">
            <CardHeader className="border-b border-white/10 pb-4 mb-6">
              <CardTitle className="text-2xl font-serif text-white flex items-center">
                <Clock className="w-6 h-6 mr-3 text-coco-gold" />
                Horarios de Atención
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-transparent">
              <div className="space-y-4">
                {operatingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-void/50 border border-white/10 rounded-lg"
                  >
                    <span className="font-medium text-gray-300">
                      {schedule.day}
                    </span>
                    <span className="text-coco-gold font-semibold">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-coco-gold/10 border border-coco-gold/30 rounded-lg">
                <p className="text-coco-gold text-sm">
                  <strong>Emergencias:</strong> Disponibles 24/7 para
                  asistencia durante tu viaje
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-8 glass-panel border-white/10">
            <CardHeader className="border-b border-white/10 pb-4 mb-6">
              <CardTitle className="text-2xl font-serif text-white flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-coco-gold" />
                Áreas de Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-transparent">
              <div className="space-y-4">
                {serviceAreas.map((area, index) => (
                  <div
                    key={index}
                    className="p-3 border border-white/10 rounded-lg hover:border-coco-gold/30 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-white">{area.area}</h3>
                      <span className="text-coco-gold text-sm font-medium">
                        Cobertura {area.coverage}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{area.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">
              EMERGENCIAS
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-white">
              Contactos de Emergencia
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card
                key={index}
                className="p-6 text-center border-l-4 border-l-coco-gold glass-panel border-white/10 hover:border-coco-gold/30 transition-all"
              >
                <CardContent className="bg-transparent">
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    {contact.title}
                  </h3>
                  <a
                    href={`tel:${contact.number}`}
                    className="text-2xl font-bold text-coco-gold hover:text-coco-gold/80 transition block mb-2"
                    data-testid={`link-emergency-${index}`}
                  >
                    {contact.number}
                  </a>
                  <p className="text-sm text-gray-400">{contact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 glass-panel border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">
              FAQ
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-white">
              Preguntas Frecuentes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-white">
                ¿Cuánto tiempo antes debo reservar?
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Recomendamos reservar al menos 24 horas antes, pero aceptamos
                reservas de última hora según disponibilidad.
              </p>

              <h3 className="font-semibold mb-3 text-white">
                ¿Aceptan pagos con tarjeta?
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Sí, aceptamos efectivo, tarjetas de crédito/débito y
                transferencias bancarias.
              </p>

              <h3 className="font-semibold mb-3 text-white">
                ¿Qué pasa si mi vuelo se retrasa?
              </h3>
              <p className="text-sm text-gray-400">
                Monitoreamos todos los vuelos automáticamente. No hay costo
                adicional por esperas de hasta 1 hora.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-white">
                ¿Incluyen asientos para bebés?
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Sí, proporcionamos asientos para bebés y niños sin costo
                adicional. Solo menciona la edad en tu reserva.
              </p>

              <h3 className="font-semibold mb-3 text-white">
                ¿Puedo cancelar mi reserva?
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Cancelación gratuita hasta 24 horas antes del servicio.
                Cancelaciones de último minuto pueden tener cargo.
              </p>

              <h3 className="font-semibold mb-3 text-white">
                ¿Los conductores hablan inglés?
              </h3>
              <p className="text-sm text-gray-400">
                Todos nuestros conductores son bilingües (español/inglés) y
                están certificados para turismo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
