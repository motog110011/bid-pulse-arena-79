import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer } from "@/components/ui/timer";
import { Gavel, Trophy, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import productPerfume from "@/assets/product-perfume.jpg";
import productLiquor from "@/assets/product-liquor.jpg";
import productSwissKnife from "@/assets/product-swiss-knife.jpg";

const MyBids = () => {
  const { user } = useAuth();

  // Mock data - en una app real vendría de la base de datos
  const [myBids] = useState([
    {
      id: "1",
      title: "Chanel No. 5 EDP 100ml - Decomisado en Seguridad",
      image: productPerfume,
      myBid: 85,
      currentBid: 95,
      minimumBid: 105,
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      status: "outbid", // "winning", "outbid", "won", "lost"
      bidTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      totalBids: 24,
      category: "Perfumes"
    },
    {
      id: "2", 
      title: "Whiskey Macallan 12 años 700ml - Confiscado",
      image: productLiquor,
      myBid: 125,
      currentBid: 125,
      minimumBid: 135,
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
      status: "winning",
      bidTime: new Date(Date.now() - 30 * 60 * 1000),
      totalBids: 18,
      category: "Licores"
    },
    {
      id: "3",
      title: "Navaja Suiza Victorinox SwissChamp - Decomisada", 
      image: productSwissKnife,
      myBid: 45,
      currentBid: 45,
      minimumBid: 55,
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Ya terminó
      status: "won",
      bidTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      totalBids: 31,
      category: "Herramientas"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "winning":
        return <Badge className="bg-green-500">Ganando</Badge>;
      case "outbid":
        return <Badge className="bg-red-500">Superado</Badge>;
      case "won":
        return <Badge className="bg-auction-gold text-black">Ganada</Badge>;
      case "lost":
        return <Badge variant="outline">Perdida</Badge>;
      default:
        return <Badge variant="outline">Activa</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "winning":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "outbid":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "won":
        return <Trophy className="h-4 w-4 text-auction-gold" />;
      case "lost":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Gavel className="h-4 w-4" />;
    }
  };

  const activeBids = myBids.filter(bid => bid.status === "winning" || bid.status === "outbid");
  const completedBids = myBids.filter(bid => bid.status === "won" || bid.status === "lost");

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
                  {activeBids.map((bid) => (
                    <Card key={bid.id} className="glass-card">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="relative">
                            <img
                              src={bid.image}
                              alt={bid.title}
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
                                <h3 className="font-semibold text-lg">{bid.title}</h3>
                                <Badge variant="outline" className="mt-1">
                                  {bid.category}
                                </Badge>
                              </div>
                              {getStatusBadge(bid.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Mi puja</p>
                                <p className="font-bold text-lg">${bid.myBid.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Puja actual</p>
                                <p className="font-bold text-lg text-auction-gold">
                                  ${bid.currentBid.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Siguiente mínima</p>
                                <p className="font-bold text-lg">${bid.minimumBid.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Tiempo restante</p>
                                <Timer endTime={bid.endTime} variant="urgent" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusIcon(bid.status)}
                                <span>
                                  {bid.status === "winning" 
                                    ? "¡Estás ganando esta subasta!" 
                                    : "Tu puja ha sido superada"
                                  }
                                </span>
                              </div>
                              
                              {bid.status === "outbid" && (
                                <Button size="sm" className="bg-gradient-primary">
                                  <Gavel className="h-4 w-4 mr-2" />
                                  Pujar ${bid.minimumBid.toLocaleString()}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  {completedBids.map((bid) => (
                    <Card key={bid.id} className="glass-card">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="relative">
                            <img
                              src={bid.image}
                              alt={bid.title}
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
                                <h3 className="font-semibold text-lg">{bid.title}</h3>
                                <Badge variant="outline" className="mt-1">
                                  {bid.category}
                                </Badge>
                              </div>
                              {getStatusBadge(bid.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Mi puja final</p>
                                <p className="font-bold text-lg">${bid.myBid.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Precio final</p>
                                <p className="font-bold text-lg">${bid.currentBid.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total de pujas</p>
                                <p className="font-bold text-lg">{bid.totalBids}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                              {getStatusIcon(bid.status)}
                              <span>
                                {bid.status === "won" 
                                  ? "¡Felicidades! Ganaste esta subasta" 
                                  : "Subasta finalizada - No ganaste"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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