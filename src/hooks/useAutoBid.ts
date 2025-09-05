import { useCallback } from 'react';
import { calculateAutoBidIncrement } from '@/utils/bidUtils';

export interface AutoBidConfig {
  minDelay: number; // mínimo delay en segundos
  maxDelay: number; // máximo delay en segundos
  chanceToRespond: number; // probabilidad de que respondan (0-1)
  maxBidIncrease: number; // máximo incremento de la puja
}

export function useAutoBid() {
  const fictionalUsers = [
    'María L.', 'José R.', 'Carmen G.', 'Roberto H.', 'Patricia M.',
    'Luis A.', 'Elena V.', 'Carlos P.', 'Isabel F.', 'Antonio S.',
    'Rosa T.', 'Francisco D.', 'Teresa C.', 'Manuel B.', 'Pilar N.',
    'Rafael O.', 'Dolores Q.', 'Ángel W.', 'Esperanza U.', 'Joaquín I.'
  ];

  const getRandomUser = useCallback(() => {
    return fictionalUsers[Math.floor(Math.random() * fictionalUsers.length)];
  }, [fictionalUsers]);

  const getRandomDelay = useCallback((min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, []);

  const shouldRespondToBid = useCallback((chance: number) => {
    return Math.random() < chance;
  }, []);

  const triggerAutoBid = useCallback((
    currentBid: number,
    auctionId: string,
    config: AutoBidConfig,
    onBidPlaced: (auctionId: string, newBid: number, bidder: string) => void
  ) => {
    // Solo responder si la probabilidad lo permite
    if (!shouldRespondToBid(config.chanceToRespond)) {
      return;
    }

    const delay = getRandomDelay(config.minDelay, config.maxDelay) * 1000; // convertir a ms
    
    // Round the current bid to remove fractional values
    const roundedCurrentBid = Math.floor(currentBid);
    
    // Use smart bid increment that results in round numbers (multiples of 5 and 10)
    const bidIncrease = calculateAutoBidIncrement(roundedCurrentBid, config.maxBidIncrease);
    const newBid = roundedCurrentBid + bidIncrease;
    const bidder = getRandomUser();

    // Auto-bid scheduled (discrete logging)
    console.log(`Bid scheduled: ${bidder} will bid $${newBid} in ${delay/1000}s`);

    setTimeout(() => {
      onBidPlaced(auctionId, newBid, bidder);
      console.log(`New bid: ${bidder} placed $${newBid}`);
    }, delay);
  }, [getRandomUser, getRandomDelay, shouldRespondToBid]);

  return {
    triggerAutoBid,
    getRandomUser
  };
}