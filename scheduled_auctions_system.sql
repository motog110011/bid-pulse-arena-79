-- Sistema de Subastas Programadas
-- Permite programar subastas que se publican automáticamente

-- 1. Crear tabla para subastas programadas
CREATE TABLE IF NOT EXISTS public.scheduled_auctions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  starting_bid numeric NOT NULL DEFAULT 0,
  image_url text,
  duration_hours integer DEFAULT 6,
  scheduled_publish_time timestamp with time zone NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_auction_id uuid REFERENCES public.auctions(id),
  created_by uuid REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.scheduled_auctions ENABLE ROW LEVEL SECURITY;

-- Política para que los admins puedan ver y gestionar todas las subastas programadas
CREATE POLICY "Admins can manage scheduled auctions" ON public.scheduled_auctions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_scheduled_auctions_publish_time ON public.scheduled_auctions(scheduled_publish_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_auctions_status ON public.scheduled_auctions(status);

-- 2. Función para publicar subastas programadas
CREATE OR REPLACE FUNCTION public.publish_scheduled_auctions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  scheduled_auction RECORD;
  published_count INTEGER := 0;
  new_auction_id uuid;
  result json;
BEGIN
  -- Buscar subastas programadas que deben publicarse ahora
  FOR scheduled_auction IN 
    SELECT * FROM public.scheduled_auctions 
    WHERE status = 'scheduled' 
    AND scheduled_publish_time <= now()
    ORDER BY scheduled_publish_time ASC
  LOOP
    BEGIN
      -- Calcular tiempo de finalización
      DECLARE
        end_time timestamp with time zone;
      BEGIN
        end_time := now() + (scheduled_auction.duration_hours * INTERVAL '1 hour');
      END;

      -- Crear la subasta real
      INSERT INTO public.auctions (
        title,
        description,
        category,
        starting_bid,
        minimum_bid,
        current_bid,
        bid_increment,
        end_time,
        status,
        image_url,
        total_bids
      ) VALUES (
        scheduled_auction.title,
        scheduled_auction.description,
        scheduled_auction.category,
        scheduled_auction.starting_bid,
        scheduled_auction.starting_bid,
        scheduled_auction.starting_bid,
        CASE 
          WHEN scheduled_auction.starting_bid < 50 THEN 5
          WHEN scheduled_auction.starting_bid < 100 THEN 10
          WHEN scheduled_auction.starting_bid < 200 THEN 15
          WHEN scheduled_auction.starting_bid < 500 THEN 25
          ELSE 50
        END,
        end_time,
        'active',
        scheduled_auction.image_url,
        0
      ) RETURNING id INTO new_auction_id;

      -- Actualizar la subasta programada como publicada
      UPDATE public.scheduled_auctions 
      SET 
        status = 'published',
        published_auction_id = new_auction_id,
        updated_at = now()
      WHERE id = scheduled_auction.id;

      published_count := published_count + 1;

      RAISE NOTICE 'Published scheduled auction: % (ID: %)', 
        scheduled_auction.title, new_auction_id;

    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to publish scheduled auction %: %', 
          scheduled_auction.id, SQLERRM;
        CONTINUE;
    END;
  END LOOP;

  -- Registrar en logs
  INSERT INTO public.auction_rotation_logs (
    auctions_processed,
    auctions_renewed,
    status,
    details
  ) VALUES (
    (SELECT COUNT(*) FROM public.scheduled_auctions 
     WHERE status = 'scheduled' AND scheduled_publish_time <= now()),
    published_count,
    CASE WHEN published_count > 0 THEN 'success' ELSE 'no_action' END,
    'Published ' || published_count || ' scheduled auctions automatically'
  );

  result := json_build_object(
    'success', true,
    'published_count', published_count,
    'message', 'Published ' || published_count || ' scheduled auctions'
  );

  RETURN result;
END;
$function$;

-- 3. Función para generar subastas programadas aleatorias
CREATE OR REPLACE FUNCTION public.generate_scheduled_auctions(
  days_ahead integer DEFAULT 7,
  auctions_per_day integer DEFAULT 3
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  day_offset integer;
  auction_count integer;
  schedule_time timestamp with time zone;
  categories text[] := ARRAY['Perfumes', 'Vinos y Licores', 'Electrónicos', 'Navajas', 'Relojes', 'Joyas'];
  
  -- Arrays de productos
  perfume_brands text[] := ARRAY['Chanel No. 5', 'Dior Sauvage', 'Giorgio Armani Si', 'Versace Eros'];
  liquor_brands text[] := ARRAY['Macallan 12 años', 'Hennessy VSOP', 'Johnnie Walker Black'];
  electronics text[] := ARRAY['iPhone 15 Pro Max', 'Samsung Galaxy S24', 'iPad Air', 'MacBook Pro M3'];
  tactical_gear text[] := ARRAY['Navaja Suiza Victorinox', 'Leatherman Wave Plus', 'Benchmade Bugout'];
  watches text[] := ARRAY['Rolex Submariner', 'Omega Speedmaster', 'TAG Heuer Carrera'];
  jewelry text[] := ARRAY['Anillo de Oro 18k', 'Collar de Perlas', 'Pulsera de Diamantes'];
  
  conditions text[] := ARRAY[
    'Decomisado en Arco de Seguridad',
    'Olvidado en Vuelo Comercial',
    'Confiscado por Aduana',
    'Encontrado en Terminal',
    'Equipaje No Reclamado'
  ];
  
  selected_category text;
  product_name text;
  condition_text text;
  starting_bid numeric;
  duration_hours integer;
  total_created integer := 0;
BEGIN
  -- Verificar permisos de admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Generar subastas para los próximos días
  FOR day_offset IN 0..days_ahead-1 LOOP
    FOR auction_count IN 1..auctions_per_day LOOP
      
      -- Calcular tiempo de publicación (distribuir a lo largo del día)
      schedule_time := date_trunc('day', now() + (day_offset * INTERVAL '1 day')) 
                     + (auction_count * INTERVAL '8 hours') 
                     + (random() * INTERVAL '2 hours');
      
      -- Solo crear si no está en el pasado
      IF schedule_time > now() THEN
        -- Seleccionar categoría aleatoria
        selected_category := categories[1 + floor(random() * array_length(categories, 1))];
        
        -- Generar producto basado en categoría
        IF selected_category = 'Perfumes' THEN
          product_name := perfume_brands[1 + floor(random() * array_length(perfume_brands, 1))] 
                         || ' EDP ' || (ARRAY['50ml', '100ml'])[1 + floor(random() * 2)];
          starting_bid := 15 + floor(random() * 30);
        ELSIF selected_category = 'Vinos y Licores' THEN
          product_name := liquor_brands[1 + floor(random() * array_length(liquor_brands, 1))] 
                         || ' 750ml';
          starting_bid := 25 + floor(random() * 80);
        ELSIF selected_category = 'Electrónicos' THEN
          product_name := electronics[1 + floor(random() * array_length(electronics, 1))] 
                         || ' ' || (ARRAY['Negro', 'Blanco', 'Plateado'])[1 + floor(random() * 3)];
          starting_bid := 50 + floor(random() * 200);
        ELSIF selected_category = 'Navajas' THEN
          product_name := tactical_gear[1 + floor(random() * array_length(tactical_gear, 1))] 
                         || ' Acero Inoxidable';
          starting_bid := 20 + floor(random() * 60);
        ELSIF selected_category = 'Relojes' THEN
          product_name := watches[1 + floor(random() * array_length(watches, 1))] 
                         || ' ' || (ARRAY['Automático', 'Cuarzo'])[1 + floor(random() * 2)];
          starting_bid := 100 + floor(random() * 300);
        ELSE -- Joyas
          product_name := jewelry[1 + floor(random() * array_length(jewelry, 1))] 
                         || ' ' || (ARRAY['Oro 18k', 'Plata 925'])[1 + floor(random() * 2)];
          starting_bid := 75 + floor(random() * 250);
        END IF;
        
        -- Seleccionar condición
        condition_text := conditions[1 + floor(random() * array_length(conditions, 1))];
        
        -- Duración aleatoria (4-8 horas)
        duration_hours := 4 + floor(random() * 5);
        
        -- Insertar subasta programada
        INSERT INTO public.scheduled_auctions (
          title,
          description,
          category,
          starting_bid,
          image_url,
          duration_hours,
          scheduled_publish_time,
          created_by
        ) VALUES (
          product_name || ' - ' || condition_text,
          'Producto ' || lower(selected_category) || ' ' || lower(condition_text) || '. Artículo auténtico en excelente estado.',
          selected_category,
          starting_bid,
          '/src/assets/product-' || 
            CASE selected_category
              WHEN 'Perfumes' THEN 'luxury-perfumes.jpg'
              WHEN 'Vinos y Licores' THEN 'premium-spirits.jpg'
              WHEN 'Electrónicos' THEN 'electronics.jpg'
              WHEN 'Navajas' THEN 'tactical-gear.jpg'
              WHEN 'Relojes' THEN 'watch.jpg'
              ELSE 'luxury-jewelry.jpg'
            END,
          duration_hours,
          schedule_time,
          auth.uid()
        );
        
        total_created := total_created + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'created_count', total_created,
    'message', 'Generated ' || total_created || ' scheduled auctions for the next ' || days_ahead || ' days'
  );
END;
$function$;

-- 4. Función para obtener próximas subastas programadas
CREATE OR REPLACE FUNCTION public.get_upcoming_scheduled_auctions(limit_count integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  starting_bid numeric,
  scheduled_publish_time timestamp with time zone,
  time_until_publish interval,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.title,
    sa.category,
    sa.starting_bid,
    sa.scheduled_publish_time,
    (sa.scheduled_publish_time - now()) AS time_until_publish,
    sa.status
  FROM public.scheduled_auctions sa
  WHERE sa.status = 'scheduled'
    AND sa.scheduled_publish_time > now()
  ORDER BY sa.scheduled_publish_time ASC
  LIMIT limit_count;
END;
$function$;

-- 5. Otorgar permisos
GRANT EXECUTE ON FUNCTION public.publish_scheduled_auctions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_scheduled_auctions(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_upcoming_scheduled_auctions(integer) TO authenticated;

-- 6. Crear algunas subastas de ejemplo para los próximos días
-- (Descomenta para ejecutar)
/*
SELECT public.generate_scheduled_auctions(3, 2); -- 3 días, 2 subastas por día
*/

-- 7. Query de ejemplo para ver próximas subastas
/*
SELECT * FROM public.get_upcoming_scheduled_auctions(5);
*/

-- 8. Instrucciones de configuración
SELECT 'Sistema de subastas programadas creado exitosamente!' as status,
       'Para automatizar la publicación, configura un cron job que ejecute public.publish_scheduled_auctions() cada 15 minutos' as instructions;
