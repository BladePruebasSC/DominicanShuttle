import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, MapPin, Camera, Utensils } from "lucide-react";

const tourCategories = [
  { value: "all", label: "Todos los Tours" },
  { value: "adventure", label: "Aventura" },
  { value: "cultural", label: "Cultural" },
  { value: "beach", label: "Playa" },
  { value: "nature", label: "Naturaleza" },
];

const tours = [
  {
    id: 1,
    name: "Isla Saona Paradise",
    description: "Descubre el paraíso tropical de Isla Saona con sus playas de arena blanca y aguas cristalinas. Una experiencia única en el Caribe.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "8 horas",
    price: 85,
    rating: 4.9,
    reviews: 523,
    category: "beach",
    maxPeople: 50,
    includes: [
      "Transporte ida y vuelta",
      "Almuerzo bufet en la playa",
      "Bebidas incluidas",
      "Equipo de snorkeling",
      "Guía turístico bilingüe",
      "Seguro de viaje"
    ],
    highlights: [
      "Playa Natural de Saona",
      "Piscina Natural",
      "Pueblo de Pescadores",
      "Manglares"
    ],
    popular: true,
  },
  {
    id: 2,
    name: "27 Charcos de Damajagua",
    description: "Aventura extrema en las cascadas más famosas de República Dominicana. Saltos, toboganes naturales y piscinas de agua dulce.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "10 horas",
    price: 95,
    rating: 4.8,
    reviews: 387,
    category: "adventure",
    maxPeople: 20,
    includes: [
      "Transporte especializado",
      "Equipo de seguridad completo",
      "Guía certificado",
      "Almuerzo típico dominicano",
      "Fotos profesionales del tour",
      "Seguro de aventura"
    ],
    highlights: [
      "27 Cascadas Naturales",
      "Saltos Guiados",
      "Toboganes de Roca",
      "Selva Tropical"
    ],
    popular: false,
  },
  {
    id: 3,
    name: "Zona Colonial Santo Domingo",
    description: "Explora la primera ciudad del Nuevo Mundo. Historia, cultura y arquitectura colonial en el corazón de América.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "6 horas",
    price: 70,
    rating: 4.7,
    reviews: 298,
    category: "cultural",
    maxPeople: 15,
    includes: [
      "Transporte cómodo",
      "Guía historiador",
      "Entradas a monumentos",
      "Almuerzo en restaurante típico",
      "Agua y refrigerios",
      "Mapa turístico"
    ],
    highlights: [
      "Catedral Primada",
      "Alcázar de Colón",
      "Calle Las Damas",
      "Fortaleza Ozama"
    ],
    popular: false,
  },
  {
    id: 4,
    name: "Cayo Levantado (Bacardí Island)",
    description: "Isla paradisíaca en la Bahía de Samaná. Relájate en playas vírgenes y disfruta de la naturaleza caribeña.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "7 horas",
    price: 75,
    rating: 4.8,
    reviews: 412,
    category: "beach",
    maxPeople: 40,
    includes: [
      "Transporte marítimo",
      "Almuerzo caribeño",
      "Bebidas tropicales",
      "Tiempo libre en la playa",
      "Equipo de playa",
      "Guía naturalista"
    ],
    highlights: [
      "Playa Bacardí",
      "Bosque Tropical",
      "Aguas Cristalinas",
      "Vida Marina"
    ],
    popular: true,
  },
  {
    id: 5,
    name: "Parque Nacional del Este",
    description: "Aventura ecológica en uno de los parques más diversos del Caribe. Cuevas, playas vírgenes y vida silvestre.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "9 horas",
    price: 90,
    rating: 4.6,
    reviews: 267,
    category: "nature",
    maxPeople: 25,
    includes: [
      "Transporte 4x4",
      "Guía naturalista",
      "Almuerzo eco-friendly",
      "Equipo de exploración",
      "Entrada al parque",
      "Binoculares"
    ],
    highlights: [
      "Cueva de Berna",
      "Playa Palmilla",
      "Observación de Aves",
      "Bosque Seco"
    ],
    popular: false,
  },
  {
    id: 6,
    name: "Hoyo Azul + Zipline Scape Park",
    description: "Combinación perfecta de aventura y naturaleza. Cenote natural y emocionantes tirolinas en la jungla.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: "5 horas",
    price: 65,
    rating: 4.9,
    reviews: 634,
    category: "adventure",
    maxPeople: 30,
    includes: [
      "Transporte al parque",
      "Equipo de tirolina",
      "Acceso al Hoyo Azul",
      "Instructor certificado",
      "Refreshment incluido",
      "Fotos del recorrido"
    ],
    highlights: [
      "Cenote Hoyo Azul",
      "12 Tirolinas",
      "Puentes Colgantes",
      "Selva Subtropical"
    ],
    popular: true,
  },
];

export default function Tours() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tours y Excursiones
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre los destinos más espectaculares de República Dominicana con nuestros tours especializados. 
            Aventura, cultura y naturaleza te esperan.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tourCategories.map((category) => (
            <Button 
              key={category.value}
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground"
              data-testid={`filter-${category.value}`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`card-tour-${tour.id}`}>
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={tour.image} 
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
                {tour.popular && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                    Más Popular
                  </Badge>
                )}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                    {tour.rating} ({tour.reviews})
                  </div>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{tour.name}</CardTitle>
                  <Badge variant="secondary" className="text-lg font-bold">
                    ${tour.price}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{tour.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Máx. {tour.maxPeople} personas</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Incluye:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tour.includes.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                        {item}
                      </li>
                    ))}
                    {tour.includes.length > 3 && (
                      <li className="text-primary text-xs">+{tour.includes.length - 3} más incluidos</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Destacados:</h4>
                  <div className="flex flex-wrap gap-1">
                    {tour.highlights.map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" data-testid={`button-book-tour-${tour.id}`}>
                  <Camera className="w-4 h-4 mr-2" />
                  Reservar Tour
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Recogida Incluida</h3>
            <p className="text-sm text-muted-foreground">
              Te recogemos en tu hotel o punto de encuentro sin costo adicional.
            </p>
          </Card>

          <Card className="text-center p-6">
            <Utensils className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comidas Incluidas</h3>
            <p className="text-sm text-muted-foreground">
              Todos nuestros tours incluyen almuerzo y bebidas durante el recorrido.
            </p>
          </Card>

          <Card className="text-center p-6">
            <Users className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Guías Expertos</h3>
            <p className="text-sm text-muted-foreground">
              Guías locales certificados que hablan español e inglés perfectamente.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-muted rounded-xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿No encuentras el tour perfecto?
          </h2>
          <p className="text-muted-foreground mb-6">
            Creamos tours personalizados según tus intereses y preferencias.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90" data-testid="button-custom-tour">
            Solicitar Tour Personalizado
          </Button>
        </div>
      </div>
    </div>
  );
}
