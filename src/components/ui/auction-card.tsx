import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Timer } from "@/components/ui/timer";
import { Gavel, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useProductImageMappings } from '@/hooks/useProductImages';
import { resolveDeterministicImage, getFallbackCandidates } from '@/lib/deterministicImageResolver';
import { calculateNextBidAmount, calculateSmartBidIncrement, validateBidAmount } from '@/utils/bidUtils';

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
  const roundedCurrentBid = Math.floor(item.currentBid);
  const smartIncrement = calculateSmartBidIncrement(roundedCurrentBid);
  const suggestedBidAmount = calculateNextBidAmount(roundedCurrentBid, smartIncrement);

  const [newBidAmount, setNewBidAmount] = useState(suggestedBidAmount);
  const [imgError, setImgError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const { data: mappings } = useProductImageMappings();

  const primaryImage = resolveDeterministicImage(
    item.title, item.category, item.image, mappings
  );
  const fallbackCandidates = getFallbackCandidates(item.category, item.title);
  const currentSrc = imgError && fallbackIndex < fallbackCandidates.length
    ? fallbackCandidates[fallbackIndex]
    : primaryImage;

  useEffect(() => {
    setImgError(false);
    setFallbackIndex(0);
  }, [item.id]);

  useEffect(() => {
    const rounded = Math.floor(item.currentBid);
    const inc = calculateSmartBidIncrement(rounded);
    setNewBidAmount(calculateNextBidAmount(rounded, inc));
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
  const isEndingSoon = timeRemaining <= 30 * 60 * 1000;
  const isExpired = timeRemaining <= 0;

  return (
    <Card className="flex flex-col bg-white border border-border hover:border-gobierno-dorado hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardHeader className="p-0">
        {/* UX: aspect-ratio fijo para evitar layout shift mientras carga la imagen */}
        <div className="relative overflow-hidden aspect-[4/3] bg-muted">
          <img
            src={currentSrc}
            alt={`${item.title} — ${item.category}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => {
              if (!imgError) {
                setImgError(true);
              } else if (fallbackIndex < fallbackCandidates.length - 1) {
                setFallbackIndex((p) => p + 1);
              }
            }}
          />
          {/* UX: badges en esquina superior izquierda — zona segura en mobile */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.isLive && (
              <Badge className="bg-destructive text-white animate-pulse-auction text-xs">
                EN VIVO
              </Badge>
            )}
            {isEndingSoon && !isExpired && (
              <Badge className="bg-auction-warning text-white text-xs">
                TERMINANDO
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* UX: CardContent con flex-col y flex-1 para que todas las cards tengan la misma altura */}
      <CardContent className="flex flex-col flex-1 p-4 gap-3">
        {/* Título y categoría */}
        <div>
          {/* UX: line-clamp-2 evita desbordamiento y mantiene altura consistente */}
          <h3 className="font-semibold text-base leading-snug line-clamp-2 mb-1.5 text-foreground">
            {item.title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
        </div>

        {/* Puja actual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Oferta actual</p>
            <p className="font-bold text-xl text-gobierno-guinda">
              ${Math.floor(item.currentBid).toLocaleString("es-MX")}
              <span className="text-xs font-normal text-muted-foreground ml-1">MXN</span>
            </p>
          </div>
          {item.currentBidder && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground text-right">
              <Users className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{item.totalBids} pujas</span>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="text-center py-1">
          <Timer endTime={item.endTime} />
        </div>

        {/* UX: controles de puja en la mitad inferior — thumb zone en mobile */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            {/* UX: inputMode numeric abre teclado numérico en mobile sin zoom (text-base = 16px) */}
            <input
              type="number"
              inputMode="numeric"
              value={newBidAmount}
              onChange={(e) => setNewBidAmount(Number(e.target.value))}
              min={suggestedBidAmount}
              step={smartIncrement}
              disabled={isExpired}
              aria-label="Monto de tu oferta en MXN"
              className="flex-1 px-3 py-2 text-base rounded border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gobierno-guinda disabled:opacity-50"
            />
            <span className="text-sm text-muted-foreground shrink-0">MXN</span>
          </div>

          {/* UX: h-12 = 48px — área de toque mínima recomendada para mobile */}
          <Button
            onClick={handleBid}
            disabled={isExpired}
            className="w-full h-12 bg-gobierno-guinda hover:bg-gobierno-guinda-oscuro text-white font-semibold text-base"
          >
            <Gavel className="h-4 w-4 mr-2" aria-hidden="true" />
            {isExpired ? "Subasta Finalizada" : "Realizar Oferta"}
          </Button>
        </div>

        {/* Metadata secundaria */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          <span>Incremento mínimo: ${smartIncrement.toLocaleString("es-MX")} MXN</span>
        </div>
      </CardContent>
    </Card>
  );
};
