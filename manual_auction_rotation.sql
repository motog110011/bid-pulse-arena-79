-- Manual Auction Rotation Script
-- Use this to manually trigger auction rotation for testing

-- Check which auctions have ended
SELECT 
  id,
  title,
  end_time,
  status,
  current_bid,
  (now() > end_time) as has_ended
FROM auctions 
WHERE status = 'active' 
ORDER BY end_time;

-- Count ended auctions
SELECT COUNT(*) as ended_auctions
FROM auctions 
WHERE status = 'active' 
AND end_time < now();

-- For testing: Force expire some auctions (uncomment to use)
/*
UPDATE auctions 
SET end_time = now() - INTERVAL '1 hour'
WHERE status = 'active' 
AND id IN (
  SELECT id FROM auctions 
  WHERE status = 'active' 
  ORDER BY end_time 
  LIMIT 3
);
*/

-- Manual rotation (you can run this to test the system)
-- This will call your edge function to rotate expired auctions
SELECT 'To manually rotate auctions, call your auction-rotator edge function at:' as instruction,
       'https://your-project-ref.supabase.co/functions/v1/auction-rotator' as url;

-- Alternative: Simple in-database rotation (basic version)
-- This is a simplified version that just resets auctions to new times
/*
DO $$
DECLARE
    auction_record RECORD;
    new_title TEXT;
    new_description TEXT;
    new_starting_bid NUMERIC;
    new_category TEXT;
    new_end_time TIMESTAMP;
    categories TEXT[] := ARRAY['Perfumes', 'Vinos y Licores', 'Electrónicos', 'Navajas', 'Relojes', 'Joyas'];
    perfume_brands TEXT[] := ARRAY['Chanel No. 5', 'Dior Sauvage', 'Giorgio Armani Si'];
    conditions TEXT[] := ARRAY['Decomisado en Arco de Seguridad', 'Olvidado en Vuelo Comercial', 'Confiscado por Aduana'];
BEGIN
    FOR auction_record IN 
        SELECT * FROM auctions 
        WHERE status = 'active' 
        AND end_time < now()
        LIMIT 5
    LOOP
        -- Generate new random product
        new_category := categories[1 + floor(random() * array_length(categories, 1))];
        new_starting_bid := 20 + floor(random() * 100);
        new_end_time := now() + INTERVAL '4 hours' + (random() * INTERVAL '4 hours');
        
        IF new_category = 'Perfumes' THEN
            new_title := perfume_brands[1 + floor(random() * array_length(perfume_brands, 1))] || 
                        ' EDP 100ml - ' || conditions[1 + floor(random() * array_length(conditions, 1))];
            new_description := 'Perfume original decomisado en aduana. Producto auténtico verificado.';
        ELSIF new_category = 'Electrónicos' THEN
            new_title := 'iPhone 15 Pro Negro - Olvidado en Vuelo Comercial';
            new_description := 'Dispositivo encontrado durante limpieza de cabina. Funcional y en buen estado.';
        ELSE
            new_title := 'Producto Premium - ' || conditions[1 + floor(random() * array_length(conditions, 1))];
            new_description := 'Artículo de calidad encontrado en aeropuerto.';
        END IF;
        
        -- Update the auction with new product
        UPDATE auctions 
        SET 
            title = new_title,
            description = new_description,
            category = new_category,
            starting_bid = new_starting_bid,
            minimum_bid = new_starting_bid,
            current_bid = new_starting_bid,
            bid_increment = CASE 
                WHEN new_starting_bid < 50 THEN 5
                WHEN new_starting_bid < 100 THEN 10
                ELSE 15
            END,
            end_time = new_end_time,
            current_bidder = NULL,
            total_bids = 0,
            updated_at = now()
        WHERE id = auction_record.id;
        
        RAISE NOTICE 'Rotated auction % to: %', auction_record.id, new_title;
    END LOOP;
    
    RAISE NOTICE 'Manual rotation complete!';
END $$;
*/

-- Check results after rotation
SELECT 
  id,
  title,
  category,
  starting_bid,
  end_time,
  updated_at
FROM auctions 
WHERE status = 'active' 
ORDER BY updated_at DESC 
LIMIT 10;
