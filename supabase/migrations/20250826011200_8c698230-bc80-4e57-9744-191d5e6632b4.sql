-- Make auction prices ridiculously cheap for wines, liquors and knives
UPDATE auctions 
SET 
  minimum_bid = CASE 
    WHEN category = 'Vinos y Licores' THEN 
      (RANDOM() * 45 + 5)::numeric(10,2)  -- 5-50 pesos
    WHEN category = 'Navajas' THEN 
      (RANDOM() * 25 + 5)::numeric(10,2)  -- 5-30 pesos
    ELSE minimum_bid
  END,
  current_bid = CASE 
    WHEN category = 'Vinos y Licores' THEN 
      ((RANDOM() * 45 + 5) * (1.2 + RANDOM() * 0.8))::numeric(10,2)  -- 1.2x to 2x minimum
    WHEN category = 'Navajas' THEN 
      ((RANDOM() * 25 + 5) * (1.2 + RANDOM() * 0.8))::numeric(10,2)  -- 1.2x to 2x minimum
    ELSE current_bid
  END,
  bid_increment = CASE 
    WHEN category = 'Vinos y Licores' THEN 
      (RANDOM() * 9 + 1)::numeric(10,2)  -- 1-10 pesos
    WHEN category = 'Navajas' THEN 
      (RANDOM() * 7 + 1)::numeric(10,2)  -- 1-8 pesos
    ELSE bid_increment
  END,
  updated_at = now()
WHERE category IN ('Vinos y Licores', 'Navajas') 
  AND status = 'active';