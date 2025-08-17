
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import { AuctionCard } from "@/components/ui/auction-card";
import { useAutoBid } from "@/hooks/useAutoBid";
import { useActivitySimulation } from "@/hooks/useActivitySimulation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const AuctionGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerAutoBid } = useAutoBid();
  const { triggerActivity } = useActivitySimulation();
  const { toast } = useToast();

  const getImageFallback = (category: string): string => {
    switch (category) {
      case 'Vinos y Licores':
        return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c76d3?q=80&w=800&auto=format&fit=crop';
      case 'Navajas':
        return 'https://images.unsplash.com/photo-1617979745825-2b3e9a219ddb?q=80&w=800&auto=format&fit=crop';
      case 'Electrónicos':
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=800&auto=format&fit=crop';
    }
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .order('end_time', { ascending: true });

      if (error) {
        console.error('Error fetching auctions:', error);
        return;
      }

      const formattedAuctions: AuctionItem[] = data.map((auction) => ({
        id: auction.id,
        title: auction.title,
        currentBid: Number(auction.current_bid),
        endTime: new Date(auction.end_time),
        image: auction.image_url || getImageFallback(auction.category),
        category: auction.category,
        isLive: auction.status === 'active',
        description: auction.description,
        currentBidder: auction.current_bidder,
        totalBids: auction.total_bids,
        minimumBid: Number(auction.minimum_bid),
        bidIncrement: Number(auction.bid_increment),
      }));

      setAuctions(formattedAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();

    // Refresh auctions every 30 seconds
    const interval = setInterval(fetchAuctions, 30000);
    
    // Set up real-time subscription for auction updates
    const subscription = supabase
      .channel('auctions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'auctions' },
        (payload) => {
          console.log('🔔 Real-time auction update:', payload);
          fetchAuctions(); // Refresh all auctions when any changes
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const handleBid = async (itemId: string, amount: number) => {
    try {
      // Update the auction in the database
      const { error } = await supabase
        .from('auctions')
        .update({
          current_bid: amount,
          current_bidder: "Tu oferta",
          total_bids: auctions.find(a => a.id === itemId)?.totalBids! + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating bid:', error);
        toast({
          title: "Error",
          description: "No se pudo realizar la oferta. Inténtalo de nuevo.",
          variant: "destructive",
        });
        return;
      }

      // Update local state immediately
      setAuctions(prevAuctions =>
        prevAuctions.map(auction =>
          auction.id === itemId
            ? {
                ...auction,
                currentBid: amount,
                currentBidder: "Tu oferta",
                totalBids: (auction.totalBids || 0) + 1,
              }
            : auction
        )
      );
      
      // Schedule auto-bid response
      const auctionCategory = auctions.find(a => a.id === itemId)?.category || '';
      triggerAutoBid(amount, itemId, auctionCategory, handleAutoBid);
      
      toast({
        title: "¡Oferta realizada!",
        description: `Has ofertado $${amount.toFixed(0)} MXN por "${auctions.find(a => a.id === itemId)?.title}"`,
      });
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Error",
        description: "No se pudo realizar la oferta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleAutoBid = async (auctionId: string, newBid: number, bidder: string) => {
    try {
      // Update the auction in the database
      const { error } = await supabase
        .from('auctions')
        .update({
          current_bid: newBid,
          current_bidder: bidder,
          total_bids: auctions.find(a => a.id === auctionId)?.totalBids! + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', auctionId);

      if (error) {
        console.error('Error updating auto bid:', error);
        return;
      }

      // Update local state
      setAuctions(prevAuctions =>
        prevAuctions.map(auction =>
          auction.id === auctionId
            ? {
                ...auction,
                currentBid: newBid,
                currentBidder: bidder,
                totalBids: (auction.totalBids || 0) + 1,
              }
            : auction
        )
      );
      
      toast({
        title: "Nueva oferta automática",
        description: `${bidder} ha ofertado $${newBid.toFixed(0)} MXN`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error processing auto bid:', error);
    }
  };

  // Filter auctions based on selected category
  const filteredAuctions = selectedCategory === "All" 
    ? auctions 
    : selectedCategory === "Terminating"
    ? auctions.filter(auction => {
        const timeRemaining = auction.endTime.getTime() - Date.now();
        return timeRemaining <= 30 * 60 * 1000 && timeRemaining > 0;
      })
    : auctions.filter(auction => auction.category === selectedCategory);

  const liveAuctions = auctions.filter(auction => {
    const timeRemaining = auction.endTime.getTime() - Date.now();
    return auction.isLive && timeRemaining > 30 * 60 * 1000;
  });
  
  const endingSoon = auctions.filter(auction => {
    const timeRemaining = auction.endTime.getTime() - Date.now();
    return timeRemaining <= 30 * 60 * 1000 && timeRemaining > 0;
  });

  return (
    <section id="auction-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">
            Productos <span className="text-primary">Decomisados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Artículos confiscados en aeropuertos internacionales. 
            Vinos, licores, navajas y electrónicos a precios increíbles.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <Badge className="bg-destructive animate-pulse-auction mb-2">
              {liveAuctions.length} EN VIVO
            </Badge>
            <p className="text-sm text-muted-foreground">Subastas activas</p>
          </div>
          <div className="text-center">
            <Badge className="bg-auction-warning mb-2">
              {endingSoon.length} TERMINANDO
            </Badge>
            <p className="text-sm text-muted-foreground">Próximas a finalizar</p>
          </div>
        </div>

        {/* Filters and Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <TabsList className="glass-card">
              <TabsTrigger value="All">Todos los Productos</TabsTrigger>
              <TabsTrigger value="Vinos y Licores">Vinos y Licores</TabsTrigger>
              <TabsTrigger value="Navajas">Navajas</TabsTrigger>
              <TabsTrigger value="Electrónicos">Electrónicos</TabsTrigger>
              <TabsTrigger value="Terminating">Terminando Pronto</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" className="glass">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Ordenar
              </Button>
            </div>
          </div>

          {["All", "Vinos y Licores", "Navajas", "Electrónicos", "Terminating"].map((category) => (
            <TabsContent key={category} value={category} className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAuctions.map((item) => (
                    <AuctionCard key={item.id} item={item} onBid={handleBid} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}

          {/* Load more */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="glass">
              Cargar Más Productos
            </Button>
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export default AuctionGrid;
export { AuctionGrid };
