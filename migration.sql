-- ============================================================
-- BID PULSE ARENA — Setup Maestro de Base de Datos
-- Versión limpia y consolidada para Supabase
-- Ejecutar completo en SQL Editor de Supabase
-- ============================================================

-- ============================================================
-- PASO 1: LIMPIAR TODO (tablas en orden inverso de dependencias)
-- ============================================================

DROP TABLE IF EXISTS public.scheduled_auctions CASCADE;
DROP TABLE IF EXISTS public.auction_rotation_logs CASCADE;
DROP TABLE IF EXISTS public.bids CASCADE;
DROP TABLE IF EXISTS public.auctions CASCADE;
DROP TABLE IF EXISTS public.balance_transactions CASCADE;
DROP TABLE IF EXISTS public.admin_notifications CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpiar funciones viejas
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.check_admin_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_setup(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_detailed_users() CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_user_balance(uuid, numeric, text) CASCADE;
DROP FUNCTION IF EXISTS public.place_bid(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.close_expired_auctions() CASCADE;
DROP FUNCTION IF EXISTS public.publish_scheduled_auctions() CASCADE;
DROP FUNCTION IF EXISTS public.generate_scheduled_auctions(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_upcoming_scheduled_auctions(integer) CASCADE;


-- ============================================================
-- PASO 2: TABLAS
-- ============================================================

-- PROFILES: datos públicos del usuario
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- USER_ROLES: rol de cada usuario (admin / user)
CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- USER_WALLETS: saldo virtual de cada usuario
CREATE TABLE public.user_wallets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- BALANCE_TRANSACTIONS: historial de movimientos de saldo
CREATE TABLE public.balance_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES public.user_wallets(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (
    transaction_type IN (
      'admin_credit', 'admin_debit',
      'bid_hold', 'bid_release', 'bid_won',
      'deposit', 'withdrawal'
    )
  ),
  description text,
  reference_number text,
  created_at timestamptz DEFAULT now()
);

-- AUCTIONS: tabla principal de subastas
CREATE TABLE public.auctions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text,
  starting_bid numeric NOT NULL DEFAULT 0 CHECK (starting_bid >= 0),
  minimum_bid numeric NOT NULL DEFAULT 0,
  current_bid numeric NOT NULL DEFAULT 0,
  bid_increment numeric NOT NULL DEFAULT 10,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'ended', 'cancelled', 'draft')),
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_bids integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- BIDS: registro de cada puja
CREATE TABLE public.bids (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  is_winning boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- AUCTION_ROTATION_LOGS: logs de operaciones automatizadas
CREATE TABLE public.auction_rotation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auctions_processed integer DEFAULT 0,
  auctions_renewed integer DEFAULT 0,
  status text DEFAULT 'success',
  details text,
  created_at timestamptz DEFAULT now()
);

-- SCHEDULED_AUCTIONS: subastas programadas para publicación automática
CREATE TABLE public.scheduled_auctions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  starting_bid numeric NOT NULL DEFAULT 0,
  image_url text,
  duration_hours integer NOT NULL DEFAULT 6,
  scheduled_publish_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'published', 'cancelled')),
  published_auction_id uuid REFERENCES public.auctions(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ADMIN_NOTIFICATIONS: notificaciones internas del panel admin
CREATE TABLE public.admin_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);


-- ============================================================
-- PASO 3: ÍNDICES
-- ============================================================

CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_auctions_end_time ON public.auctions(end_time);
CREATE INDEX idx_auctions_category ON public.auctions(category);
CREATE INDEX idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX idx_bids_user_id ON public.bids(user_id);
CREATE INDEX idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX idx_balance_transactions_user_id ON public.balance_transactions(user_id);
CREATE INDEX idx_scheduled_auctions_publish_time ON public.scheduled_auctions(scheduled_publish_time);
CREATE INDEX idx_scheduled_auctions_status ON public.scheduled_auctions(status);


-- ============================================================
-- PASO 4: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_rotation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profile_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profile_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- USER_ROLES (solo lectura para el propio usuario, todo para admins vía función)
CREATE POLICY "roles_select_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- USER_WALLETS
CREATE POLICY "wallet_select_own" ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- BALANCE_TRANSACTIONS
CREATE POLICY "transactions_select_own" ON public.balance_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- AUCTIONS: públicas para lectura, solo admin para escritura
CREATE POLICY "auctions_select_all" ON public.auctions
  FOR SELECT USING (status IN ('active', 'ended'));
CREATE POLICY "auctions_all_admin" ON public.auctions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- BIDS: el usuario ve sus propias pujas; pujas de subasta visibles para todos autenticados
CREATE POLICY "bids_select_authenticated" ON public.bids
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "bids_insert_own" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SCHEDULED_AUCTIONS: solo admins
CREATE POLICY "scheduled_auctions_admin" ON public.scheduled_auctions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- AUCTION_ROTATION_LOGS: solo admins
CREATE POLICY "rotation_logs_admin" ON public.auction_rotation_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ADMIN_NOTIFICATIONS: solo admins
CREATE POLICY "notifications_admin" ON public.admin_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );


-- ============================================================
-- PASO 5: FUNCIONES UTILITARIAS
-- ============================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil, rol y wallet al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (NEW.id, 0.00)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.check_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'admin'
  );
END;
$$;

-- Función para garantizar que un usuario tenga perfil/rol/wallet
CREATE OR REPLACE FUNCTION public.ensure_user_setup(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (p_user_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_wallets (user_id, balance) VALUES (p_user_id, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;


-- ============================================================
-- PASO 6: FUNCIÓN PLACE_BID (puja atómica con validaciones)
-- ============================================================

CREATE OR REPLACE FUNCTION public.place_bid(
  p_auction_id uuid,
  p_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_auction public.auctions%ROWTYPE;
  v_wallet public.user_wallets%ROWTYPE;
  v_prev_winner_id uuid;
  v_prev_bid numeric;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Debes iniciar sesión para pujar.');
  END IF;

  -- Bloquear fila de la subasta para evitar race conditions
  SELECT * INTO v_auction FROM public.auctions
  WHERE id = p_auction_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Subasta no encontrada.');
  END IF;

  IF v_auction.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Esta subasta no está activa.');
  END IF;

  IF now() > v_auction.end_time THEN
    -- Cerrar subasta expirada automáticamente
    UPDATE public.auctions SET status = 'ended', updated_at = now()
    WHERE id = p_auction_id;
    RETURN json_build_object('success', false, 'error', 'Esta subasta ya terminó.');
  END IF;

  IF v_auction.winner_id = v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Ya tienes la puja ganadora.');
  END IF;

  IF p_amount < (v_auction.current_bid + v_auction.bid_increment) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'La puja mínima es $' || (v_auction.current_bid + v_auction.bid_increment)::text
    );
  END IF;

  -- Verificar saldo del usuario
  SELECT * INTO v_wallet FROM public.user_wallets
  WHERE user_id = v_user_id FOR UPDATE;

  IF v_wallet.balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente en tu wallet.');
  END IF;

  -- Guardar puja anterior para liberar hold
  v_prev_winner_id := v_auction.winner_id;
  v_prev_bid       := v_auction.current_bid;

  -- Desmarcar puja anterior como ganadora
  UPDATE public.bids SET is_winning = false
  WHERE auction_id = p_auction_id AND is_winning = true;

  -- Insertar nueva puja
  INSERT INTO public.bids (auction_id, user_id, amount, is_winning)
  VALUES (p_auction_id, v_user_id, p_amount, true);

  -- Actualizar subasta
  UPDATE public.auctions SET
    current_bid = p_amount,
    winner_id   = v_user_id,
    total_bids  = total_bids + 1,
    updated_at  = now()
  WHERE id = p_auction_id;

  -- Retener saldo del nuevo ganador
  UPDATE public.user_wallets
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO public.balance_transactions
    (user_id, wallet_id, amount, transaction_type, description, reference_number)
  VALUES (
    v_user_id, v_wallet.id, -p_amount, 'bid_hold',
    'Hold por puja en subasta: ' || v_auction.title,
    'BID-' || p_auction_id::text
  );

  -- Liberar saldo del ganador anterior
  IF v_prev_winner_id IS NOT NULL AND v_prev_winner_id != v_user_id THEN
    UPDATE public.user_wallets
    SET balance = balance + v_prev_bid, updated_at = now()
    WHERE user_id = v_prev_winner_id;

    INSERT INTO public.balance_transactions
      (user_id, amount, transaction_type, description, reference_number)
    VALUES (
      v_prev_winner_id, v_prev_bid, 'bid_release',
      'Liberación de hold — superado en subasta: ' || v_auction.title,
      'BID-' || p_auction_id::text
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', '¡Puja registrada exitosamente!',
    'new_bid', p_amount
  );
END;
$$;


-- ============================================================
-- PASO 7: FUNCIÓN ADMIN — LISTAR USUARIOS
-- ============================================================

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
  IF NOT public.check_admin_role(auth.uid()) THEN
    RAISE EXCEPTION 'Acceso denegado. Se requiere rol de administrador.';
  END IF;

  -- Garantizar que todos los usuarios tengan setup completo
  PERFORM public.ensure_user_setup(au.id) FROM auth.users au;

  RETURN QUERY
  SELECT
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(ur.role, 'user')     AS role,
    COALESCE(uw.balance, 0.00)    AS balance,
    COALESCE(bt.cnt, 0)           AS transaction_count,
    p.full_name
  FROM auth.users au
  LEFT JOIN public.user_roles ur        ON au.id = ur.user_id
  LEFT JOIN public.user_wallets uw      ON au.id = uw.user_id
  LEFT JOIN public.profiles p           ON au.id = p.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt
    FROM public.balance_transactions
    GROUP BY user_id
  ) bt ON au.id = bt.user_id
  ORDER BY au.created_at DESC;
END;
$$;


-- ============================================================
-- PASO 8: FUNCIÓN ADMIN — ACTUALIZAR SALDO
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_update_user_balance(
  p_target_user_id uuid,
  p_new_balance numeric,
  p_admin_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_balance numeric;
  v_wallet_id uuid;
  v_diff numeric;
BEGIN
  IF NOT public.check_admin_role(auth.uid()) THEN
    RAISE EXCEPTION 'Acceso denegado. Se requiere rol de administrador.';
  END IF;

  IF p_new_balance < 0 THEN
    RAISE EXCEPTION 'El saldo no puede ser negativo.';
  END IF;

  PERFORM public.ensure_user_setup(p_target_user_id);

  SELECT balance, id INTO v_old_balance, v_wallet_id
  FROM public.user_wallets WHERE user_id = p_target_user_id;

  v_diff := p_new_balance - v_old_balance;

  UPDATE public.user_wallets
  SET balance = p_new_balance, updated_at = now()
  WHERE user_id = p_target_user_id;

  INSERT INTO public.balance_transactions
    (user_id, wallet_id, amount, transaction_type, description, reference_number)
  VALUES (
    p_target_user_id, v_wallet_id, v_diff,
    CASE WHEN v_diff >= 0 THEN 'admin_credit' ELSE 'admin_debit' END,
    COALESCE(p_admin_notes, 'Ajuste de saldo por administrador'),
    'ADM-' || extract(epoch FROM now())::bigint::text
  );

  INSERT INTO public.admin_notifications
    (type, title, message, data, user_id)
  VALUES (
    'balance_update',
    'Saldo actualizado',
    'Saldo de usuario actualizado de $' || v_old_balance || ' a $' || p_new_balance,
    jsonb_build_object(
      'target_user_id', p_target_user_id,
      'old_balance', v_old_balance,
      'new_balance', p_new_balance,
      'admin_id', auth.uid(),
      'notes', p_admin_notes
    ),
    auth.uid()
  );
END;
$$;


-- ============================================================
-- PASO 9: FUNCIÓN — CERRAR SUBASTAS EXPIRADAS
-- ============================================================

CREATE OR REPLACE FUNCTION public.close_expired_auctions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_closed integer := 0;
  v_auction public.auctions%ROWTYPE;
BEGIN
  FOR v_auction IN
    SELECT * FROM public.auctions
    WHERE status = 'active' AND end_time <= now()
    FOR UPDATE
  LOOP
    UPDATE public.auctions
    SET status = 'ended', updated_at = now()
    WHERE id = v_auction.id;

    v_closed := v_closed + 1;
  END LOOP;

  INSERT INTO public.auction_rotation_logs
    (auctions_processed, auctions_renewed, status, details)
  VALUES (v_closed, v_closed, 'success',
    'Cerradas ' || v_closed || ' subastas expiradas automáticamente');

  RETURN json_build_object('success', true, 'closed', v_closed);
END;
$$;


-- ============================================================
-- PASO 10: FUNCIÓN — PUBLICAR SUBASTAS PROGRAMADAS
-- ============================================================

CREATE OR REPLACE FUNCTION public.publish_scheduled_auctions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sched public.scheduled_auctions%ROWTYPE;
  v_new_auction_id uuid;
  v_published integer := 0;
BEGIN
  FOR v_sched IN
    SELECT * FROM public.scheduled_auctions
    WHERE status = 'scheduled' AND scheduled_publish_time <= now()
    ORDER BY scheduled_publish_time ASC
    FOR UPDATE
  LOOP
    BEGIN
      INSERT INTO public.auctions (
        title, description, category,
        starting_bid, minimum_bid, current_bid,
        bid_increment, end_time, status,
        image_url, total_bids, created_by
      ) VALUES (
        v_sched.title,
        v_sched.description,
        v_sched.category,
        v_sched.starting_bid,
        v_sched.starting_bid,
        v_sched.starting_bid,
        CASE
          WHEN v_sched.starting_bid < 50  THEN 5
          WHEN v_sched.starting_bid < 100 THEN 10
          WHEN v_sched.starting_bid < 200 THEN 15
          WHEN v_sched.starting_bid < 500 THEN 25
          ELSE 50
        END,
        now() + (v_sched.duration_hours * INTERVAL '1 hour'),
        'active',
        v_sched.image_url,
        0,
        v_sched.created_by
      ) RETURNING id INTO v_new_auction_id;

      UPDATE public.scheduled_auctions SET
        status = 'published',
        published_auction_id = v_new_auction_id,
        updated_at = now()
      WHERE id = v_sched.id;

      v_published := v_published + 1;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error publicando subasta programada %: %', v_sched.id, SQLERRM;
    END;
  END LOOP;

  INSERT INTO public.auction_rotation_logs
    (auctions_processed, auctions_renewed, status, details)
  VALUES (v_published, v_published,
    CASE WHEN v_published > 0 THEN 'success' ELSE 'no_action' END,
    'Publicadas ' || v_published || ' subastas programadas');

  RETURN json_build_object('success', true, 'published', v_published);
END;
$$;


-- ============================================================
-- PASO 11: TRIGGERS
-- ============================================================

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_user_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_auctions_updated_at
  BEFORE UPDATE ON public.auctions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_scheduled_auctions_updated_at
  BEFORE UPDATE ON public.scheduled_auctions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger que inicializa perfil/rol/wallet al crear usuario
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- PASO 12: PERMISOS DE EJECUCIÓN
-- ============================================================

GRANT EXECUTE ON FUNCTION public.place_bid(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_detailed_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_balance(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_expired_auctions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_scheduled_auctions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_setup(uuid) TO authenticated;


-- ============================================================
-- PASO 13: HABILITAR REALTIME EN TABLAS CLAVE
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_wallets;


-- ============================================================
-- PASO 14: DATOS DE PRUEBA (opcional, comentado por default)
-- ============================================================

-- Insertar subastas de muestra para probar el frontend:
/*
INSERT INTO public.auctions (title, description, category, starting_bid, minimum_bid, current_bid, bid_increment, end_time, status, image_url, total_bids)
VALUES
  ('iPhone 15 Pro Max 256GB — Confiscado en Aduana', 'Teléfono en excelente estado, desbloqueado. Cargador incluido.', 'Electrónicos', 150, 150, 150, 25, now() + INTERVAL '6 hours', 'active', null, 0),
  ('Rolex Submariner Automático — Equipaje no reclamado', 'Reloj en estado 9/10, brazalete original, sin caja.', 'Relojes', 300, 300, 300, 50, now() + INTERVAL '12 hours', 'active', null, 0),
  ('Chanel No. 5 100ml EDP — Olvidado en vuelo', 'Perfume original sellado de fábrica.', 'Perfumes', 30, 30, 30, 5, now() + INTERVAL '3 hours', 'active', null, 0);
*/

-- ============================================================
-- PASO 15: ASIGNAR ROL ADMIN A TU USUARIO
-- IMPORTANTE: reemplaza 'tu@email.com' con tu email real
-- ============================================================

/*
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'tu@email.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
*/

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

SELECT
  'profiles'              AS tabla, count(*) FROM public.profiles UNION ALL
SELECT 'user_roles',              count(*) FROM public.user_roles UNION ALL
SELECT 'user_wallets',            count(*) FROM public.user_wallets UNION ALL
SELECT 'auctions',                count(*) FROM public.auctions UNION ALL
SELECT 'bids',                    count(*) FROM public.bids UNION ALL
SELECT 'balance_transactions',    count(*) FROM public.balance_transactions UNION ALL
SELECT 'scheduled_auctions',      count(*) FROM public.scheduled_auctions UNION ALL
SELECT 'auction_rotation_logs',   count(*) FROM public.auction_rotation_logs UNION ALL
SELECT 'admin_notifications',     count(*) FROM public.admin_notifications
ORDER BY 1;