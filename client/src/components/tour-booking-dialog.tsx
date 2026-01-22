import { useEffect } from "react";
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

const tourBookingSchema = z.object({
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().optional(),
  tourDate: z.string().min(1, "Selecciona una fecha"),
  participants: z.coerce.number().int().min(1).max(200),
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
      tourDate: "",
      participants: 2,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        tourDate: "",
        participants: 2,
        notes: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!tour) return;
    try {
      await dataSource.createTourBooking({
        tourId: tour.id,
        tourName: tour.name,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone || null,
        tourDate: new Date(values.tourDate).toISOString(),
        participants: values.participants,
        notes: values.notes || null,
      });

      toast({
        title: "Solicitud enviada",
        description: "Recibimos tu reserva de tour. Te contactaremos para confirmar disponibilidad.",
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
      <DialogContent className="bg-void border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-white">
            Reservar Tour{tour?.name ? `: ${tour.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Label className="text-gray-300">Fecha del Tour</Label>
              <Input className="bg-void/50 border-white/10 text-white" type="datetime-local" {...form.register("tourDate")} />
              {form.formState.errors.tourDate && (
                <p className="text-red-400 text-xs mt-1">{form.formState.errors.tourDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Participantes</Label>
            <Input className="bg-void/50 border-white/10 text-white" type="number" min={1} max={200} {...form.register("participants")} />
          </div>

          <div>
            <Label className="text-gray-300">Notas (opcional)</Label>
            <Textarea className="bg-void/50 border-white/10 text-white" rows={3} {...form.register("notes")} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="bg-white text-black hover:bg-coco-gold hover:text-black font-bold uppercase text-xs tracking-[0.2em]">
              Enviar solicitud
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

