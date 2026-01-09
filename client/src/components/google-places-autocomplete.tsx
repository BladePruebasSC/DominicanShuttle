import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

interface Place {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  onPlaceSelect?: (place: any) => void;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Buscar ubicación...",
  label,
  className = "",
  onPlaceSelect,
}: GooglePlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar Google Maps API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    
    const isProduction = import.meta.env.MODE === "production";
    const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    console.log("🔑 API Key detectada:", apiKey ? "✅ Sí" : "❌ No");
    console.log("🔍 Variables de entorno:", {
      VITE_GOOGLE_MAPS_API_KEY: envKey ? `Presente (${envKey.substring(0, 10)}...)` : "No encontrada",
      MODE: import.meta.env.MODE,
      PROD: isProduction,
    });
    
    if (!apiKey) {
      if (isProduction) {
        console.error("❌ ERROR: Google Maps API Key no configurada en Netlify.");
        console.error("📋 Pasos para solucionarlo:");
        console.error("   1. Ve a Netlify > Site settings > Environment variables");
        console.error("   2. Agrega: VITE_GOOGLE_MAPS_API_KEY = AIzaSyCbiYnzceF5RCEbnOP07NQijBTKtujw56E");
        console.error("   3. Scope: All scopes (o al menos Build y Production)");
        console.error("   4. Haz un nuevo deploy (Clear cache and deploy)");
      } else {
        console.warn("⚠️ Google Maps API Key no configurada. Configura VITE_GOOGLE_MAPS_API_KEY en tu archivo .env y reinicia el servidor.");
      }
      // Permitir búsqueda manual sin autocompletado
      return;
    }

    // Verificar si ya está cargado
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("✅ Google Maps ya está cargado");
      initializeAutocomplete();
      return;
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log("📜 Script de Google Maps ya existe, esperando carga...");
      // Esperar a que se cargue
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogle);
          console.log("✅ Google Maps cargado después de esperar");
          initializeAutocomplete();
        }
      }, 100);
      
      return () => clearInterval(checkGoogle);
    }

    // Cargar script de Google Maps
    console.log("📥 Cargando Google Maps API...");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&region=DO`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Maps API cargado exitosamente");
      setIsGoogleMapsLoaded(true);
      initializeAutocomplete();
    };
    script.onerror = () => {
      console.error("❌ Error al cargar Google Maps API. Verifica tu API key.");
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("✅ Inicializando servicios de autocompletado");
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      console.log("✅ Servicios de autocompletado listos");
    } else {
      console.error("❌ Google Maps Places API no disponible");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setSelectedIndex(-1);

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Mostrar sugerencias inmediatamente con 1 carácter
    if (autocompleteServiceRef.current && inputValue.length >= 1) {
      setIsLoading(true);
      
      // Debounce más corto para respuesta más rápida
      debounceTimerRef.current = setTimeout(() => {
        if (!autocompleteServiceRef.current) return;
        
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: inputValue,
            componentRestrictions: { country: "do" }, // Restringir a República Dominicana
            // No especificar types para permitir búsqueda de cualquier tipo (direcciones, lugares, etc.)
          },
          (predictions: Place[] | null, status: string) => {
            setIsLoading(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              console.log("✅ Sugerencias recibidas:", predictions.length);
              setSuggestions(predictions.slice(0, 10)); // Aumentar a 10 sugerencias
              setShowSuggestions(true);
              console.log("✅ Mostrando sugerencias:", predictions.slice(0, 10).length);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.log("ℹ️ Sin resultados para:", inputValue);
              setSuggestions([]);
              setShowSuggestions(false);
            } else {
              console.warn("❌ Error en autocompletado:", status);
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      }, 150); // Debounce más corto (150ms) para respuesta más rápida
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlace = (place: Place) => {
    onChange(place.description, place.place_id);
    setShowSuggestions(false);
    setSuggestions([]);

    // Obtener detalles completos del lugar
    if (placesServiceRef.current && place.place_id) {
      placesServiceRef.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["geometry", "formatted_address", "name", "place_id"],
        },
        (placeDetails: any, status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && onPlaceSelect) {
            onPlaceSelect(placeDetails);
          }
        }
      );
    }
  };

  const handleFocus = () => {
    // Si hay valor y sugerencias, mostrarlas
    if (value && suggestions.length > 0) {
      setShowSuggestions(true);
    }
    // Si hay valor pero no sugerencias, buscar
    else if (value && value.length >= 1 && autocompleteServiceRef.current) {
      setIsLoading(true);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "do" },
          // No especificar types para permitir búsqueda de cualquier tipo
        },
        (predictions: Place[] | null, status: string) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 8));
            setShowSuggestions(true);
          }
        }
      );
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Verificar si el foco se movió a una sugerencia
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) {
      return; // No cerrar si el foco está en las sugerencias
    }
    
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 300); // Aumentar delay para dar más tiempo al click
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectPlace(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll a la opción seleccionada
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Debug: Log cuando se muestran sugerencias
  useEffect(() => {
    if (showSuggestions && suggestions.length > 0) {
      console.log("🎯 Renderizando sugerencias:", suggestions.length, suggestions);
    }
  }, [showSuggestions, suggestions]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const hasApiKey = !!apiKey;

  return (
    <div className={`relative w-full ${className}`} style={{ zIndex: showSuggestions ? 50 : 'auto' }}>
      {label && (
        <label className="text-gray-300 text-xs uppercase tracking-wider block mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`bg-void/50 border-white/10 text-white focus:border-coco-gold h-12 pl-10 ${className} ${
            !hasApiKey ? "opacity-75" : ""
          }`}
          autoComplete="off"
          disabled={!hasApiKey}
        />
        {isLoading && hasApiKey && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-coco-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!hasApiKey && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-yellow-500" title="API Key no configurada">⚠️</span>
          </div>
        )}
      </div>
      {!hasApiKey && (
        <p className="text-xs text-yellow-500 mt-1">
          {import.meta.env.MODE === "production" 
            ? "⚠️ Configura VITE_GOOGLE_MAPS_API_KEY en Netlify y haz un nuevo deploy"
            : "⚠️ Reinicia el servidor para cargar la API key"}
        </p>
      )}

      {/* Sugerencias en cascada */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-[9999] w-full mt-1 bg-[#0a0a0a] border border-white/20 rounded-lg shadow-2xl max-h-[320px] overflow-y-auto backdrop-blur-md"
          style={{ 
            top: "100%",
            marginTop: "4px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          }}
        >
          {suggestions.map((place, index) => (
            <button
              key={place.place_id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectPlace(place);
              }}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevenir blur del input
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 transition-all border-b border-white/5 last:border-b-0 cursor-pointer ${
                index === selectedIndex
                  ? "bg-coco-gold/30 border-l-2 border-l-coco-gold"
                  : "hover:bg-coco-gold/20 hover:border-l-2 hover:border-l-coco-gold/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  index === selectedIndex ? "text-coco-gold" : "text-coco-gold/70"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    index === selectedIndex ? "text-white" : "text-white/90"
                  }`}>
                    {place.structured_formatting.main_text}
                  </p>
                  <p className="text-gray-400 text-xs truncate mt-0.5">
                    {place.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
