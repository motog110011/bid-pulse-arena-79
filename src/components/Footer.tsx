import { Link } from "react-router-dom";
import { Gavel, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gobierno-guinda text-white mt-20">
      {/* Banda dorada superior */}
      <div className="h-1 bg-gobierno-dorado" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Identidad */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-white/10">
                <Gavel className="h-5 w-5 text-gobierno-dorado" />
              </div>
              <div>
                <div className="font-bold text-lg text-white leading-tight">Subastas GAP</div>
                <div className="text-[10px] text-gobierno-dorado uppercase tracking-widest">
                  Subastas de Artículos Decomisados
                </div>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Plataforma especializada en subastas de artículos decomisados en
              aeropuertos internacionales. Proceso transparente,
              legal y verificado.
            </p>
            {/* Escudo placeholder */}
            <div className="flex items-center gap-2 pt-2">
              <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
                <rect width="7.33" height="14" fill="#006847" />
                <rect x="7.33" width="7.34" height="14" fill="#FFFFFF" />
                <rect x="14.67" width="7.33" height="14" fill="#CE1126" />
              </svg>
              <span className="text-xs text-white/60">México</span>
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gobierno-dorado border-b border-white/20 pb-2">
              Plataforma
            </h4>
            <nav className="space-y-2">
              {[
                { label: "Cómo Funciona", href: "/#como-funciona" },
                { label: "Categorías", href: "/#auction-grid" },
                { label: "Mis Pujas", href: "/mis-pujas" },
                { label: "Mi Perfil", href: "/perfil" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  to={href}
                  className="block text-sm text-white/70 hover:text-gobierno-dorado transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gobierno-dorado border-b border-white/20 pb-2">
              Legal
            </h4>
            <nav className="space-y-2">
              <Link to="/faq" className="block text-sm text-white/70 hover:text-gobierno-dorado transition-colors">
                Preguntas Frecuentes
              </Link>
              <Link to="/terminos" className="block text-sm text-white/70 hover:text-gobierno-dorado transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="block text-sm text-white/70 hover:text-gobierno-dorado transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/reembolsos" className="block text-sm text-white/70 hover:text-gobierno-dorado transition-colors">
                Política de Reembolsos
              </Link>
              <Link to="/contacto" className="block text-sm text-white/70 hover:text-gobierno-dorado transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gobierno-dorado border-b border-white/20 pb-2">
              Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="h-4 w-4 text-gobierno-dorado flex-shrink-0" />
                <span>contacto@subastasgap.mx</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="h-4 w-4 text-gobierno-dorado flex-shrink-0" />
                <span>+52 (222) 123-4567</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-gobierno-dorado flex-shrink-0 mt-0.5" />
                <span>
                  Vía Atlixcáyotl No. 3248, Torre JV II, Piso 6<br />
                  C.P. 72830, San Andrés Cholula, Puebla
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie legal */}
        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50 text-center sm:text-left">
            © {new Date().getFullYear()} Subastas GAP. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/40">
            Artículos decomisados en aeropuertos internacionales de México
          </p>
        </div>
      </div>
    </footer>
  );
}
