import { useState, useEffect } from "react";
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
import { CalendarDays, Users, Car, Clock, CheckCircle, CreditCard, Landmark, Wallet, Banknote } from "lucide-react";
import { LOCATIONS, SERVICE_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InsertBooking } from "@shared/schema";
import GooglePlacesAutocomplete from "@/components/google-places-autocomplete";
import RouteMap from "@/components/route-map";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { dataSource } from "@/lib/data-source";
import { PhoneInput } from "@/components/phone-input";

export default function Booking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [showMap, setShowMap] = useState(false);
  const [originPlaceId, setOriginPlaceId] = useState<string>("");
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>("");
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      serviceType: "one_way",
      passengers: 1,
      paymentMethod: "card",
    },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => dataSource.listVehicles(),
  });

  // Mostrar mapa cuando hay origen y destino
  const origin = form.watch("origin");
  const destination = form.watch("destination");
  
  useEffect(() => {
    if (origin && destination) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  }, [origin, destination]);

  // Leer datos del sessionStorage si existen
  useEffect(() => {
    const bookingData = sessionStorage.getItem("bookingData");
    if (bookingData) {
      try {
        const data = JSON.parse(bookingData);
        if (data.origin) form.setValue("origin", data.origin);
        if (data.destination) form.setValue("destination", data.destination);
        if (data.passengers) {
          const passengers = parseInt(data.passengers);
          form.setValue("passengers", passengers);
        }
        if (data.vehicleId) {
          setSelectedVehicleId(data.vehicleId);
          form.setValue("vehicleId", data.vehicleId);
        }
        if (data.vehicleType) form.setValue("vehicleType", data.vehicleType);
        if (data.serviceType) form.setValue("serviceType", data.serviceType as "one_way" | "round_trip");
        if (data.estimatedPrice) setEstimatedPrice(data.estimatedPrice);
        if (data.pickupDate) form.setValue("pickupDate", data.pickupDate);
        
        // Limpiar sessionStorage después de leer
        sessionStorage.removeItem("bookingData");
        
        // Avanzar al paso 2 si hay datos suficientes
        if (data.origin && data.destination && (data.vehicleType || data.vehicleId)) {
          setCurrentStep(2);
        }
      } catch (e) {
        console.error("Error parsing booking data:", e);
      }
    }
  }, [form]);

  // Preselección desde /fleet?vehicleId=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get("vehicleId");
    if (!vehicleId) return;
    setSelectedVehicleId(vehicleId);
    form.setValue("vehicleId", vehicleId);
  }, [form]);

  // Si tenemos vehicleId seleccionado, completar vehicleType automáticamente
  useEffect(() => {
    if (!selectedVehicleId) return;
    const v = vehicles.find((x: any) => x.id === selectedVehicleId);
    if (!v) return;
    form.setValue("vehicleType", v.type);
  }, [selectedVehicleId, vehicles, form]);

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      return await dataSource.createTransportBooking(data);
    },
    onSuccess: () => {
      setCurrentStep(4);
      toast({
        title: "¡Reserva confirmada!",
        description: "Te contactaremos pronto para confirmar los detalles.",
      });
      queryClient.invalidateQueries({ queryKey: ["transportBookings"] });
    },
    onError: (error: any) => {
      const status = error?.status ?? error?.statusCode ?? error?.code;
      const message = error?.message || error?.details || String(error);

      const isBookingsNotExposed =
        String(status) === "404" ||
        /relation .*bookings/i.test(message) ||
        /could not find the.*bookings/i.test(message);

      toast({
        variant: "destructive",
        title: "Error",
        description: isBookingsNotExposed
          ? "Supabase respondió 404 para 'bookings' (tabla no creada o sin permisos). Ejecuta la migración 007 y el script de GRANTS para exponerla."
          : message || "No se pudo procesar la reserva. Inténtalo de nuevo.",
      });
    },
  });

  const onInvalid = () => {
    toast({
      variant: "destructive",
      title: "Faltan datos para confirmar",
      description: "Revisa origen, destino, fecha/hora, vehículo y teléfono antes de confirmar.",
    });
  };

  const calculatePrice = (serviceType: string, vehicleId?: string) => {
    const v = vehicles.find((x: any) => x.id === vehicleId);
    const base = v ? Number(v.basePrice) : 0;
    const multiplier = serviceType === "round_trip" ? 1.8 : 1;
    return Math.round(base * multiplier);
  };

  const getRecommendedVehicleId = (passengers: number) => {
    const sorted = vehicles
      .slice()
      .sort((a: any, b: any) => Number(a.capacity) - Number(b.capacity));
    const fit = sorted.find((v: any) => Number(v.capacity) >= passengers);
    return fit?.id || sorted[0]?.id || "";
  };

  const onSubmit = (data: InsertBooking) => {
    const price = estimatedPrice || calculatePrice(data.serviceType, data.vehicleId || selectedVehicleId);
    
    const bookingData = {
      ...data,
      estimatedPrice: price.toString(),
      vehicleId: data.vehicleId || selectedVehicleId || undefined,
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
    <div className="min-h-screen bg-void pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-coco-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">
            RESERVA
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Reserva Tu Transporte
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Completa el formulario para reservar tu transporte premium
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-4">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-max">
            {steps.slice(0, 3).map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex flex-col items-center ${index < steps.length - 2 ? "mr-2 md:mr-4" : ""}`}>
                    <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all ${
                      isActive ? "border-coco-gold bg-coco-gold text-black" :
                      isCompleted ? "border-coco-gold bg-coco-gold/20 text-coco-gold" :
                      "border-white/20 bg-void/50 text-gray-500"
                    }`}>
                      <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <p className={`text-xs md:text-sm font-medium mt-2 hidden sm:block whitespace-nowrap ${
                      isActive ? "text-coco-gold" : "text-gray-400"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 2 && (
                    <div className={`w-4 md:w-8 h-0.5 transition-colors ${
                      isCompleted ? "bg-coco-gold" : "bg-white/20"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="shadow-xl glass-panel border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-2xl text-white font-serif">
              {currentStep === 1 && "Trip Details"}
              {currentStep === 2 && "Personal Information"}
              {currentStep === 3 && "Confirm Booking"}
              {currentStep === 4 && "Booking Confirmed!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-transparent">
            {currentStep === 4 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-24 h-24 text-coco-gold mx-auto mb-6" />
                <h3 className="text-2xl font-serif text-white mb-4">¡Gracias por tu reserva!</h3>
                <p className="text-gray-400 mb-6">
                  Hemos recibido tu solicitud de reserva. Te contactaremos pronto para confirmar todos los detalles.
                </p>
                <div className="bg-void/50 border border-white/10 rounded-lg p-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold mb-2 text-white">Próximos pasos:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Recibirás un WhatsApp con los detalles del conductor</li>
                    <li>• Confirmaremos la hora exacta de recogida</li>
                    <li>• Te enviaremos el número de contacto del conductor</li>
                  </ul>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="origin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">From *</FormLabel>
                              <FormControl>
                                <GooglePlacesAutocomplete
                                  value={field.value || ""}
                                  onChange={(value, placeId) => {
                                    field.onChange(value);
                                    if (placeId) setOriginPlaceId(placeId);
                                  }}
                                  onPlaceSelect={(place) => {
                                    if (place.geometry?.location) {
                                      setOriginCoords({
                                        lat: place.geometry.location.lat(),
                                        lng: place.geometry.location.lng(),
                                      });
                                    }
                                  }}
                                  placeholder="Buscar origen (aeropuerto, hotel, dirección...)"
                                  label=""
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">To *</FormLabel>
                              <FormControl>
                                <GooglePlacesAutocomplete
                                  value={field.value || ""}
                                  onChange={(value, placeId) => {
                                    field.onChange(value);
                                    if (placeId) setDestinationPlaceId(placeId);
                                  }}
                                  onPlaceSelect={(place) => {
                                    if (place.geometry?.location) {
                                      setDestinationCoords({
                                        lat: place.geometry.location.lat(),
                                        lng: place.geometry.location.lng(),
                                      });
                                    }
                                  }}
                                  placeholder="Buscar destino (hotel, playa, dirección...)"
                                  label=""
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Mapa de ruta */}
                      {showMap && form.watch("origin") && form.watch("destination") && (
                        <div className="mt-6">
                          <RouteMap
                            origin={form.watch("origin")}
                            destination={form.watch("destination")}
                            originPlaceId={originPlaceId}
                            destinationPlaceId={destinationPlaceId}
                            originCoords={originCoords}
                            destinationCoords={destinationCoords}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="pickupDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Pick-up date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={`w-full h-12 justify-start text-left font-normal bg-void/50 border-white/10 text-white hover:bg-void/70 hover:text-white ${
                                        !field.value && "text-gray-500"
                                      }`}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(new Date(field.value), "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-void border-white/10" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        // Mantener la hora existente si hay
                                        if (field.value) {
                                          const existingDate = new Date(field.value);
                                          date.setHours(existingDate.getHours());
                                          date.setMinutes(existingDate.getMinutes());
                                        } else {
                                          date.setHours(0);
                                          date.setMinutes(0);
                                        }
                                        field.onChange(date.toISOString());
                                      }
                                    }}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                    className="bg-void text-white"
                                    classNames={{
                                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                      month: "space-y-4",
                                      caption: "flex justify-center pt-1 relative items-center",
                                      caption_label: "text-sm font-medium text-white",
                                      nav: "space-x-1 flex items-center",
                                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border-white/20",
                                      nav_button_previous: "absolute left-1",
                                      nav_button_next: "absolute right-1",
                                      table: "w-full border-collapse space-y-1",
                                      head_row: "flex",
                                      head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                                      row: "flex w-full mt-2",
                                      cell: "h-9 w-9 text-center text-sm p-0 relative",
                                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-coco-gold/20 hover:text-white",
                                      day_selected: "bg-coco-gold text-black hover:bg-coco-gold hover:text-black focus:bg-coco-gold focus:text-black",
                                      day_today: "bg-coco-gold/30 text-white",
                                      day_outside: "text-gray-500 opacity-50",
                                      day_disabled: "text-gray-500 opacity-50",
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupDate"
                          render={({ field }) => {
                            // Extraer hora y minutos del timestamp
                            let dateValue: Date;
                            if (field.value) {
                              dateValue = new Date(field.value);
                              // Si la fecha no es válida, usar fecha de hoy
                              if (isNaN(dateValue.getTime())) {
                                dateValue = new Date();
                              }
                            } else {
                              dateValue = new Date();
                            }
                            
                            const hours = String(dateValue.getHours()).padStart(2, "0");
                            const minutes = String(dateValue.getMinutes()).padStart(2, "0");
                            
                            // Generar opciones de horas (00-23)
                            const hourOptions = Array.from({ length: 24 }, (_, i) => 
                              String(i).padStart(2, "0")
                            );
                            
                            // Generar opciones de minutos (00, 15, 30, 45)
                            const minuteOptions = ["00", "15", "30", "45"];
                            const quickTimes = ["08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

                            const handleTimeChange = (newHours: string, newMinutes: string) => {
                              const hoursNum = parseInt(newHours) || 0;
                              const minutesNum = parseInt(newMinutes) || 0;
                              
                              if (field.value) {
                                const date = new Date(field.value);
                                if (!isNaN(date.getTime())) {
                                  date.setHours(hoursNum);
                                  date.setMinutes(minutesNum);
                                  date.setSeconds(0);
                                  date.setMilliseconds(0);
                                  field.onChange(date.toISOString());
                                } else {
                                  // Si la fecha guardada no es válida, crear una nueva con la fecha de hoy
                                  const today = new Date();
                                  today.setHours(hoursNum);
                                  today.setMinutes(minutesNum);
                                  today.setSeconds(0);
                                  today.setMilliseconds(0);
                                  field.onChange(today.toISOString());
                                }
                              } else {
                                // Si no hay fecha, usar la fecha de hoy como base
                                const today = new Date();
                                today.setHours(hoursNum);
                                today.setMinutes(minutesNum);
                                today.setSeconds(0);
                                today.setMilliseconds(0);
                                
                                // Verificar que la fecha sea válida antes de guardar
                                if (!isNaN(today.getTime())) {
                                  field.onChange(today.toISOString());
                                }
                              }
                            };

                            return (
                              <FormItem>
                                <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">
                                  Pick-up time * <span className="text-gray-500 text-[10px] normal-case">(24-hour format)</span>
                                </FormLabel>
                                <FormControl>
                                  <div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {quickTimes.map((t) => {
                                        const [h, m] = t.split(":");
                                        const isActive = `${hours}:${minutes}` === t;
                                        return (
                                          <Button
                                            key={t}
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleTimeChange(h, m)}
                                            className={
                                              isActive
                                                ? "bg-coco-gold/20 text-coco-gold border border-coco-gold/30 hover:bg-coco-gold/30"
                                                : "bg-void/50 border-white/10 text-white hover:bg-white/5"
                                            }
                                          >
                                            {t}
                                          </Button>
                                        );
                                      })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={hours}
                                        onValueChange={(value) => handleTimeChange(value, minutes)}
                                      >
                                        <SelectTrigger className="bg-void/50 border-white/10 text-white focus:border-coco-gold h-12 flex-1">
                                          <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-void border-white/10 max-h-[200px]">
                                          {hourOptions.map((hour) => (
                                            <SelectItem
                                              key={hour}
                                              value={hour}
                                              className="text-white hover:bg-coco-gold/20"
                                            >
                                              {hour}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      <span className="text-white text-lg font-bold">:</span>

                                      <Select
                                        value={minutes}
                                        onValueChange={(value) => handleTimeChange(hours, value)}
                                      >
                                        <SelectTrigger className="bg-void/50 border-white/10 text-white focus:border-coco-gold h-12 flex-1">
                                          <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-void border-white/10">
                                          {minuteOptions.map((minute) => (
                                            <SelectItem
                                              key={minute}
                                              value={minute}
                                              className="text-white hover:bg-coco-gold/20"
                                            >
                                              {minute}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="passengers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Passengers *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value?.toString() || "1"}
                                  onValueChange={(value) => {
                                    const passengers = parseInt(value);
                                    field.onChange(passengers);
                                    const recommendedVehicleId = getRecommendedVehicleId(passengers);
                                    if (recommendedVehicleId) {
                                      setSelectedVehicleId(recommendedVehicleId);
                                      form.setValue("vehicleId", recommendedVehicleId);
                                      const v = vehicles.find((x: any) => x.id === recommendedVehicleId);
                                      if (v) form.setValue("vehicleType", v.type);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-void/50 border-white/10 text-white focus:border-coco-gold h-12">
                                    <SelectValue placeholder="Selecciona" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-void border-white/10 max-h-[200px]">
                                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                                      <SelectItem 
                                        key={num} 
                                        value={num.toString()}
                                        className="text-white hover:bg-coco-gold/20"
                                      >
                                        {num} {num === 1 ? "passenger" : "passengers"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                            <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Service Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                data-testid="radio-service-type"
                              >
                                {SERVICE_TYPES.map((service) => (
                                  <div key={service.value} className="flex items-center space-x-2 border border-white/10 rounded-lg p-3 hover:border-coco-gold/30 transition-colors">
                                    <RadioGroupItem value={service.value} id={service.value} className="border-coco-gold text-coco-gold" />
                                    <label htmlFor={service.value} className="text-sm font-medium text-gray-300 cursor-pointer">
                                      {service.value === "one_way" ? "One-way" : "Round trip"}
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
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Return Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={`w-full h-12 justify-start text-left font-normal bg-void/50 border-white/10 text-white hover:bg-void/70 hover:text-white ${
                                        !field.value && "text-gray-500"
                                      }`}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(new Date(field.value), "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-void border-white/10" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        // Mantener la hora existente si hay
                                        if (field.value) {
                                          const existingDate = new Date(field.value);
                                          date.setHours(existingDate.getHours());
                                          date.setMinutes(existingDate.getMinutes());
                                        } else {
                                          date.setHours(0);
                                          date.setMinutes(0);
                                        }
                                        field.onChange(date.toISOString());
                                      }
                                    }}
                                    disabled={(date) => {
                                      const pickupDate = form.watch("pickupDate");
                                      if (pickupDate) {
                                        return date < new Date(pickupDate);
                                      }
                                      return date < new Date(new Date().setHours(0, 0, 0, 0));
                                    }}
                                    initialFocus
                                    className="bg-void text-white"
                                    classNames={{
                                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                      month: "space-y-4",
                                      caption: "flex justify-center pt-1 relative items-center",
                                      caption_label: "text-sm font-medium text-white",
                                      nav: "space-x-1 flex items-center",
                                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border-white/20",
                                      nav_button_previous: "absolute left-1",
                                      nav_button_next: "absolute right-1",
                                      table: "w-full border-collapse space-y-1",
                                      head_row: "flex",
                                      head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                                      row: "flex w-full mt-2",
                                      cell: "h-9 w-9 text-center text-sm p-0 relative",
                                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-coco-gold/20 hover:text-white",
                                      day_selected: "bg-coco-gold text-black hover:bg-coco-gold hover:text-black focus:bg-coco-gold focus:text-black",
                                      day_today: "bg-coco-gold/30 text-white",
                                      day_outside: "text-gray-500 opacity-50",
                                      day_disabled: "text-gray-500 opacity-50",
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Choose your vehicle *</FormLabel>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vehicles.map((vehicle: any) => {
                                  const passengers = form.watch("passengers") || 1;
                                  const isRecommended = vehicle.id === getRecommendedVehicleId(passengers);
                                  const isSelected = selectedVehicleId === vehicle.id;
                                  const price = calculatePrice(form.watch("serviceType"), vehicle.id);

                                  return (
                                    <div
                                      key={vehicle.id}
                                      onClick={() => {
                                        setSelectedVehicleId(vehicle.id);
                                        form.setValue("vehicleId", vehicle.id);
                                        field.onChange(vehicle.type);
                                        setEstimatedPrice(price);
                                        form.setValue("estimatedPrice", price.toString());
                                      }}
                                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                        isSelected
                                          ? "border-coco-gold bg-coco-gold/10 ring-2 ring-coco-gold/50"
                                          : "border-white/10 hover:border-coco-gold/30 bg-void/30"
                                      }`}
                                      data-testid={`vehicle-option-${vehicle.id}`}
                                    >
                                      {/* Vehicle Image */}
                                      <div className="relative h-32 w-full overflow-hidden bg-void/50">
                                        <img
                                          src={vehicle.imageUrl || "https://via.placeholder.com/400x200/1a1a1a/D4AF37?text=Vehicle"}
                                          alt={vehicle.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            // Fallback si la imagen no carga
                                            e.currentTarget.src = "https://via.placeholder.com/400x200/1a1a1a/D4AF37?text=" + encodeURIComponent(vehicle.name);
                                          }}
                                        />
                                        {isRecommended && (
                                          <span className="absolute top-2 right-2 text-xs bg-coco-gold/90 text-black px-2 py-1 rounded font-bold">
                                            Recomendado
                                          </span>
                                        )}
                                        {isSelected && (
                                          <div className="absolute top-2 left-2 w-6 h-6 bg-coco-gold rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Vehicle Info */}
                                      <div className="p-4">
                                        <h5 className="font-semibold text-white text-sm mb-2">{vehicle.name}</h5>
                                        
                                        {/* Capacity Icons */}
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                          <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                            </svg>
                                            <span>{vehicle.capacityText || `${vehicle.capacity} pax`}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                            </svg>
                                            <span>{vehicle.luggageText || `${vehicle.luggageCapacity} maletas`}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Price */}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                          <div>
                                            <span className="text-gray-400 text-xs">
                                              {form.watch("serviceType") === "round_trip" ? "Round trip" : "One way"}
                                            </span>
                                            <p className="text-coco-gold font-bold text-lg">${price} USD</p>
                                          </div>
                                          <input
                                            type="radio"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            className="w-5 h-5 text-coco-gold accent-coco-gold cursor-pointer"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {selectedVehicleId && form.watch("serviceType") && (
                        <div className="bg-coco-gold/10 border border-coco-gold/30 rounded-lg p-6">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-lg font-medium text-white">Estimated price:</span>
                            <Badge className="bg-coco-gold/20 text-coco-gold border border-coco-gold/30 text-xl font-bold px-4 py-2">
                              ${calculatePrice(form.watch("serviceType"), selectedVehicleId)} USD
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
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your full name" 
                                  {...field} 
                                  className="bg-void/50 border-white/10 text-white placeholder:text-gray-500 focus:border-coco-gold"
                                  data-testid="input-customer-name" 
                                />
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
                              <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="tu@email.com" 
                                  {...field} 
                                  className="bg-void/50 border-white/10 text-white placeholder:text-gray-500 focus:border-coco-gold"
                                  data-testid="input-customer-email" 
                                />
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
                            <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Phone (WhatsApp)</FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={field.value}
                                onChange={(v) => field.onChange(v)}
                                placeholder="809 000 0000"
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
                            <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Special Requests (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={3} 
                                placeholder="Baby seat, extra luggage, etc." 
                                {...field} 
                                value={field.value ?? ""}
                                className="bg-void/50 border-white/10 text-white placeholder:text-gray-500 focus:border-coco-gold"
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
                      <div className="bg-void/50 border border-white/10 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 text-white">Resumen de tu Reserva</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p className="text-gray-300"><strong className="text-white">Origen:</strong> {form.watch("origin")}</p>
                            <p className="text-gray-300"><strong className="text-white">Destino:</strong> {form.watch("destination")}</p>
                            <p className="text-gray-300">
                              <strong className="text-white">Fecha:</strong>{" "}
                              {(() => {
                                const d = form.watch("pickupDate");
                                return d ? new Date(d as any).toLocaleString() : "—";
                              })()}
                            </p>
                            {(() => {
                              const rd = form.watch("returnDate");
                              return rd ? (
                                <p className="text-gray-300">
                                  <strong className="text-white">Regreso:</strong> {new Date(rd as any).toLocaleString()}
                                </p>
                              ) : null;
                            })()}
                          </div>
                          <div className="space-y-2">
                            <p className="text-gray-300"><strong className="text-white">Passengers:</strong> {form.watch("passengers")}</p>
                            <p className="text-gray-300"><strong className="text-white">Vehicle:</strong> {vehicles.find((v: any) => v.id === (form.watch("vehicleId") || selectedVehicleId))?.name || form.watch("vehicleType")}</p>
                            <p className="text-gray-300"><strong className="text-white">Service:</strong> {form.watch("serviceType") === "one_way" ? "One-way" : "Round trip"}</p>
                            <p className="text-gray-300"><strong className="text-white">Pago:</strong> {String(form.watch("paymentMethod") || "card")}</p>
                            <p className="text-gray-300"><strong className="text-white">Total Price:</strong> 
                              <Badge className="ml-2 bg-coco-gold/20 text-coco-gold border border-coco-gold/30">
                                ${calculatePrice(form.watch("serviceType"), form.watch("vehicleId") || selectedVehicleId)} USD
                              </Badge>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-void/50 border border-white/10 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-2">Método de pago (preferencia)</h4>
                        <p className="text-xs text-gray-400 mb-4">
                          Aún no procesamos pagos online. Al confirmar disponibilidad, te enviamos el enlace/instrucciones según el método seleccionado.
                        </p>

                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => {
                            const methods = [
                              { key: "card", label: "Tarjeta", icon: CreditCard },
                              { key: "paypal", label: "PayPal", icon: Wallet },
                              { key: "transfer", label: "Transferencia", icon: Landmark },
                              { key: "cash", label: "Efectivo", icon: Banknote },
                            ] as const;

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {methods.map((m) => {
                                  const Icon = m.icon;
                                  const active = field.value === m.key;
                                  return (
                                    <button
                                      key={m.key}
                                      type="button"
                                      onClick={() => field.onChange(m.key)}
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
                            );
                          }}
                        />
                      </div>

                      <div className="bg-coco-gold/10 border border-coco-gold/30 rounded-lg p-4">
                        <h4 className="font-semibold text-coco-gold mb-2">Important Information:</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• The driver will contact you 30 minutes before pickup</li>
                          <li>• El pago se coordina según el método seleccionado (por ahora)</li>
                          <li>• Includes free water and Wi-Fi in premium vehicles</li>
                          <li>• Free cancellation up to 24 hours before</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 flex-wrap gap-4">
                    {currentStep > 1 && currentStep < 4 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="bg-void/60 border-white/40 text-white hover:bg-white/15 hover:text-white"
                        data-testid="button-previous"
                      >
                        Anterior
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button 
                        type="button" 
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="ml-auto bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
                        data-testid="button-next"
                      >
                        Next
                      </Button>
                    ) : currentStep === 3 ? (
                      <Button 
                        type="submit" 
                        className="ml-auto bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
                        disabled={bookingMutation.isPending}
                        data-testid="button-confirm-booking"
                      >
                        {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
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
