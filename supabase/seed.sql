-- ============================================================
-- SEED — Funciones auxiliares + 20 subastas de prueba
-- Ejecutar DESPUÉS de migration.sql
-- ============================================================


-- ============================================================
-- FUNCIONES AUXILIARES (que el frontend necesita)
-- ============================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(role, 'user')
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon;

-- Compatibilidad: has_role(uuid, text) usado en algunas políticas
CREATE OR REPLACE FUNCTION public.has_role(p_user_id uuid, p_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;

-- Retorna subastas activas en orden aleatorio con nombre del ganador actual
CREATE OR REPLACE FUNCTION public.get_random_auctions()
RETURNS TABLE (
  id              uuid,
  title           text,
  description     text,
  category        text,
  current_bid     numeric,
  minimum_bid     numeric,
  bid_increment   numeric,
  image_url       text,
  end_time        timestamptz,
  status          text,
  current_bidder  text,
  total_bids      integer,
  created_at      timestamptz,
  updated_at      timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    a.id,
    a.title,
    a.description,
    a.category,
    a.current_bid,
    a.minimum_bid,
    a.bid_increment,
    a.image_url,
    a.end_time,
    a.status,
    COALESCE(p.full_name, split_part(u.email, '@', 1)) AS current_bidder,
    a.total_bids,
    a.created_at,
    a.updated_at
  FROM public.auctions a
  LEFT JOIN auth.users  u ON u.id = a.winner_id
  LEFT JOIN public.profiles p ON p.id = a.winner_id
  WHERE a.status = 'active'
    AND a.end_time > now()
  ORDER BY random();
$$;

GRANT EXECUTE ON FUNCTION public.get_random_auctions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_random_auctions() TO anon;


-- ============================================================
-- 20 SUBASTAS DE PRUEBA
-- Distribuidas en 6 categorías, con end_time variados (1h–48h)
-- ============================================================

INSERT INTO public.auctions
  (title, description, category, starting_bid, minimum_bid, current_bid, bid_increment, end_time, status, image_url, total_bids)
VALUES

-- PERFUMES (4)
(
  'Chanel No. 5 EDP 100ml — Olvidado en sala de abordaje',
  'Perfume original sellado de fábrica. Fragancia icónica para mujer. Sin caja exterior pero frasco intacto.',
  'Perfumes', 35, 35, 35, 5,
  now() + INTERVAL '2 hours 30 minutes', 'active', NULL, 0
),
(
  'Dior Sauvage EDT 200ml — Confiscado en revisión de equipaje',
  'Frasco grande en perfecto estado. Uno de los perfumes masculinos más vendidos del mundo.',
  'Perfumes', 45, 45, 45, 5,
  now() + INTERVAL '8 hours', 'active', NULL, 0
),
(
  'YSL Black Opium EDP 90ml — Equipaje no reclamado',
  'Perfume femenino de alta gama. Notas de café negro, vainilla y flor blanca. Frasco con pequeño rayón en base.',
  'Perfumes', 40, 40, 40, 5,
  now() + INTERVAL '18 hours', 'active', NULL, 0
),
(
  'Versace Eros Pour Femme 100ml — Olvidado en vuelo CDMX–Miami',
  'Perfume original con caja. Sellado. Aduana lo clasificó como exceso de perfume personal.',
  'Perfumes', 38, 38, 38, 5,
  now() + INTERVAL '36 hours', 'active', NULL, 0
),

-- LICORES (4)
(
  'Johnnie Walker Black Label 750ml — Decomisado en aduana',
  'Botella sellada, etiqueta en excelente estado. Pasajero excedió límite de litros permitidos.',
  'Licores', 28, 28, 28, 5,
  now() + INTERVAL '1 hour 45 minutes', 'active', NULL, 0
),
(
  'Hennessy VSOP 700ml — Confiscado vuelo internacional',
  'Cognac francés, botella original sellada. Sin caja. Excelente estado.',
  'Licores', 45, 45, 45, 5,
  now() + INTERVAL '6 hours 15 minutes', 'active', NULL, 0
),
(
  'Don Julio 1942 Añejo 750ml — Equipaje no reclamado',
  'Tequila premium mexicano de añejamiento 30 meses. Botella sellada, edición estándar.',
  'Licores', 80, 80, 80, 10,
  now() + INTERVAL '24 hours', 'active', NULL, 0
),
(
  'Macallan 12 años Double Cask 700ml — Olvidado en sala VIP',
  'Single malt whisky escocés. Botella sellada con caja original. Uno de los más buscados.',
  'Licores', 95, 95, 95, 10,
  now() + INTERVAL '42 hours', 'active', NULL, 0
),

-- VINOS (3)
(
  'Vino tinto Caymus Cabernet Sauvignon 750ml — Confiscado',
  'Vino californiano de culto. Cosecha 2021. Botella intacta, corcho en perfecto estado.',
  'Vinos', 22, 22, 22, 3,
  now() + INTERVAL '4 hours', 'active', NULL, 0
),
(
  'Opus One 2019 750ml — Equipaje no reclamado',
  'Blend napa valley. Botella sin caja. Una de las etiquetas más reconocidas de California.',
  'Vinos', 120, 120, 120, 15,
  now() + INTERVAL '12 hours', 'active', NULL, 0
),
(
  'Moët & Chandon Impérial Brut 750ml — Olvidado en terminal',
  'Champán francés clásico. Botella fría al momento del decomiso. Mantiene presión.',
  'Vinos', 32, 32, 32, 5,
  now() + INTERVAL '30 hours', 'active', NULL, 0
),

-- NAVAJAS (3)
(
  'Victorinox Swiss Champ 91mm — Confiscado en arco de seguridad',
  'Navaja suiza original con 33 funciones. Mango rojo. Sin desgaste visible.',
  'Navajas', 18, 18, 18, 3,
  now() + INTERVAL '3 hours 20 minutes', 'active', NULL, 0
),
(
  'Leatherman Wave Plus Acero inoxidable — Decomisado en revisión',
  'Multitool completo con 18 herramientas. Incluye funda de cuero original.',
  'Navajas', 42, 42, 42, 5,
  now() + INTERVAL '10 hours', 'active', NULL, 0
),
(
  'Benchmade Bugout 535 — Confiscado por aduana',
  'Navaja de hoja CPM-S30V. Apertura AXIS. Peso 56g. En muy buen estado.',
  'Navajas', 65, 65, 65, 8,
  now() + INTERVAL '28 hours', 'active', NULL, 0
),

-- HERRAMIENTAS (3)
(
  'Anker PowerCore 26800mAh — Equipaje no reclamado',
  'Batería portátil de alta capacidad con 3 puertos USB. Ciclos de carga: estimado <10.',
  'Herramientas', 25, 25, 25, 5,
  now() + INTERVAL '5 hours', 'active', NULL, 0
),
(
  'Bosch GLM 50 C Medidor láser — Confiscado en revisión',
  'Medidor de distancia Bluetooth 50m. Con estuche. Baterías incluidas.',
  'Herramientas', 55, 55, 55, 8,
  now() + INTERVAL '16 hours', 'active', NULL, 0
),
(
  'Fluke 117 Multímetro digital — Equipaje no reclamado 6 meses',
  'Multímetro profesional sin contacto de voltaje VoltAlert. Con puntas y estuche.',
  'Herramientas', 90, 90, 90, 10,
  now() + INTERVAL '44 hours', 'active', NULL, 0
),

-- COSMÉTICOS (3)
(
  'Set MAC Studio Fix Foundation + Polvo — Olvidado en vuelo',
  'Base SPF 15 tono NC35 + polvo Studio Fix. Ambos sin abrir. Set valorado en $850.',
  'Cosméticos', 15, 15, 15, 3,
  now() + INTERVAL '7 hours', 'active', NULL, 0
),
(
  'Charlotte Tilbury Pillow Talk Kit 4 piezas — Confiscado',
  'Labial + delineador + iluminador + base. Todos sellados. Tono Pillow Talk original.',
  'Cosméticos', 28, 28, 28, 5,
  now() + INTERVAL '20 hours', 'active', NULL, 0
),
(
  'La Mer Crème de la Mer 30ml — Equipaje no reclamado',
  'Crema facial de lujo. Frasco sellado, sin abrir. Fecha de vencimiento: 2027.',
  'Cosméticos', 55, 55, 55, 8,
  now() + INTERVAL '46 hours', 'active', NULL, 0
);


-- ============================================================
-- HABILITAR REALTIME (si no está ya en migration.sql)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'auctions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bids'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
  END IF;
END $$;


-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT category, count(*) AS total
FROM public.auctions
GROUP BY category
ORDER BY category;
