import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, MapPin, Camera, Utensils, Check } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTours = selectedCategory === "all" 
    ? tours 
    : tours.filter(tour => tour.category === selectedCategory);

  return (
    <div className="min-h-screen bg-void pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            TOURS
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Tours y Excursiones
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
            Descubre los destinos más espectaculares de República Dominicana con nuestros tours especializados. 
            Aventura, cultura y naturaleza te esperan.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {tourCategories.map((category) => (
            <Button 
              key={category.value}
              variant="outline"
              onClick={() => setSelectedCategory(category.value)}
              className={`border transition-all text-xs md:text-sm ${
                selectedCategory === category.value
                  ? "border-coco-gold bg-coco-gold/20 text-coco-gold"
                  : "border-white/20 text-gray-400 hover:border-coco-gold/50 hover:text-coco-gold"
              }`}
              data-testid={`filter-${category.value}`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {filteredTours.map((tour) => (
            <Card 
              key={tour.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30 group" 
              data-testid={`card-tour-${tour.id}`}
            >
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={tour.image} 
                  alt={tour.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                />
                {tour.popular && (
                  <Badge className="absolute top-4 left-4 bg-coco-gold/20 text-coco-gold border border-coco-gold/30 backdrop-blur-sm">
                    Más Popular
                  </Badge>
                )}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs md:text-sm">
                  <div className="flex items-center">
                    <i className="fas fa-star text-coco-gold mr-1"></i>
                    {tour.rating} ({tour.reviews})
                  </div>
                </div>
                <div className="absolute inset-0 border border-coco-gold/20 m-4 pointer-events-none"></div>
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <CardTitle className="text-xl text-white font-serif">{tour.name}</CardTitle>
                  <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30 text-lg font-bold px-3 py-1">
                    ${tour.price}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mt-2">{tour.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4 bg-transparent">
                <div className="flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-coco-gold" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-coco-gold" />
                    <span>Máx. {tour.maxPeople} personas</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 text-white">Incluye:</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {tour.includes.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-3 h-3 mr-2 text-coco-gold flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {tour.includes.length > 3 && (
                      <li className="text-coco-gold text-xs">+{tour.includes.length - 3} más incluidos</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 text-white">Destacados:</h4>
                  <div className="flex flex-wrap gap-1">
                    {tour.highlights.map((highlight, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs border-white/20 text-gray-300"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]" 
                  data-testid={`button-book-tour-${tour.id}`}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Reservar Tour
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <Card className="text-center p-6 glass-panel border-white/10">
            <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-coco-gold" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Recogida Incluida</h3>
            <p className="text-sm text-gray-400">
              Te recogemos en tu hotel o punto de encuentro sin costo adicional.
            </p>
          </Card>

          <Card className="text-center p-6 glass-panel border-white/10">
            <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-6 h-6 text-coco-gold" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Comidas Incluidas</h3>
            <p className="text-sm text-gray-400">
              Todos nuestros tours incluyen almuerzo y bebidas durante el recorrido.
            </p>
          </Card>

          <Card className="text-center p-6 glass-panel border-white/10">
            <div className="border border-coco-gold/30 bg-void/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-coco-gold" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Guías Expertos</h3>
            <p className="text-sm text-gray-400">
              Guías locales certificados que hablan español e inglés perfectamente.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center glass-panel border-white/10 rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
            ¿No encuentras el tour perfecto?
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Creamos tours personalizados según tus intereses y preferencias.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
            data-testid="button-custom-tour"
          >
            Solicitar Tour Personalizado
          </Button>
        </div>
      </div>
    </div>
  );
}
