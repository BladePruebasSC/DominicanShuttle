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
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold">DominicanTransport</span>
              <span className="text-sm text-secondary ml-1">PRO</span>
            </div>
            <p className="text-primary-foreground/80 mb-4">
              Tu socio confiable para transporte turístico en República Dominicana. Conectamos destinos con comodidad y seguridad.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="text-primary-foreground/80 hover:text-secondary text-xl"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Services & Destinations */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href}>
                      <span className="hover:text-secondary transition-colors" data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center">
                <i className="fas fa-phone mr-2"></i>
                <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-secondary" data-testid="link-phone">
                  {COMPANY_INFO.phone}
                </a>
              </div>
              <div className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-secondary" data-testid="link-email">
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>República Dominicana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/80 text-sm" data-testid="text-copyright">
              © 2025 Dominican Transport Pro. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {legalLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="text-primary-foreground/80 hover:text-secondary text-sm"
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
