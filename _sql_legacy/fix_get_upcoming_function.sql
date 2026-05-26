-- Crear función simplificada para obtener próximas subastas programadas
-- Sin restricciones RLS para pruebas

CREATE OR REPLACE FUNCTION public.get_upcoming_scheduled_auctions_simple(limit_count integer DEFAULT 10)
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

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.get_upcoming_scheduled_auctions_simple(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_upcoming_scheduled_auctions_simple(integer) TO anon;

-- Probar la función
SELECT 'Probando get_upcoming_scheduled_auctions_simple...' as step;
SELECT * FROM public.get_upcoming_scheduled_auctions_simple(5);
