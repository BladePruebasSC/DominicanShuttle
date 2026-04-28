import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  origin: string;
  destination: string;
  pickupDate: string;
  status: string;
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

function getOrCreateDeviceId() {
  const key = "tracking_device_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  localStorage.setItem(key, generated);
  return generated;
}

export default function TrackingPage() {
  const [, params] = useRoute("/reserva/:id");
  const routeBookingId = params?.id ?? "";
  const [bookingId, setBookingId] = useState(routeBookingId);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const resolvedBookingId = useMemo(() => bookingId.trim(), [bookingId]);

  const loadData = async () => {
    if (!resolvedBookingId) return;
    setLoading(true);
    try {
      const [bookingRes, tripRes] = await Promise.all([
        fetch(`/api/bookings/${resolvedBookingId}`),
        fetch(`/api/trips/booking/${resolvedBookingId}`),
      ]);

      if (!bookingRes.ok) throw new Error("No se encontró la reserva");
      const bookingData = await bookingRes.json();
      setBooking(bookingData);

      if (tripRes.ok) {
        const tripData = await tripRes.json();
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

  const startTrip = async () => {
    if (!resolvedBookingId) return;
    const deviceId = getOrCreateDeviceId();
    setLoading(true);
    try {
      const res = await fetch("/api/trips/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bookingId: resolvedBookingId,
          deviceId,
          clientShared: true,
        }),
      });
      if (!res.ok) throw new Error("No se pudo iniciar el viaje");
      const data = await res.json();
      setTrip(data);
      toast({ title: "Viaje iniciado", description: "Tracking activo correctamente." });
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
      toast({ title: "Primero inicia el viaje", description: "Aun no hay trip activo." });
      return;
    }
    if (!navigator.geolocation) {
      toast({ title: "GPS no disponible", description: "Tu navegador no soporta geolocalización.", variant: "destructive" });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        await fetch(`/api/trips/${trip.id}/location`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? null,
            speed: pos.coords.speed ?? null,
            bearing: pos.coords.heading ?? null,
          }),
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

  const completeTrip = async () => {
    if (!trip?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/complete`, { method: "PATCH" });
      if (!res.ok) throw new Error("No se pudo completar");
      const data = await res.json();
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

          {booking && (
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Reserva:</strong> {booking.id}</p>
              <p><strong>Cliente:</strong> {booking.customerName} ({booking.customerEmail})</p>
              <p><strong>Ruta:</strong> {booking.origin} → {booking.destination}</p>
              <p><strong>Estado reserva:</strong> {booking.status}</p>
            </div>
          )}

          {trip && (
            <div className="text-sm text-gray-300 space-y-1 border-t border-white/10 pt-3">
              <p><strong>Trip ID:</strong> {trip.id}</p>
              <p><strong>Estado:</strong> {trip.status}</p>
              <p><strong>Inicio:</strong> {trip.startTime ?? "-"}</p>
              <p><strong>Fin:</strong> {trip.endTime ?? "-"}</p>
              <p><strong>Duración real:</strong> {trip.durationReal ?? "-"}s</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={startTrip} disabled={loading || !booking}>
              Iniciar mi viaje
            </Button>
            <Button onClick={startLocationWatch} variant="outline" disabled={!trip || loading}>
              Activar GPS en vivo
            </Button>
            <Button onClick={completeTrip} variant="secondary" disabled={!trip || loading}>
              Marcar como completado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

