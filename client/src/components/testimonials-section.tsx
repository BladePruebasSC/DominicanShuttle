import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Alicia H.",
    initials: "AH",
    date: "Agosto 2025",
    rating: 5,
    review: "Excelente servicio! El transfer fue puntual, muy cómodo, y el conductor súper amable. Hizo que nuestro viaje en Punta Cana fuera libre de estrés. Lo recomiendo 100%.",
    source: "Google",
    color: "bg-primary",
  },
  {
    name: "Nathan Mapp",
    initials: "NM",
    date: "Septiembre 2025",
    rating: 5,
    review: "Estaba escéptico al principio, pero el servicio superó mis expectativas. Pago por adelantado, comunicación excelente por WhatsApp, y conductores profesionales. $35 por una van fue un precio justo.",
    source: "TripAdvisor",
    color: "bg-secondary",
  },
  {
    name: "Shanda Young",
    initials: "SY",
    date: "Agosto 2025",
    rating: 5,
    review: "Viajé con un grupo grande y el servicio fue excepcional. La comunicación fue excelente, el servicio profesional y la hospitalidad excepcional. Definitivamente los usaré otra vez.",
    source: "Google",
    color: "bg-accent",
  },
  {
    name: "Roberto M.",
    initials: "RM",
    date: "Julio 2025",
    rating: 5,
    review: "El servicio de transporte fue impecable. Puntualidad suiza en el Caribe. El conductor nos esperó con una sonrisa y nos ayudó con el equipaje.",
    source: "TripAdvisor",
    color: "bg-primary",
  },
  {
    name: "Sarah Jenkins",
    initials: "SJ",
    date: "Septiembre 2025",
    rating: 5,
    review: "Driver was waiting with a sign. Perfect service, clean vehicle, and professional driver. Made our vacation stress-free from the start.",
    source: "Google",
    color: "bg-secondary",
  },
  {
    name: "Marc D.",
    initials: "MD",
    date: "Agosto 2025",
    rating: 5,
    review: "La mejor experiencia VIP en Punta Cana. El vehículo estaba impecable y el servicio fue de primera clase. Sin duda volveré a usar este servicio.",
    source: "Google",
    color: "bg-accent",
  },
];

// Componente de reseña flotante (similar a TripAdvisor/Google)
function FloatingReview({ review, index }: { review: typeof testimonials[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 2000);

    return () => clearTimeout(timer);
  }, [index]);

  if (!isVisible) return null;

  return (
    <div
      className={`review-card-floating fixed bottom-20 left-4 md:left-6 z-40 max-w-[320px] animate-review-slide ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 8}s` }}
    >
      <div className="glass-panel rounded-sm p-4 border-l-4 border-coco-gold shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex text-coco-gold text-sm gap-0.5 flex-shrink-0">
            {[...Array(review.rating)].map((_, i) => (
              <i key={i} className="fas fa-star text-xs"></i>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-serif italic leading-relaxed mb-2">
              "{review.review}"
            </p>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-[9px] uppercase tracking-wider">
                — {review.name}
              </p>
              <span className="text-gray-500 text-[8px] uppercase tracking-widest">
                via {review.source}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [displayedReviews, setDisplayedReviews] = useState<typeof testimonials>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < testimonials.length) {
        setDisplayedReviews((prev) => [...prev, testimonials[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Reiniciar ciclo
        setDisplayedReviews([]);
        setCurrentIndex(0);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <>
      {/* Reseñas flotantes */}
      <div className="fixed bottom-0 left-0 z-40 pointer-events-none">
        {displayedReviews.map((review, index) => (
          <FloatingReview key={`${review.name}-${index}`} review={review} index={index} />
        ))}
      </div>

      {/* Sección principal de testimonios */}
      <section className="py-20 bg-void relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
              TESTIMONIOS
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto mb-6">
              Miles de turistas confían en nosotros para sus traslados en República Dominicana.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30 px-4 py-2 text-sm">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span className="font-bold">5.0</span>
                <span className="ml-2">359 reseñas</span>
              </Badge>
              <div className="flex items-center gap-2">
                <img
                  src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary-11900-2.svg"
                  alt="TripAdvisor"
                  className="h-6 opacity-80"
                />
                <span className="text-gray-500 text-xs">Calificado como #1</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-white/10 bg-glass-dark backdrop-blur-sm hover:border-coco-gold/30"
                data-testid={`card-testimonial-${index}`}
              >
                <CardContent className="p-6">
                  {/* Header con fuente y rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex text-coco-gold">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <i key={i} className="fas fa-star text-xs"></i>
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-500 text-[9px] uppercase tracking-widest">
                      {testimonial.source}
                    </span>
                  </div>

                  {/* Review text */}
                  <p
                    className="text-gray-300 mb-4 text-sm leading-relaxed font-serif italic"
                    data-testid={`text-review-${index}`}
                  >
                    "{testimonial.review}"
                  </p>

                  {/* Footer con avatar y nombre */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}
                      >
                        {testimonial.initials}
                      </div>
                      <div>
                        <div
                          className="font-semibold text-white text-sm"
                          data-testid={`text-name-${index}`}
                        >
                          {testimonial.name}
                        </div>
                        <div
                          className="text-xs text-gray-500"
                          data-testid={`text-date-${index}`}
                        >
                          {testimonial.date}
                        </div>
                      </div>
                    </div>
                    {/* Icono de verificación según la fuente */}
                    {testimonial.source === "Google" && (
                      <i className="fab fa-google text-coco-gold text-lg"></i>
                    )}
                    {testimonial.source === "TripAdvisor" && (
                      <i className="fab fa-tripadvisor text-coco-gold text-lg"></i>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">Calificados como #1 en TripAdvisor</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <img
                src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150"
                alt="Premio Excelencia TripAdvisor"
                className="h-16 opacity-80"
              />
              <div className="flex items-center gap-2">
                <i className="fab fa-google text-coco-gold text-2xl"></i>
                <span className="text-gray-400 text-sm">Google Business</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
