import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

  // Return mock data for now to avoid database errors
  const {
    data: upcomingAuctions,
    isLoading: isLoadingUpcoming,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ['upcoming-scheduled-auctions'],
    queryFn: async (): Promise<UpcomingAuction[]> => {
      // Return empty array to avoid database calls
      return [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const {
    data: allScheduled,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['all-scheduled-auctions'],
    queryFn: async (): Promise<ScheduledAuction[]> => {
      // Return empty array to avoid database calls
      return [];
    },
    enabled: !!user,
  });

  const {
    data: scheduledStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['scheduled-auctions-stats'],
    queryFn: async () => {
      // Return mock stats to avoid database calls
      return {
        totalScheduled: 0,
        pendingCount: 0,
        publishedCount: 0,
        readyToPublish: 0,
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Mock mutations that don't actually do anything but return appropriate responses
  const generateScheduledAuctionsMutation = useMutation({
    mutationFn: async (params: GenerateScheduledAuctionsParams = {}) => {
      console.log('Mock: generating scheduled auctions', params);
      return { created_count: 0, success: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  const publishScheduledAuctionsMutation = useMutation({
    mutationFn: async () => {
      console.log('Mock: publishing scheduled auctions');
      return { published_count: 0, success: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  const createScheduledAuctionMutation = useMutation({
    mutationFn: async (auctionData: CreateScheduledAuctionData) => {
      console.log('Mock: creating scheduled auction', auctionData);
      return {
        id: 'mock-id',
        ...auctionData,
        duration_hours: auctionData.duration_hours || 6,
        status: 'scheduled' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  const deleteScheduledAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      console.log('Mock: deleting scheduled auction', auctionId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  const cancelScheduledAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      console.log('Mock: cancelling scheduled auction', auctionId);
      return {
        id: auctionId,
        status: 'cancelled' as const,
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  const rescheduleAuctionMutation = useMutation({
    mutationFn: async ({ auctionId, newDateTime }: { auctionId: string; newDateTime: string }) => {
      console.log('Mock: rescheduling auction', auctionId, newDateTime);
      return {
        id: auctionId,
        scheduled_publish_time: newDateTime,
        status: 'scheduled' as const,
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['all-scheduled-auctions'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-auctions-stats'] });
    },
  });

  return {
    // Data
    upcomingAuctions: upcomingAuctions || [],
    allScheduled: allScheduled || [],
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