import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Clock,
  PlayCircle,
  Zap,
  Database,
  AlertCircle,
  RefreshCw,
  Timer,
  Eye,
  Plus,
  Settings,
  Trash2,
  Edit,
  CheckCircle
} from 'lucide-react';
import { useScheduledAuctions } from '@/hooks/useScheduledAuctions';
import { CreateScheduledAuction } from './CreateScheduledAuction';
import { UpcomingAuctionsView } from './UpcomingAuctionsView';
import { toast } from 'sonner';

export const ScheduledAuctionsManager = () => {
  const {
    upcomingAuctions,
    allScheduled,
    scheduledStats,
    isLoadingUpcoming,
    isLoadingAll,
    isLoadingStats,
    generateScheduledAuctions,
    publishScheduledAuctions,
    deleteScheduledAuction,
    cancelScheduledAuction,
    isGenerating,
    isPublishing,
    isDeleting,
    isCancelling,
    refetchUpcoming,
    refetchAll,
    refetchStats,
  } = useScheduledAuctions();

  const [selectedAuctions, setSelectedAuctions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const handleGenerateAuctions = async (days: number = 7, perDay: number = 3) => {
    try {
      const result = await generateScheduledAuctions({ 
        days_ahead: days, 
        auctions_per_day: perDay 
      });
      
      toast.success(`✅ ${result.created_count} subastas programadas generadas para los próximos ${days} días`);
      setShowGenerateDialog(false);
    } catch (error) {
      console.error('Error generating auctions:', error);
      toast.error('❌ Error al generar subastas programadas');
    }
  };

  const handlePublishReady = async () => {
    try {
      const result = await publishScheduledAuctions();
      
      if (result.published_count > 0) {
        toast.success(`✅ ${result.published_count} subastas publicadas automáticamente`);
      } else {
        toast.info('ℹ️ No hay subastas listas para publicar en este momento');
      }
    } catch (error) {
      console.error('Error publishing auctions:', error);
      toast.error('❌ Error al publicar subastas programadas');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedAuctions.length === 0) {
      toast.error('Selecciona al menos una subasta para eliminar');
      return;
    }

    try {
      for (const auctionId of selectedAuctions) {
        await deleteScheduledAuction(auctionId);
      }
      
      toast.success(`✅ ${selectedAuctions.length} subastas programadas eliminadas`);
      setSelectedAuctions([]);
    } catch (error) {
      toast.error('❌ Error al eliminar subastas programadas');
    }
  };

  const formatTimeUntil = (timeUntilPublish: string) => {
    // Parse PostgreSQL interval format
    const match = timeUntilPublish.match(/(?:(-?\d+) days?)?\s*(?:(-?\d+):)?(\d{2}):(\d{2})/);
    if (!match) return 'Formato inválido';

    const [, daysStr, hoursStr, minutesStr] = match;
    const days = parseInt(daysStr || '0');
    const hours = parseInt(hoursStr || '0');
    const minutes = parseInt(minutesStr || '0');

    if (days < 0 || hours < 0 || minutes < 0) {
      return 'Listo para publicar';
    }

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'published':
        return 'Publicada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (isLoadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subastas Programadas</h1>
          <p className="text-muted-foreground">
            Gestiona subastas que se publican automáticamente en horarios específicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              refetchUpcoming();
              refetchAll();
              refetchStats();
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Programada
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Programadas</p>
                <div className="text-2xl font-bold">{scheduledStats?.totalScheduled || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <div className="text-2xl font-bold">{scheduledStats?.pendingCount || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Publicadas</p>
                <div className="text-2xl font-bold">{scheduledStats?.publishedCount || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Listas</p>
                <div className="text-2xl font-bold">{scheduledStats?.readyToPublish || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="glass-card">
          <TabsTrigger value="upcoming">Próximas Subastas</TabsTrigger>
          <TabsTrigger value="all">Todas las Programadas</TabsTrigger>
          <TabsTrigger value="controls">Controles</TabsTrigger>
        </TabsList>

        {/* Upcoming Auctions Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <UpcomingAuctionsView />
        </TabsContent>

        {/* All Scheduled Auctions Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Todas las Subastas Programadas ({allScheduled?.length || 0})
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteSelected}
                    disabled={selectedAuctions.length === 0 || isDeleting}
                    variant="destructive"
                    size="sm"
                  >
                    {isDeleting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Eliminar ({selectedAuctions.length})
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAll ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : allScheduled?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay subastas programadas</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allScheduled?.map((auction) => (
                    <div
                      key={auction.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setSelectedAuctions(prev =>
                          prev.includes(auction.id)
                            ? prev.filter(id => id !== auction.id)
                            : [...prev, auction.id]
                        );
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAuctions.includes(auction.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <div>
                          <h4 className="font-medium">{auction.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{auction.category}</Badge>
                            <span>${auction.starting_bid}</span>
                            <span>•</span>
                            <span>{auction.duration_hours}h duración</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge className={getStatusColor(auction.status)}>
                            {getStatusText(auction.status)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(auction.scheduled_publish_time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto-generation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generación Automática
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Genera subastas programadas automáticamente con productos únicos y horarios distribuidos.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                    <DialogTrigger asChild>
                      <Button disabled={isGenerating} className="flex-1">
                        <Zap className="h-4 w-4 mr-2" />
                        Generar Subastas
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generar Subastas Programadas</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            onClick={() => handleGenerateAuctions(3, 2)}
                            className="flex-col h-20"
                          >
                            <span className="text-sm font-bold">3 días</span>
                            <span className="text-xs">2 por día</span>
                          </Button>
                          <Button
                            onClick={() => handleGenerateAuctions(7, 3)}
                            className="flex-col h-20"
                          >
                            <span className="text-sm font-bold">1 semana</span>
                            <span className="text-xs">3 por día</span>
                          </Button>
                          <Button
                            onClick={() => handleGenerateAuctions(14, 2)}
                            className="flex-col h-20"
                          >
                            <span className="text-sm font-bold">2 semanas</span>
                            <span className="text-xs">2 por día</span>
                          </Button>
                          <Button
                            onClick={() => handleGenerateAuctions(30, 1)}
                            className="flex-col h-20"
                          >
                            <span className="text-sm font-bold">1 mes</span>
                            <span className="text-xs">1 por día</span>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="text-xs text-muted-foreground">
                  Las subastas se distribuirán a lo largo del día con productos únicos y precios variables
                </div>
              </CardContent>
            </Card>

            {/* Publishing Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Publicación Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Timer className="h-4 w-4" />
                  <AlertDescription>
                    Publica manualmente las subastas que están listas según su horario programado.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handlePublishReady}
                  disabled={isPublishing || (scheduledStats?.readyToPublish || 0) === 0}
                  className="w-full bg-gradient-primary"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Publicar Listas ({scheduledStats?.readyToPublish || 0})
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground">
                  Normalmente esto se hace automáticamente cada 15 minutos
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Subasta Programada</DialogTitle>
          </DialogHeader>
          <CreateScheduledAuction
            onSuccess={() => setShowCreateModal(false)}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
