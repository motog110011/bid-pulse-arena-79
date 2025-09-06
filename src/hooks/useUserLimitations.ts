import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';

export type UserTier = 'anonymous' | 'registered' | 'funded';

export interface UserLimitations {
  // Información del usuario
  userTier: UserTier;
  isAnonymous: boolean;
  isRegistered: boolean;
  hasFunds: boolean;
  
  // Limitaciones de visualización
  canViewAllAuctions: boolean;
  canViewAuctionDetails: boolean;
  canViewBiddingHistory: boolean;
  canViewHighResImages: boolean;
  maxVisibleAuctions: number;
  
  // Limitaciones de acciones
  canPlaceBids: boolean;
  canCreateAuctions: boolean;
  canContactSellers: boolean;
  canSaveToWatchlist: boolean;
  
  // Mensajes motivacionales
  ctaMessage: string;
  ctaAction: 'register' | 'deposit' | 'none';
  
  // Beneficios desbloqueables
  nextTierBenefits: string[];
}

export const useUserLimitations = (): UserLimitations => {
  const { user, loading: authLoading } = useAuth();
  const { balance, loading: balanceLoading } = useUserBalance();

  return useMemo(() => {
    // Si está cargando, dar acceso limitado por defecto
    if (authLoading || balanceLoading) {
      return {
        userTier: 'anonymous',
        isAnonymous: true,
        isRegistered: false,
        hasFunds: false,
        canViewAllAuctions: false,
        canViewAuctionDetails: false,
        canViewBiddingHistory: false,
        canViewHighResImages: false,
        maxVisibleAuctions: 3,
        canPlaceBids: false,
        canCreateAuctions: false,
        canContactSellers: false,
        canSaveToWatchlist: false,
        ctaMessage: 'Cargando...',
        ctaAction: 'none',
        nextTierBenefits: []
      };
    }

    const isAnonymous = !user;
    const isRegistered = !!user;
    const hasFunds = balance && balance > 0;

    let userTier: UserTier = 'anonymous';
    if (isRegistered && hasFunds) {
      userTier = 'funded';
    } else if (isRegistered) {
      userTier = 'registered';
    }

    // Configuración para usuarios anónimos
    if (isAnonymous) {
      return {
        userTier,
        isAnonymous: true,
        isRegistered: false,
        hasFunds: false,
        
        // Limitaciones de visualización - muy restrictivas
        canViewAllAuctions: false,
        canViewAuctionDetails: false,
        canViewBiddingHistory: false,
        canViewHighResImages: false,
        maxVisibleAuctions: 3,
        
        // Sin acciones permitidas
        canPlaceBids: false,
        canCreateAuctions: false,
        canContactSellers: false,
        canSaveToWatchlist: false,
        
        // CTA para registro
        ctaMessage: '🎉 ¡Regístrate gratis y descubre todas las subastas!',
        ctaAction: 'register',
        
        nextTierBenefits: [
          'Ver todas las subastas disponibles',
          'Acceder a detalles completos',
          'Guardar subastas favoritas',
          'Historial de pujas',
          'Imágenes en alta resolución',
          'Contactar vendedores'
        ]
      };
    }

    // Configuración para usuarios registrados sin fondos
    if (isRegistered && !hasFunds) {
      return {
        userTier,
        isAnonymous: false,
        isRegistered: true,
        hasFunds: false,
        
        // Más acceso que anónimos pero limitado
        canViewAllAuctions: true,
        canViewAuctionDetails: true,
        canViewBiddingHistory: true,
        canViewHighResImages: true,
        maxVisibleAuctions: Infinity,
        
        // Limitado en acciones que requieren dinero
        canPlaceBids: false,
        canCreateAuctions: true,
        canContactSellers: true,
        canSaveToWatchlist: true,
        
        // CTA para recarga
        ctaMessage: '💰 ¡Recarga tu saldo y empieza a pujar!',
        ctaAction: 'deposit',
        
        nextTierBenefits: [
          'Participar en todas las subastas',
          'Realizar pujas sin límite',
          'Acceso a subastas exclusivas',
          'Notificaciones prioritarias',
          'Descuentos en comisiones',
          'Soporte premium'
        ]
      };
    }

    // Configuración para usuarios registrados con fondos - acceso completo
    return {
      userTier,
      isAnonymous: false,
      isRegistered: true,
      hasFunds: true,
      
      // Acceso completo
      canViewAllAuctions: true,
      canViewAuctionDetails: true,
      canViewBiddingHistory: true,
      canViewHighResImages: true,
      maxVisibleAuctions: Infinity,
      
      // Todas las acciones permitidas
      canPlaceBids: true,
      canCreateAuctions: true,
      canContactSellers: true,
      canSaveToWatchlist: true,
      
      // Sin CTA necesario
      ctaMessage: '',
      ctaAction: 'none',
      
      nextTierBenefits: []
    };

  }, [user, balance, authLoading, balanceLoading]);
};

// Utility hooks
export const useRequiresAuth = () => {
  const { isAnonymous } = useUserLimitations();
  return isAnonymous;
};

export const useRequiresFunds = () => {
  const { hasFunds, isRegistered } = useUserLimitations();
  return isRegistered && !hasFunds;
};

export const useCanPlaceBids = () => {
  const { canPlaceBids } = useUserLimitations();
  return canPlaceBids;
};
