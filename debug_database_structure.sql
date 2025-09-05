-- Debug script to check database structure and understand the issues
-- Run this in your Supabase SQL Editor to see what's actually in your database

-- 1. Check if user_roles table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 2. Check if user_wallets table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_wallets'
ORDER BY ordinal_position;

-- 3. Check if profiles table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check if balance_transactions table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'balance_transactions'
ORDER BY ordinal_position;

-- 5. List all custom types in the database
SELECT 
    t.typname as type_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname;

-- 6. Check what functions exist with 'get_detailed_users' in the name
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%detailed_users%';

-- 7. Test a simple query to see what actually works
-- This will tell us if the basic tables exist
SELECT 
    COUNT(*) as user_count
FROM auth.users;

-- 8. Test user_roles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        RAISE NOTICE 'user_roles table exists with % rows', (SELECT COUNT(*) FROM public.user_roles);
    ELSE
        RAISE NOTICE 'user_roles table does NOT exist';
    END IF;
END $$;

-- 9. Test user_wallets table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_wallets') THEN
        RAISE NOTICE 'user_wallets table exists with % rows', (SELECT COUNT(*) FROM public.user_wallets);
    ELSE
        RAISE NOTICE 'user_wallets table does NOT exist';
    END IF;
END $$;

-- 10. Test profiles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE 'profiles table exists with % rows', (SELECT COUNT(*) FROM public.profiles);
    ELSE
        RAISE NOTICE 'profiles table does NOT exist';
    END IF;
END $$;
