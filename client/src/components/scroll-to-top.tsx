import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Fuerza scroll al inicio en cada cambio de ruta.
 * Wouter no incluye scroll restoration por defecto.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

