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
import { Bell, Wallet, LogOut, User, Shield, Gavel, Settings, History, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserRole } from "@/hooks/useUserRole";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { WalletRechargeForm } from "@/components/WalletRechargeForm";
import { AdminPanelModal } from "@/components/AdminPanelModal";
import { GobiertoLogo } from "@/components/GobiertoLogo";

const navItems = [
  {
    label: "Subastas",
    scrollTo: "auction-grid",
  },
  {
    label: "Categorías",
    scrollTo: "auction-grid",
  },
  {
    label: "Cómo Funciona",
    scrollTo: "como-funciona",
  },
] as const;

export function HeaderGobierno() {
  const { user, signOut } = useAuth();
  const { balance, loading: balanceLoading } = useUserBalance();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const userBalance = user && !balanceLoading ? balance : 0;

  const handleScrollNav = (scrollTo: string) => {
    if (location.pathname === "/") {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/?scroll=${scrollTo}`);
    }
  };

  return (
    <>
      {/* Franja superior guinda — estilo gob.mx */}
      <div className="bg-gobierno-guinda text-white text-xs font-institucional font-semibold tracking-widest uppercase py-1 px-4 flex items-center gap-2">
        <span className="opacity-75">|</span>
        <span>Gobierno de México</span>
        <span className="opacity-75">·</span>
        <span className="opacity-75">Portal Oficial de Subastas</span>
      </div>

      {/* Header principal */}
      <header className="bg-white border-b-4 border-gobierno-guinda sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center"
              onClick={() => {
                if (location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              aria-label="Subastas GAP — Inicio"
            >
              <GobiertoLogo size="md" />
            </Link>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleScrollNav(item.scrollTo)}
                  className="px-4 py-2 text-sm font-semibold font-institucional uppercase tracking-wide text-gobierno-gris rounded hover:text-gobierno-guinda hover:bg-gobierno-claro transition-colors duration-150"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/mis-pujas"
                className="px-4 py-2 text-sm font-semibold font-institucional uppercase tracking-wide text-gobierno-gris rounded hover:text-gobierno-guinda hover:bg-gobierno-claro transition-colors duration-150"
              >
                Mis Pujas
              </Link>
              {isAdmin && (
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="px-4 py-2 text-sm font-semibold font-institucional uppercase tracking-wide text-gobierno-guinda bg-gobierno-claro rounded border border-gobierno-guinda hover:bg-gobierno-guinda hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </button>
              )}
            </nav>

            {/* Zona derecha */}
            <div className="flex items-center gap-2">

              {/* Campana de notificaciones */}
              <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gobierno-gris hover:text-gobierno-guinda"
                    aria-label="Notificaciones"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="font-institucional text-gobierno-guinda">Notificaciones</DialogTitle>
                    <DialogDescription>Tu actividad reciente en subastas</DialogDescription>
                  </DialogHeader>
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Sin notificaciones nuevas</p>
                  </div>
                </DialogContent>
              </Dialog>

              {user ? (
                <div className="flex items-center gap-2">
                  {/* Billetera */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-gobierno-dorado bg-gobierno-claro hover:bg-gobierno-dorado/10 transition-colors cursor-pointer"
                        aria-label="Saldo de billetera"
                      >
                        <Wallet className="h-4 w-4 text-gobierno-dorado" />
                        <span className="text-sm font-bold font-institucional text-gobierno-guinda-oscuro">
                          ${userBalance.toLocaleString("es-MX")}
                        </span>
                        <Badge className="bg-gobierno-guinda text-white text-[10px] h-5 px-1.5 rounded-sm">
                          Recargar
                        </Badge>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <WalletRechargeForm />
                    </DialogContent>
                  </Dialog>

                  {/* Menú de usuario */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-gobierno-claro"
                        aria-label="Menú de cuenta"
                      >
                        <Avatar className="h-8 w-8 border-2 border-gobierno-guinda">
                          <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt={user.user_metadata?.full_name}
                          />
                          <AvatarFallback className="bg-gobierno-guinda text-white text-xs font-bold">
                            {user.user_metadata?.full_name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || user.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm font-semibold font-institucional text-gobierno-gris max-w-[120px] truncate">
                          {user.user_metadata?.full_name?.split(" ")[0] || "Ciudadano"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-56 border border-gobierno-guinda/20 shadow-lg"
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold font-institucional text-gobierno-guinda">
                            {user.user_metadata?.full_name || "Ciudadano"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                          <span className="text-xs text-gobierno-dorado-oscuro font-semibold">
                            Saldo: ${userBalance.toLocaleString("es-MX")} MXN
                          </span>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator className="bg-gobierno-guinda/10" />

                      <DropdownMenuItem asChild>
                        <Link to="/perfil" className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4 text-gobierno-guinda" />
                          Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/mis-pujas" className="flex items-center gap-2 cursor-pointer">
                          <Gavel className="h-4 w-4 text-gobierno-guinda" />
                          Mis Pujas
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer opacity-50" disabled>
                        <History className="h-4 w-4" />
                        Historial
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer opacity-50" disabled>
                        <Settings className="h-4 w-4" />
                        Configuración
                      </DropdownMenuItem>

                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator className="bg-gobierno-guinda/10" />
                          <DropdownMenuItem
                            onClick={() => setIsAdminPanelOpen(true)}
                            className="flex items-center gap-2 cursor-pointer text-gobierno-guinda font-semibold"
                          >
                            <Shield className="h-4 w-4" />
                            Panel de Admin
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator className="bg-gobierno-guinda/10" />
                      <DropdownMenuItem
                        onClick={signOut}
                        className="flex items-center gap-2 cursor-pointer text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="text-sm font-semibold font-institucional text-gobierno-gris hover:text-gobierno-guinda uppercase tracking-wide"
                    asChild
                  >
                    <Link to="/auth">Iniciar Sesión</Link>
                  </Button>
                  <Button
                    className="bg-gobierno-guinda hover:bg-gobierno-guinda-hover text-white text-sm font-bold font-institucional uppercase tracking-wide rounded-sm px-4"
                    asChild
                  >
                    <Link to="/auth">Registrarse</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

      {/* Admin Panel */}
      {isAdmin && (
        <Dialog open={isAdminPanelOpen} onOpenChange={setIsAdminPanelOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-institucional text-gobierno-guinda flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Panel de Administración
              </DialogTitle>
              <DialogDescription>
                Gestión de usuarios, recargas y subastas
              </DialogDescription>
            </DialogHeader>
            <AdminPanelModal />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
