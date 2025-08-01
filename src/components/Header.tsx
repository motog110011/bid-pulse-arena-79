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
import { Bell, Search, User, Wallet, LogOut, Settings, Gavel } from "lucide-react";

interface HeaderProps {
  userBalance?: number;
  userName?: string;
  userAvatar?: string;
}

export function Header({ userBalance = 5000, userName = "Usuario Demo", userAvatar }: HeaderProps) {
  const [notifications] = useState(3);

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
            <Button variant="ghost" className="text-foreground">
              Subastas
            </Button>
            <Button variant="ghost" className="text-foreground">
              Categorías
            </Button>
            <Button variant="ghost" className="text-foreground">
              Mis Pujas
            </Button>
            <Button variant="ghost" className="text-foreground">
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
            <div className="hidden sm:flex items-center gap-2 glass px-3 py-2 rounded-lg">
              <Wallet className="h-4 w-4 text-auction-gold" />
              <span className="text-sm font-medium">
                ${userBalance.toLocaleString()}
              </span>
              <Button size="sm" variant="secondary" className="h-6 text-xs">
                Recargar
              </Button>
            </div>

            {/* User Menu */}
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
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
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
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}