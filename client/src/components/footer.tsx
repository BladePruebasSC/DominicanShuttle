import { Link } from "wouter";
import { COMPANY_INFO } from "@/lib/constants";

const footerSections = [
  {
    title: "Servicios",
    links: [
      { label: "Traslados Aeropuerto", href: "/booking" },
      { label: "Tours Privados", href: "/tours" },
      { label: "Transporte Ejecutivo", href: "/fleet" },
      { label: "Grupos Grandes", href: "/contact" },
      { label: "Eventos Especiales", href: "/contact" },
    ],
  },
  {
    title: "Destinos",
    links: [
      { label: "Punta Cana", href: "/booking" },
      { label: "Santo Domingo", href: "/booking" },
      { label: "Puerto Plata", href: "/booking" },
      { label: "La Romana", href: "/booking" },
      { label: "Cap Cana", href: "/booking" },
    ],
  },
];

const socialLinks = [
  { icon: "fab fa-facebook", href: "#", label: "Facebook" },
  { icon: "fab fa-instagram", href: "#", label: "Instagram" },
  { icon: "fab fa-whatsapp", href: `https://wa.me/${COMPANY_INFO.whatsapp}`, label: "WhatsApp" },
  { icon: "fab fa-tripadvisor", href: "#", label: "TripAdvisor" },
];

const legalLinks = [
  { label: "Términos de Servicio", href: "#" },
  { label: "Política de Privacidad", href: "#" },
  { label: "Cancelaciones", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1a2e] text-white py-12 md:py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex flex-col mb-4">
              <span className="text-xl md:text-2xl font-serif font-bold text-white">
                DOMINICAN<span className="text-coco-gold">TRANSPORT</span>
              </span>
              <span className="text-xs text-coco-gold tracking-[0.3em] uppercase mt-1">
                PRO
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Tu socio confiable para transporte turístico en República Dominicana. Conectamos destinos con comodidad y seguridad.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="w-10 h-10 border border-coco-gold/30 rounded-full flex items-center justify-center text-coco-gold hover:bg-coco-gold hover:text-black transition-all duration-300"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4 text-white border-b border-coco-gold/30 pb-2 inline-block">
              Servicios
            </h3>
            <ul className="space-y-2 text-gray-400">
              {footerSections[0].links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link href={link.href}>
                    <span 
                      className="hover:text-coco-gold transition-colors text-sm block" 
                      data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4 text-white border-b border-coco-gold/30 pb-2 inline-block">
              Destinos
            </h3>
            <ul className="space-y-2 text-gray-400">
              {footerSections[1].links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link href={link.href}>
                    <span 
                      className="hover:text-coco-gold transition-colors text-sm block" 
                      data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4 text-white border-b border-coco-gold/30 pb-2 inline-block">
              Contacto
            </h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center group">
                <i className="fas fa-phone mr-3 text-coco-gold group-hover:scale-110 transition-transform"></i>
                <a 
                  href={`tel:${COMPANY_INFO.phone}`} 
                  className="hover:text-coco-gold transition-colors text-sm" 
                  data-testid="link-phone"
                >
                  {COMPANY_INFO.phone}
                </a>
              </div>
              <div className="flex items-center group">
                <i className="fas fa-envelope mr-3 text-coco-gold group-hover:scale-110 transition-transform"></i>
                <a 
                  href={`mailto:${COMPANY_INFO.email}`} 
                  className="hover:text-coco-gold transition-colors text-sm break-all" 
                  data-testid="link-email"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-3 text-coco-gold"></i>
                <span className="text-sm">República Dominicana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs md:text-sm text-center md:text-left" data-testid="text-copyright">
              © 2025 Dominican Transport Pro. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
              {legalLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="text-gray-500 hover:text-coco-gold transition-colors text-xs md:text-sm"
                  data-testid={`link-legal-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
