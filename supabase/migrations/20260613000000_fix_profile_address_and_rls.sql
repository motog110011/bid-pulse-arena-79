-- ============================================================
-- Fix 1: Add shipping address + ID document fields to profiles
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS shipping_full_name  text,
  ADD COLUMN IF NOT EXISTS shipping_phone      text,
  ADD COLUMN IF NOT EXISTS shipping_street     text,
  ADD COLUMN IF NOT EXISTS shipping_colony     text,
  ADD COLUMN IF NOT EXISTS shipping_city       text,
  ADD COLUMN IF NOT EXISTS shipping_state      text,
  ADD COLUMN IF NOT EXISTS shipping_zip_code   text,
  ADD COLUMN IF NOT EXISTS shipping_references text,
  ADD COLUMN IF NOT EXISTS id_document_url     text;

-- ============================================================
-- Fix 2: RLS policies for wallet_recharge_requests
-- Users can only insert and view their own requests
-- ============================================================
ALTER TABLE public.wallet_recharge_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own recharge requests" ON public.wallet_recharge_requests;
CREATE POLICY "Users can insert own recharge requests"
  ON public.wallet_recharge_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own recharge requests" ON public.wallet_recharge_requests;
CREATE POLICY "Users can view own recharge requests"
  ON public.wallet_recharge_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- Fix 3: Storage bucket for ID documents (if not exists)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identificaciones',
  'identificaciones',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own ID" ON storage.objects;
CREATE POLICY "Users upload own ID"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'identificaciones' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users read own ID" ON storage.objects;
CREATE POLICY "Users read own ID"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'identificaciones' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Admins read all IDs" ON storage.objects;
CREATE POLICY "Admins read all IDs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'identificaciones'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
