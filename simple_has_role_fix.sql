-- Simple fix: Just add the missing has_role(uuid, text) overload
-- Don't drop anything, just add what's needed

-- Create the has_role function with text parameter (the one that's missing)
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Convert text to app_role and call the existing function
  RETURN public.has_role(user_id, role_name::app_role);
EXCEPTION
  WHEN invalid_text_representation THEN
    -- If the text can't be converted to app_role, return false
    RETURN FALSE;
END;
$function$;

-- Test that both versions work
SELECT 'has_role overload added successfully!' as status;
SELECT public.has_role(auth.uid(), 'admin'::text) as text_version;
SELECT public.has_role(auth.uid(), 'admin'::app_role) as enum_version;
