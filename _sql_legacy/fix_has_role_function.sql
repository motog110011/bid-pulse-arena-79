-- Fix for has_role function parameter type issues
-- Run this in your Supabase SQL Editor

-- First, drop all existing has_role functions to avoid conflicts
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, varchar);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Ensure the app_role enum type exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the has_role function with explicit parameter types
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Ensure we have both parameters
  IF user_id IS NULL OR role_name IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = has_role.user_id 
    AND ur.role::text = has_role.role_name
  );
END;
$function$;

-- Also create an overload for varchar input (just in case)
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name varchar)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN public.has_role(user_id, role_name::text);
END;
$function$;

-- Update the admin_update_user_balance function to explicitly cast the role parameter
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
  -- Check if current user is admin using explicit text casting
  IF NOT public.has_role(auth.uid(), 'admin'::text) THEN
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

  -- Create transaction record if balance_transactions table exists
  BEGIN
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
  EXCEPTION
    WHEN undefined_table THEN
      -- If balance_transactions table doesn't exist, just continue
      NULL;
  END;
END;
$function$;

-- Test the function
SELECT 'has_role function fixed successfully!' as status;

-- Show function signatures to verify
SELECT 
    routine_name, 
    data_type,
    ordinal_position,
    parameter_name,
    parameter_default,
    udt_name
FROM information_schema.parameters 
WHERE routine_name = 'has_role' 
AND routine_schema = 'public'
ORDER BY ordinal_position;
