-- Final fix with proper app_role type casting
-- The issue is that user_roles.role is app_role type, not text

-- 1. First, let's see what we're working with
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'role';

-- 2. Drop the problematic function
DROP FUNCTION IF EXISTS public.get_detailed_users();

-- 3. Create the function with proper type casting
CREATE OR REPLACE FUNCTION public.get_detailed_users()
RETURNS TABLE (
    id uuid,
    email varchar(255),
    email_confirmed_at timestamptz,
    created_at timestamptz,
    last_sign_in_at timestamptz,
    role text,  -- We want text output
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
        COALESCE(ur.role::text, 'user') as role,  -- Cast app_role to text
        COALESCE(uw.balance, 0.00) as balance,
        0::bigint as transaction_count,
        p.full_name
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    LEFT JOIN public.user_wallets uw ON au.id = uw.user_id
    LEFT JOIN public.profiles p ON au.id = p.id
    ORDER BY au.created_at DESC;
END;
$$;

-- 4. Also fix the admin_update_user_balance function to work with app_role
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = $1 AND ur.role::text = 'admin'  -- Cast to text for comparison
    );
END;
$function$;

-- 5. Create simplified balance update function
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

-- 6. Test the fixed function
SELECT 'Fixed! Testing the function...' as status;
SELECT * FROM public.get_detailed_users() LIMIT 3;

-- 7. Success message
SELECT 'SUCCESS! The function now properly casts app_role to text. 

To make yourself admin, run:

INSERT INTO public.user_roles (user_id, role) 
SELECT id, ''admin''::app_role FROM auth.users WHERE email = ''your-email@example.com''
ON CONFLICT (user_id) DO UPDATE SET role = ''admin''::app_role;

' as final_instructions;
