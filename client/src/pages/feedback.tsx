import { useState } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl transition ${
            n <= value ? "text-coco-gold" : "text-gray-500 hover:text-coco-gold/70"
          }`}
          aria-label={`Calificar ${n} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [, params] = useRoute("/feedback/:id");
  const bookingId = params?.id ?? "";
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [improvement, setImprovement] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) {
      toast({
        title: "Enlace inválido",
        description: "No encontramos el identificador de la reserva.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/feedback", {
        bookingId,
        rating,
        comment: comment.trim() || null,
        improvement: improvement.trim() || null,
        source: "internal",
      });
      setSubmitted(true);
      toast({
        title: "Gracias por tu opinión",
        description: "Tu respuesta fue enviada correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "No se pudo enviar",
        description: error?.message || "Intenta nuevamente en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-white font-serif text-3xl">Encuesta CocoLuxe</CardTitle>
            <CardDescription className="text-gray-400">
              Nos ayuda a mejorar cada servicio. Reserva: {bookingId || "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
                Gracias por tu tiempo. Tu feedback ya fue registrado.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <Label className="text-gray-300 text-sm">1) ¿Cómo fue tu experiencia?</Label>
                  <div className="mt-2">
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment" className="text-gray-300 text-sm">
                    2) ¿Qué fue lo mejor del servicio? (opcional)
                  </Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    className="mt-2 bg-void/50 border-white/10 text-white placeholder:text-gray-500"
                    placeholder="Cuéntanos qué te encantó..."
                  />
                </div>

                <div>
                  <Label htmlFor="improvement" className="text-gray-300 text-sm">
                    3) ¿Hay algo que podríamos mejorar? (opcional)
                  </Label>
                  <Textarea
                    id="improvement"
                    value={improvement}
                    onChange={(e) => setImprovement(e.target.value)}
                    maxLength={500}
                    className="mt-2 bg-void/50 border-white/10 text-white placeholder:text-gray-500"
                    placeholder="Tu sugerencia nos ayuda mucho..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black hover:bg-coco-gold hover:text-black font-bold uppercase text-xs tracking-[0.2em]"
                >
                  {loading ? "Enviando..." : "Enviar encuesta"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
