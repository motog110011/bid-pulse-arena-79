import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Users, 
  Star, 
  Wallet, 
  Zap,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useUserLimitations } from '@/hooks/useUserLimitations';

export const FloatingCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();
  
  const { 
    isAnonymous, 
    hasFunds,
    ctaAction, 
    ctaMessage,
    userTier,
    maxVisibleAuctions
  } = useUserLimitations();

  useEffect(() => {
    // Solo mostrar si es usuario anónimo o sin fondos
    if ((isAnonymous || !hasFunds) && !isDismissed) {
      // Mostrar después de 3 segundos para no ser intrusivo
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAnonymous, hasFunds, isDismissed]);

  // No mostrar si el usuario tiene acceso completo o fue dismissado
  if ((!isAnonymous && hasFunds) || isDismissed || !isVisible) {
    return null;
  }

  const handleAction = () => {
    setIsVisible(false);
    if (ctaAction === 'register') {
      navigate('/auth');
    } else if (ctaAction === 'deposit') {
      navigate('/wallet');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Almacenar en localStorage para no molestar durante la sesión
    localStorage.setItem('floating-cta-dismissed', 'true');
  };

  // Verificar si fue dismissado previamente
  useEffect(() => {
    const dismissed = localStorage.getItem('floating-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-2xl p-4 max-w-sm border-2 border-white/20">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content for anonymous users */}
        {isAnonymous ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/20 rounded">
                <Users className="w-4 h-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                Solo {maxVisibleAuctions} subastas visibles
              </Badge>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm mb-1">
                ¡Desbloquea todas las subastas!
              </h3>
              <p className="text-xs text-white/90 mb-3">
                Regístrate gratis y accede a cientos de productos decomisados
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs text-white/80">
              <Eye className="w-3 h-3" />
              <span>Ver detalles completos</span>
              <span>•</span>
              <Star className="w-3 h-3" />
              <span>Guardar favoritos</span>
            </div>

            <Button 
              onClick={handleAction}
              className="w-full bg-white text-blue-600 hover:bg-gray-100 font-medium text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              ¡Registrarme Gratis!
            </Button>
            
            <p className="text-xs text-center text-white/70">
              ✨ Sin comisiones • Registro instantáneo
            </p>
          </div>
        ) : (
          // Content for registered users without funds
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-yellow-400/20 rounded">
                <Wallet className="w-4 h-4 text-yellow-300" />
              </div>
              <Badge className="bg-yellow-400/20 text-yellow-200 border-yellow-300/30 text-xs">
                Sin saldo disponible
              </Badge>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm mb-1">
                ¡Empieza a pujar hoy!
              </h3>
              <p className="text-xs text-white/90 mb-3">
                Recarga tu cuenta y participa en subastas exclusivas
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs text-white/80">
              <TrendingUp className="w-3 h-3" />
              <span>Participar en subastas</span>
              <span>•</span>
              <Zap className="w-3 h-3" />
              <span>Ofertas ilimitadas</span>
            </div>

            <Button 
              onClick={handleAction}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-medium text-sm"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Recargar Saldo
            </Button>
            
            <p className="text-xs text-center text-white/70">
              💳 Desde $10 • Transacciones seguras
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook para resetear el estado dismissed cuando cambia el usuario
export const useFloatingCTA = () => {
  const { isAnonymous } = useUserLimitations();
  
  useEffect(() => {
    // Si el usuario cambia de anónimo a registrado, limpiar el dismissed
    if (!isAnonymous) {
      localStorage.removeItem('floating-cta-dismissed');
    }
  }, [isAnonymous]);
  
  return {
    resetDismissed: () => {
      localStorage.removeItem('floating-cta-dismissed');
    }
  };
};
