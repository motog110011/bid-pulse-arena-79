import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { Bell, Search, User, Wallet, LogOut, Settings, Gavel, CreditCard, History, Award, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserLimitations } from "@/hooks/useUserLimitations";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { WalletRechargeForm } from "@/components/WalletRechargeForm";
import { AdminPanelModal } from "@/components/AdminPanelModal";
import { UserCTA, UserTierBadge } from "@/components/UserCTA";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const { balance, loading: balanceLoading } = useUserBalance();
  const { isAdmin } = useUserRole();
  const { 
    userTier, 
    isAnonymous, 
    hasFunds, 
    ctaAction, 
    ctaMessage 
  } = useUserLimitations();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const { toast } = useToast();
  
  // Real user balance from database
  const userBalance = user && !balanceLoading ? balance : 0;


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

  const mockNotifications = [
    // Comentado para mostrar estado vacío real
    // { 
    //   id: 1, 
    //   type: "bid_won", 
    //   title: "¡Puja ganada!", 
    //   message: "Has ganado la subasta de iPhone 15 Pro", 
    //   time: "Hace 2 horas", 
    //   read: false 
    // },
  ];

  return (
    <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-3"
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Subastas GAP
                </h1>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost" 
              className="text-foreground"
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('auction-grid')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/?scroll=auction-grid');
                }
              }}
            >
              Subastas
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground"
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('auction-grid')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/?scroll=auction-grid');
                }
              }}
            >
              Categorías
            </Button>
            <Button variant="ghost" className="text-foreground" asChild>
              <Link to="/mis-pujas">Mis Pujas</Link>
            </Button>
            {isAdmin && (
              <Button 
                variant="ghost" 
                className="text-foreground"
                onClick={() => setIsAdminPanelOpen(true)}
              >
                Admin
              </Button>
            )}
            <Button 
              variant="ghost" 
              className="text-foreground"
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/?scroll=como-funciona');
                }
              }}
            >
              Cómo Funciona
            </Button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="glass relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-md">
                <DialogHeader>
                  <DialogTitle>Notificaciones</DialogTitle>
                  <DialogDescription>
                    Mantente al día con tus subastas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay notificaciones nuevas</p>
                    </div>
                  ) : (
                    mockNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.read 
                            ? 'bg-background/50 border-border/30' 
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'bid_won' ? 'bg-auction-success/20' :
                            notification.type === 'bid_outbid' ? 'bg-destructive/20' :
                            'bg-auction-gold/20'
                          }`}>
                            {notification.type === 'bid_won' && <Award className="h-4 w-4 text-auction-success" />}
                            {notification.type === 'bid_outbid' && <Gavel className="h-4 w-4 text-destructive" />}
                            {notification.type === 'auction_ending' && <Bell className="h-4 w-4 text-auction-gold" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* User Authentication/Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Tier Badge and Balance */}
                <div className="hidden sm:flex items-center gap-2">
                  <UserTierBadge />
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className={`flex items-center gap-2 glass px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${
                        !hasFunds ? 'ring-2 ring-yellow-400/50 animate-pulse' : ''
                      }`}>
                        <Wallet className={`h-4 w-4 ${
                          hasFunds ? 'text-auction-gold' : 'text-yellow-400'
                        }`} />
                        <span className="text-sm font-medium">
                          ${userBalance.toLocaleString()}
                        </span>
                        <Button 
                          size="sm" 
                          variant={hasFunds ? "secondary" : "default"}
                          className={`h-6 text-xs ${
                            !hasFunds ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-medium' : ''
                          }`}
                        >
                          {hasFunds ? 'Recargar' : '¡Recarga!'}
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="glass-card max-w-md max-h-[90vh] overflow-y-auto">
                      <WalletRechargeForm />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* User Menu */}
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="glass p-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                          <AvatarFallback>
                            {user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || user.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Usuario'}</p>
                            <UserTierBadge className="text-xs" />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs leading-none text-muted-foreground">
                              Saldo: ${userBalance.toLocaleString()}
                            </p>
                            {!hasFunds && (
                              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                                Sin fondos
                              </Badge>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/perfil">
                          <User className="mr-2 h-4 w-4" />
                          <span>Mi Perfil</span>
                        </Link>
                      </DropdownMenuItem>
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
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => setIsAdminPanelOpen(true)}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Panel de Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={signOut}>
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
                                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                                <AvatarFallback>
                                  <User className="h-8 w-8" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-medium">{user.user_metadata?.full_name || 'Usuario'}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Miembro desde {new Date(user.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Nombre completo</Label>
                                <Input value={user.user_metadata?.full_name || ''} readOnly className="mt-1" />
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
                            <div className="text-center py-8 text-muted-foreground">
                              <p>Aún no tienes actividad reciente</p>
                              <p className="text-sm">Participa en tu primera subasta para ver tu historial aquí</p>
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
                                <span className="text-2xl font-bold">0</span>
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
                                <span className="text-2xl font-bold">0</span>
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
                                <span className="text-2xl font-bold">0%</span>
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
              ) : (
              <div className="flex items-center gap-3">
                {/* CTA motivacional para usuarios anónimos */}
                <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 px-3 py-1 rounded-lg">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    Visitante
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {ctaMessage || 'Regístrate para acceder a todas las subastas'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild className="text-sm">
                    <Link to="/auth">Iniciar Sesión</Link>
                  </Button>
                  <Button 
                    variant="default" 
                    asChild 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm font-medium"
                  >
                    <Link to="/auth">¡Únete Gratis!</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      
      {/* Admin Panel Modal */}
      {isAdmin && (
        <Dialog open={isAdminPanelOpen} onOpenChange={setIsAdminPanelOpen}>
          <DialogContent className="glass-card max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Panel de Administración</DialogTitle>
              <DialogDescription>
                Gestiona recargas y balances de usuarios
              </DialogDescription>
            </DialogHeader>
            <AdminPanelModal />
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}