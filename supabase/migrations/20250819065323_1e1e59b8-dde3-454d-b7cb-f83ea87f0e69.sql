-- Fix image URL generation to use Unsplash Source and repair broken URLs

-- 1) Replace the existing function to generate valid Unsplash Source URLs
CREATE OR REPLACE FUNCTION public.generate_specific_image_url(title text, category text, fallback_index integer DEFAULT 0)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    search_term text;
    dims text := '800x600';
BEGIN
    -- Derive a simple search term from title/category
    search_term := CASE
        -- Electronics brands
        WHEN lower(title) LIKE '%samsung%' OR lower(title) LIKE '%galaxy%' THEN 'samsung smartphone'
        WHEN lower(title) LIKE '%iphone%' OR lower(title) LIKE '%apple%' THEN 'iphone apple'
        WHEN lower(title) LIKE '%xiaomi%' THEN 'xiaomi phone'
        WHEN lower(title) LIKE '%huawei%' THEN 'huawei smartphone'
        WHEN lower(title) LIKE '%sony%' THEN 'sony electronics'
        WHEN lower(title) LIKE '%hp%' OR lower(title) LIKE '%laptop%' THEN 'laptop computer'
        WHEN lower(title) LIKE '%dell%' THEN 'dell laptop'
        WHEN lower(title) LIKE '%lenovo%' THEN 'lenovo computer'
        WHEN lower(title) LIKE '%anker%' OR lower(title) LIKE '%power bank%' THEN 'power bank'
        
        -- Knife brands
        WHEN lower(title) LIKE '%benchmade%' THEN 'benchmade knife'
        WHEN lower(title) LIKE '%spyderco%' THEN 'spyderco knife'
        WHEN lower(title) LIKE '%cold steel%' THEN 'tactical knife'
        WHEN lower(title) LIKE '%kershaw%' THEN 'folding knife'
        WHEN lower(title) LIKE '%opinel%' THEN 'opinel knife'
        WHEN lower(title) LIKE '%victorinox%' OR lower(title) LIKE '%swiss army%' THEN 'swiss army knife'
        
        -- Liquor brands
        WHEN lower(title) LIKE '%johnnie walker%' THEN 'johnnie walker whiskey'
        WHEN lower(title) LIKE '%macallan%' THEN 'macallan scotch'
        WHEN lower(title) LIKE '%glenfiddich%' THEN 'single malt whiskey'
        WHEN lower(title) LIKE '%hennessy%' THEN 'hennessy cognac'
        WHEN lower(title) LIKE '%don julio%' THEN 'tequila bottle'
        WHEN lower(title) LIKE '%patron%' THEN 'patron tequila'
        
        -- Category fallbacks
        WHEN category = 'Electrónicos' THEN 'electronics device'
        WHEN category = 'Navajas' THEN 'tactical knife'
        WHEN category = 'Vinos y Licores' THEN 'wine bottle'
        WHEN category = 'Cosméticos' THEN 'cosmetics beauty'
        WHEN category = 'Joyería' THEN 'luxury jewelry'
        ELSE 'product item'
    END;

    RETURN 'https://source.unsplash.com/' || dims || '/?' || replace(search_term, ' ', ',') || '&sig=' || fallback_index::text;
END;
$$;

-- 2) Update existing rows that contain broken Unsplash photo IDs or empty values
UPDATE auctions 
SET image_url = public.generate_specific_image_url(title, category, (random()*1000)::int)
WHERE image_url IS NULL 
   OR image_url = ''
   OR image_url LIKE 'https://images.unsplash.com/photo-%';