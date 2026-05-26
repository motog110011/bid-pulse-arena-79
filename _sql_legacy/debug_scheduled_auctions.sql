-- Script de diagnóstico para subastas programadas
-- Ejecutar cada sección paso a paso para identificar el problema

-- 1. Verificar que la tabla existe
SELECT 'Verificando tabla scheduled_auctions...' as step;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'scheduled_auctions'
) as table_exists;

-- 2. Verificar estructura de la tabla
SELECT 'Estructura de scheduled_auctions:' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'scheduled_auctions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar que las funciones existen
SELECT 'Verificando funciones...' as step;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('generate_scheduled_auctions', 'publish_scheduled_auctions', 'get_upcoming_scheduled_auctions');

-- 4. Verificar permisos de usuario actual
SELECT 'Usuario actual y roles:' as step;
SELECT auth.uid() as current_user_id;

SELECT 'Roles del usuario:' as step;
SELECT ur.role 
FROM public.user_roles ur 
WHERE ur.user_id = auth.uid();

-- 5. Probar inserción manual simple
SELECT 'Probando inserción manual...' as step;
INSERT INTO public.scheduled_auctions (
  title,
  description,
  category,
  starting_bid,
  scheduled_publish_time
) VALUES (
  'Producto de Prueba - Test Manual',
  'Descripción de prueba para verificar funcionamiento',
  'Perfumes',
  25,
  now() + interval '1 hour'
) RETURNING id, title, scheduled_publish_time;

-- 6. Ver contenido actual de la tabla
SELECT 'Contenido actual:' as step;
SELECT id, title, category, starting_bid, scheduled_publish_time, status 
FROM public.scheduled_auctions 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Probar función generate_scheduled_auctions con parámetros mínimos
SELECT 'Probando generate_scheduled_auctions...' as step;
SELECT public.generate_scheduled_auctions(1, 1); -- Solo 1 día, 1 subasta

-- 8. Verificar tabla auctions existe
SELECT 'Verificando tabla auctions...' as step;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'auctions'
) as auctions_table_exists;

-- 9. Verificar campos de tabla auctions
SELECT 'Campos de tabla auctions:' as step;
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'auctions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
