import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Luggage, Check, Wifi, Snowflake, Music, Star } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Fleet() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const fleetCategories = [
    {
      title: "Vehículos Económicos",
      description: "Perfectos para parejas y viajeros individuales",
      icon: "💰",
    },
    {
      title: "Vehículos Premium", 
      description: "Máximo confort para familias y grupos pequeños",
      icon: "⭐",
    },
    {
      title: "Vehículos Grupales",
      description: "Ideales para grupos grandes y eventos especiales",
      icon: "👥",
    },
  ];

  const features = [
    { icon: Snowflake, text: "Aire acondicionado" },
    { icon: Wifi, text: "WiFi gratuito" },
    { icon: Music, text: "Sistema de sonido" },
    { icon: Check, text: "Seguro incluido" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden glass-panel border-white/10">
                <div className="aspect-video bg-void/50 animate-pulse" />
                <CardContent className="p-6 bg-transparent">
                  <div className="space-y-3">
                    <div className="h-6 bg-void/50 rounded animate-pulse" />
                    <div className="h-4 bg-void/50 rounded animate-pulse" />
                    <div className="h-4 bg-void/50 rounded animate-pulse w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            FLOTA
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Nuestra Flota de Vehículos
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
            Vehículos modernos, cómodos y seguros para garantizar tu comodidad en cada viaje. 
            Desde sedanes económicos hasta autobuses de lujo para grupos grandes.
          </p>
        </div>

        {/* Fleet Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {fleetCategories.map((category, index) => (
            <Card 
              key={index} 
              className="text-center p-6 hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-serif font-bold mb-2 text-white">{category.title}</h3>
              <p className="text-gray-400 text-sm">{category.description}</p>
            </Card>
          ))}
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {vehicles?.map((vehicle: any, index: number) => (
            <Card 
              key={vehicle.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30 group" 
              data-testid={`card-vehicle-${index}`}
            >
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={vehicle.imageUrl || "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 border border-coco-gold/20 m-4 pointer-events-none"></div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <CardTitle className="text-xl text-white font-serif">{vehicle.name}</CardTitle>
                  {vehicle.type === "sedan" && (
                    <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30">Económico</Badge>
                  )}
                  {vehicle.type === "suv" && (
                    <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30">Premium</Badge>
                  )}
                  {(vehicle.type === "van" || vehicle.type === "bus") && (
                    <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30">Grupal</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 bg-transparent">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-coco-gold" />
                      <span>{vehicle.capacity} pax</span>
                    </div>
                    <div className="flex items-center">
                      <Luggage className="w-4 h-4 mr-1 text-coco-gold" />
                      <span>{vehicle.luggageCapacity} maletas</span>
                    </div>
                  </div>
                  <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30 text-lg font-bold px-3 py-1">
                    ${vehicle.basePrice}
                  </Badge>
                </div>
                
                <ul className="space-y-1">
                  {vehicle.features?.slice(0, 3).map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-300">
                      <Check className="w-4 h-4 mr-2 text-coco-gold flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  asChild 
                  className="w-full bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]" 
                  data-testid={`button-book-vehicle-${index}`}
                >
                  <Link href="/booking">Reservar Ahora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="glass-panel border-white/10 rounded-xl p-8 mb-12 md:mb-16">
          <h2 className="text-2xl font-serif text-center text-white mb-8">Características de Todos Nuestros Vehículos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-coco-gold" />
                  </div>
                  <p className="text-sm font-medium text-gray-300">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Vehicles Section */}
        <div className="text-center mb-12">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            ESPECIALES
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Vehículos Especiales</h2>
          <p className="text-gray-400 text-base md:text-xl mb-8 max-w-2xl mx-auto">
            También ofrecemos vehículos especializados para ocasiones únicas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <Card className="p-6 glass-panel border-white/10">
              <h3 className="text-xl font-serif font-bold mb-4 text-white">🚌 Autobuses de Lujo</h3>
              <p className="text-gray-400 mb-4">
                Para grupos de 40+ personas. Perfectos para eventos corporativos, bodas y excursiones grupales.
              </p>
              <ul className="text-sm text-left space-y-1 mb-4 text-gray-300">
                <li>• Asientos reclinables de cuero</li>
                <li>• Sistema de entretenimiento</li>
                <li>• Baño privado a bordo</li>
                <li>• Refrigerador y microondas</li>
              </ul>
              <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30 text-lg px-4 py-2">
                Desde $300 USD
              </Badge>
            </Card>

            <Card className="p-6 glass-panel border-white/10">
              <h3 className="text-xl font-serif font-bold mb-4 text-white">🏎️ Vehículos de Lujo</h3>
              <p className="text-gray-400 mb-4">
                Mercedes-Benz, BMW y vehículos premium para ejecutivos y ocasiones especiales.
              </p>
              <ul className="text-sm text-left space-y-1 mb-4 text-gray-300">
                <li>• Conductor con traje ejecutivo</li>
                <li>• Agua y refrigerios premium</li>
                <li>• Cargadores para dispositivos</li>
                <li>• Servicio de concierge</li>
              </ul>
              <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30 text-lg px-4 py-2">
                Desde $150 USD
              </Badge>
            </Card>
          </div>
        </div>

        {/* Safety & Maintenance */}
        <div className="glass-panel border-coco-gold/30 rounded-xl p-8 md:p-12 text-center mb-12 md:mb-16">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            SEGURIDAD
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-8">Seguridad y Mantenimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-coco-gold" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Mantenimiento Regular</h3>
              <p className="text-gray-400 text-sm">
                Todos nuestros vehículos reciben mantenimiento preventivo cada 5,000 km
              </p>
            </div>
            <div>
              <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 md:w-8 md:h-8 text-coco-gold" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Seguros Completos</h3>
              <p className="text-gray-400 text-sm">
                Cobertura total de responsabilidad civil y daños a terceros
              </p>
            </div>
            <div>
              <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-coco-gold" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Conductores Certificados</h3>
              <p className="text-gray-400 text-sm">
                Todos nuestros conductores están licenciados y certificados
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
            ¿Necesitas un vehículo específico?
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Contáctanos para solicitudes especiales o vehículos personalizados para tu evento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
              data-testid="button-book-fleet"
            >
              <Link href="/booking">Reservar Vehículo</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-coco-gold text-coco-gold hover:bg-coco-gold hover:text-black"
              data-testid="button-contact-fleet"
            >
              <Link href="/contact">Solicitud Especial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
