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
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
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
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Nuestra Flota de Vehículos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Vehículos modernos, cómodos y seguros para garantizar tu comodidad en cada viaje. 
            Desde sedanes económicos hasta autobuses de lujo para grupos grandes.
          </p>
        </div>

        {/* Fleet Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {fleetCategories.map((category, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold mb-2">{category.title}</h3>
              <p className="text-muted-foreground">{category.description}</p>
            </Card>
          ))}
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {vehicles?.map((vehicle: any, index: number) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`card-vehicle-${index}`}>
              <div className="aspect-video overflow-hidden">
                <img 
                  src={vehicle.imageUrl || "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{vehicle.name}</CardTitle>
                  {vehicle.type === "sedan" && (
                    <Badge className="bg-green-500">Económico</Badge>
                  )}
                  {vehicle.type === "suv" && (
                    <Badge className="bg-blue-500">Premium</Badge>
                  )}
                  {(vehicle.type === "van" || vehicle.type === "bus") && (
                    <Badge className="bg-purple-500">Grupal</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{vehicle.capacity} pax</span>
                    </div>
                    <div className="flex items-center">
                      <Luggage className="w-4 h-4 mr-1" />
                      <span>{vehicle.luggageCapacity} maletas</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xl font-bold">
                    ${vehicle.basePrice}
                  </Badge>
                </div>
                
                <ul className="space-y-1">
                  {vehicle.features?.slice(0, 3).map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button asChild className="w-full" data-testid={`button-book-vehicle-${index}`}>
                  <Link href="/booking">Reservar Ahora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-muted rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Características de Todos Nuestros Vehículos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Vehicles Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Vehículos Especiales</h2>
          <p className="text-xl text-muted-foreground mb-8">
            También ofrecemos vehículos especializados para ocasiones únicas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🚌 Autobuses de Lujo</h3>
              <p className="text-muted-foreground mb-4">
                Para grupos de 40+ personas. Perfectos para eventos corporativos, bodas y excursiones grupales.
              </p>
              <ul className="text-sm text-left space-y-1 mb-4">
                <li>• Asientos reclinables de cuero</li>
                <li>• Sistema de entretenimiento</li>
                <li>• Baño privado a bordo</li>
                <li>• Refrigerador y microondas</li>
              </ul>
              <Badge variant="secondary" className="text-lg">Desde $300 USD</Badge>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🏎️ Vehículos de Lujo</h3>
              <p className="text-muted-foreground mb-4">
                Mercedes-Benz, BMW y vehículos premium para ejecutivos y ocasiones especiales.
              </p>
              <ul className="text-sm text-left space-y-1 mb-4">
                <li>• Conductor con traje ejecutivo</li>
                <li>• Agua y refrigerios premium</li>
                <li>• Cargadores para dispositivos</li>
                <li>• Servicio de concierge</li>
              </ul>
              <Badge variant="secondary" className="text-lg">Desde $150 USD</Badge>
            </Card>
          </div>
        </div>

        {/* Safety & Maintenance */}
        <div className="bg-primary text-primary-foreground rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Seguridad y Mantenimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Star className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Mantenimiento Regular</h3>
              <p className="text-primary-foreground/80">
                Todos nuestros vehículos reciben mantenimiento preventivo cada 5,000 km
              </p>
            </div>
            <div>
              <Check className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Seguros Completos</h3>
              <p className="text-primary-foreground/80">
                Cobertura total de responsabilidad civil y daños a terceros
              </p>
            </div>
            <div>
              <Users className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Conductores Certificados</h3>
              <p className="text-primary-foreground/80">
                Todos nuestros conductores están licenciados y certificados
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿Necesitas un vehículo específico?
          </h2>
          <p className="text-muted-foreground mb-6">
            Contáctanos para solicitudes especiales o vehículos personalizados para tu evento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" data-testid="button-book-fleet">
              <Link href="/booking">Reservar Vehículo</Link>
            </Button>
            <Button asChild variant="outline" size="lg" data-testid="button-contact-fleet">
              <Link href="/contact">Solicitud Especial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
