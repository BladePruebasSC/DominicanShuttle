import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { dataSource } from "@/lib/data-source";
import type { Tour } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Minus, Plus, CreditCard, Landmark, Wallet, Banknote } from "lucide-react";
import { format } from "date-fns";

const tourBookingSchema = z.object({
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().optional(),
  hotelOrPickup: z.string().optional(),
  tourDay: z.string().min(1, "Selecciona una fecha"),
  tourTime: z.string().min(1, "Selecciona una hora"),
  participants: z.coerce.number().int().min(1).max(200),
  paymentMethod: z.enum(["card", "transfer", "paypal", "cash"]).default("card"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof tourBookingSchema>;

export function TourBookingDialog({
  open,
  onOpenChange,
  tour,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tour: Tour | null;
}) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(tourBookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      hotelOrPickup: "",
      tourDay: "",
      tourTime: "09:00",
      participants: 2,
      paymentMethod: "card",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        hotelOrPickup: "",
        tourDay: "",
        tourTime: "09:00",
        participants: 2,
        paymentMethod: "card",
        notes: "",
      });
    }
  }, [open, form]);

  const participants = form.watch("participants");
  const paymentMethod = form.watch("paymentMethod");
  const tourDay = form.watch("tourDay");
  const tourTime = form.watch("tourTime");

  const basePrice = useMemo(() => {
    const raw = (tour as any)?.price;
    const n = typeof raw === "number" ? raw : parseFloat(String(raw || "0"));
    return Number.isFinite(n) ? n : 0;
  }, [tour]);

  const total = useMemo(() => {
    const p = typeof participants === "number" ? participants : parseInt(String(participants || "1"), 10);
    const qty = Number.isFinite(p) ? p : 1;
    return Math.round(basePrice * qty * 100) / 100;
  }, [basePrice, participants]);

  const onSubmit = async (values: FormValues) => {
    if (!tour) return;
    try {
      const iso = new Date(`${values.tourDay}T${values.tourTime}:00`).toISOString();
      await dataSource.createTourBooking({
        tourId: tour.id,
        tourName: tour.name,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone || null,
        tourDate: iso,
        participants: values.participants,
        totalPrice: total.toFixed(2) as any,
        currency: "USD" as any,
        paymentMethod: values.paymentMethod as any,
        paymentStatus: "pending" as any,
        notes: values.notes || null,
      });

      toast({
        title: "Solicitud enviada",
        description: "Recibimos tu reserva de tour. Te contactaremos para confirmar disponibilidad y coordinar el pago.",
      });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar",
        description: e?.message || "Intenta de nuevo",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-void border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-white">
            Reservar Tour{tour?.name ? `: ${tour.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-coco-gold/10 text-coco-gold border border-coco-gold/30">
            Desde ${basePrice} USD / persona
          </Badge>
          <Badge className="bg-white/5 text-gray-200 border border-white/10">
            Total estimado: <span className="ml-1 text-white font-semibold">${total} USD</span>
          </Badge>
          <Badge className="bg-white/5 text-gray-200 border border-white/10">
            Pago: <span className="ml-1 text-white font-semibold">próximamente</span>
          </Badge>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nombre</Label>
              <Input className="bg-void/50 border-white/10 text-white" {...form.register("customerName")} />
              {form.formState.errors.customerName && (
                <p className="text-red-400 text-xs mt-1">{form.formState.errors.customerName.message}</p>
              )}
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input className="bg-void/50 border-white/10 text-white" type="email" {...form.register("customerEmail")} />
              {form.formState.errors.customerEmail && (
                <p className="text-red-400 text-xs mt-1">{form.formState.errors.customerEmail.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Teléfono (WhatsApp)</Label>
              <Input className="bg-void/50 border-white/10 text-white" {...form.register("customerPhone")} placeholder="+1 ..." />
            </div>
            <div>
              <Label className="text-gray-300">Hotel / Punto de recogida (opcional)</Label>
              <Input className="bg-void/50 border-white/10 text-white" {...form.register("hotelOrPickup")} placeholder="Ej: Hotel Barceló / Lobby" />
            </div>
          </div>

          {/* Fecha + Hora (personalizado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Fecha del Tour</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full h-12 justify-start text-left font-normal bg-void/50 border-white/10 text-white hover:bg-void/70 hover:text-white ${
                      !tourDay ? "text-gray-500" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tourDay ? format(new Date(tourDay), "PPP") : <span>Selecciona fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-void border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={tourDay ? new Date(tourDay) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const isoDay = date.toISOString().slice(0, 10); // YYYY-MM-DD
                        form.setValue("tourDay", isoDay, { shouldValidate: true });
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="bg-void text-white"
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.tourDay && (
                <p className="text-red-400 text-xs mt-1">{form.formState.errors.tourDay.message}</p>
              )}
            </div>
            <div>
              <Label className="text-gray-300">Hora</Label>
              <div className="grid grid-cols-3 gap-2">
                {["08:00", "09:00", "10:00", "12:00", "14:00", "16:00"].map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant="outline"
                    onClick={() => form.setValue("tourTime", t, { shouldValidate: true })}
                    className={
                      tourTime === t
                        ? "bg-coco-gold/20 text-coco-gold border border-coco-gold/30 hover:bg-coco-gold/30"
                        : "bg-void/50 border-white/10 text-white hover:bg-white/5"
                    }
                  >
                    {t}
                  </Button>
                ))}
              </div>
              {form.formState.errors.tourTime && (
                <p className="text-red-400 text-xs mt-1">{form.formState.errors.tourTime.message}</p>
              )}
            </div>
          </div>

          {/* Participantes (sin flechitas) */}
          <div>
            <Label className="text-gray-300">Participantes</Label>
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("participants", Math.max(1, (participants || 1) - 1))}
                className="bg-void/50 border-white/10 text-white hover:bg-white/5"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 h-12 rounded-lg border border-white/10 bg-void/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{participants}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("participants", Math.min(200, (participants || 1) + 1))}
                className="bg-void/50 border-white/10 text-white hover:bg-white/5"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preferencia de pago (sin procesar aún) */}
          <div>
            <Label className="text-gray-300">Método de pago (preferencia)</Label>
            <p className="text-xs text-gray-400 mt-1">
              Aún no procesamos pagos en la web. Esto solo nos ayuda a prepararte el enlace/instrucciones cuando confirmemos disponibilidad.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[
                { key: "card", label: "Tarjeta", icon: CreditCard },
                { key: "paypal", label: "PayPal", icon: Wallet },
                { key: "transfer", label: "Transferencia", icon: Landmark },
                { key: "cash", label: "Efectivo", icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === (m.key as any);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => form.setValue("paymentMethod", m.key as any)}
                    className={
                      "text-left rounded-lg border p-4 transition " +
                      (active
                        ? "border-coco-gold/40 bg-coco-gold/10"
                        : "border-white/10 bg-void/40 hover:bg-white/5")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-white/10 bg-void/50 flex items-center justify-center">
                        <Icon className={active ? "text-coco-gold" : "text-gray-300"} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{m.label}</p>
                        <p className="text-xs text-gray-400">Próximamente</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Notas (opcional)</Label>
            <Textarea className="bg-void/50 border-white/10 text-white" rows={3} {...form.register("notes")} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-coco-gold hover:text-black font-bold uppercase text-xs tracking-[0.2em]">
              Continuar (confirmación)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

