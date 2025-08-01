import { useState, useEffect } from "react";
import { AuctionCard } from "@/components/ui/auction-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, SortAsc } from "lucide-react";
import productPerfume from "@/assets/product-perfume.jpg";
import productLiquor from "@/assets/product-liquor.jpg";
import productTools from "@/assets/product-tools.jpg";
import productCosmetics from "@/assets/product-cosmetics.jpg";
import productElectronics from "@/assets/product-electronics.jpg";
import productLuxuryPerfumes from "@/assets/product-luxury-perfumes.jpg";
import productPremiumSpirits from "@/assets/product-premium-spirits.jpg";
import productSwissKnife from "@/assets/product-swiss-knife.jpg";
import productLuxuryMakeup from "@/assets/product-luxury-makeup.jpg";
import productPremiumElectronics from "@/assets/product-premium-electronics.jpg";
import productLuxuryWatches from "@/assets/product-luxury-watches.jpg";
import productTacticalGear from "@/assets/product-tactical-gear.jpg";
import productLuxuryJewelry from "@/assets/product-luxury-jewelry.jpg";

export function AuctionGrid() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userBalance] = useState(15000);

  // Productos decomisados en aeropuertos - Precios realistas pero atractivos
  const auctions = [
    {
      id: "1",
      title: "Chanel No. 5 EDP 100ml - Decomisado en Seguridad",
      image: productLuxuryPerfumes,
      currentBid: 45,
      minimumBid: 55,
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
      totalBids: 24,
      category: "Perfumes",
      isLive: true,
      lastBidder: "Carlos M."
    },
    {
      id: "2",
      title: "Whiskey Macallan 12 años 700ml - Confiscado",
      image: productPremiumSpirits,
      currentBid: 89,
      minimumBid: 99,
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000 + 30 * 60 * 1000), // 1.5 hours
      totalBids: 18,
      category: "Licores",
      isLive: true,
      lastBidder: "Ana R."
    },
    {
      id: "3",
      title: "Navaja Suiza Victorinox SwissChamp - Decomisada",
      image: productSwissKnife,
      currentBid: 25,
      minimumBid: 35,
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
      totalBids: 31,
      category: "Herramientas",
      isLive: true,
      lastBidder: "Miguel S."
    },
    {
      id: "4",
      title: "Set Cosméticos La Mer - Productos Confiscados",
      image: productLuxuryMakeup,
      currentBid: 35,
      minimumBid: 45,
      endTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
      totalBids: 12,
      category: "Cosméticos",
      isLive: true,
      lastBidder: "Laura P."
    },
    {
      id: "5",
      title: "iPhone 15 Pro 256GB + AirPods Pro - Decomisados",
      image: productPremiumElectronics,
      currentBid: 750,
      minimumBid: 760,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000), // 2h 15m
      totalBids: 8,
      category: "Electrónicos",
      isLive: false,
      lastBidder: "Roberto H."
    },
    {
      id: "6",
      title: "Cognac Hennessy XO 700ml - Decomisado",
      image: productLiquor,
      currentBid: 125,
      minimumBid: 135,
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      totalBids: 19,
      category: "Licores",
      isLive: false,
      lastBidder: "Fernando L."
    },
    {
      id: "7",
      title: "Tom Ford Oud Wood 100ml - Confiscado Seguridad",
      image: productPerfume,
      currentBid: 65,
      minimumBid: 75,
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      totalBids: 15,
      category: "Perfumes",
      isLive: true,
      lastBidder: "Sofia V."
    },
    {
      id: "8",
      title: "Kit Supervivencia Leatherman - Decomisado",
      image: productTacticalGear,
      currentBid: 45,
      minimumBid: 55,
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000), // 3h 30m
      totalBids: 22,
      category: "Herramientas",
      isLive: true,
      lastBidder: "Diego R."
    },
    {
      id: "9",
      title: "Rolex Submariner Date - Confiscado Aduana",
      image: productLuxuryWatches,
      currentBid: 2850,
      minimumBid: 2860,
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      totalBids: 67,
      category: "Relojes",
      isLive: true,
      lastBidder: "Alejandro K."
    },
    {
      id: "10",
      title: "MacBook Pro M3 Pro 16\" - Decomisado",
      image: productElectronics,
      currentBid: 1450,
      minimumBid: 1460,
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000 + 20 * 60 * 1000), // 4h 20m
      totalBids: 43,
      category: "Electrónicos",
      isLive: true,
      lastBidder: "Patricia M."
    },
    {
      id: "11",
      title: "Collar Oro 18k + Cadena Cartier - Confiscado",
      image: productLuxuryJewelry,
      currentBid: 890,
      minimumBid: 900,
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000 + 45 * 60 * 1000), // 6h 45m
      totalBids: 29,
      category: "Joyería",
      isLive: false,
      lastBidder: "Mónica V."
    },
    {
      id: "12",
      title: "Vodka Grey Goose 1L + Gin Bombay - Decomisados",
      image: productPremiumSpirits,
      currentBid: 55,
      minimumBid: 65,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      totalBids: 16,
      category: "Licores",
      isLive: true,
      lastBidder: "Eduardo F."
    },
    {
      id: "13",
      title: "Dior Sauvage 100ml + Gift Set - Confiscado",
      image: productCosmetics,
      currentBid: 38,
      minimumBid: 48,
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000), // 5h 30m
      totalBids: 21,
      category: "Perfumes",
      isLive: false,
      lastBidder: "Carmen L."
    },
    {
      id: "14",
      title: "Omega Speedmaster Professional - Decomisado",
      image: productLuxuryWatches,
      currentBid: 1650,
      minimumBid: 1660,
      endTime: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours
      totalBids: 38,
      category: "Relojes",
      isLive: true,
      lastBidder: "Javier R."
    },
    {
      id: "15",
      title: "Multitool Leatherman Wave Plus - Confiscado",
      image: productTools,
      currentBid: 28,
      minimumBid: 38,
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
      totalBids: 14,
      category: "Herramientas",
      isLive: true,
      lastBidder: "Ricardo P."
    }
  ];

  const handleBid = (itemId: string, amount: number) => {
    console.log(`Nueva puja de $${amount} para el item ${itemId}`);
    // Aquí implementarías la lógica de puja
  };

  const filteredAuctions = selectedCategory === "all" 
    ? auctions 
    : auctions.filter(auction => auction.category.toLowerCase() === selectedCategory);

  const liveAuctions = auctions.filter(auction => auction.isLive);
  const endingSoon = auctions.filter(auction => {
    const timeLeft = auction.endTime.getTime() - Date.now();
    return timeLeft < 60 * 60 * 1000; // Less than 1 hour
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">
            Productos <span className="text-primary">Decomisados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Artículos confiscados en aeropuertos internacionales. 
            Perfumes, licores, herramientas y más a precios increíbles.
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
              <TabsTrigger value="all">Todos los Productos</TabsTrigger>
              <TabsTrigger value="perfumes">Perfumes</TabsTrigger>
              <TabsTrigger value="licores">Licores</TabsTrigger>
              <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
              <TabsTrigger value="cosméticos">Cosméticos</TabsTrigger>
              <TabsTrigger value="relojes">Relojes</TabsTrigger>
              <TabsTrigger value="joyería">Joyería</TabsTrigger>
              <TabsTrigger value="ending">Terminando Pronto</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" className="glass">
                <SortAsc className="h-4 w-4 mr-2" />
                Ordenar
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="perfumes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="licores" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="herramientas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cosméticos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="relojes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="joyería" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endingSoon.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  item={auction}
                  userBalance={userBalance}
                  onBid={handleBid}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        {/* Load more */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="glass">
            Cargar Más Productos
          </Button>
        </div>
      </div>
    </section>
  );
}