import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BidData {
  auctionId: string;
  amount: number;
}

interface PlaceBidResult {
  success: boolean;
  error?: string;
  message?: string;
  new_bid?: number;
}

export const useBidMutation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ auctionId, amount }: BidData): Promise<PlaceBidResult> => {
      if (!user) {
        throw new Error('Debes iniciar sesión para pujar.');
      }

      const { data, error } = await (supabase as any).rpc('place_bid', {
        p_auction_id: auctionId,
        p_amount: amount,
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as PlaceBidResult;

      if (!result.success) {
        throw new Error(result.error ?? 'Error al registrar la puja.');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bids'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
    },
  });
};
