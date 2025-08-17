import { useCallback } from 'react';

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
    'Rafael O.', 'Dolores Q.', 'Ángel W.', 'Esperanza U.', 'Joaquín I.',
    'Diego M.', 'Ana G.', 'Fernando L.', 'Sofía R.', 'Gabriel P.',
    'Valentina S.', 'Alejandro F.', 'Camila T.', 'Sebastián C.', 'Isabella N.'
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
    const bidIncrease = Math.floor(Math.random() * config.maxBidIncrease) + 10; // mínimo +10
    const newBid = currentBid + bidIncrease;
    const bidder = getRandomUser();

    console.log(`Usuario ficticio programado para pujar en ${delay/1000}s:`, {
      auctionId,
      currentBid,
      newBid,
      bidder,
      delay: delay/1000
    });

    setTimeout(() => {
      onBidPlaced(auctionId, newBid, bidder);
      console.log(`Puja automática realizada: ${bidder} pujó $${newBid} en subasta ${auctionId}`);
    }, delay);
  }, [getRandomUser, getRandomDelay, shouldRespondToBid]);

  return {
    triggerAutoBid,
    getRandomUser
  };
}