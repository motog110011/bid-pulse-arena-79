import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      if (!user) return [];

      // Get user's bids with auction details
      const { data: bids, error } = await supabase
        .from('bids')
        .select(`
          id,
          auction_id,
          amount,
          created_at,
          auctions!inner (
            id,
            title,
            description,
            starting_bid,
            current_bid,
            end_time,
            status,
            category,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user bids:', error);
        throw error;
      }

      if (!bids) return [];

      // Get total bids count for each auction
      const auctionIds = [...new Set(bids.map(bid => bid.auction_id))];
      const { data: bidCounts } = await supabase
        .from('bids')
        .select('auction_id')
        .in('auction_id', auctionIds);

      const bidCountsMap = bidCounts?.reduce((acc, bid) => {
        acc[bid.auction_id] = (acc[bid.auction_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get user's highest bid for each auction
      const userHighestBids = bids.reduce((acc, bid) => {
        if (!acc[bid.auction_id] || bid.amount > acc[bid.auction_id].amount) {
          acc[bid.auction_id] = bid;
        }
        return acc;
      }, {} as Record<string, typeof bids[0]>);

      // Transform to UserBid format
      const userBids: UserBid[] = Object.values(userHighestBids).map(bid => {
        const auction = bid.auctions;
        const now = new Date();
        const endTime = new Date(auction.end_time);
        const auctionEnded = now > endTime || auction.status === 'completed';
        
        // Determine if user is winning or has been outbid
        const isCurrentHighestBidder = bid.amount >= auction.current_bid;
        const isWinning = !auctionEnded && isCurrentHighestBidder;
        const isOutbid = !auctionEnded && !isCurrentHighestBidder;
        const userWon = auctionEnded && isCurrentHighestBidder;

        return {
          id: bid.id,
          auction_id: bid.auction_id,
          amount: bid.amount,
          created_at: bid.created_at,
          auction: {
            id: auction.id,
            title: auction.title,
            description: auction.description || '',
            starting_bid: auction.starting_bid,
            current_bid: auction.current_bid,
            end_time: auction.end_time,
            status: auction.status,
            category: auction.category || 'General',
            image_url: auction.image_url || '',
            total_bids: bidCountsMap[auction.id] || 0,
          },
          is_winning: isWinning,
          is_outbid: isOutbid,
          auction_ended: auctionEnded,
          user_won: userWon,
        };
      });

      return userBids;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
  });
};

export const useUserBidStats = () => {
  const { data: userBids = [], isLoading } = useUserBids();

  const stats = {
    totalBids: userBids.length,
    activeBids: userBids.filter(bid => !bid.auction_ended).length,
    winningBids: userBids.filter(bid => bid.is_winning).length,
    outbidBids: userBids.filter(bid => bid.is_outbid).length,
    wonAuctions: userBids.filter(bid => bid.user_won).length,
    lostAuctions: userBids.filter(bid => bid.auction_ended && !bid.user_won).length,
  };

  return {
    stats,
    isLoading,
  };
};
