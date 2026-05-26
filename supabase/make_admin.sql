-- ============================================================
-- ASIGNAR ROL ADMIN
-- Ejecutar en el SQL Editor de Supabase
-- Reemplaza 'tu@email.com' con tu email real
-- ============================================================

DO $$
DECLARE
  v_user_id uuid;
  v_email   text := 'tu@email.com';  -- <-- CAMBIA ESTO
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe un usuario con email: %', v_email;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = now();

  -- Asegurarse de que tenga wallet y perfil
  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (v_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.profiles (id)
  VALUES (v_user_id)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Usuario % ahora es admin', v_email;
END $$;

-- Verificar
SELECT
  u.email,
  ur.role,
  uw.balance
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.user_wallets uw ON uw.user_id = u.id
WHERE ur.role = 'admin';
