
import { useCallback } from 'react';

export interface AutoBidConfig {
  minDelay: number;
  maxDelay: number; 
  chanceToRespond: number;
  maxBidIncrease: number;
}

export function useAutoBid() {
  const fictionalUsers = [
    'María L.', 'José R.', 'Carmen G.', 'Roberto H.', 'Patricia M.',
    'Luis A.', 'Elena V.', 'Carlos P.', 'Isabel F.', 'Antonio S.',
    'Rosa T.', 'Francisco D.', 'Teresa C.', 'Manuel B.', 'Pilar N.',
    'Rafael O.', 'Dolores Q.', 'Ángel W.', 'Esperanza U.', 'Joaquín I.',
    'Diego M.', 'Ana G.', 'Fernando L.', 'Sofía R.', 'Gabriel P.',
    'Valentina S.', 'Alejandro F.', 'Camila T.', 'Sebastián C.', 'Isabella N.'
  ];

  const getAutoBidConfig = useCallback((category: string): AutoBidConfig => {
    switch (category) {
      case 'Vinos y Licores':
        return { minDelay: 15, maxDelay: 45, chanceToRespond: 0.6, maxBidIncrease: 40 };
      case 'Navajas':
        return { minDelay: 20, maxDelay: 60, chanceToRespond: 0.5, maxBidIncrease: 30 };
      case 'Electrónicos':
        return { minDelay: 10, maxDelay: 35, chanceToRespond: 0.8, maxBidIncrease: 60 };
      default:
        return { minDelay: 15, maxDelay: 50, chanceToRespond: 0.65, maxBidIncrease: 45 };
    }
  }, []);

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
    category: string,
    onBidPlaced: (auctionId: string, newBid: number, bidder: string) => void
  ) => {
    const config = getAutoBidConfig(category);
    
    // Only respond if probability allows
    if (!shouldRespondToBid(config.chanceToRespond)) {
      console.log(`🎲 Auto-bid skipped for category ${category} (${Math.round(config.chanceToRespond * 100)}% chance)`);
      return;
    }

    const delay = getRandomDelay(config.minDelay, config.maxDelay) * 1000;
    const bidIncrease = Math.floor(Math.random() * config.maxBidIncrease) + 10;
    const newBid = currentBid + bidIncrease;
    const bidder = getRandomUser();

    console.log(`🤖 Auto-bid scheduled for ${delay/1000}s:`, {
      auctionId,
      category,
      currentBid,
      newBid,
      bidder,
      config
    });

    setTimeout(() => {
      onBidPlaced(auctionId, newBid, bidder);
      console.log(`✅ Auto-bid placed: ${bidder} bid $${newBid} in ${category} auction`);
    }, delay);
  }, [getAutoBidConfig, getRandomUser, getRandomDelay, shouldRespondToBid]);

  return {
    triggerAutoBid,
    getRandomUser,
    getAutoBidConfig
  };
}
