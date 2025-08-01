import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer } from "@/components/ui/timer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Gavel, Trophy, Clock, AlertCircle, TrendingUp, MapPin, Upload, Truck, Gift } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import productPerfume from "@/assets/product-perfume.jpg";
import productLiquor from "@/assets/product-liquor.jpg";
import productSwissKnife from "@/assets/product-swiss-knife.jpg";

const addressSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  street: z.string().min(5, "La dirección es requerida"),
  colony: z.string().min(2, "La colonia es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El estado es requerido"),
  zipCode: z.string().min(5, "El código postal es requerido"),
  references: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

const MyBids = () => {
  const { user } = useAuth();
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const handleAddressSubmit = (data: AddressFormData) => {
    console.log("Dirección guardada:", data);
    // Simular cálculo de costo de envío
    setShippingCost(200);
  };

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIdFile(file);
      console.log("Archivo de ID seleccionado:", file.name);
    }
  };

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
              <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
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

            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6">
                {/* Dirección de Entrega */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Dirección de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...addressForm}>
                      <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Juan Pérez" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="55 1234 5678" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addressForm.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calle y número</FormLabel>
                              <FormControl>
                                <Input placeholder="Av. Principal 123, Col. Centro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="colony"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Colonia</FormLabel>
                                <FormControl>
                                  <Input placeholder="Centro" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ciudad</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ciudad de México" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                  <Input placeholder="CDMX" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código postal</FormLabel>
                                <FormControl>
                                  <Input placeholder="06000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addressForm.control}
                          name="references"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Referencias (opcional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Entre calles, puntos de referencia, indicaciones adicionales..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full bg-gradient-primary">
                          <MapPin className="h-4 w-4 mr-2" />
                          Guardar Dirección y Calcular Envío
                        </Button>
                      </form>
                    </Form>

                    {shippingCost && (
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Costo de Envío Calculado
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Envío estándar:</span>
                            <span className="font-bold">${shippingCost.toLocaleString()} MXN</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <Gift className="h-4 w-4" />
                            <span className="text-sm">
                              ¡Envío GRATUITO al comprar 3 o más productos!
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Identificación Oficial */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Identificación Oficial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          En caso de adquirir bebidas alcohólicas, será obligatorio cargar una identificación oficial vigente que acredite la mayoría de edad. No se procesarán envíos sin esta verificación.
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="id-upload">Subir identificación oficial</Label>
                      <div className="mt-2">
                        <Input
                          id="id-upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleIdUpload}
                          className="cursor-pointer"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Acepta: INE/IFE, Pasaporte, Cédula Profesional (formato JPG, PNG o PDF)
                      </p>
                    </div>

                    {idFile && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <Upload className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 dark:text-green-200">
                          Archivo cargado: {idFile.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBids;