import { Button } from "@/components/ui/button";
import { Gavel, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.png";

export function Footer() {
  return (
    <footer className="glass-card border-t border-border/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Subastas GAP
                </h3>
                <p className="text-xs text-muted-foreground">Premium Auctions</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              La plataforma líder en subastas online con experiencia premium y seguridad garantizada.
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="glass hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="glass hover:bg-white/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="glass hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="glass hover:bg-white/10">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Enlaces Rápidos</h4>
            <nav className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cómo Funciona
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Categorías
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Mis Subastas
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Historia de Pujas
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Centro de Ayuda
              </a>
            </nav>
          </div>

          {/* Soporte */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Soporte</h4>
            <nav className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
              <a href="/terminos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Reembolsos
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
            </nav>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">contacto@subastasgap.mx</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">+52 (222) 123-4567</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  Vía Atlixcáyotl No. 3248, Torre JV II, Piso 6<br />
                  Col. Reserva Territorial Atlixcáyotl<br />
                  C.P. 72830, San Andrés Cholula, Puebla
                </span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Disponible 24/7 para asistencia
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Subastas GAP. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Métodos de pago seguros:</span>
              <img src={visaLogo} alt="Visa" className="h-5 w-auto" />
              <img src={mastercardLogo} alt="Mastercard" className="h-5 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}