import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserBid {
  id: string;
  auction_id: string;
  amount: number;
  is_winning: boolean;
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
    image_url: string | null;
    total_bids: number;
  };
  is_outbid: boolean;
  auction_ended: boolean;
  user_won: boolean;
}

export const useUserBids = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-bids', user?.id],
    queryFn: async (): Promise<UserBid[]> => {
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('bids')
        .select(`
          id,
          auction_id,
          amount,
          is_winning,
          created_at,
          auction:auctions(
            id, title, description, starting_bid, current_bid,
            end_time, status, category, image_url, total_bids
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const now = new Date();

      return (data as any[]).map((bid) => {
        const auctionEnded =
          bid.auction.status === 'ended' ||
          new Date(bid.auction.end_time) < now;

        return {
          id: bid.id,
          auction_id: bid.auction_id,
          amount: bid.amount,
          is_winning: bid.is_winning,
          created_at: bid.created_at,
          auction: bid.auction,
          is_outbid: !bid.is_winning,
          auction_ended: auctionEnded,
          user_won: bid.is_winning && auctionEnded,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const useUserBidStats = () => {
  const { data: userBids = [], isLoading } = useUserBids();

  const stats = {
    totalBids: userBids.length,
    activeBids: userBids.filter((b) => !b.auction_ended).length,
    winningBids: userBids.filter((b) => b.is_winning && !b.auction_ended).length,
    outbidBids: userBids.filter((b) => b.is_outbid && !b.auction_ended).length,
    wonAuctions: userBids.filter((b) => b.user_won).length,
    lostAuctions: userBids.filter((b) => b.auction_ended && !b.user_won).length,
  };

  return { stats, isLoading };
};
