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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, User, Wallet, LogOut, Gavel, Shield, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserRole } from "@/hooks/useUserRole";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { WalletRechargeForm } from "@/components/WalletRechargeForm";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const { balance, loading: balanceLoading } = useUserBalance();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  const userBalance = user && !balanceLoading ? balance : 0;

  const scrollTo = (id: string) => {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/?scroll=${id}`);
    }
  };

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2) ?? user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="sticky top-0 z-50">
      {/* Barra de aviso institucional */}
      <div className="bg-gobierno-guinda text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold tracking-wide">Subastas GAP</span>
            <span className="text-gobierno-dorado hidden sm:block">|</span>
            <span className="hidden sm:block opacity-80">
              Artículos decomisados en aeropuertos internacionales
            </span>
          </div>
          <span className="text-xs text-gobierno-dorado tracking-widest font-medium">
            subastasgap.mx
          </span>
        </div>
      </div>

      {/* Cabecera principal — blanca con borde dorado */}
      <header className="bg-white border-b-2 border-gobierno-dorado shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3"
              onClick={() => {
                if (location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <div className="p-2 rounded bg-gobierno-guinda">
                <Gavel className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gobierno-guinda leading-tight tracking-tight">
                  Subastas GAP
                </div>
                <div className="text-[10px] text-gobierno-gris uppercase tracking-widest leading-none">
                  Productos Decomisados
                </div>
              </div>
            </Link>

            {/* Navegación central */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Subastas", scroll: "auction-grid" },
                { label: "Categorías", scroll: "auction-grid" },
                { label: "Cómo Funciona", scroll: "como-funciona" },
              ].map(({ label, scroll }) => (
                <button
                  key={label}
                  onClick={() => scrollTo(scroll)}
                  className="px-4 py-2 text-sm font-medium text-gobierno-gris hover:text-gobierno-guinda hover:bg-gobierno-claro rounded transition-colors"
                >
                  {label}
                </button>
              ))}
              <Link
                to="/mis-pujas"
                className="px-4 py-2 text-sm font-medium text-gobierno-gris hover:text-gobierno-guinda hover:bg-gobierno-claro rounded transition-colors"
              >
                Mis Pujas
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gobierno-guinda hover:bg-gobierno-guinda hover:text-white rounded transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Zona derecha */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Saldo */}
                  <button
                    onClick={() => setRechargeOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-gobierno-dorado hover:bg-gobierno-claro transition-colors"
                  >
                    <Wallet className="h-4 w-4 text-gobierno-dorado" />
                    <span className="text-sm font-semibold text-gobierno-guinda">
                      ${userBalance.toLocaleString("es-MX")}
                    </span>
                    <span className="text-xs text-gobierno-gris bg-gobierno-claro px-1.5 py-0.5 rounded">
                      Recargar
                    </span>
                  </button>

                  {/* Avatar + menú */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-1 rounded hover:bg-gobierno-claro transition-colors">
                        <Avatar className="h-8 w-8 border-2 border-gobierno-guinda">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gobierno-guinda text-white text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-white border border-border shadow-md">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm text-gobierno-guinda">
                            {user.user_metadata?.full_name || "Usuario"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Saldo: ${userBalance.toLocaleString("es-MX")}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/perfil" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/mis-pujas" className="cursor-pointer">
                          <History className="mr-2 h-4 w-4" />
                          Mis Pujas
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRechargeOpen(true)}>
                        <Wallet className="mr-2 h-4 w-4" />
                        Recargar Saldo
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="cursor-pointer text-gobierno-guinda font-medium">
                              <Shield className="mr-2 h-4 w-4" />
                              Panel Admin
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gobierno-gris hover:text-gobierno-guinda"
                    onClick={() => setAuthDialogOpen(true)}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white"
                    onClick={() => setAuthDialogOpen(true)}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recargar Saldo</DialogTitle>
          </DialogHeader>
          <WalletRechargeForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
