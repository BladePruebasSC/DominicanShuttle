import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check } from "lucide-react";
import { Link } from "wouter";

const tours = [
  {
    name: "Isla Saona",
    description: "Paraíso tropical con aguas cristalinas y playas de arena blanca.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "8 horas",
    price: 85,
    includes: ["Transporte ida y vuelta", "Almuerzo incluido", "Snorkeling", "Guía turístico"],
    category: "Bestseller",
    categoryColor: "bg-accent",
  },
  {
    name: "27 Charcos",
    description: "Cascadas naturales y pozas de agua dulce para una aventura única.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "10 horas",
    price: 95,
    includes: ["Equipo de seguridad", "Guía especializado", "Almuerzo típico", "Fotos profesionales"],
    category: "Aventura",
    categoryColor: "bg-secondary",
  },
  {
    name: "Zona Colonial",
    description: "Historia viva en la primera ciudad del Nuevo Mundo.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "6 horas",
    price: 70,
    includes: ["Catedral Primada", "Alcázar de Colón", "Calle Las Damas", "Guía historiador"],
    category: "Cultural",
    categoryColor: "bg-caribbean-600",
  },
];

export default function ToursSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Tours Populares</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre los destinos más increíbles de República Dominicana con nuestros tours especializados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`card-tour-${index}`}>
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={tour.image} 
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-4 right-4 ${tour.categoryColor} text-white`}>
                  {tour.category}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{tour.name}</CardTitle>
                <p className="text-muted-foreground">{tour.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{tour.duration}</span>
                  </div>
                  <Badge variant="secondary" className="text-xl font-bold">
                    ${tour.price}
                  </Badge>
                </div>
                
                <ul className="space-y-1">
                  {tour.includes.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Button asChild className="w-full" data-testid={`button-book-tour-${index}`}>
                  <Link href="/tours">Reservar Tour</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="secondary" size="lg" data-testid="button-view-all-tours">
            <Link href="/tours">Ver Todos los Tours</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
