
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Timer } from "@/components/ui/timer";
import { Heart, Gavel, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useProductImageMappings } from '@/hooks/useProductImages';
import { resolveDeterministicImage, getFallbackCandidates } from '@/lib/deterministicImageResolver';
import { calculateNextBidAmount, calculateSmartBidIncrement, validateBidAmount, formatBidAmount } from '@/utils/bidUtils';

interface AuctionItem {
  id: string;
  title: string;
  currentBid: number;
  endTime: Date;
  image: string;
  category: string;
  isLive: boolean;
  description?: string;
  currentBidder?: string;
  totalBids: number;
  minimumBid: number;
  bidIncrement: number;
}

interface AuctionCardProps {
  item: AuctionItem;
  onBid: (itemId: string, amount: number) => void;
}

export const AuctionCard = ({ item, onBid }: AuctionCardProps) => {
  // Round the current bid to remove fractional values
  const roundedCurrentBid = Math.floor(item.currentBid);
  
  // Calculate smart bid increment based on rounded current bid amount
  const smartIncrement = calculateSmartBidIncrement(roundedCurrentBid);
  const suggestedBidAmount = calculateNextBidAmount(roundedCurrentBid, smartIncrement);
  
  const [newBidAmount, setNewBidAmount] = useState(suggestedBidAmount);
  const [imgError, setImgError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  
  const { data: mappings } = useProductImageMappings();

  // Resolver imagen de forma determinística
  const primaryImage = resolveDeterministicImage(
    item.title,
    item.category,
    item.image,
    mappings
  );

  const fallbackCandidates = getFallbackCandidates(item.category, item.title);
  const currentSrc = imgError && fallbackIndex < fallbackCandidates.length 
    ? fallbackCandidates[fallbackIndex] 
    : primaryImage;

  // Reset error state when item changes
  useEffect(() => {
    setImgError(false);
    setFallbackIndex(0);
  }, [item.id]);

  // Update bid amount when current bid changes - use smart increments
  useEffect(() => {
    const roundedBid = Math.floor(item.currentBid);
    const smartIncrement = calculateSmartBidIncrement(roundedBid);
    const suggestedAmount = calculateNextBidAmount(roundedBid, smartIncrement);
    setNewBidAmount(suggestedAmount);
  }, [item.currentBid]);

  const handleBid = () => {
    const validation = validateBidAmount(newBidAmount, item.currentBid, smartIncrement);
    
    if (!validation.valid) {
      toast.error(validation.message || "Oferta inválida");
      return;
    }
    
    onBid(item.id, newBidAmount);
  };

  const timeRemaining = item.endTime.getTime() - Date.now();
  const isEndingSoon = timeRemaining <= 30 * 60 * 1000; // 30 minutes

  return (
    <Card className="group bg-white border border-border hover:shadow-md hover:border-gobierno-dorado transition-all duration-200 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={currentSrc}
            alt={`${item.title} - ${item.category}`}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 33vw"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => {
              if (!imgError) {
                setImgError(true);
              } else if (fallbackIndex < fallbackCandidates.length - 1) {
                setFallbackIndex(prev => prev + 1);
              }
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {item.isLive && (
              <Badge className="bg-destructive animate-pulse-auction">
                EN VIVO
              </Badge>
            )}
            {isEndingSoon && (
              <Badge className="bg-auction-warning">
                TERMINANDO
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 glass text-white hover:text-destructive"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Title and Category */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {item.title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
        </div>

        {/* Current Bid Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Oferta actual:</span>
            <span className="font-bold text-xl text-primary">
              ${Math.floor(item.currentBid)} MXN
            </span>
          </div>
          
          {item.currentBidder && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{item.currentBidder}</span>
              <span>•</span>
              <span>{item.totalBids} ofertas</span>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="text-center py-2">
          <Timer endTime={item.endTime} />
        </div>

        {/* Bid Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newBidAmount}
              onChange={(e) => setNewBidAmount(Number(e.target.value))}
              min={suggestedBidAmount}
              step={smartIncrement}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="Tu oferta"
            />
            <span className="text-sm text-muted-foreground">MXN</span>
          </div>
          
          <Button
            onClick={handleBid}
            className="w-full bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white"
            disabled={timeRemaining <= 0}
          >
            <Gavel className="h-4 w-4 mr-2" />
            {timeRemaining <= 0 ? "Subasta Finalizada" : "Realizar Oferta"}
          </Button>
        </div>

        {/* Bid Increment Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>Incremento mínimo: ${smartIncrement} MXN</span>
        </div>
      </CardContent>
    </Card>
  );
};
