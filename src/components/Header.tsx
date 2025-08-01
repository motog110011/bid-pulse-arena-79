import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Search, User, Wallet, LogOut, Settings, Gavel, CreditCard, History, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  userBalance?: number;
  userName?: string;
  userAvatar?: string;
}

export function Header({ userBalance = 5000, userName = "Usuario Demo", userAvatar }: HeaderProps) {
  const [notifications] = useState(3);
  const [rechargeAmount, setRechargeAmount] = useState("100");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();

  const handleRecharge = () => {
    const amount = parseInt(rechargeAmount);
    if (amount > 0) {
      toast({
        title: "Recarga exitosa",
        description: `Se han agregado $${amount.toLocaleString()} a tu cuenta.`,
      });
      setRechargeAmount("100");
    }
  };

  const userStats = {
    totalBids: 47,
    wonAuctions: 12,
    avgSavings: 35,
    memberSince: "Enero 2024"
  };

  const recentActivity = [
    { id: 1, action: "Puja ganada", item: "Whiskey Macallan 12 años", amount: 125, date: "Hace 2 horas" },
    { id: 2, action: "Puja realizada", item: "iPhone 15 Pro", amount: 750, date: "Hace 4 horas" },
    { id: 3, action: "Puja superada", item: "Rolex Submariner", amount: 2850, date: "Hace 1 día" }
  ];

  return (
    <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Subastas GAP
                </h1>
                <p className="text-xs text-muted-foreground">Premium Auctions</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost" 
              className="text-foreground"
              onClick={() => document.getElementById('auction-grid')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Subastas
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground"
              onClick={() => document.getElementById('auction-grid')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Categorías
            </Button>
            <Button variant="ghost" className="text-foreground">
              Mis Pujas
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground"
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Cómo Funciona
            </Button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <Button variant="ghost" size="icon" className="glass">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="glass relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Balance */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="hidden sm:flex items-center gap-2 glass px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <Wallet className="h-4 w-4 text-auction-gold" />
                  <span className="text-sm font-medium">
                    ${userBalance.toLocaleString()}
                  </span>
                  <Button size="sm" variant="secondary" className="h-6 text-xs">
                    Recargar
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle>Recargar Billetera</DialogTitle>
                  <DialogDescription>
                    Agrega fondos a tu cuenta para participar en las subastas
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Cantidad
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="col-span-3"
                      placeholder="100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRechargeAmount("50")}>
                      $50
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRechargeAmount("100")}>
                      $100
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRechargeAmount("250")}>
                      $250
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRechargeAmount("500")}>
                      $500
                    </Button>
                  </div>
                  <Button onClick={handleRecharge} className="w-full bg-gradient-primary">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Recargar ${parseInt(rechargeAmount || "0").toLocaleString()}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* User Menu */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="glass p-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Saldo: ${userBalance.toLocaleString()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Mi Billetera</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Gavel className="mr-2 h-4 w-4" />
                    <span>Mis Subastas</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="glass-card max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Mi Perfil</DialogTitle>
                  <DialogDescription>
                    Gestiona tu cuenta y revisa tu actividad de subastas
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="activity">Actividad</TabsTrigger>
                    <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>
                          Actualiza tu información de perfil
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={userAvatar} alt={userName} />
                            <AvatarFallback>
                              <User className="h-8 w-8" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-medium">{userName}</h3>
                            <p className="text-sm text-muted-foreground">Miembro desde {userStats.memberSince}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nombre completo</Label>
                            <Input value={userName} readOnly className="mt-1" />
                          </div>
                          <div>
                            <Label>Saldo actual</Label>
                            <Input value={`$${userBalance.toLocaleString()}`} readOnly className="mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                        <CardDescription>
                          Tus últimas acciones en la plataforma
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">{activity.item}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${activity.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{activity.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Pujas Totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <Gavel className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold">{userStats.totalBids}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Subastas Ganadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-auction-gold" />
                            <span className="text-2xl font-bold">{userStats.wonAuctions}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Ahorro Promedio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <Wallet className="h-5 w-5 text-auction-success" />
                            <span className="text-2xl font-bold">{userStats.avgSavings}%</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Historial</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Ver todo</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
}