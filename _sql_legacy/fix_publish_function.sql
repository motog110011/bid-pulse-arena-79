-- Parche para corregir la función publish_scheduled_auctions()
-- En caso de que haya problemas con los campos de la tabla auctions

-- Primero verificamos qué campos tiene la tabla auctions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'auctions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Función corregida que maneja diferentes esquemas de tabla auctions
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
  end_time timestamp with time zone;
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
      end_time := now() + (scheduled_auction.duration_hours * INTERVAL '1 hour');

      -- Crear la subasta real con campos básicos que sabemos que existen
      INSERT INTO public.auctions (
        title,
        category,
        starting_bid,
        minimum_bid,
        current_bid,
        bid_increment,
        end_time,
        status,
        total_bids
      ) VALUES (
        scheduled_auction.title,
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
        0
      ) RETURNING id INTO new_auction_id;

      -- Intentar actualizar con descripción e imagen si los campos existen
      BEGIN
        UPDATE public.auctions 
        SET 
          description = scheduled_auction.description,
          image_url = scheduled_auction.image_url
        WHERE id = new_auction_id;
      EXCEPTION
        WHEN undefined_column THEN
          -- Si los campos no existen, continuar sin ellos
          NULL;
      END;

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
