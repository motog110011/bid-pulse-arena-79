import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer } from "@/components/ui/timer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gavel, Trophy, Clock, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserBids } from "@/hooks/useUserBids";
import { useBidMutation } from "@/hooks/useBidMutation";
import { calculateSmartBidIncrement, calculateNextBidAmount } from "@/utils/bidUtils";
import { toast } from "sonner";
import { resolveDeterministicImage } from "@/lib/deterministicImageResolver";
import { useProductImageMappings } from "@/hooks/useProductImages";

const MyBids = () => {
  const { user } = useAuth();
  const { data: userBids = [], isLoading, error, refetch } = useUserBids();
  const { data: mappings } = useProductImageMappings();
  const bidMutation = useBidMutation();
  const [biddingAuctions, setBiddingAuctions] = useState<Set<string>>(new Set());

  const handleBid = async (auctionId: string, amount: number) => {
    setBiddingAuctions(prev => new Set([...prev, auctionId]));
    
    try {
      await bidMutation.mutateAsync({ auctionId, amount });
      toast.success(`¡Puja de $${amount.toLocaleString()} realizada exitosamente!`);
      refetch(); // Refresh the bids data
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Error al realizar la puja');
    } finally {
      setBiddingAuctions(prev => {
        const newSet = new Set(prev);
        newSet.delete(auctionId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (bid: any) => {
    if (bid.user_won) {
      return <Badge className="bg-auction-gold text-black">Ganada</Badge>;
    }
    if (bid.auction_ended && !bid.user_won) {
      return <Badge variant="outline">Perdida</Badge>;
    }
    if (bid.is_winning) {
      return <Badge className="bg-green-500">Ganando</Badge>;
    }
    if (bid.is_outbid) {
      return <Badge className="bg-red-500">Superado</Badge>;
    }
    return <Badge variant="outline">Activa</Badge>;
  };

  const getStatusIcon = (bid: any) => {
    if (bid.user_won) {
      return <Trophy className="h-4 w-4 text-auction-gold" />;
    }
    if (bid.auction_ended && !bid.user_won) {
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
    if (bid.is_winning) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (bid.is_outbid) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Gavel className="h-4 w-4" />;
  };

  const activeBids = userBids.filter(bid => !bid.auction_ended);
  const completedBids = userBids.filter(bid => bid.auction_ended);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mis Pujas</h1>
              <p className="text-muted-foreground">
                Gestiona tus pujas activas y revisa tu historial de subastas
              </p>
            </div>
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-24 h-24 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="grid grid-cols-4 gap-4">
                          <Skeleton className="h-12" />
                          <Skeleton className="h-12" />
                          <Skeleton className="h-12" />
                          <Skeleton className="h-12" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error cargando tus pujas. Por favor intenta de nuevo.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Gavel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Inicia sesión para ver tus pujas</h1>
            <p className="text-muted-foreground mb-6">
              Necesitas estar autenticado para acceder a tu historial de pujas
            </p>
            <Button asChild>
              <a href="/auth">Iniciar Sesión</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Pujas</h1>
            <p className="text-muted-foreground">
              Gestiona tus pujas activas y revisa tu historial de subastas
            </p>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="glass-card">
              <TabsTrigger value="active">Pujas Activas ({activeBids.length})</TabsTrigger>
              <TabsTrigger value="completed">Historial ({completedBids.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeBids.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="text-center py-12">
                    <Gavel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No tienes pujas activas</h3>
                    <p className="text-muted-foreground mb-6">
                      Explora nuestras subastas y comienza a pujar por productos únicos
                    </p>
                    <Button asChild>
                      <a href="/?scroll=auction-grid">Ver Subastas</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {activeBids.map((bid) => {
                    const auctionEndTime = new Date(bid.auction.end_time);
                    const currentBidRounded = Math.floor(bid.auction.current_bid);
                    const smartIncrement = calculateSmartBidIncrement(currentBidRounded);
                    const nextBidAmount = calculateNextBidAmount(currentBidRounded, smartIncrement);
                    const imageUrl = resolveDeterministicImage(
                      bid.auction.title,
                      bid.auction.category,
                      bid.auction.image_url,
                      mappings
                    );
                    const isBiddingOnThisAuction = biddingAuctions.has(bid.auction_id);
                    
                    return (
                      <Card key={bid.id} className="glass-card">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="relative">
                              <img
                                src={imageUrl}
                                alt={bid.auction.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-1 right-1">
                                <span className="text-xs text-white/70 bg-black/50 px-1 py-0.5 rounded text-[10px]">
                                  *Imagen ilustrativa
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{bid.auction.title}</h3>
                                  <Badge variant="outline" className="mt-1">
                                    {bid.auction.category}
                                  </Badge>
                                </div>
                                {getStatusBadge(bid)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Mi puja</p>
                                  <p className="font-bold text-lg">${bid.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Puja actual</p>
                                  <p className="font-bold text-lg text-auction-gold">
                                    ${bid.auction.current_bid.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Siguiente mínima</p>
                                  <p className="font-bold text-lg">${nextBidAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Tiempo restante</p>
                                  <Timer endTime={auctionEndTime} variant="urgent" />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {getStatusIcon(bid)}
                                  <span>
                                    {bid.is_winning
                                      ? "¡Estás ganando esta subasta!" 
                                      : "Tu puja ha sido superada"
                                    }
                                  </span>
                                </div>
                                
                                {bid.is_outbid && auctionEndTime > new Date() && (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-primary"
                                    onClick={() => handleBid(bid.auction_id, nextBidAmount)}
                                    disabled={isBiddingOnThisAuction}
                                  >
                                    {isBiddingOnThisAuction ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Gavel className="h-4 w-4 mr-2" />
                                    )}
                                    Pujar ${nextBidAmount.toLocaleString()}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {completedBids.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="text-center py-12">
                    <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Sin historial de pujas</h3>
                    <p className="text-muted-foreground">
                      Una vez que terminen tus primeras subastas, aparecerán aquí
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {completedBids.map((bid) => {
                    const imageUrl = resolveDeterministicImage(
                      bid.auction.title,
                      bid.auction.category,
                      bid.auction.image_url,
                      mappings
                    );
                    
                    return (
                      <Card key={bid.id} className="glass-card">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="relative">
                              <img
                                src={imageUrl}
                                alt={bid.auction.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-1 right-1">
                                <span className="text-xs text-white/70 bg-black/50 px-1 py-0.5 rounded text-[10px]">
                                  *Imagen ilustrativa
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{bid.auction.title}</h3>
                                  <Badge variant="outline" className="mt-1">
                                    {bid.auction.category}
                                  </Badge>
                                </div>
                                {getStatusBadge(bid)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Mi puja final</p>
                                  <p className="font-bold text-lg">${bid.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Precio final</p>
                                  <p className="font-bold text-lg">${bid.auction.current_bid.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total de pujas</p>
                                  <p className="font-bold text-lg">{bid.auction.total_bids}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                                {getStatusIcon(bid)}
                                <span>
                                  {bid.user_won
                                    ? "¡Felicidades! Ganaste esta subasta" 
                                    : "Subasta finalizada - No ganaste"
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBids;