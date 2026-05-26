-- ============================================================
-- CREAR USUARIO ADMIN DIRECTAMENTE
-- Ejecutar en Supabase SQL Editor (tiene acceso a auth.users)
--
-- Opción A: el usuario ya existe (incluso sin confirmar email)
-- Opción B: crear el usuario completo desde SQL
-- ============================================================


-- ============================================================
-- OPCIÓN A — El usuario ya existe, solo hacerlo admin
-- Usa esto si ya te registraste pero no pudiste iniciar sesión
-- Reemplaza el email abajo con el tuyo
-- ============================================================

DO $$
DECLARE
  v_user_id uuid;
  v_email   text := 'motog110011@gmail.com';  -- <-- CAMBIA SI ES NECESARIO
BEGIN
  -- Buscar usuario, incluyendo los que no confirmaron email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  -- Si no existe, saltar al bloque de crear usuario (Opción B abajo)
  IF v_user_id IS NULL THEN
    RAISE NOTICE '% no está en auth.users. Ejecuta la Opción B abajo.', v_email;
    RETURN;
  END IF;

  -- Confirmar el email si aún no está confirmado (salta el paso de verificación)
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at         = now()
  WHERE id = v_user_id;

  -- Asegurar que tiene perfil, rol y wallet
  INSERT INTO public.profiles (id) VALUES (v_user_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_wallets (user_id, balance) VALUES (v_user_id, 1000)
  ON CONFLICT (user_id) DO UPDATE SET balance = GREATEST(user_wallets.balance, 1000);

  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = now();

  RAISE NOTICE '✓ % es ahora admin con email confirmado y $1000 en wallet', v_email;
END $$;


-- ============================================================
-- OPCIÓN B — El usuario NO existe, crearlo desde SQL
-- Descomenta este bloque si la Opción A no encontró al usuario
-- Reemplaza email y contraseña
-- ============================================================

/*
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_email   text := 'motog110011@gmail.com';    -- <-- TU EMAIL
  v_pass    text := 'Admin2024!';               -- <-- TU CONTRASEÑA
BEGIN
  -- Insertar usuario directamente en auth.users
  -- La contraseña se guarda como bcrypt — Supabase la validará al login
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    v_email,
    crypt(v_pass, gen_salt('bf')),
    now(),   -- email ya confirmado
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING;

  -- Obtener el ID real (por si ya existía)
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  -- Crear perfil, rol admin y wallet con saldo inicial
  INSERT INTO public.profiles (id, full_name) VALUES (v_user_id, 'Admin')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  INSERT INTO public.user_wallets (user_id, balance) VALUES (v_user_id, 1000)
  ON CONFLICT (user_id) DO UPDATE SET balance = 1000;

  RAISE NOTICE '✓ Usuario admin creado: % / %', v_email, v_pass;
END $$;
*/


-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmado,
  ur.role,
  uw.balance
FROM auth.users u
LEFT JOIN public.user_roles   ur ON ur.user_id = u.id
LEFT JOIN public.user_wallets uw ON uw.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
