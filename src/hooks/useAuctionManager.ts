import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  endedAuctions: number;
  totalBids: number;
  avgBidAmount: number;
  recentRotations: RotationLog[];
}

export interface RotationLog {
  id: string;
  rotation_time: string;
  auctions_processed: number;
  auctions_renewed: number;
  status: string;
  details: string | null;
}

export interface AuctionItem {
  id: string;
  title: string;
  category: string;
  current_bid: number;
  end_time: string;
  status: string;
  total_bids: number;
  created_at: string;
  updated_at: string;
}

export const useAuctionManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get auction statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['auction-stats'],
    queryFn: async (): Promise<AuctionStats> => {
      // Get basic auction counts
      const { data: auctions, error: auctionsError } = await supabase
        .from('auctions')
        .select('id, current_bid, end_time, status, total_bids');

      if (auctionsError) throw auctionsError;

      const now = new Date();
      const totalAuctions = auctions?.length || 0;
      const activeAuctions = auctions?.filter(a => a.status === 'active' && new Date(a.end_time) > now).length || 0;
      const endedAuctions = auctions?.filter(a => a.status === 'active' && new Date(a.end_time) <= now).length || 0;

      // Get total bids
      const { count: totalBids } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true });

      // Calculate average bid amount
      const { data: avgData } = await supabase
        .from('bids')
        .select('amount');
      
      const avgBidAmount = avgData && avgData.length > 0 
        ? avgData.reduce((sum, bid) => sum + bid.amount, 0) / avgData.length 
        : 0;

      // Get recent rotation logs
      const { data: recentRotations } = await supabase
        .from('auction_rotation_logs')
        .select('*')
        .order('rotation_time', { ascending: false })
        .limit(5);

      return {
        totalAuctions,
        activeAuctions,
        endedAuctions,
        totalBids: totalBids || 0,
        avgBidAmount,
        recentRotations: recentRotations || [],
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get expired auctions
  const {
    data: expiredAuctions,
    isLoading: isLoadingExpired,
    refetch: refetchExpired,
  } = useQuery({
    queryKey: ['expired-auctions'],
    queryFn: async (): Promise<AuctionItem[]> => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .lt('end_time', new Date().toISOString())
        .order('end_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Manual rotation mutation
  const rotateAuctionsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting manual auction rotation...');

      // Call the edge function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auction-rotator`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Rotation failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Rotation result:', result);

      // Log the rotation
      await supabase.from('auction_rotation_logs').insert({
        auctions_processed: result.totalProcessed || 0,
        auctions_renewed: result.renewedCount || 0,
        status: result.success ? 'success' : 'failed',
        details: result.message || 'Manual rotation from admin panel',
      });

      return result;
    },
    onSuccess: () => {
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['auction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['expired-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });

  // Force expire auctions for testing
  const forceExpireAuctionsMutation = useMutation({
    mutationFn: async (auctionIds: string[]) => {
      const { error } = await supabase
        .from('auctions')
        .update({ 
          end_time: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        })
        .in('id', auctionIds);

      if (error) throw error;

      return { expiredCount: auctionIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['expired-auctions'] });
    },
  });

  // Get all auctions with pagination
  const {
    data: allAuctions,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['all-auctions'],
    queryFn: async (): Promise<AuctionItem[]> => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Create new auction manually
  const createAuctionMutation = useMutation({
    mutationFn: async (auctionData: {
      title: string;
      description: string;
      category: string;
      starting_bid: number;
      image_url?: string;
      duration_hours?: number;
    }) => {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + (auctionData.duration_hours || 6));

      const { data, error } = await supabase
        .from('auctions')
        .insert({
          title: auctionData.title,
          description: auctionData.description,
          category: auctionData.category,
          starting_bid: auctionData.starting_bid,
          minimum_bid: auctionData.starting_bid,
          current_bid: auctionData.starting_bid,
          bid_increment: auctionData.starting_bid < 50 ? 5 : 
                        auctionData.starting_bid < 100 ? 10 : 15,
          end_time: endTime.toISOString(),
          status: 'active',
          image_url: auctionData.image_url || '',
          total_bids: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-auctions'] });
    },
  });

  return {
    // Data
    stats,
    expiredAuctions,
    allAuctions,
    
    // Loading states
    isLoadingStats,
    isLoadingExpired,
    isLoadingAll,
    
    // Mutations
    rotateAuctions: rotateAuctionsMutation.mutateAsync,
    forceExpireAuctions: forceExpireAuctionsMutation.mutateAsync,
    createAuction: createAuctionMutation.mutateAsync,
    
    // Mutation states
    isRotating: rotateAuctionsMutation.isPending,
    isForceExpiring: forceExpireAuctionsMutation.isPending,
    isCreating: createAuctionMutation.isPending,
    
    // Manual refresh functions
    refetchStats,
    refetchExpired,
    refetchAll,
  };
};
