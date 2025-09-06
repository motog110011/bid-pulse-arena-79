import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Timer, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Zap,
  Plus,
  PlayCircle,
  StopCircle,
  Database,
  Activity,
  DollarSign,
  Gavel
} from 'lucide-react';
import { useAuctionManager } from '@/hooks/useAuctionManager';
import { generateProductVariant } from '@/utils/dynamicAuctionGenerator';
import { toast } from 'sonner';

export const AuctionManager = () => {
  const {
    stats,
    expiredAuctions,
    allAuctions,
    isLoadingStats,
    isLoadingExpired,
    isLoadingAll,
    rotateAuctions,
    forceExpireAuctions,
    createAuction,
    isRotating,
    isForceExpiring,
    isCreating,
    refetchStats,
    refetchExpired,
  } = useAuctionManager();

  const [selectedAuctions, setSelectedAuctions] = useState<string[]>([]);
  const [newAuctionForm, setNewAuctionForm] = useState({
    category: 'Perfumes',
    starting_bid: 25,
    duration_hours: 6,
  });

  const handleRotateAuctions = async () => {
    try {
      const result = await rotateAuctions();
      toast.success(`✅ Rotación completada: ${result.renewedCount} subastas renovadas`);
    } catch (error) {
      console.error('Error rotating auctions:', error);
      toast.error('❌ Error al rotar subastas: ' + (error as Error).message);
    }
  };

  const handleForceExpire = async () => {
    if (selectedAuctions.length === 0) {
      toast.error('Selecciona al menos una subasta para expirar');
      return;
    }

    try {
      await forceExpireAuctions(selectedAuctions);
      toast.success(`✅ ${selectedAuctions.length} subastas forzadas a expirar`);
      setSelectedAuctions([]);
    } catch (error) {
      toast.error('❌ Error al expirar subastas');
    }
  };

  const handleCreateRandomAuction = async () => {
    try {
      const productVariant = generateProductVariant(newAuctionForm.category);
      
      await createAuction({
        title: productVariant.title,
        description: productVariant.description,
        category: productVariant.category,
        starting_bid: newAuctionForm.starting_bid,
        image_url: productVariant.imageUrl,
        duration_hours: newAuctionForm.duration_hours,
      });

      toast.success(`✅ Nueva subasta creada: "${productVariant.title}"`);
    } catch (error) {
      toast.error('❌ Error al crear subasta');
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins > 60) {
      const hours = Math.floor(diffMins / 60);
      return `${hours}h ${diffMins % 60}m`;
    } else if (diffMins > 0) {
      return `${diffMins}m`;
    } else {
      return `Expirada hace ${Math.abs(diffMins)}m`;
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
          <h1 className="text-3xl font-bold">Gestión de Subastas</h1>
          <p className="text-muted-foreground">
            Panel de control para rotación automática y gestión de subastas
          </p>
        </div>
        <Button
          onClick={() => {
            refetchStats();
            refetchExpired();
          }}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Subastas</p>
                <div className="text-2xl font-bold">{stats?.totalAuctions || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Activas</p>
                <div className="text-2xl font-bold">{stats?.activeAuctions || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Expiradas</p>
                <div className="text-2xl font-bold">{stats?.endedAuctions || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Puja Promedio</p>
                <div className="text-2xl font-bold">
                  ${Math.round(stats?.avgBidAmount || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rotation" className="w-full">
        <TabsList className="glass-card">
          <TabsTrigger value="rotation">Rotación</TabsTrigger>
          <TabsTrigger value="expired">Subastas Expiradas</TabsTrigger>
          <TabsTrigger value="create">Crear Nueva</TabsTrigger>
          <TabsTrigger value="logs">Historial</TabsTrigger>
        </TabsList>

        {/* Rotation Tab */}
        <TabsContent value="rotation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Rotación Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  La rotación automática convierte subastas expiradas en productos completamente nuevos con títulos, precios y categorías diferentes.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button
                  onClick={handleRotateAuctions}
                  disabled={isRotating}
                  className="bg-gradient-primary"
                >
                  {isRotating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Rotando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Rotar Subastas Expiradas
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{stats?.endedAuctions || 0} subastas listas para rotar</span>
                </div>
              </div>

              {stats?.recentRotations && stats.recentRotations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Últimas Rotaciones</h4>
                  {stats.recentRotations.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                        <span className="text-sm">
                          {log.auctions_renewed} subastas renovadas
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.rotation_time).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expired Auctions Tab */}
        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Subastas Expiradas ({expiredAuctions?.length || 0})
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleForceExpire}
                    disabled={selectedAuctions.length === 0 || isForceExpiring}
                    variant="destructive"
                    size="sm"
                  >
                    {isForceExpiring ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Expirando...
                      </>
                    ) : (
                      <>
                        <StopCircle className="h-4 w-4 mr-2" />
                        Expirar Seleccionadas
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRotateAuctions}
                    disabled={!expiredAuctions?.length || isRotating}
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rotar Todas
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingExpired ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : expiredAuctions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay subastas expiradas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expiredAuctions?.map((auction) => (
                    <div
                      key={auction.id}
                      className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted/50"
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
                            <span>${auction.current_bid}</span>
                            <span>•</span>
                            <span>{auction.total_bids} pujas</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {formatTime(auction.end_time)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(auction.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create New Auction Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Crear Nueva Subasta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={newAuctionForm.category}
                    onValueChange={(value) =>
                      setNewAuctionForm(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Perfumes">Perfumes</SelectItem>
                      <SelectItem value="Vinos y Licores">Vinos y Licores</SelectItem>
                      <SelectItem value="Electrónicos">Electrónicos</SelectItem>
                      <SelectItem value="Navajas">Navajas</SelectItem>
                      <SelectItem value="Relojes">Relojes</SelectItem>
                      <SelectItem value="Joyas">Joyas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Precio Inicial ($)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={newAuctionForm.starting_bid}
                    onChange={(e) =>
                      setNewAuctionForm(prev => ({ 
                        ...prev, 
                        starting_bid: Number(e.target.value) 
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duración (horas)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={newAuctionForm.duration_hours}
                    onChange={(e) =>
                      setNewAuctionForm(prev => ({ 
                        ...prev, 
                        duration_hours: Number(e.target.value) 
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateRandomAuction}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Crear Subasta Aleatoria
                  </>
                )}
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se generará automáticamente un producto único con título, descripción y condición realista basado en la categoría seleccionada.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Historial de Rotaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentRotations && stats.recentRotations.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentRotations.map((log) => (
                    <div key={log.id} className="border-l-4 border-l-primary pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status === 'success' ? 'Exitoso' : 'Error'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.rotation_time).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        Procesadas: {log.auctions_processed} | Renovadas: {log.auctions_renewed}
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay historial de rotaciones aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
