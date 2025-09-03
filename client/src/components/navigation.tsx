import { useState } from "react";
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

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0" data-testid="link-home">
              <span className="text-2xl font-bold text-primary">DominicanTransport</span>
              <span className="text-sm text-secondary ml-1">PRO</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} data-testid={`link-${item.label.toLowerCase()}`}>
                  <span
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <Button asChild className="ml-4" data-testid="button-contact">
                <a href={`tel:${COMPANY_INFO.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  {COMPANY_INFO.phone}
                </a>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      data-testid={`link-mobile-${item.label.toLowerCase()}`}
                    >
                      <span
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          location === item.href
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  <Button asChild className="mt-4" data-testid="button-mobile-contact">
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
      </div>
    </nav>
  );
}
