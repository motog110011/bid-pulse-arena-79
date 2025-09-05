/**
 * Utility functions for bid calculations
 * Ensures all bids use round numbers (multiples of 5 and 10)
 */

/**
 * Calculate smart bid increment based on current bid amount
 * Returns increments that are multiples of 5 or 10 depending on bid range
 */
export const calculateSmartBidIncrement = (currentBid: number): number => {
  if (currentBid < 50) {
    return 5; // $5 increments for bids under $50
  } else if (currentBid < 100) {
    return 10; // $10 increments for bids $50-$99
  } else if (currentBid < 500) {
    return 20; // $20 increments for bids $100-$499
  } else if (currentBid < 1000) {
    return 50; // $50 increments for bids $500-$999
  } else if (currentBid < 5000) {
    return 100; // $100 increments for bids $1000-$4999
  } else {
    return 250; // $250 increments for bids $5000+
  }
};

/**
 * Calculate the next suggested bid amount
 * Always returns a round number that's a proper increment above current bid
 */
export const calculateNextBidAmount = (currentBid: number, customIncrement?: number): number => {
  const increment = customIncrement || calculateSmartBidIncrement(currentBid);
  return currentBid + increment;
};

/**
 * Round a number to the nearest multiple of the given increment
 * Used to ensure all bids are properly rounded
 */
export const roundToNearestIncrement = (amount: number, increment: number): number => {
  return Math.ceil(amount / increment) * increment;
};

/**
 * Calculate smart auto-bid increment for automated bidding
 * Returns a random but reasonable increment that's always a multiple of 5 or 10
 */
export const calculateAutoBidIncrement = (currentBid: number, maxIncrease: number = 50): number => {
  const baseIncrement = calculateSmartBidIncrement(currentBid);
  
  // Generate a random multiplier (1-3) to add variety to auto-bids
  const multiplier = Math.floor(Math.random() * 3) + 1;
  const suggestedIncrement = baseIncrement * multiplier;
  
  // Cap the increment at maxIncrease but ensure it's still a multiple of 5
  const cappedIncrement = Math.min(suggestedIncrement, maxIncrease);
  
  // Round to nearest 5 to ensure clean numbers
  return roundToNearestIncrement(cappedIncrement, 5);
};

/**
 * Format bid amount for display
 * Removes unnecessary decimals for whole numbers
 */
export const formatBidAmount = (amount: number): string => {
  return amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
};

/**
 * Validate if a bid amount is acceptable
 * Checks if bid is higher than current and uses proper increments
 */
export const validateBidAmount = (newBid: number, currentBid: number, minIncrement?: number): {
  valid: boolean;
  message?: string;
} => {
  if (newBid <= currentBid) {
    return {
      valid: false,
      message: "La oferta debe ser mayor a la oferta actual"
    };
  }
  
  const increment = minIncrement || calculateSmartBidIncrement(currentBid);
  const minValidBid = calculateNextBidAmount(currentBid, increment);
  
  if (newBid < minValidBid) {
    return {
      valid: false,
      message: `La oferta mínima debe ser $${minValidBid}`
    };
  }
  
  // Check if the bid is a reasonable multiple of 5
  if (newBid % 5 !== 0 && newBid < 50) {
    return {
      valid: false,
      message: "La oferta debe ser un múltiplo de $5"
    };
  }
  
  return { valid: true };
};
