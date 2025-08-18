-- Update existing auctions with specific image URLs based on their titles and categories
-- This will regenerate more specific images for each product

-- First, let's add a function to generate specific image URLs in the database
CREATE OR REPLACE FUNCTION public.generate_specific_image_url(title text, category text, fallback_index integer DEFAULT 0)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    search_term text;
    random_seed integer;
    image_id text;
    base_url text := 'https://images.unsplash.com/photo-';
    final_url text;
BEGIN
    -- Extract search terms based on title and category
    search_term := CASE
        -- Electronics brands
        WHEN lower(title) LIKE '%samsung%' OR lower(title) LIKE '%galaxy%' THEN 'samsung+smartphone'
        WHEN lower(title) LIKE '%iphone%' OR lower(title) LIKE '%apple%' THEN 'iphone+apple'
        WHEN lower(title) LIKE '%xiaomi%' THEN 'xiaomi+phone'
        WHEN lower(title) LIKE '%huawei%' THEN 'huawei+smartphone'
        WHEN lower(title) LIKE '%sony%' THEN 'sony+electronics'
        WHEN lower(title) LIKE '%hp%' OR lower(title) LIKE '%laptop%' THEN 'laptop+computer'
        WHEN lower(title) LIKE '%dell%' THEN 'dell+laptop'
        WHEN lower(title) LIKE '%lenovo%' THEN 'lenovo+computer'
        WHEN lower(title) LIKE '%anker%' OR lower(title) LIKE '%power bank%' THEN 'power+bank'
        
        -- Knife brands
        WHEN lower(title) LIKE '%benchmade%' THEN 'benchmade+knife'
        WHEN lower(title) LIKE '%spyderco%' THEN 'spyderco+knife'
        WHEN lower(title) LIKE '%cold steel%' THEN 'tactical+knife'
        WHEN lower(title) LIKE '%kershaw%' THEN 'folding+knife'
        WHEN lower(title) LIKE '%opinel%' THEN 'opinel+knife'
        WHEN lower(title) LIKE '%victorinox%' OR lower(title) LIKE '%swiss army%' THEN 'swiss+army+knife'
        
        -- Liquor brands
        WHEN lower(title) LIKE '%johnnie walker%' THEN 'johnnie+walker+whiskey'
        WHEN lower(title) LIKE '%macallan%' THEN 'macallan+scotch'
        WHEN lower(title) LIKE '%glenfiddich%' THEN 'single+malt+whiskey'
        WHEN lower(title) LIKE '%hennessy%' THEN 'hennessy+cognac'
        WHEN lower(title) LIKE '%don julio%' THEN 'tequila+bottle'
        WHEN lower(title) LIKE '%patron%' THEN 'patron+tequila'
        
        -- Category fallbacks
        WHEN category = 'Electrónicos' THEN 'electronics+device'
        WHEN category = 'Navajas' THEN 'tactical+knife'
        WHEN category = 'Vinos y Licores' THEN 'wine+bottle'
        WHEN category = 'Cosméticos' THEN 'cosmetics+beauty'
        WHEN category = 'Joyería' THEN 'luxury+jewelry'
        
        ELSE 'product+item'
    END;
    
    -- Generate random seed for uniqueness
    random_seed := (random() * 1000)::integer + fallback_index;
    
    -- Generate a pseudo-random image ID (11 characters)
    image_id := substr(md5(title || category || random_seed::text), 1, 11);
    
    -- Build the final URL
    final_url := base_url || image_id || '?w=400&h=300&fit=crop&q=80&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&cs=tinysrgb&dpr=2&fm=webp&crop=entropy&sig=' || random_seed || '&' || search_term;
    
    RETURN final_url;
END;
$$;

-- Update existing auctions that don't have custom image URLs (or have generic ones)
UPDATE auctions 
SET image_url = generate_specific_image_url(title, category, 
    -- Use auction ID to ensure different images for same products
    (id::text)::numeric::integer % 100
)
WHERE image_url IS NULL 
   OR image_url LIKE '%category=%'  -- Update generic category-based URLs
   OR image_url = '';