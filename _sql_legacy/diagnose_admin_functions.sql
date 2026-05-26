-- Script de diagnóstico para verificar funciones de administración

-- 1. Verificar si la función has_role existe
SELECT 
  proname AS function_name,
  prosrc AS function_body,
  prorettype::regtype AS return_type,
  proargtypes::regtype[] AS argument_types
FROM pg_proc 
WHERE proname = 'has_role' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Verificar si la función admin_update_user_balance existe
SELECT 
  proname AS function_name,
  prosrc AS function_body,
  prorettype::regtype AS return_type,
  proargtypes::regtype[] AS argument_types
FROM pg_proc 
WHERE proname = 'admin_update_user_balance' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. Verificar si el tipo app_role existe
SELECT typname, typtype 
FROM pg_type 
WHERE typname = 'app_role';

-- 4. Verificar la tabla user_roles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar la tabla user_wallets
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_wallets' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar si hay usuarios con rol de admin
SELECT 
  ur.user_id,
  ur.role,
  p.full_name,
  uw.balance
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
LEFT JOIN user_wallets uw ON uw.user_id = ur.user_id
WHERE ur.role = 'admin'
LIMIT 5;

-- 7. Verificar permisos de la función admin_update_user_balance
SELECT 
  p.proname,
  p.proowner::regrole AS owner,
  p.proacl AS access_privileges,
  p.prosecdef AS security_definer
FROM pg_proc p
WHERE p.proname = 'admin_update_user_balance';
