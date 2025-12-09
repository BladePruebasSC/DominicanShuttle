import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const navigationItems = [
  { href: "/", label: "Inicio" },
  { href: "/booking", label: "Reservar" },
  { href: "/fleet", label: "Flota" },
  { href: "/tours", label: "Tours" },
  { href: "/contact", label: "Contacto" },
];

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 py-6 border-b ${
        isScrolled
          ? "nav-scrolled bg-glass-dark"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="cursor-pointer hover:opacity-90 transition transform hover:scale-105 duration-500">
          <div className="flex flex-col leading-none">
            <span className="font-serif font-bold text-white tracking-[0.2em] text-xl md:text-2xl">
              DOMINICAN<span className="text-coco-gold italic">TRANSPORT</span>
            </span>
            <span className="text-[7px] text-coco-gold tracking-[0.6em] uppercase mt-1 text-center opacity-80">
              PRO
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-coco-gold transition relative group py-2 ${
                location === item.href ? "text-coco-gold" : ""
              }`}
              data-testid={`link-${item.label.toLowerCase()}`}
            >
              {item.label}
              {location === item.href && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-coco-gold"></span>
              )}
            </Link>
          ))}
          <Button
            asChild
            className="text-coco-gold border border-coco-gold/40 px-3 py-1 hover:bg-coco-gold hover:text-black transition flex items-center gap-2 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] bg-transparent"
            data-testid="button-contact"
          >
            <a href={`tel:${COMPANY_INFO.phone}`}>
              <Phone className="w-3 h-3" />
              {COMPANY_INFO.phone}
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-coco-gold"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-glass-dark border-white/10 backdrop-blur-xl"
            >
              <div className="flex flex-col space-y-4 mt-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    data-testid={`link-mobile-${item.label.toLowerCase()}`}
                  >
                    <span
                      className={`block px-3 py-2 rounded-md text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                        location === item.href
                          ? "text-coco-gold bg-coco-gold/10"
                          : "text-white hover:text-coco-gold hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 border border-coco-gold/40 text-coco-gold hover:bg-coco-gold hover:text-black"
                  data-testid="button-mobile-contact"
                >
                  <a href={`tel:${COMPANY_INFO.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    {COMPANY_INFO.phone}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
