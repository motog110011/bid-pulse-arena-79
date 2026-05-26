-- Safe version of get_detailed_users that handles missing tables gracefully
-- Run this AFTER running the debug script to understand your database structure

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_detailed_users();

-- Create a simple, robust version that starts basic and can be enhanced
CREATE OR REPLACE FUNCTION public.get_detailed_users()
RETURNS TABLE (
  id uuid,
  email text,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  role text,
  balance numeric,
  transaction_count bigint,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Start with just auth.users and add other tables if they exist
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    au.last_sign_in_at,
    'user'::text as role,  -- Default role
    0.00::numeric as balance,  -- Default balance
    0::bigint as transaction_count,  -- Default transaction count
    au.email as full_name  -- Use email as fallback for full_name
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Test the function to make sure it works
-- SELECT * FROM public.get_detailed_users() LIMIT 5;
