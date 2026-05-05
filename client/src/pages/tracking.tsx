import { useEffect, useMemo, useRef, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  origin: string;
  destination: string;
  pickupDate: string;
  status: string;
  serviceType?: string;
  vehicleType?: string;
  vehicleId?: string | null;
  notes?: string | null;
};

type Trip = {
  id: string;
  bookingId: string;
  hypertrackTripId: string | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  durationReal: number | null;
  clientShared: boolean;
  metadata: Record<string, unknown> | null;
};

type LocationPoint = {
  lat: number;
  lng: number;
  accuracy?: number | null;
  speed?: number | null;
  bearing?: number | null;
  at?: string;
};

declare global {
  interface Window {
    google: any;
  }
}

function getSavedDeviceId() {
  const key = "tracking_device_id";
  return localStorage.getItem(key) ?? "";
}

function saveDeviceId(deviceId: string) {
  localStorage.setItem("tracking_device_id", deviceId);
}

export default function TrackingPage() {
  const [, params] = useRoute("/reserva/:id");
  const routeBookingId = params?.id ?? "";
  const [bookingId, setBookingId] = useState(routeBookingId);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [deviceId, setDeviceId] = useState(getSavedDeviceId());
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const resolvedBookingId = useMemo(() => bookingId.trim(), [bookingId]);
  const resolvedDeviceId = useMemo(() => deviceId.trim(), [deviceId]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const safeJson = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt.startsWith("<!DOCTYPE") ? "Respuesta inválida del servidor API" : txt || "Respuesta no JSON");
    }
    return res.json();
  };

  const parseAssignedPlate = (notes?: string | null) => {
    if (!notes) return null;
    const m = notes.match(/(?:placa|plate)\s*[:\-]\s*([A-Z0-9\-]+)/i);
    return m?.[1] ?? null;
  };

  const bookingHasAssignment = useMemo(() => {
    if (!booking) return false;
    const hasVehicle = Boolean(booking.vehicleId || booking.vehicleType);
    const hasPlate = Boolean(parseAssignedPlate(booking.notes));
    return hasVehicle && hasPlate;
  }, [booking]);

  const tripStatus = trip?.status ?? "pending";
  const isTrackingActive = tripStatus === "in_progress";
  const isTripCompleted = tripStatus === "completed";

  const loadData = async () => {
    if (!resolvedBookingId) return;
    setLoading(true);
    try {
      const [bookingRes, tripRes] = await Promise.all([
        apiRequest("GET", `/api/bookings/${resolvedBookingId}`),
        apiRequest("GET", `/api/trips/booking/${resolvedBookingId}`).catch(() => null),
      ]);

      const bookingData = await safeJson(bookingRes);
      setBooking(bookingData);

      if (tripRes) {
        const tripData = await safeJson(tripRes);
        setTrip(tripData);
      } else {
        setTrip(null);
      }
    } catch (err: any) {
      setBooking(null);
      setTrip(null);
      toast({
        title: "No se pudo cargar",
        description: err?.message || "Error consultando la reserva",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeBookingId) {
      setBookingId(routeBookingId);
      void loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeBookingId]);

  useEffect(() => {
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  useEffect(() => {
    if (!resolvedBookingId) return;
    const interval = setInterval(() => {
      void loadData();
    }, 7000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedBookingId]);

  useEffect(() => {
    const latest = ((trip?.metadata as any)?.latest_location ?? null) as LocationPoint | null;
    const history = (((trip?.metadata as any)?.location_history ?? []) as LocationPoint[]).filter(
      (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng),
    );
    if (!latest || !Number.isFinite(latest.lat) || !Number.isFinite(latest.lng)) return;
    if (!mapRef.current) return;

    const ensureMap = () => {
      if (!mapRef.current || !window.google?.maps) return;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: { lat: latest.lat, lng: latest.lng },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      }
      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat: latest.lat, lng: latest.lng },
          map: mapInstanceRef.current,
          title: "Ubicación actual",
        });
      } else {
        markerRef.current.setPosition({ lat: latest.lat, lng: latest.lng });
      }

      if (!polylineRef.current) {
        polylineRef.current = new window.google.maps.Polyline({
          map: mapInstanceRef.current,
          path: [],
          geodesic: true,
          strokeColor: "#D4AF37",
          strokeOpacity: 0.85,
          strokeWeight: 4,
        });
      }
      polylineRef.current.setPath(history.map((p) => ({ lat: p.lat, lng: p.lng })));

      const bounds = new window.google.maps.LatLngBounds();
      history.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      bounds.extend({ lat: latest.lat, lng: latest.lng });
      if (history.length > 1) {
        mapInstanceRef.current.fitBounds(bounds);
      } else {
        mapInstanceRef.current.setCenter({ lat: latest.lat, lng: latest.lng });
      }
    };

    if (!apiKey) return;
    if (window.google?.maps) {
      ensureMap();
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener("load", ensureMap, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&region=DO`;
    script.async = true;
    script.defer = true;
    script.onload = ensureMap;
    document.head.appendChild(script);
  }, [trip, apiKey]);

  const beginLocationWatch = (tripId: string) => {
    if (!navigator.geolocation) {
      toast({ title: "GPS no disponible", description: "Tu navegador no soporta geolocalización.", variant: "destructive" });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        await apiRequest("PATCH", `/api/trips/${tripId}/location`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? null,
            speed: pos.coords.speed ?? null,
            bearing: pos.coords.heading ?? null,
        });
      },
      () => {
        toast({
          title: "No se pudo leer GPS",
          description: "Verifica permisos de ubicación.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    setWatchId(id);
    toast({ title: "Tracking en vivo", description: "Se está enviando ubicación periódicamente." });
  };

  const startTrip = async () => {
    if (!resolvedBookingId) return;
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/trips/start", {
        bookingId: resolvedBookingId,
        deviceId: resolvedDeviceId || null,
        clientShared: true,
      });
      const data = await safeJson(res);
      setTrip(data);
      if (resolvedDeviceId) saveDeviceId(resolvedDeviceId);
      beginLocationWatch(data.id);
      toast({ title: "Viaje iniciado", description: "Tu viaje está en seguimiento en tiempo real." });
    } catch (err: any) {
      toast({
        title: "Error al iniciar viaje",
        description: err?.message || "Intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startLocationWatch = () => {
    if (!trip?.id) {
      toast({ title: "Primero inicia el viaje", description: "Aún no hay viaje activo." });
      return;
    }
    beginLocationWatch(trip.id);
  };

  const completeTrip = async () => {
    if (!trip?.id) return;
    setLoading(true);
    try {
      const res = await apiRequest("PATCH", `/api/trips/${trip.id}/complete`);
      const data = await safeJson(res);
      setTrip(data);
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      toast({ title: "Viaje completado", description: "El viaje se cerró correctamente." });
    } catch (err: any) {
      toast({
        title: "Error al completar",
        description: err?.message || "Intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareJourney = async () => {
    const shareUrl = `${window.location.origin}/reserva/${resolvedBookingId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Seguimiento de viaje CocoLuxe",
          text: "Comparte este enlace para ver mi viaje en tiempo real.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Enlace copiado", description: "Comparte el enlace con quien quieras." });
      }
    } catch (error) {
      // Evita ruido cuando el usuario cancela el diálogo nativo de share.
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-28 space-y-6">
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Tracking de Viaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="UUID de reserva"
              className="bg-void/50 border-white/10 text-white"
            />
            <Button onClick={loadData} disabled={loading || !resolvedBookingId}>
              Cargar
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-gray-400">
              Identificador de sesión (opcional)
            </label>
            <Input
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Opcional (ej: device interno o referencia externa)"
              className="bg-void/50 border-white/10 text-white"
            />
            <p className="text-xs text-gray-500">
              Si lo completas, se guarda como metadato técnico del viaje. Si no, puedes iniciar el viaje igual.
            </p>
          </div>

          {booking && (
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Reserva:</strong> {booking.id}</p>
              <p><strong>Cliente:</strong> {booking.customerName} ({booking.customerEmail})</p>
              <p><strong>Ruta:</strong> {booking.origin} → {booking.destination}</p>
              <p><strong>Estado reserva:</strong> {booking.status}</p>
              {bookingHasAssignment ? (
                <p className="text-emerald-300">
                  <strong>Vehículo confirmado:</strong> {booking.vehicleType ?? "Asignado"} · Placa {parseAssignedPlate(booking.notes)}
                </p>
              ) : (
                <div className="mt-2 p-3 rounded border border-amber-300/30 bg-amber-300/10 text-amber-200">
                  Tu vehículo será confirmado antes de la fecha de tu servicio. Recibirás una notificación con todos los detalles.
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-white/10 bg-void/40 p-3">
            {!bookingHasAssignment ? (
              <p className="text-amber-200 text-sm">
                Estado 1 - Reserva confirmada. Tu vehículo será confirmado antes de la fecha de tu servicio.
              </p>
            ) : isTripCompleted ? (
              <p className="text-emerald-300 text-sm">
                Estado 4 - Viaje completado. Gracias por viajar con CocoLuxe.
              </p>
            ) : isTrackingActive ? (
              <p className="text-coco-gold text-sm">
                Estado 3 - Tracking activo. Tu ubicación se está transmitiendo en tiempo real.
              </p>
            ) : (
              <p className="text-sky-300 text-sm">
                Estado 2 - Vehículo asignado. Ya puedes iniciar tu viaje.
              </p>
            )}
          </div>

          {trip && (
            <div className="text-sm text-gray-300 space-y-1 border-t border-white/10 pt-3">
              <p><strong>Trip ID:</strong> {trip.id}</p>
              <p><strong>Estado:</strong> {trip.status}</p>
              <p><strong>Inicio:</strong> {trip.startTime ?? "-"}</p>
              <p><strong>Fin:</strong> {trip.endTime ?? "-"}</p>
              <p><strong>Duración real:</strong> {trip.durationReal ?? "-"}s</p>
              <p>
                <strong>Puntos de recorrido:</strong>{" "}
                {Array.isArray((trip.metadata as any)?.location_history)
                  ? (trip.metadata as any).location_history.length
                  : 0}
              </p>
            </div>
          )}

          {trip && (
            <div className="border border-white/10 rounded-lg overflow-hidden">
              {apiKey ? (
                <div ref={mapRef} className="w-full h-[320px] bg-black/30" />
              ) : (
                (() => {
                  const latest = ((trip.metadata as any)?.latest_location ?? null) as LocationPoint | null;
                  if (latest && Number.isFinite(latest.lat) && Number.isFinite(latest.lng)) {
                    const mapQuery = `${latest.lat},${latest.lng}`;
                    return (
                      <iframe
                        title="Tracking en vivo"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`}
                        className="w-full h-[320px] border-0"
                        loading="lazy"
                      />
                    );
                  }
                  return (
                    <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">
                      Activa GPS en vivo para ver el mapa.
                    </div>
                  );
                })()
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={startTrip} disabled={loading || !booking || !bookingHasAssignment || isTrackingActive}>
              Iniciar mi viaje
            </Button>
            <Button onClick={startLocationWatch} variant="outline" disabled={!trip || loading || isTripCompleted}>
              Activar GPS en vivo
            </Button>
            <Button onClick={shareJourney} variant="outline" disabled={!trip || !isTrackingActive}>
              Compartir viaje
            </Button>
            <Button onClick={completeTrip} variant="secondary" disabled={!trip || loading || isTripCompleted}>
              Llegué
            </Button>
            {isTripCompleted && (
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `/feedback/${resolvedBookingId}`;
                }}
              >
                Dejar encuesta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

