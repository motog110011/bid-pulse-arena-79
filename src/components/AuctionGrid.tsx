import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AuctionCard } from "@/components/ui/auction-card";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBidMutation } from "@/hooks/useBidMutation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Filter, ArrowUpDown } from "lucide-react";

interface AuctionItem {
  id: string;
  title: string;
  currentBid: number;
  endTime: Date;
  image: string;
  category: string;
  isLive: boolean;
  description?: string;
  currentBidder?: string;
  totalBids: number;
  minimumBid: number;
  bidIncrement: number;
}

const CATEGORIES = ["Perfumes", "Licores", "Vinos", "Navajas", "Herramientas", "Cosméticos"] as const;

const formatAuction = (raw: any): AuctionItem => ({
  id: raw.id,
  title: raw.title,
  currentBid: Number(raw.current_bid),
  endTime: new Date(raw.end_time),
  image: raw.image_url ?? "",
  category: raw.category,
  isLive: raw.status === "active",
  description: raw.description,
  currentBidder: raw.current_bidder ?? undefined,
  totalBids: raw.total_bids,
  minimumBid: Number(raw.minimum_bid),
  bidIncrement: Number(raw.bid_increment),
});

const AuctionGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user } = useAuth();
  const bidMutation = useBidMutation();
  const { toast } = useToast();

  const fetchAuctions = useCallback(async () => {
    const { data, error } = await (supabase as any).rpc("get_random_auctions");
    if (error) {
      toast({ title: "Error cargando subastas", variant: "destructive" });
      return;
    }
    setAuctions((data as any[]).map(formatAuction));
    setLoading(false);
  }, []);

  // Carga inicial + suscripción Realtime
  useEffect(() => {
    fetchAuctions();

    const channel = supabase
      .channel("auction-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions" },
        (payload) => {
          const updated = payload.new as any;
          setAuctions((prev) =>
            prev
              .map((a) =>
                a.id === updated.id
                  ? {
                      ...a,
                      currentBid: Number(updated.current_bid),
                      totalBids: updated.total_bids,
                      isLive: updated.status === "active",
                    }
                  : a
              )
              .filter((a) => a.isLive)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAuctions]);

  const handleBid = async (itemId: string, amount: number) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    const auction = auctions.find((a) => a.id === itemId);

    try {
      await bidMutation.mutateAsync({ auctionId: itemId, amount });

      // Actualización optimista local — Realtime la confirmará
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === itemId
            ? {
                ...a,
                currentBid: amount,
                currentBidder: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Tú",
                totalBids: a.totalBids + 1,
              }
            : a
        )
      );

      toast({
        title: "¡Puja registrada!",
        description: `Ofertaste $${amount.toLocaleString("es-MX")} por "${auction?.title}"`,
      });
    } catch (err: any) {
      toast({
        title: "No se pudo pujar",
        description: err.message ?? "Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const filteredAuctions =
    selectedCategory === "All"
      ? auctions
      : selectedCategory === "Terminating"
      ? auctions.filter(
          (a) => a.endTime.getTime() - Date.now() <= 30 * 60 * 1000 && a.endTime.getTime() > Date.now()
        )
      : auctions.filter((a) => a.category === selectedCategory);

  const liveCount = auctions.filter(
    (a) => a.isLive && a.endTime.getTime() - Date.now() > 30 * 60 * 1000
  ).length;

  const endingSoonCount = auctions.filter(
    (a) => a.endTime.getTime() - Date.now() <= 30 * 60 * 1000 && a.endTime.getTime() > Date.now()
  ).length;

  const tabKeys = ["All", ...CATEGORIES, "Terminating"] as const;

  return (
    <>
      <section id="auction-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">
              Productos <span className="text-primary">Decomisados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Artículos confiscados en aeropuertos internacionales.
              Perfumes, licores, vinos, navajas y más a precios increíbles.
            </p>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <Badge className="bg-destructive animate-pulse-auction mb-2">
                {liveCount} EN VIVO
              </Badge>
              <p className="text-sm text-muted-foreground">Subastas activas</p>
            </div>
            <div className="text-center">
              <Badge className="bg-auction-warning mb-2">
                {endingSoonCount} TERMINANDO
              </Badge>
              <p className="text-sm text-muted-foreground">Próximas a finalizar</p>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <TabsList className="glass-card flex-wrap h-auto gap-1">
                <TabsTrigger value="All">Todos</TabsTrigger>
                {CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                ))}
                <TabsTrigger value="Terminating">Terminando</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="glass" disabled>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm" className="glass" disabled>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Ordenar
                </Button>
              </div>
            </div>

            {tabKeys.map((category) => (
              <TabsContent key={category} value={category} className="space-y-6">
                {loading ? (
                  // UX: skeleton con aspect-ratio que coincide con la imagen de la card — evita layout shift
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white border border-border rounded overflow-hidden animate-pulse">
                        <div className="aspect-[4/3] bg-muted" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                          <div className="h-8 bg-muted rounded" />
                          <div className="h-12 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredAuctions.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg">No hay subastas activas en esta categoría.</p>
                  </div>
                ) : (
                  // UX: mobile-first grid — 1 col base, 2 en sm, 3 en lg
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredAuctions.map((item) => (
                      <AuctionCard key={item.id} item={item} onBid={handleBid} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
};

export default AuctionGrid;
export { AuctionGrid };
