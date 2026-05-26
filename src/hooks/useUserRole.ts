import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserRole() {
  const { user } = useAuth();

  const { data: role, isLoading: loading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<'admin' | 'user'> => {
      const { data, error } = await (supabase as any).rpc('get_current_user_role');
      if (error) return 'user';
      return (data as 'admin' | 'user') ?? 'user';
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  return {
    role: role ?? 'user',
    isAdmin: role === 'admin',
    loading,
    ready: !loading,
    refreshRole: () => {},
  };
}
