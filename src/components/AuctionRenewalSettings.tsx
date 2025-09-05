import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw, Clock, Zap } from 'lucide-react';
import { useAuctionRenewal } from '@/hooks/useAuctionRenewal';
import { useToast } from '@/hooks/use-toast';

export const AuctionRenewalSettings = () => {
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState({
    minExtensionMinutes: 15,
    maxExtensionMinutes: 60,
    checkIntervalSeconds: 30,
    enabled: true
  });

  // Initialize the renewal system with current settings
  const { renewExpiredAuctions, config } = useAuctionRenewal(localConfig);

  const handleConfigChange = (field: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    toast({
      title: "Configuración actualizada",
      description: `${field} cambiado a: ${value}`,
      duration: 2000,
    });
  };

  const handleManualRenewal = async () => {
    toast({
      title: "🔧 Ejecutando renovación manual",
      description: "Verificando subastas expiradas...",
      duration: 3000,
    });
    
    await renewExpiredAuctions();
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Control de Renovación Automática
          <Badge variant={config.enabled ? "default" : "secondary"} className="ml-2">
            {config.enabled ? "Activo" : "Inactivo"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Sistema Activo</Label>
            <p className="text-sm text-muted-foreground">
              Activar/desactivar la renovación automática de subastas
            </p>
          </div>
          <Switch
            checked={localConfig.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
        </div>

        {/* Configuration Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minExtension" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Extensión Mínima (minutos)
            </Label>
            <Input
              id="minExtension"
              type="number"
              min="1"
              max="30"
              value={localConfig.minExtensionMinutes}
              onChange={(e) => handleConfigChange('minExtensionMinutes', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxExtension" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Extensión Máxima (minutos)
            </Label>
            <Input
              id="maxExtension"
              type="number"
              min="30"
              max="120"
              value={localConfig.maxExtensionMinutes}
              onChange={(e) => handleConfigChange('maxExtensionMinutes', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInterval" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Intervalo de Verificación (segundos)
            </Label>
            <Input
              id="checkInterval"
              type="number"
              min="10"
              max="300"
              value={localConfig.checkIntervalSeconds}
              onChange={(e) => handleConfigChange('checkIntervalSeconds', parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleManualRenewal}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Renovar Ahora
            </Button>
          </div>
        </div>

        {/* Status Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Estado Actual</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Extensión: </span>
              <span className="font-medium">
                {config.minExtensionMinutes}-{config.maxExtensionMinutes} min
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Verificación: </span>
              <span className="font-medium">
                cada {formatTime(config.checkIntervalSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">ℹ️ Cómo funciona:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• El sistema verifica automáticamente las subastas expiradas</li>
            <li>• Extiende cada subasta por un tiempo aleatorio entre {config.minExtensionMinutes}-{config.maxExtensionMinutes} minutos</li>
            <li>• Revisa cada {formatTime(config.checkIntervalSeconds)} si hay subastas que renovar</li>
            <li>• Opera silenciosamente en segundo plano sin notificaciones visibles</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
