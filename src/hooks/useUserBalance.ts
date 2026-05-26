import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserBalance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: balance = 0, isLoading: loading } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;

      const { data, error } = await (supabase as any)
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) return 0;
      return Number(data?.balance ?? 0);
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  const refreshBalance = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['user-balance', user.id] });
    }
  };

  return { balance, loading, refreshBalance };
}
