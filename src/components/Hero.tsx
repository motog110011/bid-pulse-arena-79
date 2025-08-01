import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer } from "@/components/ui/timer";
import { ArrowRight, Gavel, TrendingUp, Users, Star } from "lucide-react";
import heroImage from "@/assets/hero-mexican-airport.jpg";

export function Hero() {
  const [activeUsers] = useState(1247);
  const [totalAuctions] = useState(156);
  const [liveAuctions] = useState(23);

  // Simulación de subasta destacada de producto decomisado
  const featuredAuction = {
    title: "Whiskey Macallan 18 años - Decomisado",
    currentBid: 1850,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000), // 2h 45m from now
    bidders: 47
  };

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background with glassmorphism overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-gold text-black font-medium text-sm px-4 py-2">
                ✨ Plataforma Premium de Subastas
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Subastas de
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Productos Aeroportuarios
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Productos de calidad decomisados en aeropuertos. 
                Licores, perfumes, herramientas y más a precios únicos.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{activeUsers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Usuarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-auction-gold">{totalAuctions}</div>
                <div className="text-sm text-muted-foreground">Subastas Hoy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-auction-success">{liveAuctions}</div>
                <div className="text-sm text-muted-foreground">En Vivo</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8">
                <Gavel className="mr-2 h-5 w-5" />
                Comenzar a Pujar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Subastas
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-auction-gold" />
                <span className="text-sm text-muted-foreground">Calificación 4.9/5</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-auction-success" />
                <span className="text-sm text-muted-foreground">+35% más ganancias</span>
              </div>
            </div>
          </div>

          {/* Right content - Featured auction card */}
          <div className="lg:flex justify-center hidden">
            <div className="glass-card max-w-sm w-full space-y-6">
              <div className="space-y-2">
                <Badge className="bg-destructive animate-pulse-auction">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  SUBASTA EN VIVO
                </Badge>
                <h3 className="text-xl font-bold">{featuredAuction.title}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Puja actual</p>
                    <p className="text-3xl font-bold text-auction-gold">
                      ${featuredAuction.currentBid.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Termina en</p>
                    <Timer endTime={featuredAuction.endTime} variant="urgent" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{featuredAuction.bidders} pujadores</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12% última hora</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-primary hover:shadow-glow">
                  <Gavel className="mr-2 h-4 w-4" />
                  Pujar Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}