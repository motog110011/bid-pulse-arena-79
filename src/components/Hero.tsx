import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer } from "@/components/ui/timer";
import { ArrowRight, Gavel, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useDynamicStats } from "@/hooks/useDynamicStats";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-mexican-airport.jpg";

const featuredAuctions = [
  { title: "Whiskey Macallan 18 años – Decomisado", currentBid: 1850, bidders: 47, hoursLeft: 2, minsLeft: 45 },
  { title: "Chanel No. 5 EDP 100 ml – Confiscado",  currentBid: 125,  bidders: 28, hoursLeft: 1, minsLeft: 30 },
  { title: "Cognac Hennessy XO 700 ml – Decomisado", currentBid: 285,  bidders: 35, hoursLeft: 3, minsLeft: 15 },
  { title: "Mezcal Clase Azul Reposado – Confiscado", currentBid: 195,  bidders: 22, hoursLeft: 4, minsLeft: 20 },
];

export function Hero() {
  const { user } = useAuth();
  const { balance } = useUserBalance();
  const { toast } = useToast();
  const { stats, loading } = useDynamicStats();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const [featuredIndex] = useState(() => Math.floor(Date.now() / 60000) % featuredAuctions.length);
  const featured = featuredAuctions[featuredIndex];
  const endTime = new Date(Date.now() + featured.hoursLeft * 3_600_000 + featured.minsLeft * 60_000);

  function handleBid() {
    if (!user) { setAuthDialogOpen(true); return; }
    if (balance < featured.currentBid + 50) {
      toast({ title: "Saldo insuficiente", description: "Recarga tu cuenta para participar.", variant: "destructive" });
      return;
    }
    toast({ title: "Puja registrada", description: `Ofertaste por ${featured.title}` });
    document.getElementById("auction-grid")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative overflow-hidden">
      {/* Imagen de fondo con overlay claro */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* overlay sólido — evita que la foto sangre y grisee el texto */}
      <div className="absolute inset-0 bg-white/[.96] sm:bg-gradient-to-r sm:from-white/[.98] sm:via-white/[.97] sm:to-white/[.88]" />

      {/* Banda dorada decorativa superior */}
      <div className="relative h-1 bg-gobierno-dorado" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Columna izquierda */}
          <div className="space-y-8">
            {/* Sello de la plataforma */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-1 bg-gobierno-guinda rounded-full" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gobierno-guinda">
                  Subastas GAP
                </p>
                <p className="text-xs text-gray-500 tracking-wide">
                  Plataforma certificada de subastas
                </p>
              </div>
            </div>

            {/* Titular */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gobierno-guinda">
                Subastas de
                <span className="block text-gray-900">Productos Decomisados</span>
              </h1>
              <p className="text-base text-gray-700 max-w-lg leading-relaxed">
                Artículos confiscados en aeropuertos internacionales de México.
                Proceso transparente, verificado y 100% legal.
                Precios muy por debajo del mercado.
              </p>
            </div>

            {/* Indicadores */}
            <div className="flex items-center gap-6 py-4 border-y border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-gobierno-guinda">
                  {loading ? "—" : stats.activeUsers.toLocaleString("es-MX")}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">Usuarios activos</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gobierno-dorado-oscuro">
                  {loading ? "—" : stats.totalAuctionsToday}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">Subastas hoy</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gobierno-guinda">
                  {loading ? "—" : stats.liveAuctions}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">En vivo</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white text-base px-8 font-semibold"
                onClick={() => document.getElementById("auction-grid")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Gavel className="mr-2 h-5 w-5" />
                Participar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gobierno-guinda text-gobierno-guinda hover:bg-gobierno-claro text-base px-8"
                onClick={() => document.getElementById("auction-grid")?.scrollIntoView({ behavior: "smooth" })}
              >
                Ver Catálogo
              </Button>
            </div>

            {/* Sellos de confianza */}
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-gobierno-guinda" />
                <span>Proceso oficial verificado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-gobierno-dorado-oscuro" />
                <span>Hasta 70% de descuento</span>
              </div>
            </div>
          </div>

          {/* Columna derecha — tarjeta de subasta destacada */}
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-sm bg-white border border-border rounded shadow-md overflow-hidden">
              {/* Cabecera guinda */}
              <div className="bg-gobierno-guinda px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    Subasta en Vivo
                  </span>
                </div>
                <Badge className="bg-gobierno-dorado text-gobierno-guinda-oscuro text-xs font-bold">
                  DESTACADA
                </Badge>
              </div>

              {/* Contenido */}
              <div className="p-5 space-y-5">
                <h3 className="font-bold text-base text-foreground leading-snug">
                  {featured.title}
                </h3>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Puja actual</p>
                    <p className="text-3xl font-extrabold text-gobierno-guinda">
                      ${featured.currentBid.toLocaleString("es-MX")}
                      <span className="text-sm font-normal text-muted-foreground ml-1">MXN</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Termina en</p>
                    <Timer endTime={endTime} variant="urgent" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-t border-border pt-3">
                  <Users className="h-4 w-4" />
                  <span>{featured.bidders} participantes</span>
                </div>

                <Button
                  className="w-full bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white font-semibold"
                  onClick={handleBid}
                >
                  <Gavel className="mr-2 h-4 w-4" />
                  Pujar Ahora
                </Button>
              </div>

              {/* Pie con sello */}
              <div className="bg-gobierno-claro px-5 py-2 border-t border-border flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-gobierno-guinda" />
                <span className="text-xs text-gobierno-gris">
                  Artículo verificado por Subastas GAP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banda dorada decorativa inferior */}
      <div className="relative h-1 bg-gobierno-dorado" />

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </section>
  );
}
