import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check } from "lucide-react";
import { Link } from "wouter";
import { dataSource } from "@/lib/data-source";

export default function ToursSection() {
  const { data: tours = [] } = useQuery({
    queryKey: ["tours"],
    queryFn: () => dataSource.listTours(),
  });

  const topTours = tours
    .slice()
    .sort((a, b) => (b.popular === true ? 1 : 0) - (a.popular === true ? 1 : 0))
    .slice(0, 3);

  return (
    <section className="py-20 bg-void relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            TOURS
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Tours Populares
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
            Descubre los destinos más increíbles de República Dominicana con nuestros tours especializados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topTours.map((tour, index) => (
            <Card
              key={tour.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-white/10 !bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30 group"
              data-testid={`card-tour-${index}`}
            >
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={
                    tour.imageUrl ||
                    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  }
                  alt={tour.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                />
                <Badge className="absolute top-4 right-4 bg-coco-gold/20 text-coco-gold border border-coco-gold/30 backdrop-blur-sm">
                  {tour.popular ? "Bestseller" : "Tour"}
                </Badge>
                <div className="absolute inset-0 border border-coco-gold/20 m-4 pointer-events-none"></div>
              </div>
              <CardHeader className="bg-transparent border-b border-white/10">
                <CardTitle className="text-xl text-white font-serif">
                  {tour.name}
                </CardTitle>
                <p className="text-gray-400 text-sm">{tour.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1 text-coco-gold" />
                    <span>{tour.duration}</span>
                  </div>
                  <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30 text-lg font-bold px-3 py-1">
                    ${tour.price}
                  </Badge>
                </div>

                <ul className="space-y-1">
                  {(Array.isArray(tour.includes) ? tour.includes : []).slice(0, 4).map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-center text-sm text-gray-300"
                    >
                      <Check className="w-4 h-4 mr-2 text-coco-gold" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="w-full bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
                  data-testid={`button-book-tour-${index}`}
                >
                  <Link href="/tours">Ver / Reservar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-coco-gold text-coco-gold hover:bg-coco-gold hover:text-black"
            data-testid="button-view-all-tours"
          >
            <Link href="/tours">Ver Todos los Tours</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
