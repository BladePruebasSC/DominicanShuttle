import { COMPANY_INFO } from "@/lib/constants";

export default function WhatsAppFloat() {
  const whatsappMessage = "Hola, me interesa obtener información sobre sus servicios de transporte.";
  const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-colors"
      aria-label="Contactar por WhatsApp"
      data-testid="button-whatsapp-float"
    >
      <i className="fab fa-whatsapp text-2xl"></i>
    </a>
  );
}
