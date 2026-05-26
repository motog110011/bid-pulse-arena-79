-- Script para reparar la función de actualización de balance de admin

-- Primero, crear el tipo app_role si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('user', 'admin');
    RAISE NOTICE 'Tipo app_role creado';
  ELSE
    RAISE NOTICE 'Tipo app_role ya existe';
  END IF;
END $$;

-- Crear o reemplazar la función has_role
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Si no hay user_id, retornar false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si el usuario tiene el rol requerido
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = has_role.user_id 
      AND ur.role = has_role.required_role
  );
END;
$function$;

-- Crear o reemplazar la función create_admin_notification (si no existe)
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  notification_type text,
  title text,
  message text,
  data jsonb DEFAULT NULL,
  admin_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.admin_notifications (
    type,
    title,
    message,
    data,
    user_id,
    read
  ) VALUES (
    notification_type,
    title,
    message,
    COALESCE(data, '{}'::jsonb),
    admin_id,
    false
  );
END;
$function$;

-- Crear o reemplazar la función admin_update_user_balance mejorada
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
  current_admin_id uuid;
BEGIN
  -- Obtener el ID del admin actual
  current_admin_id := auth.uid();
  
  -- Verificar que hay un usuario logueado
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found.';
  END IF;
  
  -- Verificar si el usuario actual es admin
  IF NOT public.has_role(current_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required. User ID: %, Role check failed', current_admin_id;
  END IF;
  
  -- Verificar que el target_user_id existe
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user ID cannot be null.';
  END IF;
  
  -- Verificar que new_balance es válido
  IF new_balance IS NULL OR new_balance < 0 THEN
    RAISE EXCEPTION 'New balance must be a non-negative number.';
  END IF;

  -- Obtener balance actual y wallet id
  SELECT balance, id INTO old_balance, wallet_uuid
  FROM public.user_wallets 
  WHERE user_id = target_user_id;

  -- Si no existe wallet, crear uno
  IF wallet_uuid IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (target_user_id, new_balance)
    RETURNING id INTO wallet_uuid;
    
    old_balance := 0;
    RAISE NOTICE 'Created new wallet for user %', target_user_id;
  END IF;

  -- Calcular diferencia
  balance_difference := new_balance - old_balance;

  -- Actualizar balance de wallet
  UPDATE public.user_wallets 
  SET balance = new_balance, updated_at = now()
  WHERE user_id = target_user_id;

  -- Crear registro de transacción
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

  -- Crear notificación de administrador
  PERFORM public.create_admin_notification(
    'balance_update',
    'Balance Updated',
    'User balance updated from ' || COALESCE(old_balance, 0) || ' to ' || new_balance,
    jsonb_build_object(
      'user_id', target_user_id,
      'old_balance', COALESCE(old_balance, 0),
      'new_balance', new_balance,
      'admin_notes', admin_notes,
      'admin_id', current_admin_id
    ),
    current_admin_id
  );

  RAISE NOTICE 'Balance updated successfully for user %. Old: %, New: %', target_user_id, old_balance, new_balance;
END;
$function$;

-- Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_balance TO authenticated;

-- Verificar que las funciones fueron creadas correctamente
SELECT 
  proname AS function_name,
  prorettype::regtype AS return_type
FROM pg_proc 
WHERE proname IN ('has_role', 'admin_update_user_balance', 'create_admin_notification')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
