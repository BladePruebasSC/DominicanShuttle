import ContactSection from "@/components/contact-section";
import { Card, CardContent } from "@/components/ui/card";
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
      number: "+1 (849) 654-2047",
      description: "Para emergencias durante tu viaje",
    },
    {
      title: "WhatsApp Inmediato",
      number: "+1 (849) 654-2047", 
      description: "Respuesta en menos de 5 minutos",
    },
    {
      title: "Coordinador de Viajes",
      number: "+1 (849) 654-2048",
      description: "Para cambios de última hora",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos aquí para ayudarte 24/7. Nuestro equipo de expertos está listo para hacer 
            de tu experiencia en República Dominicana algo inolvidable.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Llámanos</h3>
            <p className="text-sm text-muted-foreground mb-3">Disponible 24/7</p>
            <a 
              href={`tel:${COMPANY_INFO.phone}`}
              className="text-primary hover:underline font-medium"
              data-testid="link-quick-phone"
            >
              {COMPANY_INFO.phone}
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <Mail className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-muted-foreground mb-3">Respuesta en 2h</p>
            <a 
              href={`mailto:${COMPANY_INFO.email}`}
              className="text-primary hover:underline font-medium"
              data-testid="link-quick-email"
            >
              {COMPANY_INFO.email}
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fab fa-whatsapp text-white text-2xl"></i>
            </div>
            <h3 className="font-semibold mb-2">WhatsApp</h3>
            <p className="text-sm text-muted-foreground mb-3">Respuesta inmediata</p>
            <a 
              href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
              data-testid="link-quick-whatsapp"
            >
              Enviar mensaje
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <MapPin className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Ubicación</h3>
            <p className="text-sm text-muted-foreground mb-3">Toda RD</p>
            <span className="text-primary font-medium">República Dominicana</span>
          </Card>
        </div>

        {/* Main Contact Section */}
        <ContactSection />

        {/* Operating Hours */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-primary" />
              Horarios de Atención
            </h2>
            <div className="space-y-4">
              {operatingHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">{schedule.day}</span>
                  <span className="text-primary font-semibold">{schedule.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Emergencias:</strong> Disponibles 24/7 para asistencia durante tu viaje
              </p>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-primary" />
              Áreas de Servicio
            </h2>
            <div className="space-y-4">
              {serviceAreas.map((area, index) => (
                <div key={index} className="p-3 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{area.area}</h3>
                    <span className="text-green-600 text-sm font-medium">
                      Cobertura {area.coverage}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.details}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Contactos de Emergencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="p-6 text-center border-l-4 border-l-accent">
                <h3 className="font-semibold text-lg mb-2">{contact.title}</h3>
                <a 
                  href={`tel:${contact.number}`}
                  className="text-2xl font-bold text-primary hover:underline block mb-2"
                  data-testid={`link-emergency-${index}`}
                >
                  {contact.number}
                </a>
                <p className="text-sm text-muted-foreground">{contact.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-muted rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">¿Cuánto tiempo antes debo reservar?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recomendamos reservar al menos 24 horas antes, pero aceptamos reservas de última hora según disponibilidad.
              </p>

              <h3 className="font-semibold mb-3">¿Aceptan pagos con tarjeta?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sí, aceptamos efectivo, tarjetas de crédito/débito y transferencias bancarias.
              </p>

              <h3 className="font-semibold mb-3">¿Qué pasa si mi vuelo se retrasa?</h3>
              <p className="text-sm text-muted-foreground">
                Monitoreamos todos los vuelos automáticamente. No hay costo adicional por esperas de hasta 1 hora.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">¿Incluyen asientos para bebés?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sí, proporcionamos asientos para bebés y niños sin costo adicional. Solo menciona la edad en tu reserva.
              </p>

              <h3 className="font-semibold mb-3">¿Puedo cancelar mi reserva?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cancelación gratuita hasta 24 horas antes del servicio. Cancelaciones de último minuto pueden tener cargo.
              </p>

              <h3 className="font-semibold mb-3">¿Los conductores hablan inglés?</h3>
              <p className="text-sm text-muted-foreground">
                Todos nuestros conductores son bilingües (español/inglés) y están certificados para turismo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
