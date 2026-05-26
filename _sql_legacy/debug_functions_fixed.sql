-- Debug script to see what's actually in the database (fixed for PostgreSQL)

-- 1. Show all has_role functions that exist
SELECT 
    proname as function_name,
    pronargs as num_args,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'has_role' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Show the user_roles table structure (if it exists)
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Show if user_roles table exists at all
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_roles';

-- 4. Check what tables do exist in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 5. Try to see what the actual error is by calling the function
SELECT 'Testing function call:' as info;

-- Test the function call that's failing
DO $$
BEGIN
    IF public.has_role(auth.uid(), 'admin') THEN
        RAISE NOTICE 'User is admin';
    ELSE
        RAISE NOTICE 'User is not admin';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error calling has_role: %', SQLERRM;
END
$$;
