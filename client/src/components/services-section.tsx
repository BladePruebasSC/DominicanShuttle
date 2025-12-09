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
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 bg-void relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            SERVICIOS
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
            Ofrecemos una amplia gama de servicios de transporte para hacer de tu experiencia en República Dominicana algo inolvidable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-white/10 !bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30"
              >
                <CardHeader className="text-center bg-transparent border-b border-white/10">
                  <div className="border border-coco-gold/30 bg-void/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-coco-gold transition-colors">
                    <IconComponent className="w-8 h-8 text-coco-gold" />
                  </div>
                  <CardTitle className="text-xl text-white font-serif">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-transparent">
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {service.routes.map((route, routeIndex) => (
                      <div
                        key={routeIndex}
                        className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0"
                      >
                        <span className="text-gray-300 text-xs">
                          • {route.name}
                        </span>
                        {route.price && (
                          <span className="font-semibold text-coco-gold text-xs">
                            {route.price}
                          </span>
                        )}
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
