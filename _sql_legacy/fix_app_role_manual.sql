-- Manual SQL to fix app_role type issue
-- Run this in your Supabase SQL Editor

-- Ensure the app_role enum type exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Recreate the has_role function to ensure it works correctly
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = $1 
    AND ur.role::text = role_name
  );
END;
$function$;

-- Update the admin_update_user_balance function to use proper role checking
CREATE OR REPLACE FUNCTION public.admin_update_user_balance(target_user_id uuid, new_balance numeric, admin_notes text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  old_balance numeric;
  balance_difference numeric;
  wallet_uuid uuid;
BEGIN
  -- Check if current user is admin using text comparison
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get current balance and wallet id
  SELECT balance, id INTO old_balance, wallet_uuid
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

  -- Create admin notification (if the function exists)
  BEGIN
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
  EXCEPTION
    WHEN undefined_function THEN
      -- If the notification function doesn't exist, just continue
      NULL;
  END;
END;
$function$;

-- Fix the get_detailed_users function to properly cast app_role to text
DROP FUNCTION IF EXISTS public.get_detailed_users();

CREATE OR REPLACE FUNCTION public.get_detailed_users()
RETURNS TABLE (
  id uuid,
  email varchar(255),
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
    COALESCE(ur.role::text, 'user') as role,  -- Cast app_role to text
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

-- Test the functions
SELECT 'Functions updated successfully!' as status;
SELECT * FROM public.get_detailed_users() LIMIT 3;
