-- Minimal working solution without complex function dependencies
-- Run this in your Supabase SQL Editor

-- 1. Create basic tables
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.user_wallets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    balance numeric DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Insert basic data for existing users manually
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_wallets (user_id, balance)
SELECT id, 0.00 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, full_name)
SELECT id, null FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create basic policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;
CREATE POLICY "Enable read access for all users" ON public.user_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_wallets;  
CREATE POLICY "Enable read access for all users" ON public.user_wallets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);

-- 5. Create simple working functions
DROP FUNCTION IF EXISTS public.get_detailed_users();

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
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.email_confirmed_at,
        au.created_at,
        au.last_sign_in_at,
        COALESCE(ur.role, 'user') as role,
        COALESCE(uw.balance, 0.00) as balance,
        0::bigint as transaction_count,  -- Simple default
        p.full_name
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    LEFT JOIN public.user_wallets uw ON au.id = uw.user_id
    LEFT JOIN public.profiles p ON au.id = p.id
    ORDER BY au.created_at DESC;
END;
$$;

-- 6. Create simple admin check function
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = $1 AND ur.role = 'admin'
    );
END;
$function$;

-- 7. Create simplified balance update function
CREATE OR REPLACE FUNCTION public.admin_update_user_balance(
    target_user_id uuid, 
    new_balance numeric, 
    admin_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    -- Check admin permission
    IF NOT check_admin_role(current_user_id) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Update wallet balance (create wallet if doesn't exist)
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (target_user_id, new_balance)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        balance = new_balance, 
        updated_at = now();
END;
$function$;

-- 8. Test the setup
SELECT 'Setup completed! Testing function...' as status;
SELECT * FROM public.get_detailed_users() LIMIT 3;

-- 9. Instructions for making yourself admin
SELECT '
To make yourself admin, run this query with your actual email:

INSERT INTO public.user_roles (user_id, role) 
SELECT id, ''admin'' FROM auth.users WHERE email = ''your-email@example.com''
ON CONFLICT (user_id) DO UPDATE SET role = ''admin'';

' as admin_instructions;
