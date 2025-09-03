import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Luggage, Check } from "lucide-react";
import { Link } from "wouter";

const vehicles = [
  {
    name: "Sedán Económico",
    description: "Ideal para 1-3 pasajeros con equipaje ligero.",
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    capacity: 3,
    luggage: 2,
    price: 35,
    features: ["Aire acondicionado", "Conductor profesional", "Agua gratis"],
  },
  {
    name: "SUV Premium",
    description: "Perfecto para familias o grupos pequeños.",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    capacity: 6,
    luggage: 4,
    price: 60,
    features: ["Vehículo de lujo", "Asientos de cuero", "WiFi gratis"],
  },
  {
    name: "Van Grupal",
    description: "Ideal para grupos medianos y familias grandes.",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    capacity: 12,
    luggage: 8,
    price: 120,
    features: ["Amplio espacio", "Sistema de sonido", "Refrigerios incluidos"],
  },
];

export default function FleetSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Nuestra Flota</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Vehículos modernos, cómodos y seguros para garantizar tu comodidad en cada viaje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`card-vehicle-${index}`}>
              <div className="aspect-video overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{vehicle.name}</CardTitle>
                <p className="text-muted-foreground">{vehicle.description}</p>
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
                      <span>{vehicle.luggage} maletas</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xl font-bold">
                    ${vehicle.price}
                  </Badge>
                </div>
                
                <ul className="space-y-1">
                  {vehicle.features.map((feature, featureIndex) => (
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

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            ¿Necesitas un vehículo más grande? También tenemos autobuses para grupos de 20+ personas.
          </p>
          <Button asChild variant="secondary" size="lg" data-testid="button-view-all-fleet">
            <Link href="/fleet">Ver Toda la Flota</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
