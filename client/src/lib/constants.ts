export const LOCATIONS = {
  AIRPORTS: [
    { value: "PUJ", label: "Aeropuerto Punta Cana (PUJ)" },
    { value: "SDQ", label: "Aeropuerto Santo Domingo (SDQ)" },
    { value: "POP", label: "Aeropuerto Puerto Plata (POP)" },
    { value: "LRM", label: "Aeropuerto La Romana (LRM)" },
  ],
  DESTINATIONS: [
    { value: "punta-cana", label: "Zona Hotelera Punta Cana" },
    { value: "cap-cana", label: "Cap Cana" },
    { value: "bavaro", label: "Bávaro" },
    { value: "uvero-alto", label: "Uvero Alto" },
    { value: "santo-domingo", label: "Santo Domingo Centro" },
    { value: "puerto-plata", label: "Puerto Plata" },
  ],
};

export const VEHICLE_TYPES = [
  { 
    value: "sedan", 
    label: "Sedán Económico", 
    capacity: "1-3 pax",
    luggage: "1-3",
    price: 35,
    image: "https://images.unsplash.com/photo-1550355291-bbee519a034a?q=80&w=800&auto=format&fit=crop"
  },
  { 
    value: "suv", 
    label: "SUV Premium", 
    capacity: "4-6 pax",
    luggage: "4-6",
    price: 60,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"
  },
  { 
    value: "van", 
    label: "Van Grupal", 
    capacity: "7-12 pax",
    luggage: "7-12",
    price: 120,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop"
  },
  { 
    value: "bus", 
    label: "Autobús", 
    capacity: "15+ pax",
    luggage: "15+",
    price: 180,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop"
  },
];

export const SERVICE_TYPES = [
  { value: "one_way", label: "Solo Ida" },
  { value: "round_trip", label: "Ida y Vuelta" },
];

export const CONTACT_SERVICES = [
  { value: "airport_transfer", label: "Traslado Aeropuerto" },
  { value: "private_tour", label: "Tour Privado" },
  { value: "executive_transport", label: "Transporte Ejecutivo" },
  { value: "special_event", label: "Evento Especial" },
  { value: "other", label: "Otro" },
];

export const COMPANY_INFO = {
  name: "Cocoluxe",
  phone: "+1 (809) 444-8800",
  email: "info@dominicantransportpro.com",
  whatsapp: "18094448800",
  notificationPhone: "+1 (809) 444-8800",
  coverage: ["Punta Cana", "Santo Domingo", "Puerto Plata", "La Romana"],
};
