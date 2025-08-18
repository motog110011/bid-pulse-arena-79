
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer } from "@/components/ui/timer";
import { cn } from "@/lib/utils";
import { Heart, Gavel, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserBalance } from "@/hooks/useUserBalance";
import { getImageWithFallbacks } from "@/lib/imageUtils";

interface AuctionItem {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  minimumBid: number;
  bidIncrement: number;
  endTime: Date;
  totalBids: number;
  category: string;
  isLive: boolean;
  currentBidder?: string;
}

interface AuctionCardProps {
  item: AuctionItem;
  onBid?: (itemId: string, amount: number) => void;
  className?: string;
}

export function AuctionCard({ item, onBid, className }: AuctionCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { balance: userBalance } = useUserBalance();
  const { toast } = useToast();

  const handleBid = () => {
    const nextBidAmount = item.currentBid + item.bidIncrement;
    
    if (nextBidAmount > userBalance) {
      toast({
        title: "Saldo insuficiente",
        description: "No tienes suficiente saldo para realizar esta puja.",
        variant: "destructive",
      });
      return;
    }

    onBid?.(item.id, nextBidAmount);
  };

  const nextBidAmount = item.currentBid + item.bidIncrement;

  return (
    <Card className={cn("glass-card smooth-transition hover:auction-glow group", className)}>
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={getImageWithFallbacks(item.title, item.category, item.image)} 
            alt={item.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Generate a different fallback image for this specific item
              target.src = getImageWithFallbacks(item.title, item.category);
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-gradient-gold text-black font-medium">
              {item.category}
            </Badge>
            {item.isLive && (
              <Badge className="bg-destructive animate-pulse-auction">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                EN VIVO
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 glass hover:bg-white/20"
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart className={cn(
              "h-5 w-5 transition-colors",
              isFavorited ? "fill-red-500 text-red-500" : "text-white"
            )} />
          </Button>
          <div className="absolute bottom-2 right-2">
            <span className="text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
              *Imagen para fines ilustrativos
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Puja actual</p>
              <p className="text-2xl font-bold text-auction-gold">
                ${item.currentBid.toFixed(0)} MXN
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tiempo restante</p>
              <Timer endTime={item.endTime} variant="urgent" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Gavel className="h-4 w-4" />
              <span>{item.totalBids} pujas</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Pujador: {item.currentBidder || "Sin pujas"}</span>
            </div>
          </div>

          {item.currentBidder && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <TrendingUp className="h-4 w-4 text-auction-success" />
              <span className="text-sm">
                Última puja: <span className="font-medium">{item.currentBidder}</span> con <span className="font-bold">${item.currentBid.toFixed(0)} MXN</span>
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Siguiente puja mínima</p>
            <p className="font-bold text-primary">${nextBidAmount.toFixed(0)} MXN</p>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <Button
            onClick={handleBid}
            className="flex-1 bg-gradient-primary hover:shadow-glow smooth-transition"
            disabled={userBalance < nextBidAmount}
          >
            <Gavel className="h-4 w-4 mr-2" />
            Pujar ${nextBidAmount.toFixed(0)} MXN
          </Button>
          <Button variant="outline" size="icon" className="glass hover:bg-white/10">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {userBalance < nextBidAmount && (
          <p className="text-sm text-destructive text-center">
            Saldo insuficiente. Recarga tu cuenta para participar.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
