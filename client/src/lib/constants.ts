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
  { value: "sedan", label: "Sedán Económico (1-3 pax)", price: 35 },
  { value: "suv", label: "SUV Premium (4-6 pax)", price: 60 },
  { value: "van", label: "Van Grupal (7-12 pax)", price: 120 },
  { value: "bus", label: "Autobús (15+ pax)", price: 180 },
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
  name: "Dominican Transport Pro",
  phone: "+1 (809) 444-8800",
  email: "info@dominicantransportpro.com",
  whatsapp: "18094448800",
  notificationPhone: "+1 (809) 444-8800",
  coverage: ["Punta Cana", "Santo Domingo", "Puerto Plata", "La Romana"],
};
