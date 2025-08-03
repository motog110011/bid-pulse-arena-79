-- Create RPC function to get detailed user information for admin panel
CREATE OR REPLACE FUNCTION public.get_detailed_users()
RETURNS TABLE (
  id uuid,
  email text,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  role app_role,
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
    COALESCE(ur.role, 'user'::app_role) as role,
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

-- Create RPC function to get current user role (if not exists)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(role, 'user'::app_role) FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;