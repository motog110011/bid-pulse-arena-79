import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ScheduledAuction {
  id: string;
  title: string;
  description: string;
  category: string;
  starting_bid: number;
  image_url?: string;
  duration_hours: number;
  scheduled_publish_time: string;
  status: 'scheduled' | 'published' | 'cancelled';
  created_at: string;
  updated_at: string;
  published_auction_id?: string;
  created_by?: string;
}

export interface UpcomingAuction extends ScheduledAuction {
  time_until_publish: string;
}

export interface CreateScheduledAuctionData {
  title: string;
  description: string;
  category: string;
  starting_bid: number;
  image_url?: string;
  duration_hours?: number;
  scheduled_publish_time: string;
}

export interface GenerateScheduledAuctionsParams {
  days_ahead?: number;
  auctions_per_day?: number;
}

export const useScheduledAuctions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get upcoming scheduled auctions
  const {
    data: upcomingAuctions,
    isLoading: isLoadingUpcoming,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ['upcoming-scheduled-auctions'],
    queryFn: async (): Promise<UpcomingAuction[]> => {
      const { data, error } = await supabase.rpc('get_upcoming_scheduled_auctions', {
        limit_count: 20
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get all scheduled auctions (for admin)
  const {
    data: allScheduled,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['all-scheduled-auctions'],
    queryFn: async (): Promise<ScheduledAuction[]> => {
      const { data, error } = await supabase
        .from('scheduled_auctions')
        .select('*')
        .order('scheduled_publish_time', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Get scheduled auctions stats
  const {
    data: scheduledStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['scheduled-auctions-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_auctions')
        .select('status, scheduled_publish_time');

      if (error) throw error;

      const now = new Date();
      const stats = {
        totalScheduled: data?.length || 0,
        pendingCount: data?.filter(a => a.status === 'scheduled' && new Date(a.scheduled_publish_time) > now).length || 0,
        publishedCount: data?.filter(a => a.status === 'published').length || 0,
        readyToPublish: data?.filter(a => a.status === 'scheduled' && new Date(a.scheduled_publish_time) <= now).length || 0,
      };

      return stats;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Create scheduled auction manually
  const createScheduledAuctionMutation = useMutation({
    mutationFn: async (auctionData: CreateScheduledAuctionData) => {
      const { data, error } = await supabase
        .from('scheduled_auctions')
        .insert({
          title: auctionData.title,
          description: auctionData.description,
          category: auctionData.category,
          starting_bid: auctionData.starting_bid,
          image_url: auctionData.image_url || '',
          duration_hours: auctionData.duration_hours || 6,
          scheduled_publish_time: auctionData.scheduled_publish_time,
          status: 'scheduled',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  // Generate scheduled auctions automatically
  const generateScheduledAuctionsMutation = useMutation({
    mutationFn: async (params: GenerateScheduledAuctionsParams = {}) => {
      const { data, error } = await supabase.rpc('generate_scheduled_auctions', {
        days_ahead: params.days_ahead || 7,
        auctions_per_day: params.auctions_per_day || 3,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  // Publish scheduled auctions manually
  const publishScheduledAuctionsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('publish_scheduled_auctions');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] }); // Refresh main auctions too
    },
  });

  // Delete scheduled auction
  const deleteScheduledAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      const { error } = await supabase
        .from('scheduled_auctions')
        .delete()
        .eq('id', auctionId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  // Cancel scheduled auction
  const cancelScheduledAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      const { data, error } = await supabase
        .from('scheduled_auctions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  // Reschedule auction
  const rescheduleAuctionMutation = useMutation({
    mutationFn: async ({ auctionId, newDateTime }: { auctionId: string; newDateTime: string }) => {
      const { data, error } = await supabase
        .from('scheduled_auctions')
        .update({ 
          scheduled_publish_time: newDateTime,
          status: 'scheduled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  return {
    // Data
    upcomingAuctions,
    allScheduled,
    scheduledStats,
    
    // Loading states
    isLoadingUpcoming,
    isLoadingAll,
    isLoadingStats,
    
    // Mutations
    createScheduledAuction: createScheduledAuctionMutation.mutateAsync,
    generateScheduledAuctions: generateScheduledAuctionsMutation.mutateAsync,
    publishScheduledAuctions: publishScheduledAuctionsMutation.mutateAsync,
    deleteScheduledAuction: deleteScheduledAuctionMutation.mutateAsync,
    cancelScheduledAuction: cancelScheduledAuctionMutation.mutateAsync,
    rescheduleAuction: rescheduleAuctionMutation.mutateAsync,
    
    // Mutation states
    isCreating: createScheduledAuctionMutation.isPending,
    isGenerating: generateScheduledAuctionsMutation.isPending,
    isPublishing: publishScheduledAuctionsMutation.isPending,
    isDeleting: deleteScheduledAuctionMutation.isPending,
    isCancelling: cancelScheduledAuctionMutation.isPending,
    isRescheduling: rescheduleAuctionMutation.isPending,
    
    // Manual refresh functions
    refetchUpcoming,
    refetchAll,
    refetchStats,
  };
};
