import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export interface UserBid {
  id: string;
  auction_id: string;
  amount: number;
  created_at: string;
  auction: {
    id: string;
    title: string;
    description: string;
    starting_bid: number;
    current_bid: number;
    end_time: string;
    status: string;
    category: string;
    image_url: string;
    total_bids: number;
  };
  is_winning: boolean;
  is_outbid: boolean;
  auction_ended: boolean;
  user_won: boolean;
}

export const useUserBids = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-bids', user?.id],
    queryFn: async () => {
      // Return empty array since bids table doesn't exist yet
      return [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const useUserBidStats = () => {
  const { data: userBids = [], isLoading } = useUserBids();

  const stats = {
    totalBids: 0,
    activeBids: 0,
    winningBids: 0,
    outbidBids: 0,
    wonAuctions: 0,
    lostAuctions: 0,
  };

  return {
    stats,
    isLoading,
  };
};