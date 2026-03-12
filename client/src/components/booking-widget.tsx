import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, MapPin, Users, Calendar, Car } from "lucide-react";
import { LOCATIONS, VEHICLE_TYPES, SERVICE_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import GooglePlacesAutocomplete from "@/components/google-places-autocomplete";
import RouteMap from "@/components/route-map";

const bookingFormSchema = z.object({
  origin: z.string().min(1, "Selecciona el origen"),
  destination: z.string().min(1, "Selecciona el destino"),
  pickupDate: z.string().min(1, "Selecciona la fecha"),
  pickupTime: z.string().min(1, "Selecciona la hora"),
  passengers: z.string().min(1, "Selecciona el número de pasajeros"),
  bags: z.string().optional(),
  serviceType: z.enum(["one_way", "round_trip"]),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function BookingWidget() {
  const [currentStep, setCurrentStep] = useState<"trip" | "vehicle" | "passenger">("trip");
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [showMap, setShowMap] = useState(false);
  const [originPlaceId, setOriginPlaceId] = useState<string>("");
  const [destinationPlaceId, setDestinationPlaceId] = useState<string>("");
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | undefined>();
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceType: "one_way",
      passengers: "1",
      bags: "0",
    },
  });

  const origin = form.watch("origin");
  const destination = form.watch("destination");
  const passengers = parseInt(form.watch("passengers") || "1");
  const serviceType = form.watch("serviceType");

  // Mostrar mapa cuando hay origen y destino
  useEffect(() => {
    if (origin && destination) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  }, [origin, destination]);

  // Calcular vehículo recomendado
  useEffect(() => {
    if (passengers) {
      let recommended = "sedan";
      if (passengers <= 3) recommended = "sedan";
      else if (passengers <= 6) recommended = "suv";
      else if (passengers <= 12) recommended = "van";
      else recommended = "bus";
      
      setSelectedVehicle(recommended);
      form.setValue("passengers", passengers.toString());
    }
  }, [passengers, form]);

  // Calcular precio estimado
  useEffect(() => {
    if (selectedVehicle && passengers) {
      const vehicle = VEHICLE_TYPES.find(v => v.value === selectedVehicle);
      if (vehicle) {
        const multiplier = serviceType === "round_trip" ? 1.8 : 1;
        setEstimatedPrice(Math.round(vehicle.price * multiplier));
      }
    }
  }, [selectedVehicle, passengers, serviceType]);

  const onSubmit = (data: BookingFormData) => {
    const vehicle = VEHICLE_TYPES.find(v => v.value === selectedVehicle);
    if (vehicle) {
      const price = serviceType === "round_trip" ? vehicle.price * 1.8 : vehicle.price;
      toast({
        title: "Disponibilidad encontrada",
        description: `Se encontraron vehículos disponibles. Precio estimado: $${Math.round(price)} USD`,
      });
      // Redirigir a página de booking completa
      window.location.href = "/booking";
    }
  };


  const getRecommendedVehicle = () => {
    if (passengers <= 3) return "sedan";
    if (passengers <= 6) return "suv";
    if (passengers <= 12) return "van";
    return "bus";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto lg:mx-0 shadow-2xl glass-panel border-white/10" style={{ overflow: 'visible' }}>
      <CardContent className="bg-transparent p-0" style={{ overflow: 'visible' }}>
        {/* Steps Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-4 sm:p-6 border-b border-white/10">
          <button
            onClick={() => setCurrentStep("trip")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all ${
              currentStep === "trip"
                ? "bg-coco-gold text-black font-bold"
                : "bg-void/50 text-gray-400 hover:text-white"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Trip</span>
          </button>
          <div className="hidden sm:block w-8 h-0.5 bg-white/20"></div>
          <button
            onClick={() => {
              if (origin && destination) setCurrentStep("vehicle");
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all ${
              currentStep === "vehicle"
                ? "bg-coco-gold text-black font-bold"
                : origin && destination
                ? "bg-void/50 text-gray-400 hover:text-white"
                : "bg-void/30 text-gray-600 cursor-not-allowed"
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Vehicle</span>
          </button>
          <div className="hidden sm:block w-8 h-0.5 bg-white/20"></div>
          <button
            onClick={() => {
              if (origin && destination && selectedVehicle) setCurrentStep("passenger");
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all ${
              currentStep === "passenger"
                ? "bg-coco-gold text-black font-bold"
                : origin && destination && selectedVehicle
                ? "bg-void/50 text-gray-400 hover:text-white"
                : "bg-void/30 text-gray-600 cursor-not-allowed"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Passenger</span>
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 relative" style={{ overflow: 'visible' }}>
            {/* Step 1: Trip */}
            {currentStep === "trip" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif text-white mb-2">1. Route</h3>
                  <p className="text-gray-400 text-sm mb-4">Pickup & drop-off</p>
                </div>

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4 mb-6"
                        >
                          <div className="flex items-center space-x-2 border border-white/10 rounded-lg p-3 hover:border-coco-gold/30 transition-colors">
                            <RadioGroupItem value="one_way" id="one_way" className="border-coco-gold text-coco-gold" />
                            <label htmlFor="one_way" className="text-sm font-medium text-gray-300 cursor-pointer flex-1">
                              One-way
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 border border-white/10 rounded-lg p-3 hover:border-coco-gold/30 transition-colors">
                            <RadioGroupItem value="round_trip" id="round_trip" className="border-coco-gold text-coco-gold" />
                            <label htmlFor="round_trip" className="text-sm font-medium text-gray-300 cursor-pointer flex-1">
                              Round trip
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
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
                            label="From *"
                            placeholder="Buscar origen (aeropuerto, hotel, dirección...)"
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
                            label="To *"
                            placeholder="Buscar destino (hotel, playa, dirección...)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Google Maps Preview con Ruta */}
                {showMap && origin && destination && (
                  <div className="mt-6">
                    <RouteMap
                      origin={origin}
                      destination={destination}
                      originPlaceId={originPlaceId}
                      destinationPlaceId={destinationPlaceId}
                      originCoords={originCoords}
                      destinationCoords={destinationCoords}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Pick-up date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            min={new Date().toISOString().split('T')[0]}
                            className="bg-void/50 border-white/10 text-white focus:border-coco-gold h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupTime"
                    render={({ field }) => {
                      // Separar hora y minutos del valor actual
                      const timeValue = field.value || "00:00";
                      const [hours, minutes] = timeValue.split(":");
                      
                      // Generar opciones de horas (00-23)
                      const hourOptions = Array.from({ length: 24 }, (_, i) => 
                        String(i).padStart(2, "0")
                      );
                      
                      // Generar opciones de minutos (00, 15, 30, 45)
                      const minuteOptions = ["00", "15", "30", "45"];

                      const handleTimeChange = (newHours: string, newMinutes: string) => {
                        const newTime = `${newHours}:${newMinutes}`;
                        field.onChange(newTime);
                      };

                      return (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">
                            Pick-up time * <span className="text-gray-500 text-[10px] normal-case">(24-hour format)</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Select
                                value={hours || "00"}
                                onValueChange={(value) => handleTimeChange(value, minutes || "00")}
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
                                value={minutes || "00"}
                                onValueChange={(value) => handleTimeChange(hours || "00", value)}
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    if (origin && destination) {
                      setCurrentStep("vehicle");
                    }
                  }}
                  disabled={!origin || !destination}
                  className="w-full bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em] h-12"
                >
                  Continuar
                </Button>
              </div>
            )}

            {/* Step 2: Vehicle */}
            {currentStep === "vehicle" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif text-white mb-2">2. Passengers & Bags</h3>
                  <p className="text-gray-400 text-sm mb-4">We'll recommend the right vehicle</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="passengers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">👤 Passengers</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || "1"}
                            onValueChange={field.onChange}
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
                                  {num} {num === 1 ? "pasajero" : "pasajeros"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">🧳 Bags</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || "0"}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="bg-void/50 border-white/10 text-white focus:border-coco-gold h-12">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent className="bg-void border-white/10 max-h-[200px]">
                              {Array.from({ length: 21 }, (_, i) => i).map((num) => (
                                <SelectItem 
                                  key={num} 
                                  value={num.toString()}
                                  className="text-white hover:bg-coco-gold/20"
                                >
                                  {num} {num === 1 ? "maleta" : "maletas"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Vehicle Selection */}
                <div>
                  <h4 className="text-white font-serif mb-4">Choose your vehicle *</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {VEHICLE_TYPES.map((vehicle) => {
                      const isRecommended = vehicle.value === getRecommendedVehicle();
                      const isSelected = selectedVehicle === vehicle.value;
                      const price = serviceType === "round_trip" ? Math.round(vehicle.price * 1.8) : vehicle.price;

                      return (
                        <div
                          key={vehicle.value}
                          onClick={() => setSelectedVehicle(vehicle.value)}
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                            isSelected
                              ? "border-coco-gold bg-coco-gold/10 ring-2 ring-coco-gold/50"
                              : "border-white/10 hover:border-coco-gold/30 bg-void/30"
                          }`}
                        >
                          {/* Vehicle Image */}
                          <div className="relative h-32 w-full overflow-hidden bg-void/50">
                            <img
                              src={vehicle.image}
                              alt={vehicle.label}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect fill='%231a1a1a' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23D4AF37' font-family='sans-serif' font-size='16'%3EVehicle%3C/text%3E%3C/svg%3E";
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
                            <h5 className="font-semibold text-white text-sm mb-2">{vehicle.label}</h5>
                            
                            {/* Capacity Icons */}
                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                <span>{vehicle.capacity}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                </svg>
                                <span>{vehicle.luggage} maletas</span>
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <div>
                                <span className="text-gray-400 text-xs">Round trip</span>
                                <p className="text-coco-gold font-bold text-lg">${price}</p>
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
                </div>

                {estimatedPrice && (
                  <div className="bg-coco-gold/10 border border-coco-gold/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Estimated total:</span>
                      <span className="text-coco-gold font-bold text-xl">${estimatedPrice} USD</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">Final price may vary. Payment later.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("trip")}
                    variant="outline"
                    className="flex-1 border-white/40 bg-void/50 text-white hover:bg-white/20 hover:border-white/60 transition font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (selectedVehicle) setCurrentStep("passenger");
                    }}
                    disabled={!selectedVehicle}
                    className="flex-1 bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Passenger - Redirigir a página completa de booking */}
            {currentStep === "passenger" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif text-white mb-2">3. Ready to Book</h3>
                  <p className="text-gray-400 text-sm mb-4">Complete your booking with passenger details.</p>
                </div>

                <div className="bg-void/50 border border-white/10 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">From:</span>
                    <span className="text-white text-right max-w-[60%] break-words">{LOCATIONS.AIRPORTS.find(a => a.value === origin)?.label || origin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">To:</span>
                    <span className="text-white text-right max-w-[60%] break-words">{LOCATIONS.DESTINATIONS.find(d => d.value === destination)?.label || destination}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Passengers:</span>
                    <span className="text-white">{passengers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vehicle:</span>
                    <span className="text-white">{VEHICLE_TYPES.find(v => v.value === selectedVehicle)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/10 pt-3 mt-3">
                    <span className="text-gray-400 font-semibold">Estimated Total:</span>
                    <span className="text-coco-gold font-bold text-lg">${estimatedPrice} USD</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("vehicle")}
                    variant="outline"
                    className="flex-1 border-white/40 bg-void/50 text-white hover:bg-white/20 hover:border-white/60 transition font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      // Guardar datos en sessionStorage y redirigir
                      const bookingData = {
                        origin,
                        destination,
                        passengers: passengers.toString(),
                        vehicleType: selectedVehicle,
                        serviceType,
                        estimatedPrice,
                        pickupDate: form.getValues("pickupDate"),
                        pickupTime: form.getValues("pickupTime"),
                      };
                      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
                      window.location.href = "/booking";
                    }}
                    className="flex-1 bg-white text-black hover:bg-coco-gold hover:text-black transition font-bold uppercase text-xs tracking-[0.2em]"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Complete Booking
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
