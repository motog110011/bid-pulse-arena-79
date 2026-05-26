import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import {
  Menu, X, User, Wallet, LogOut, Gavel, Shield, History,
} from "lucide-react";
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
  // UX: estado del menú hamburguesa — sin librerías extra
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userBalance = user && !balanceLoading ? balance : 0;

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
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

  const navLinks = [
    { label: "Subastas",       action: () => scrollTo("auction-grid") },
    { label: "Categorías",     action: () => scrollTo("auction-grid") },
    { label: "Cómo Funciona",  action: () => scrollTo("como-funciona") },
  ];

  return (
    // UX: sticky que agrupa la barra institucional + nav principal para que ambas sean sticky
    <div className="sticky top-0 z-50">
      {/* Barra institucional */}
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
            subastasgap.com.mx
          </span>
        </div>
      </div>

      {/* Cabecera principal */}
      <header className="bg-white border-b-2 border-gobierno-dorado shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 flex-shrink-0"
              onClick={() => {
                setMobileMenuOpen(false);
                if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="p-2 rounded bg-gobierno-guinda">
                <Gavel className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-lg font-bold text-gobierno-guinda leading-tight tracking-tight">
                  Subastas GAP
                </div>
                <div className="text-[10px] text-gobierno-gris uppercase tracking-widest leading-none hidden sm:block">
                  Productos Decomisados
                </div>
              </div>
            </Link>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
              {navLinks.map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="px-4 py-2 text-sm font-medium text-gobierno-gris hover:text-gobierno-guinda hover:bg-gobierno-claro rounded transition-colors min-h-[44px]"
                >
                  {label}
                </button>
              ))}
              <Link
                to="/mis-pujas"
                className="px-4 py-2 text-sm font-medium text-gobierno-gris hover:text-gobierno-guinda hover:bg-gobierno-claro rounded transition-colors min-h-[44px] flex items-center"
              >
                Mis Pujas
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gobierno-guinda hover:bg-gobierno-guinda hover:text-white rounded transition-colors min-h-[44px]"
                >
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Zona derecha */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Saldo — visible en sm+ */}
                  <button
                    onClick={() => setRechargeOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-gobierno-dorado hover:bg-gobierno-claro transition-colors min-h-[44px]"
                    aria-label={`Saldo $${userBalance.toLocaleString("es-MX")} — recargar`}
                  >
                    <Wallet className="h-4 w-4 text-gobierno-dorado" aria-hidden="true" />
                    <span className="text-sm font-semibold text-gobierno-guinda">
                      ${userBalance.toLocaleString("es-MX")}
                    </span>
                    <span className="text-xs text-gobierno-gris bg-gobierno-claro px-1.5 py-0.5 rounded">
                      Recargar
                    </span>
                  </button>

                  {/* Avatar + menú dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {/* UX: área de toque mínima 44x44px en mobile */}
                      <button
                        className="flex items-center gap-2 p-1 rounded hover:bg-gobierno-claro transition-colors min-h-[44px] min-w-[44px] justify-center"
                        aria-label="Menú de usuario"
                      >
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
                          <User className="mr-2 h-4 w-4" aria-hidden="true" />
                          Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/mis-pujas" className="cursor-pointer">
                          <History className="mr-2 h-4 w-4" aria-hidden="true" />
                          Mis Pujas
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRechargeOpen(true)}>
                        <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
                        Recargar Saldo
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="cursor-pointer text-gobierno-guinda font-medium">
                              <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                              Panel Admin
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gobierno-gris hover:text-gobierno-guinda min-h-[44px]"
                    onClick={() => setAuthDialogOpen(true)}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white min-h-[44px]"
                    onClick={() => setAuthDialogOpen(true)}
                  >
                    Registrarse
                  </Button>
                </div>
              )}

              {/* UX: botón hamburguesa — solo mobile, área táctil 44×44px */}
              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded hover:bg-gobierno-claro transition-colors"
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {/* UX: transición suave X ↔ hamburguesa sin librería extra */}
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Menu
                    className={`h-5 w-5 text-gobierno-guinda absolute transition-all duration-200 ${
                      mobileMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                    }`}
                    aria-hidden="true"
                  />
                  <X
                    className={`h-5 w-5 text-gobierno-guinda absolute transition-all duration-200 ${
                      mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* UX: menú mobile — desliza con max-height + opacity para animación fluida sin JS */}
        <div
          id="mobile-menu"
          className={`md:hidden border-t border-border bg-white overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="px-4 py-3 space-y-1" aria-label="Navegación mobile">
            {navLinks.map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full text-left px-4 py-3 text-base font-medium text-gobierno-gris hover:text-gobierno-guinda hover:bg-gobierno-claro rounded transition-colors min-h-[48px] flex items-center"
              >
                {label}
              </button>
            ))}
            <Link
              to="/mis-pujas"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-4 py-3 text-base font-medium text-gobierno-gris hover:text-gobierno-guinda hover:bg-gobierno-claro rounded transition-colors min-h-[48px] flex items-center"
            >
              Mis Pujas
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-3 text-base font-semibold text-gobierno-guinda hover:bg-gobierno-claro rounded transition-colors min-h-[48px] flex items-center gap-2"
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                Panel Admin
              </Link>
            )}

            {/* Separador con acciones de usuario en mobile */}
            <div className="pt-2 border-t border-border space-y-1">
              {user ? (
                <>
                  {/* UX: saldo visible en mobile también */}
                  <button
                    onClick={() => { setMobileMenuOpen(false); setRechargeOpen(true); }}
                    className="w-full px-4 py-3 text-base font-medium text-gobierno-gris hover:bg-gobierno-claro rounded transition-colors min-h-[48px] flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4 text-gobierno-dorado" aria-hidden="true" />
                    <span>Saldo: ${userBalance.toLocaleString("es-MX")}</span>
                    <span className="ml-auto text-xs text-gobierno-guinda font-semibold">Recargar</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); signOut(); }}
                    className="w-full px-4 py-3 text-base font-medium text-destructive hover:bg-red-50 rounded transition-colors min-h-[48px] flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pb-2">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base border-gobierno-guinda text-gobierno-guinda"
                    onClick={() => { setMobileMenuOpen(false); setAuthDialogOpen(true); }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    className="w-full h-12 text-base bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white"
                    onClick={() => { setMobileMenuOpen(false); setAuthDialogOpen(true); }}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </nav>
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
