-- Remove insecure policy that references user_metadata
DROP POLICY IF EXISTS "jwt_admin_access" ON public.user_roles;