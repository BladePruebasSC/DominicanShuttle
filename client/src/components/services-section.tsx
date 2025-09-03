import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MapPin, Briefcase, Users } from "lucide-react";

const services = [
  {
    icon: Plane,
    title: "Traslados Aeropuerto",
    description: "Servicio directo desde/hacia todos los aeropuertos de República Dominicana.",
    routes: [
      { name: "Punta Cana (PUJ)", price: "desde $35" },
      { name: "Santo Domingo (SDQ)", price: "desde $45" },
      { name: "Puerto Plata (POP)", price: "desde $40" },
    ],
    color: "bg-primary",
  },
  {
    icon: MapPin,
    title: "Tours Privados",
    description: "Explora los mejores destinos con nuestros tours personalizados.",
    routes: [
      { name: "Saona Island", price: "" },
      { name: "27 Charcos de Damajagua", price: "" },
      { name: "Zona Colonial Santo Domingo", price: "" },
      { name: "Cayo Levantado", price: "" },
    ],
    color: "bg-secondary",
  },
  {
    icon: Briefcase,
    title: "Transporte Ejecutivo",
    description: "Servicios premium para empresarios y ejecutivos.",
    routes: [
      { name: "Vehículos de lujo", price: "" },
      { name: "Conductores bilingües", price: "" },
      { name: "Servicios por horas", price: "" },
      { name: "Disponibilidad 24/7", price: "" },
    ],
    color: "bg-accent",
  },
  {
    icon: Users,
    title: "Grupos Grandes",
    description: "Transporte para grupos de cualquier tamaño.",
    routes: [
      { name: "Minibuses (15-20 pax)", price: "" },
      { name: "Autobuses (40+ pax)", price: "" },
      { name: "Eventos corporativos", price: "" },
      { name: "Bodas y celebraciones", price: "" },
    ],
    color: "bg-caribbean-600",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Nuestros Servicios</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ofrecemos una amplia gama de servicios de transporte para hacer de tu experiencia en República Dominicana algo inolvidable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className={`${service.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="space-y-2 text-sm">
                    {service.routes.map((route, routeIndex) => (
                      <div key={routeIndex} className="flex justify-between items-center">
                        <span className="text-muted-foreground">• {route.name}</span>
                        {route.price && <span className="font-medium">{route.price}</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
