-- Debug script to see what's actually in the database

-- 1. Show all has_role functions that exist
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'has_role';

-- 2. Show parameters for has_role functions
SELECT 
    routine_name, 
    ordinal_position,
    parameter_name,
    data_type,
    udt_name
FROM information_schema.parameters 
WHERE routine_name = 'has_role' 
AND routine_schema = 'public'
ORDER BY routine_name, ordinal_position;

-- 3. Show the user_roles table structure
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles';

-- 4. Show admin_update_user_balance function
SELECT routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'admin_update_user_balance';

-- 5. Test calling has_role directly with different parameter types
SELECT 'Testing has_role calls:' as test_info;

-- Try to call with explicit text casting
SELECT public.has_role(auth.uid(), 'admin'::text) as test_text_call;
