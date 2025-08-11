-- Fix the get_detailed_users function to return proper data with email
CREATE OR REPLACE FUNCTION public.get_detailed_users()
RETURNS TABLE(
  id uuid, 
  email text, 
  email_confirmed_at timestamp with time zone, 
  created_at timestamp with time zone, 
  last_sign_in_at timestamp with time zone, 
  role app_role, 
  balance numeric, 
  transaction_count bigint, 
  full_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.email_confirmed_at,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(ur.role, 'user'::public.app_role) as role,
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

-- Add RLS policies for admins to view profiles and manage users
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any profile" ON public.profiles  
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view wallet recharge requests
CREATE POLICY "Admins can view all recharge requests" ON public.wallet_recharge_requests
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all recharge requests" ON public.wallet_recharge_requests
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to update user balance (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_balance(
  target_user_id uuid,
  new_balance numeric,
  admin_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  old_balance numeric;
  balance_difference numeric;
BEGIN
  -- Check if current user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get current balance
  SELECT balance INTO old_balance 
  FROM public.user_wallets 
  WHERE user_id = target_user_id;

  IF old_balance IS NULL THEN
    RAISE EXCEPTION 'User wallet not found';
  END IF;

  -- Calculate difference
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
  SELECT 
    target_user_id,
    uw.id,
    balance_difference,
    CASE 
      WHEN balance_difference > 0 THEN 'admin_credit'
      ELSE 'admin_debit'
    END,
    COALESCE(admin_notes, 'Balance adjusted by admin'),
    'ADMIN-' || EXTRACT(epoch FROM now())::text
  FROM public.user_wallets uw
  WHERE uw.user_id = target_user_id;

  -- Create admin notification
  PERFORM create_admin_notification(
    'balance_update',
    'Balance Updated',
    'User balance updated from ' || old_balance || ' to ' || new_balance,
    jsonb_build_object(
      'user_id', target_user_id,
      'old_balance', old_balance,
      'new_balance', new_balance,
      'admin_notes', admin_notes
    ),
    auth.uid()
  );
END;
$$;