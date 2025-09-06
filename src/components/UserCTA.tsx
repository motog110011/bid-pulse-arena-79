import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Star, 
  Wallet, 
  Users, 
  Shield, 
  Gift,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useUserLimitations, UserTier } from '@/hooks/useUserLimitations';

interface UserCTAProps {
  variant?: 'card' | 'banner' | 'inline';
  showBenefits?: boolean;
  className?: string;
}

const tierIcons = {
  anonymous: Users,
  registered: Shield,
  funded: Star
};

const tierColors = {
  anonymous: 'bg-gray-100 text-gray-800',
  registered: 'bg-blue-100 text-blue-800',
  funded: 'bg-gold-100 text-gold-800 border-gold-200'
};

const tierLabels = {
  anonymous: 'Visitante',
  registered: 'Miembro',
  funded: 'Premium'
};

export const UserCTA: React.FC<UserCTAProps> = ({ 
  variant = 'card',
  showBenefits = true,
  className = ''
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

  const handleAction = () => {
    if (ctaAction === 'register') {
      navigate('/register');
    } else if (ctaAction === 'deposit') {
      navigate('/wallet');
    }
  };

  const TierIcon = tierIcons[userTier];

  // No mostrar CTA si el usuario tiene acceso completo
  if (ctaAction === 'none') return null;

  // Variant Banner - Para top de página
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <TierIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{ctaMessage}</p>
              <p className="text-sm text-white/80">
                {isAnonymous ? 'Únete a miles de usuarios' : 'Desbloquea todas las funciones'}
              </p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleAction}
            className="bg-white text-blue-600 hover:bg-white/90"
          >
            {ctaAction === 'register' ? 'Registrarme' : 'Recargar Saldo'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Variant Inline - Para mostrar dentro de componentes
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <Zap className="w-5 h-5 text-blue-500" />
        <p className="text-sm text-blue-700 flex-1">{ctaMessage}</p>
        <Button size="sm" onClick={handleAction}>
          {ctaAction === 'register' ? 'Registrarme' : 'Recargar'}
        </Button>
      </div>
    );
  }

  // Variant Card (por defecto)
  return (
    <Card className={`border-2 border-dashed border-blue-200 bg-blue-50/50 ${className}`}>
      <CardContent className="p-6 text-center">
        {/* Header con tier actual */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Badge variant="outline" className={tierColors[userTier]}>
            <TierIcon className="w-4 h-4 mr-1" />
            {tierLabels[userTier]}
          </Badge>
          {userTier !== 'funded' && (
            <>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Badge className="bg-gold-100 text-gold-800 border-gold-200">
                <Star className="w-4 h-4 mr-1" />
                {userTier === 'anonymous' ? 'Miembro' : 'Premium'}
              </Badge>
            </>
          )}
        </div>

        {/* Mensaje principal */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isAnonymous ? '¡Únete a BidPulse!' : '¡Activa tu cuenta!'}
          </h3>
          <p className="text-gray-600">{ctaMessage}</p>
        </div>

        {/* Beneficios */}
        {showBenefits && nextTierBenefits.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" />
              Lo que obtienes:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              {nextTierBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleAction} 
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
          
          {isAnonymous && (
            <Button variant="outline" onClick={() => navigate('/')}>
              Explorar sin registro
            </Button>
          )}
        </div>

        {/* Footer con incentivos */}
        <div className="mt-4 text-xs text-gray-500">
          {isAnonymous ? (
            <p>✨ Registro gratuito • Sin comisiones ocultas • Soporte 24/7</p>
          ) : (
            <p>💰 Recarga desde $10 • Transacciones seguras • Retiros instantáneos</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente específico para mostrar tier del usuario
export const UserTierBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { userTier, hasFunds, isRegistered } = useUserLimitations();
  
  const TierIcon = tierIcons[userTier];
  
  return (
    <Badge 
      variant="outline" 
      className={`${tierColors[userTier]} ${className}`}
    >
      <TierIcon className="w-4 h-4 mr-1" />
      {tierLabels[userTier]}
      {hasFunds && <Star className="w-3 h-3 ml-1" />}
    </Badge>
  );
};

// Hook para mostrar toast motivacional
export const useMotivationalToast = () => {
  const { ctaMessage, ctaAction } = useUserLimitations();
  
  return {
    showMotivationalMessage: () => ({
      title: ctaAction === 'register' ? 'Regístrate para continuar' : 'Recarga tu saldo',
      description: ctaMessage,
      action: ctaAction
    })
  };
};
