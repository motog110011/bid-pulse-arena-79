-- Create the missing app_role enum type
DO $$ 
BEGIN
    -- Check if app_role type exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- Fix the admin_update_user_balance function to use proper function syntax
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
  current_user_role text;
BEGIN
  -- Get current user role using the existing function
  SELECT get_current_user_role()::text INTO current_user_role;
  
  -- Check if current user is admin
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Validate new_balance is not negative
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Balance cannot be negative';
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
      WHEN balance_difference < 0 THEN 'admin_debit'
      ELSE 'admin_adjustment'
    END,
    COALESCE(admin_notes, 'Balance adjusted by admin'),
    'ADMIN-' || EXTRACT(epoch FROM now())::text
  );

  -- Create admin notification
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