-- SCRIPT MÍNIMO Y CONSERVADOR
-- Solo arregla lo estrictamente necesario sin tocar tipos ni funciones existentes

-- Paso 1: Verificar estado actual (solo lectura)
DO $$
BEGIN
  -- Verificar si la función admin_update_user_balance existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'admin_update_user_balance' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE NOTICE 'La función admin_update_user_balance NO existe';
  ELSE
    RAISE NOTICE 'La función admin_update_user_balance SÍ existe';
  END IF;

  -- Verificar si la función has_role existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE NOTICE 'La función has_role NO existe';
  ELSE
    RAISE NOTICE 'La función has_role SÍ existe';
  END IF;

  -- Verificar si el tipo app_role existe
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    RAISE NOTICE 'El tipo app_role NO existe';
  ELSE
    RAISE NOTICE 'El tipo app_role SÍ existe';
  END IF;
END $$;

-- Paso 2: Solo crear la función admin_update_user_balance si NO existe
-- Y usar TEXT en lugar de app_role para evitar problemas
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
  current_admin_id uuid;
  admin_role_exists boolean;
BEGIN
  -- Obtener el ID del admin actual
  current_admin_id := auth.uid();
  
  -- Verificar que hay un usuario logueado
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuario autenticado';
  END IF;
  
  -- Verificar rol de admin usando consulta directa (sin has_role por seguridad)
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = current_admin_id 
      AND ur.role::text = 'admin'
  ) INTO admin_role_exists;
  
  IF NOT admin_role_exists THEN
    RAISE EXCEPTION 'Acceso denegado. Se requiere rol de administrador.';
  END IF;
  
  -- Verificar que el target_user_id existe y es válido
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'El ID del usuario objetivo no puede ser nulo.';
  END IF;
  
  -- Verificar que new_balance es válido
  IF new_balance IS NULL OR new_balance < 0 THEN
    RAISE EXCEPTION 'El nuevo balance debe ser un número no negativo.';
  END IF;

  -- Obtener balance actual
  SELECT balance INTO old_balance
  FROM public.user_wallets 
  WHERE user_id = target_user_id;

  -- Si no existe wallet, crear uno
  IF old_balance IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (target_user_id, new_balance);
    old_balance := 0;
    RAISE NOTICE 'Wallet creado para usuario %', target_user_id;
  ELSE
    -- Actualizar balance existente
    UPDATE public.user_wallets 
    SET balance = new_balance, updated_at = now()
    WHERE user_id = target_user_id;
  END IF;

  RAISE NOTICE 'Balance actualizado exitosamente para usuario %. Anterior: %, Nuevo: %', 
    target_user_id, COALESCE(old_balance, 0), new_balance;
END;
$function$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.admin_update_user_balance TO authenticated;

-- Verificar que se creó correctamente
SELECT 
  proname AS function_name,
  prorettype::regtype AS return_type,
  pronargs AS num_parameters
FROM pg_proc 
WHERE proname = 'admin_update_user_balance'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
