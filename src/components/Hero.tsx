import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer } from "@/components/ui/timer";
import { ArrowRight, Gavel, TrendingUp, Users, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useDynamicStats } from "@/hooks/useDynamicStats";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useToast } from "@/hooks/use-toast";
import { calculateNextBidAmount, calculateSmartBidIncrement } from '@/utils/bidUtils';
import heroImage from "@/assets/hero-mexican-airport.jpg";

export function Hero() {
  const { user } = useAuth();
  const { balance } = useUserBalance();
  const { toast } = useToast();
  const { stats, loading } = useDynamicStats();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Simulación de subasta destacada que cambia cada vez
  const featuredAuctions = [
    {
      title: "Whiskey Macallan 18 años - Decomisado",
      currentBid: 1850,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000),
      bidders: 47
    },
    {
      title: "Chanel No. 5 EDP 100ml - Confiscado",
      currentBid: 125,
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000 + 30 * 60 * 1000),
      bidders: 28
    },
    {
      title: "Cognac Hennessy XO 700ml - Decomisado",
      currentBid: 285,
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000 + 15 * 60 * 1000),
      bidders: 35
    },
    {
      title: "Mezcal Clase Azul Reposado - Confiscado",
      currentBid: 195,
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000 + 20 * 60 * 1000),
      bidders: 22
    }
  ];

  // Seleccionar subasta destacada basada en el tiempo para que cambie
  const [featuredIndex] = useState(() => Math.floor(Date.now() / 60000) % featuredAuctions.length);
  const featuredAuction = featuredAuctions[featuredIndex];

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background with glassmorphism overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/85 to-background/60" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4 bg-background/80 backdrop-blur-sm p-6 rounded-lg border border-border/20">
              <Badge className="bg-gradient-gold text-black font-medium text-sm px-4 py-2">
                ✨ Plataforma Premium de Subastas
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Subastas de
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Productos Decomisados
                </span>
              </h1>
              
              <p className="text-xl text-foreground max-w-lg">
                Productos decomisados legalmente en aeropuertos de México por motivos de seguridad. Todos los artículos son 100% legales y están disponibles para subasta al público general.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {loading ? "..." : stats.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-foreground">Usuarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-auction-gold">
                  {loading ? "..." : stats.totalAuctionsToday}
                </div>
                <div className="text-sm text-foreground">Subastas Hoy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-auction-success">
                  {loading ? "..." : stats.liveAuctions}
                </div>
                <div className="text-sm text-foreground">En Vivo</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow text-lg px-8"
                onClick={() => {
                  const auctionGrid = document.getElementById('auction-grid');
                  if (auctionGrid) {
                    auctionGrid.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Gavel className="mr-2 h-5 w-5" />
                Comenzar a Pujar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => {
                  const auctionGrid = document.getElementById('auction-grid');
                  if (auctionGrid) {
                    auctionGrid.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Ver Subastas
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border/20">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-auction-gold" />
                <span className="text-sm text-foreground">Calificación 4.9/5</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-auction-success" />
                <span className="text-sm text-foreground">+35% más ganancias</span>
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

                <Button 
                  className="w-full bg-gradient-primary hover:shadow-glow"
                  onClick={() => handleFeaturedBid()}
                >
                  <Gavel className="mr-2 h-4 w-4" />
                  Pujar Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </section>
  );

  function handleFeaturedBid() {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    // Calculate smart bid increment for the featured auction
    const smartIncrement = calculateSmartBidIncrement(featuredAuction.currentBid);
    const nextBidAmount = calculateNextBidAmount(featuredAuction.currentBid, smartIncrement);
    
    if (balance < nextBidAmount) {
      toast({
        title: "Saldo insuficiente",
        description: "No tienes suficiente saldo para realizar esta puja. Recarga tu cuenta para participar.",
        variant: "destructive",
      });
      return;
    }

    // Simular puja exitosa
    toast({
      title: "¡Puja realizada!",
      description: `Has pujado $${nextBidAmount.toLocaleString()} por ${featuredAuction.title}`,
    });

    // Scroll to auction grid to see more auctions
    setTimeout(() => {
      const auctionGrid = document.getElementById('auction-grid');
      if (auctionGrid) {
        auctionGrid.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1500);
  }
}