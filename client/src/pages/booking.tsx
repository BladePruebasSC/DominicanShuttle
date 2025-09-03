import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Car, Clock, CheckCircle } from "lucide-react";
import { LOCATIONS, VEHICLE_TYPES, SERVICE_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertBooking } from "@shared/schema";

export default function Booking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      serviceType: "one_way",
      passengers: 1,
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      return await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      setCurrentStep(4);
      toast({
        title: "¡Reserva confirmada!",
        description: "Te contactaremos pronto para confirmar los detalles.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la reserva. Inténtalo de nuevo.",
      });
    },
  });

  const calculatePrice = (passengers: number, serviceType: string, vehicleType: string) => {
    const vehicle = VEHICLE_TYPES.find(v => v.value === vehicleType);
    if (!vehicle) return 0;
    
    const multiplier = serviceType === "round_trip" ? 1.8 : 1;
    return Math.round(vehicle.price * multiplier);
  };

  const getRecommendedVehicle = (passengers: number) => {
    if (passengers <= 3) return "sedan";
    if (passengers <= 6) return "suv";
    if (passengers <= 12) return "van";
    return "bus";
  };

  const onSubmit = (data: InsertBooking) => {
    const price = estimatedPrice || calculatePrice(data.passengers, data.serviceType, data.vehicleType);
    
    const bookingData = {
      ...data,
      estimatedPrice: price.toString(),
      pickupDate: new Date(data.pickupDate),
      returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
    };
    
    bookingMutation.mutate(bookingData);
  };

  const steps = [
    { number: 1, title: "Detalles del Viaje", icon: Car },
    { number: 2, title: "Información Personal", icon: Users },
    { number: 3, title: "Confirmación", icon: CheckCircle },
    { number: 4, title: "¡Completado!", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-muted pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Reserva Tu Transporte</h1>
          <p className="text-xl text-muted-foreground">
            Completa el formulario para reservar tu transporte premium
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.slice(0, 3).map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isActive ? "border-primary bg-primary text-white" :
                    isCompleted ? "border-green-500 bg-green-500 text-white" :
                    "border-muted-foreground bg-background text-muted-foreground"
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 2 && (
                    <div className={`w-8 h-0.5 ml-4 ${isCompleted ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && "Detalles del Viaje"}
              {currentStep === 2 && "Información Personal"}
              {currentStep === 3 && "Confirmar Reserva"}
              {currentStep === 4 && "¡Reserva Confirmada!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 4 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-4">¡Gracias por tu reserva!</h3>
                <p className="text-muted-foreground mb-6">
                  Hemos recibido tu solicitud de reserva. Te contactaremos pronto para confirmar todos los detalles.
                </p>
                <div className="bg-muted rounded-lg p-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold mb-2">Próximos pasos:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Recibirás un WhatsApp con los detalles del conductor</li>
                    <li>• Confirmaremos la hora exacta de recogida</li>
                    <li>• Te enviaremos el número de contacto del conductor</li>
                  </ul>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="pickupDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Recogida</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field}
                                  min={new Date().toISOString().slice(0, 16)}
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
                              <FormLabel>Número de Pasajeros</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="50"
                                  {...field}
                                  onChange={(e) => {
                                    const passengers = parseInt(e.target.value);
                                    field.onChange(passengers);
                                    const recommendedVehicle = getRecommendedVehicle(passengers);
                                    setSelectedVehicle(recommendedVehicle);
                                    form.setValue("vehicleType", recommendedVehicle);
                                  }}
                                  data-testid="input-passengers"
                                />
                              </FormControl>
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

                      {form.watch("serviceType") === "round_trip" && (
                        <FormField
                          control={form.control}
                          name="returnDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Regreso</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field}
                                  value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  data-testid="input-return-date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Vehículo</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {VEHICLE_TYPES.map((vehicle) => (
                                <div
                                  key={vehicle.value}
                                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                    field.value === vehicle.value 
                                      ? "border-primary bg-primary/10" 
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  onClick={() => {
                                    field.onChange(vehicle.value);
                                    setSelectedVehicle(vehicle.value);
                                  }}
                                  data-testid={`vehicle-option-${vehicle.value}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium">{vehicle.label}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Desde ${vehicle.price} USD
                                      </p>
                                    </div>
                                    <input
                                      type="radio"
                                      checked={field.value === vehicle.value}
                                      onChange={() => {}}
                                      className="text-primary"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedVehicle && form.watch("passengers") && form.watch("serviceType") && (
                        <div className="bg-muted rounded-lg p-6">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium">Precio estimado:</span>
                            <Badge variant="secondary" className="text-xl font-bold">
                              ${calculatePrice(form.watch("passengers"), form.watch("serviceType"), selectedVehicle)} USD
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre Completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre completo" {...field} data-testid="input-customer-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="tu@email.com" {...field} data-testid="input-customer-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono (WhatsApp)</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="+1 (xxx) xxx-xxxx" 
                                {...field} 
                                data-testid="input-customer-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Solicitudes Especiales (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={3} 
                                placeholder="Silla para bebé, equipaje extra, etc." 
                                {...field} 
                                data-testid="textarea-special-requests"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="bg-muted rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Resumen de tu Reserva</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Origen:</strong> {form.watch("origin")}</p>
                            <p><strong>Destino:</strong> {form.watch("destination")}</p>
                            <p><strong>Fecha:</strong> {form.watch("pickupDate") && new Date(form.watch("pickupDate")).toLocaleString()}</p>
                            {form.watch("returnDate") && (
                              <p><strong>Regreso:</strong> {new Date(form.watch("returnDate")).toLocaleString()}</p>
                            )}
                          </div>
                          <div>
                            <p><strong>Pasajeros:</strong> {form.watch("passengers")}</p>
                            <p><strong>Vehículo:</strong> {VEHICLE_TYPES.find(v => v.value === form.watch("vehicleType"))?.label}</p>
                            <p><strong>Servicio:</strong> {SERVICE_TYPES.find(s => s.value === form.watch("serviceType"))?.label}</p>
                            <p><strong>Precio Total:</strong> 
                              <Badge variant="secondary" className="ml-2">
                                ${calculatePrice(form.watch("passengers"), form.watch("serviceType"), form.watch("vehicleType"))} USD
                              </Badge>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Información Importante:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• El conductor te contactará 30 minutos antes de la recogida</li>
                          <li>• El pago se realiza directamente al conductor</li>
                          <li>• Incluye agua gratis y Wi-Fi en vehículos premium</li>
                          <li>• Cancelación gratuita hasta 24 horas antes</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && currentStep < 4 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep(currentStep - 1)}
                        data-testid="button-previous"
                      >
                        Anterior
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button 
                        type="button" 
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="ml-auto"
                        data-testid="button-next"
                      >
                        Siguiente
                      </Button>
                    ) : currentStep === 3 ? (
                      <Button 
                        type="submit" 
                        className="ml-auto"
                        disabled={bookingMutation.isPending}
                        data-testid="button-confirm-booking"
                      >
                        {bookingMutation.isPending ? "Procesando..." : "Confirmar Reserva"}
                      </Button>
                    ) : null}
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
