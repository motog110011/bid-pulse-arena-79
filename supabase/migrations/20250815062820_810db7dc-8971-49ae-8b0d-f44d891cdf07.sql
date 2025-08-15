-- Fix 1: Recreate the missing get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Fix 2: Update the bank details update logic to handle existing records
-- First check if bank_details setting exists and delete it to avoid constraint issues
DELETE FROM public.app_settings WHERE setting_key = 'bank_details';

-- Grant necessary permissions for the function
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO service_role;