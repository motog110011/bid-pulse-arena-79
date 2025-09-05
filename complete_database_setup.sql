-- Complete database setup for admin panel functionality
-- This creates all necessary tables and functions from scratch

-- 1. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Create user_wallets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    balance numeric DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- 3. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create balance_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.balance_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id uuid REFERENCES public.user_wallets(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    transaction_type text NOT NULL,
    description text,
    reference_number text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Create admin_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    read boolean DEFAULT false,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 7. Create basic RLS policies
-- User roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- User wallets policies
CREATE POLICY "Users can view their own wallet" ON public.user_wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON public.user_wallets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Profiles policies
CREATE POLICY "Users can view and edit their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 8. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Add updated_at triggers
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_user_wallets_updated_at ON public.user_wallets;
CREATE TRIGGER update_user_wallets_updated_at
    BEFORE UPDATE ON public.user_wallets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Create admin role checking function
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

-- 11. Create function to ensure user has wallet and profile
CREATE OR REPLACE FUNCTION public.ensure_user_setup(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Ensure user has a role (default to 'user')
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Ensure user has a wallet
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (user_id, 0.00)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Ensure user has a profile
    INSERT INTO public.profiles (id, full_name)
    VALUES (user_id, NULL)
    ON CONFLICT (id) DO NOTHING;
END;
$function$;

-- 12. Create the working get_detailed_users function
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
    -- Ensure all existing users have proper setup
    PERFORM ensure_user_setup(au.id)
    FROM auth.users au;
    
    RETURN QUERY
    SELECT 
        au.id,
        au.email,
        au.email_confirmed_at,
        au.created_at,
        au.last_sign_in_at,
        COALESCE(ur.role, 'user') as role,
        COALESCE(uw.balance, 0.00) as balance,
        COALESCE(bt.transaction_count, 0) as transaction_count,
        p.full_name
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    LEFT JOIN public.user_wallets uw ON au.id = uw.user_id
    LEFT JOIN public.profiles p ON au.id = p.id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as transaction_count
        FROM public.balance_transactions
        GROUP BY user_id
    ) bt ON au.id = bt.user_id
    ORDER BY au.created_at DESC;
END;
$$;

-- 13. Create the admin balance update function
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
    old_balance numeric;
    balance_difference numeric;
    wallet_uuid uuid;
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    -- Check admin permission
    IF NOT check_admin_role(current_user_id) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Ensure target user has proper setup
    PERFORM ensure_user_setup(target_user_id);
    
    -- Get current balance and wallet id
    SELECT balance, id INTO old_balance, wallet_uuid
    FROM public.user_wallets 
    WHERE user_id = target_user_id;
    
    IF old_balance IS NULL THEN
        RAISE EXCEPTION 'User wallet not found';
    END IF;
    
    balance_difference := new_balance - old_balance;
    
    -- Update wallet balance
    UPDATE public.user_wallets 
    SET balance = new_balance, updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Create transaction record
    INSERT INTO public.balance_transactions (
        user_id,
        wallet_id,
        amount,
        transaction_type,
        description,
        reference_number
    )
    VALUES (
        target_user_id,
        wallet_uuid,
        balance_difference,
        CASE 
            WHEN balance_difference > 0 THEN 'admin_credit'
            ELSE 'admin_debit'
        END,
        COALESCE(admin_notes, 'Balance adjusted by admin'),
        'ADMIN-' || EXTRACT(epoch FROM now())::text
    );
    
    -- Create admin notification
    INSERT INTO public.admin_notifications (
        type,
        title,
        message,
        data,
        user_id,
        created_at
    ) VALUES (
        'balance_update',
        'Balance Updated',
        'User balance updated from ' || old_balance || ' to ' || new_balance,
        jsonb_build_object(
            'user_id', target_user_id,
            'old_balance', old_balance,
            'new_balance', new_balance,
            'admin_notes', admin_notes,
            'admin_user_id', current_user_id
        ),
        current_user_id,
        now()
    );
END;
$function$;

-- 14. Set up your user as admin (replace with your actual user email)
-- You'll need to replace 'your-email@example.com' with your actual email
-- INSERT INTO public.user_roles (user_id, role) 
-- SELECT id, 'admin' FROM auth.users WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 15. Test the function
-- SELECT * FROM public.get_detailed_users() LIMIT 5;
