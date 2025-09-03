import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alicia H.",
    initials: "AH",
    date: "Agosto 2025",
    rating: 5,
    review: "Excelente servicio! El transfer fue puntual, muy cómodo, y el conductor súper amable. Hizo que nuestro viaje en Punta Cana fuera libre de estrés. Lo recomiendo 100%.",
    color: "bg-primary",
  },
  {
    name: "Nathan Mapp",
    initials: "NM",
    date: "Septiembre 2025",
    rating: 5,
    review: "Estaba escéptico al principio, pero el servicio superó mis expectativas. Pago por adelantado, comunicación excelente por WhatsApp, y conductores profesionales. $35 por una van fue un precio justo.",
    color: "bg-secondary",
  },
  {
    name: "Shanda Young",
    initials: "SY",
    date: "Agosto 2025",
    rating: 5,
    review: "Viajé con un grupo grande y el servicio fue excepcional. La comunicación fue excelente, el servicio profesional y la hospitalidad excepcional. Definitivamente los usaré otra vez.",
    color: "bg-accent",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Lo Que Dicen Nuestros Clientes</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Miles de turistas confían en nosotros para sus traslados en República Dominicana.
          </p>
          <div className="flex items-center justify-center mt-6">
            <Badge className="bg-accent text-accent-foreground px-4 py-2 text-lg">
              <Star className="w-4 h-4 mr-1 fill-current" />
              <span className="font-bold">5.0</span>
              <span className="ml-2">359 reseñas en Google</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow" data-testid={`card-testimonial-${index}`}>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground mb-4" data-testid={`text-review-${index}`}>
                  "{testimonial.review}"
                </p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground" data-testid={`text-name-${index}`}>
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-date-${index}`}>
                      {testimonial.date}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-6">Calificados como #1 en TripAdvisor</p>
          <img 
            src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150" 
            alt="Premio Excelencia TripAdvisor" 
            className="mx-auto h-20 opacity-80"
          />
        </div>
      </div>
    </section>
  );
}
