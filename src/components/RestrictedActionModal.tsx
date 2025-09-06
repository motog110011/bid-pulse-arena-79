import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Users, 
  Wallet, 
  Star,
  CheckCircle,
  Zap,
  Gift,
  ArrowRight
} from 'lucide-react';
import { useUserLimitations } from '@/hooks/useUserLimitations';

interface RestrictedActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  feature?: string;
  customMessage?: string;
}

const actionMessages = {
  'place-bid': {
    title: 'Para pujar necesitas saldo',
    description: 'Las pujas requieren tener fondos disponibles en tu cuenta para garantizar el pago.',
    icon: Wallet,
    color: 'text-yellow-600'
  },
  'create-auction': {
    title: 'Crear subasta requiere registro',
    description: 'Solo usuarios registrados pueden crear subastas para mantener la confianza en la plataforma.',
    icon: Users,
    color: 'text-blue-600'
  },
  'contact-seller': {
    title: 'Contactar vendedor requiere registro',
    description: 'Regístrate para poder contactar vendedores y obtener información adicional.',
    icon: Users,
    color: 'text-blue-600'
  },
  'view-details': {
    title: 'Detalles completos solo para miembros',
    description: 'Regístrate gratis para ver todos los detalles, historial de pujas y más información.',
    icon: Lock,
    color: 'text-gray-600'
  },
  'save-watchlist': {
    title: 'Guardar favoritos requiere registro',
    description: 'Crea una cuenta para guardar tus subastas favoritas y recibir notificaciones.',
    icon: Star,
    color: 'text-purple-600'
  },
  'view-history': {
    title: 'Historial de pujas para miembros',
    description: 'Solo usuarios registrados pueden ver el historial completo de pujas.',
    icon: Users,
    color: 'text-blue-600'
  },
  'high-res-images': {
    title: 'Imágenes en alta resolución',
    description: 'Regístrate para ver imágenes en máxima calidad y detalles ampliados.',
    icon: Zap,
    color: 'text-indigo-600'
  }
};

export const RestrictedActionModal: React.FC<RestrictedActionModalProps> = ({
  isOpen,
  onClose,
  action,
  feature,
  customMessage
}) => {
  const navigate = useNavigate();
  const { 
    userTier, 
    ctaMessage, 
    ctaAction, 
    nextTierBenefits,
    isAnonymous,
    hasFunds 
  } = useUserLimitations();

  const actionConfig = actionMessages[action as keyof typeof actionMessages] || {
    title: 'Función restringida',
    description: customMessage || 'Esta función requiere registro o saldo.',
    icon: Lock,
    color: 'text-gray-600'
  };

  const ActionIcon = actionConfig.icon;

  const handlePrimaryAction = () => {
    onClose();
    if (ctaAction === 'register') {
      navigate('/register');
    } else if (ctaAction === 'deposit') {
      navigate('/wallet');
    }
  };

  const handleSecondaryAction = () => {
    onClose();
    if (isAnonymous) {
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <ActionIcon className={`w-8 h-8 ${actionConfig.color}`} />
          </div>
          
          <DialogTitle className="text-xl font-semibold">
            {actionConfig.title}
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 mt-2">
            {actionConfig.description}
          </DialogDescription>

          {/* Badge del tier actual */}
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className={
              userTier === 'anonymous' 
                ? 'bg-gray-100 text-gray-800' 
                : userTier === 'registered'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gold-100 text-gold-800'
            }>
              {userTier === 'anonymous' ? 'Visitante' : 
               userTier === 'registered' ? 'Miembro' : 'Premium'}
            </Badge>
          </div>
        </DialogHeader>

        {/* Beneficios de upgrading */}
        <div className="py-4 border-t border-b">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">
              {isAnonymous ? 'Al registrarte obtienes:' : 'Con saldo disponible:'}
            </span>
          </div>
          
          <div className="space-y-2">
            {(nextTierBenefits.slice(0, 4)).map((benefit, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 pt-4">
          {/* Botón principal */}
          <Button 
            onClick={handlePrimaryAction}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            size="lg"
          >
            {ctaAction === 'register' ? (
              <>
                <Users className="w-4 h-4 mr-2" />
                Registrarme Gratis
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Recargar Saldo
              </>
            )}
          </Button>

          {/* Botones secundarios */}
          <div className="flex gap-2 w-full">
            {isAnonymous ? (
              <Button 
                variant="outline" 
                onClick={handleSecondaryAction}
                className="flex-1"
              >
                Ya tengo cuenta
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="flex-1"
              >
                Mi Perfil
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="flex-1"
            >
              Ahora no
            </Button>
          </div>

          {/* Footer motivacional */}
          <div className="text-center text-xs text-gray-500 mt-2">
            {isAnonymous ? (
              <p>⚡ Registro instantáneo • 100% gratuito • Sin spam</p>
            ) : (
              <p>💳 Pagos seguros • Retiros rápidos • Soporte 24/7</p>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook para manejar acciones restringidas de forma sencilla
export const useRestrictedAction = () => {
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    action: string;
    feature?: string;
    customMessage?: string;
  }>({
    isOpen: false,
    action: '',
    feature: undefined,
    customMessage: undefined
  });

  const { canPlaceBids, canViewAuctionDetails, isAnonymous } = useUserLimitations();

  const checkAndExecute = (
    action: string, 
    callback: () => void, 
    options?: {
      feature?: string;
      customMessage?: string;
    }
  ) => {
    let canExecute = true;

    // Verificar permisos según la acción
    switch (action) {
      case 'place-bid':
        canExecute = canPlaceBids;
        break;
      case 'view-details':
        canExecute = canViewAuctionDetails;
        break;
      case 'create-auction':
      case 'contact-seller':
      case 'save-watchlist':
      case 'view-history':
        canExecute = !isAnonymous;
        break;
      default:
        canExecute = true;
    }

    if (canExecute) {
      callback();
    } else {
      setModalState({
        isOpen: true,
        action,
        feature: options?.feature,
        customMessage: options?.customMessage
      });
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    checkAndExecute,
    closeModal,
    modalProps: {
      isOpen: modalState.isOpen,
      onClose: closeModal,
      action: modalState.action,
      feature: modalState.feature,
      customMessage: modalState.customMessage
    }
  };
};
