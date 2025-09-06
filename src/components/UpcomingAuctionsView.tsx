import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock,
  Calendar,
  DollarSign,
  Tag,
  Eye,
  Trash2,
  PlayCircle,
  AlertTriangle,
  Timer,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useScheduledAuctions, type UpcomingAuction } from '@/hooks/useScheduledAuctions';
import { toast } from 'sonner';

export const UpcomingAuctionsView = () => {
  const {
    upcomingAuctions,
    isLoadingUpcoming,
    publishScheduledAuctions,
    deleteScheduledAuction,
    cancelScheduledAuction,
    isDeleting,
    isCancelling,
    refetchUpcoming,
  } = useScheduledAuctions();

  const [selectedAuction, setSelectedAuction] = useState<UpcomingAuction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Helper functions for time formatting and styling
  const formatTimeUntil = (timeUntilPublish: string) => {
    // Parse custom format from hook
    if (timeUntilPublish === 'Ready to publish') {
      return { text: 'Listo para publicar', isReady: true, isUrgent: true };
    }

    // Parse format like "2 days 14:30:00" or "2:30:00"
    const match = timeUntilPublish.match(/(?:(\d+) days\s+)?(\d+):(\d+):(\d+)/);
    if (!match) return { text: 'Formato inválido', isReady: false, isUrgent: false };

    const [, daysStr, hoursStr, minutesStr] = match;
    const days = parseInt(daysStr || '0');
    const hours = parseInt(hoursStr || '0');
    const minutes = parseInt(minutesStr || '0');

    let text = '';
    let isUrgent = false;

    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m`;
      isUrgent = hours < 2; // Urgent if less than 2 hours
    } else {
      text = `${minutes}m`;
      isUrgent = true; // Always urgent if less than 1 hour
    }

    return { text, isReady: false, isUrgent };
  };

  const getTimelineColor = (timeInfo: { isReady: boolean; isUrgent: boolean }) => {
    if (timeInfo.isReady) return 'bg-red-500';
    if (timeInfo.isUrgent) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTimelineTextColor = (timeInfo: { isReady: boolean; isUrgent: boolean }) => {
    if (timeInfo.isReady) return 'text-red-700';
    if (timeInfo.isUrgent) return 'text-yellow-700';
    return 'text-blue-700';
  };

  const handleDeleteAuction = async (auctionId: string) => {
    try {
      await deleteScheduledAuction(auctionId);
      toast.success('✅ Subasta programada eliminada');
    } catch (error) {
      toast.error('❌ Error al eliminar la subasta programada');
    }
  };

  const handleCancelAuction = async (auctionId: string) => {
    try {
      await cancelScheduledAuction(auctionId);
      toast.success('✅ Subasta programada cancelada');
    } catch (error) {
      toast.error('❌ Error al cancelar la subasta programada');
    }
  };

  const handlePublishReady = async () => {
    try {
      const result = await publishScheduledAuctions();
      
      if (result?.published_count > 0) {
        toast.success(`✅ ${result.published_count} subastas publicadas`);
      } else {
        toast.info('ℹ️ No hay subastas listas para publicar');
      }
    } catch (error) {
      toast.error('❌ Error al publicar subastas');
    }
  };

  const groupAuctionsByTime = (auctions: UpcomingAuction[]) => {
    const ready = auctions.filter(a => formatTimeUntil(a.time_until_publish).isReady);
    const urgent = auctions.filter(a => {
      const timeInfo = formatTimeUntil(a.time_until_publish);
      return !timeInfo.isReady && timeInfo.isUrgent;
    });
    const scheduled = auctions.filter(a => {
      const timeInfo = formatTimeUntil(a.time_until_publish);
      return !timeInfo.isReady && !timeInfo.isUrgent;
    });

    return { ready, urgent, scheduled };
  };

  if (isLoadingUpcoming) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const { ready, urgent, scheduled } = groupAuctionsByTime(upcomingAuctions || []);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {ready.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">
              {ready.length} subasta{ready.length > 1 ? 's' : ''} lista{ready.length > 1 ? 's' : ''} para publicar inmediatamente
            </span>
            <Button
              onClick={handlePublishReady}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Publicar Ahora ({ready.length})
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Ready to Publish */}
      {ready.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Timer className="h-5 w-5" />
              Listas para Publicar ({ready.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ready.map((auction) => (
                <AuctionTimelineItem
                  key={auction.id}
                  auction={auction}
                  onDelete={handleDeleteAuction}
                  onCancel={handleCancelAuction}
                  onViewDetails={(auction) => {
                    setSelectedAuction(auction);
                    setShowDetailsModal(true);
                  }}
                  isDeleting={isDeleting}
                  isCancelling={isCancelling}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgent (less than 2 hours) */}
      {urgent.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              Próximas (Urgentes) ({urgent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgent.map((auction) => (
                <AuctionTimelineItem
                  key={auction.id}
                  auction={auction}
                  onDelete={handleDeleteAuction}
                  onCancel={handleCancelAuction}
                  onViewDetails={(auction) => {
                    setSelectedAuction(auction);
                    setShowDetailsModal(true);
                  }}
                  isDeleting={isDeleting}
                  isCancelling={isCancelling}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled (more than 2 hours) */}
      {scheduled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Programadas ({scheduled.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scheduled.map((auction) => (
                <AuctionTimelineItem
                  key={auction.id}
                  auction={auction}
                  onDelete={handleDeleteAuction}
                  onCancel={handleCancelAuction}
                  onViewDetails={(auction) => {
                    setSelectedAuction(auction);
                    setShowDetailsModal(true);
                  }}
                  isDeleting={isDeleting}
                  isCancelling={isCancelling}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!upcomingAuctions || upcomingAuctions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No hay subastas programadas</h3>
            <p className="text-muted-foreground mb-4">
              Programa nuevas subastas para mantener un flujo constante de productos
            </p>
            <Button className="bg-gradient-primary">
              <PlayCircle className="h-4 w-4 mr-2" />
              Crear Primera Subasta
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Subasta Programada</DialogTitle>
          </DialogHeader>
          {selectedAuction && (
            <AuctionDetails
              auction={selectedAuction}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface AuctionTimelineItemProps {
  auction: UpcomingAuction;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails: (auction: UpcomingAuction) => void;
  isDeleting: boolean;
  isCancelling: boolean;
}

const AuctionTimelineItem = ({
  auction,
  onDelete,
  onCancel,
  onViewDetails,
  isDeleting,
  isCancelling
}: AuctionTimelineItemProps) => {
  const formatTimeUntil = (timeUntilPublish: string) => {
    if (timeUntilPublish === 'Ready to publish') {
      return { text: 'Listo para publicar', isReady: true, isUrgent: true };
    }

    const match = timeUntilPublish.match(/(?:(\d+) days\s+)?(\d+):(\d+):(\d+)/);
    if (!match) return { text: 'Formato inválido', isReady: false, isUrgent: false };

    const [, daysStr, hoursStr, minutesStr] = match;
    const days = parseInt(daysStr || '0');
    const hours = parseInt(hoursStr || '0');
    const minutes = parseInt(minutesStr || '0');

    let text = '';
    let isUrgent = false;

    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m`;
      isUrgent = hours < 2;
    } else {
      text = `${minutes}m`;
      isUrgent = true;
    }

    return { text, isReady: false, isUrgent };
  };

  const getTimelineColor = (timeInfo: { isReady: boolean; isUrgent: boolean }) => {
    if (timeInfo.isReady) return 'bg-red-500';
    if (timeInfo.isUrgent) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTimelineTextColor = (timeInfo: { isReady: boolean; isUrgent: boolean }) => {
    if (timeInfo.isReady) return 'text-red-700';
    if (timeInfo.isUrgent) return 'text-yellow-700';
    return 'text-blue-700';
  };

  const timeInfo = formatTimeUntil(auction.time_until_publish);

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${getTimelineColor(timeInfo)}`} />
        <div className={`w-0.5 h-8 ${getTimelineColor(timeInfo)} opacity-30`} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium line-clamp-1">{auction.title}</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {auction.category}
              </Badge>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${auction.starting_bid}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {auction.duration_hours}h
              </span>
            </div>
          </div>

          {/* Time until publish */}
          <div className="text-right">
            <div className={`text-sm font-medium ${getTimelineTextColor(timeInfo)}`}>
              {timeInfo.text}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(auction.scheduled_publish_time).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(auction.scheduled_publish_time).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails(auction)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCancel(auction.id)}
          disabled={isCancelling}
        >
          <XCircle className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(auction.id)}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface AuctionDetailsProps {
  auction: UpcomingAuction;
  onClose: () => void;
}

const AuctionDetails = ({ auction, onClose }: AuctionDetailsProps) => {
  const formatTimeUntil = (timeUntilPublish: string) => {
    if (timeUntilPublish === 'Ready to publish') {
      return { text: 'Listo para publicar', isReady: true, isUrgent: true };
    }

    const match = timeUntilPublish.match(/(?:(\d+) days\s+)?(\d+):(\d+):(\d+)/);
    if (!match) return { text: 'Formato inválido', isReady: false, isUrgent: false };

    const [, daysStr, hoursStr, minutesStr] = match;
    const days = parseInt(daysStr || '0');
    const hours = parseInt(hoursStr || '0');
    const minutes = parseInt(minutesStr || '0');

    let text = '';
    let isUrgent = false;

    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m`;
      isUrgent = hours < 2;
    } else {
      text = `${minutes}m`;
      isUrgent = true;
    }

    return { text, isReady: false, isUrgent };
  };

  const timeInfo = formatTimeUntil(auction.time_until_publish);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert className={timeInfo.isReady ? 'border-red-200 bg-red-50' : 
                       timeInfo.isUrgent ? 'border-yellow-200 bg-yellow-50' : 
                       'border-blue-200 bg-blue-50'}>
        {timeInfo.isReady ? (
          <CheckCircle className="h-4 w-4 text-red-600" />
        ) : timeInfo.isUrgent ? (
          <Timer className="h-4 w-4 text-yellow-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription>
          <strong>Estado:</strong> {timeInfo.text}
          {timeInfo.isReady && " - Esta subasta puede publicarse inmediatamente"}
          {timeInfo.isUrgent && !timeInfo.isReady && " - Se publicará pronto"}
        </AlertDescription>
      </Alert>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título</Label>
            <p className="text-sm">{auction.title}</p>
          </div>
          
          <div>
            <Label>Descripción</Label>
            <p className="text-sm text-muted-foreground">{auction.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoría</Label>
              <Badge variant="outline">{auction.category}</Badge>
            </div>
            <div>
              <Label>Precio Inicial</Label>
              <p className="text-sm font-medium">${auction.starting_bid}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Programación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Publicación</Label>
              <p className="text-sm">
                {new Date(auction.scheduled_publish_time).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label>Hora de Publicación</Label>
              <p className="text-sm">
                {new Date(auction.scheduled_publish_time).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <Label>Duración</Label>
              <p className="text-sm">{auction.duration_hours} horas</p>
            </div>
            <div>
              <Label>Estado</Label>
              <Badge className={
                auction.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                auction.status === 'published' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }>
                {auction.status === 'scheduled' ? 'Programada' :
                 auction.status === 'published' ? 'Publicada' :
                 'Cancelada'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium text-muted-foreground block mb-1">
    {children}
  </label>
);