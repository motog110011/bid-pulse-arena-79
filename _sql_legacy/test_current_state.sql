-- Script de prueba CONSERVADOR - Solo para verificar funciones existentes
-- NO CREA NI MODIFICA NADA

-- 1. Verificar si existen las funciones actuales
SELECT 
  proname AS function_name,
  prorettype::regtype AS return_type,
  pronargs AS num_args
FROM pg_proc 
WHERE proname IN ('has_role', 'admin_update_user_balance')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Verificar si existe el tipo app_role
SELECT 
  typname AS type_name,
  ARRAY(SELECT enumlabel FROM pg_enum WHERE enumtypid = pg_type.oid ORDER BY enumsortorder) AS enum_values
FROM pg_type 
WHERE typname = 'app_role';

-- 3. Verificar la estructura de user_roles (sin mostrar datos)
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar la estructura de user_wallets (sin mostrar datos)
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_wallets' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Contar registros en las tablas (sin mostrar datos sensibles)
SELECT 'user_roles' AS table_name, COUNT(*) AS record_count FROM public.user_roles
UNION ALL
SELECT 'user_wallets' AS table_name, COUNT(*) AS record_count FROM public.user_wallets
UNION ALL
SELECT 'balance_transactions' AS table_name, COUNT(*) AS record_count FROM public.balance_transactions;

-- 6. Verificar permisos en las funciones
SELECT 
  p.proname,
  p.proacl
FROM pg_proc p
WHERE p.proname IN ('has_role', 'admin_update_user_balance')
  AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
