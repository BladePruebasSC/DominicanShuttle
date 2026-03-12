import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface RouteMapProps {
  origin: string;
  destination: string;
  originPlaceId?: string;
  destinationPlaceId?: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  className?: string;
}

export default function RouteMap({
  origin,
  destination,
  originPlaceId,
  destinationPlaceId,
  originCoords,
  destinationCoords,
  className = "",
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{
    distance?: string;
    duration?: string;
  } | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (!apiKey) {
      setIsLoading(false);
      return;
    }

    if (!mapRef.current || (!origin && !destination)) {
      setIsLoading(false);
      return;
    }

    // Cargar Google Maps si no está cargado
    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions&language=es&region=DO`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [origin, destination, originPlaceId, destinationPlaceId, originCoords, destinationCoords]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Inicializar mapa
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 18.4861, lng: -69.9312 }, // Centro de República Dominicana
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#1a1a1a" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#0a0a0a" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#2a2a2a" }],
        },
      ],
    });

    // Inicializar servicios
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#D4AF37", // Color dorado
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    calculateRoute();
  };

  const calculateRoute = () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;

    setIsLoading(true);

    // Preparar request
    const request: any = {
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
    };

    // Usar coordenadas si están disponibles
    if (originCoords && destinationCoords) {
      request.origin = originCoords;
      request.destination = destinationCoords;
    } else if (originPlaceId && destinationPlaceId) {
      request.origin = { placeId: originPlaceId };
      request.destination = { placeId: destinationPlaceId };
    } else {
      // Fallback a texto
      request.origin = origin + ", Dominican Republic";
      request.destination = destination + ", Dominican Republic";
    }

    directionsServiceRef.current.route(request, (result: any, status: string) => {
      setIsLoading(false);
      
      if (status === window.google.maps.DirectionsStatus.OK && result?.routes?.length > 0) {
        const route = result.routes[0];
        const legs = route?.legs;
        if (legs?.length > 0) {
          directionsRendererRef.current.setDirections(result);
          const leg = legs[0];
          setRouteInfo({
            distance: leg.distance?.text ?? "",
            duration: leg.duration?.text ?? "",
          });
          const bounds = new window.google.maps.LatLngBounds();
          legs.forEach((l: any) => {
            if (l.start_location) bounds.extend(l.start_location);
            if (l.end_location) bounds.extend(l.end_location);
          });
          mapInstanceRef.current.fitBounds(bounds);
        } else {
          showMarkersOnly();
        }
      } else {
        console.error("Error al calcular ruta:", status);
        // Mostrar mapa con marcadores en los puntos
        showMarkersOnly();
      }
    });
  };

  const showMarkersOnly = () => {
    if (!mapInstanceRef.current || !window.google) return;

    const markers: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    // Agregar marcador de origen
    if (originCoords) {
      const originMarker = new window.google.maps.Marker({
        position: originCoords,
        map: mapInstanceRef.current,
        title: origin,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#D4AF37",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      markers.push(originMarker);
      bounds.extend(originCoords);
    }

    // Agregar marcador de destino
    if (destinationCoords) {
      const destMarker = new window.google.maps.Marker({
        position: destinationCoords,
        map: mapInstanceRef.current,
        title: destination,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#D4AF37",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      markers.push(destMarker);
      bounds.extend(destinationCoords);
    }

    if (markers.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  if (!apiKey) {
    return (
      <div className={`relative rounded-lg overflow-hidden border border-white/10 ${className}`}>
        <div className="w-full h-[300px] bg-void/50 flex items-center justify-center">
          <div className="text-center p-4">
            <MapPin className="w-8 h-8 text-coco-gold mx-auto mb-2" />
            <p className="text-white text-sm mb-1">Google Maps no configurado</p>
            <p className="text-gray-400 text-xs">
              Configura VITE_GOOGLE_MAPS_API_KEY en tu archivo .env
            </p>
            <a
              href={`https://www.google.com/maps/dir/${encodeURIComponent(origin + ", Dominican Republic")}/${encodeURIComponent(destination + ", Dominican Republic")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-coco-gold hover:text-coco-gold/80 underline mt-2 inline-block"
            >
              Ver ruta en Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border border-white/10 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-void/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-coco-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm">Calculando ruta...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-[300px]" />

      {/* Información de ruta */}
      {routeInfo && (
        <div className="absolute top-4 left-4 bg-glass-dark border border-white/10 rounded-lg p-3 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-coco-gold" />
            <div>
              <p className="text-white font-semibold">Route Preview</p>
              <p className="text-gray-400 text-[10px]">
                {origin} → {destination}
              </p>
              {routeInfo.distance && routeInfo.duration && (
                <p className="text-coco-gold text-[10px] mt-1">
                  {routeInfo.distance} • {routeInfo.duration}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link para ampliar mapa */}
      <div className="absolute bottom-4 right-4 z-20">
        <a
          href={`https://www.google.com/maps/dir/${encodeURIComponent(origin + ", Dominican Republic")}/${encodeURIComponent(destination + ", Dominican Republic")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-coco-gold hover:text-coco-gold/80 underline"
        >
          Ampliar el mapa
        </a>
      </div>
    </div>
  );
}
