import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search } from "lucide-react";
import { LOCATIONS, VEHICLE_TYPES, SERVICE_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const bookingFormSchema = z.object({
  origin: z.string().min(1, "Selecciona el origen"),
  destination: z.string().min(1, "Selecciona el destino"),
  pickupDate: z.string().min(1, "Selecciona la fecha"),
  passengers: z.string().min(1, "Selecciona el número de pasajeros"),
  serviceType: z.enum(["one_way", "round_trip"]),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function BookingWidget() {
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceType: "one_way",
    },
  });

  const onSubmit = (data: BookingFormData) => {
    // Calculate estimated price based on vehicle type and service type
    const vehicleType = VEHICLE_TYPES.find(v => 
      (data.passengers === "1-3" && v.value === "sedan") ||
      (data.passengers === "4-6" && v.value === "suv") ||
      (data.passengers === "7-10" && v.value === "van") ||
      (data.passengers === "11+" && v.value === "bus")
    );
    
    if (vehicleType) {
      const price = data.serviceType === "round_trip" 
        ? vehicleType.price * 1.8 
        : vehicleType.price;
      setEstimatedPrice(price);
    }

    toast({
      title: "Disponibilidad encontrada",
      description: `Se encontraron vehículos disponibles para tu viaje. Precio estimado: $${estimatedPrice} USD`,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto lg:mx-0 shadow-2xl glass-panel border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-2xl font-serif font-bold text-white">Reserva Tu Transporte</CardTitle>
      </CardHeader>
      <CardContent className="bg-transparent">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-origin">
                          <SelectValue placeholder="Selecciona origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.AIRPORTS.map((airport) => (
                          <SelectItem key={airport.value} value={airport.value}>
                            {airport.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="hotel">Hotel/Resort</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-destination">
                          <SelectValue placeholder="Selecciona destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.DESTINATIONS.map((destination) => (
                          <SelectItem key={destination.value} value={destination.value}>
                            {destination.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        min={new Date().toISOString().split('T')[0]}
                        data-testid="input-pickup-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasajeros</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-passengers">
                          <SelectValue placeholder="# Pasajeros" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-3">1-3 Pasajeros</SelectItem>
                        <SelectItem value="4-6">4-6 Pasajeros</SelectItem>
                        <SelectItem value="7-10">7-10 Pasajeros</SelectItem>
                        <SelectItem value="11+">11+ Pasajeros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Servicio</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                      data-testid="radio-service-type"
                    >
                      {SERVICE_TYPES.map((service) => (
                        <div key={service.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={service.value} id={service.value} />
                          <label htmlFor={service.value} className="text-sm font-medium">
                            {service.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-coco-gold hover:text-black transition shadow-[0_0_20px_rgba(255,255,255,0.2)] font-bold uppercase text-xs tracking-[0.2em]" 
              size="lg" 
              data-testid="button-search-availability"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar Disponibilidad
            </Button>

            {estimatedPrice && (
              <div className="text-center p-4 bg-coco-gold/10 border border-coco-gold/30 rounded-lg">
                <p className="text-sm text-gray-300">
                  Precio estimado desde{" "}
                  <span className="font-bold text-coco-gold" data-testid="text-estimated-price">
                    ${estimatedPrice} USD
                  </span>
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
