-- Final fix: Create has_role function that works directly with the database
-- No enum types needed

-- Create the has_role function with text parameter
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if user_id and role_name are provided
  IF user_id IS NULL OR role_name IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check directly in user_roles table
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = has_role.user_id 
    AND ur.role = role_name
  );
END;
$function$;

-- Test the function
SELECT 'has_role function created successfully!' as status;

-- Show what's in user_roles table to verify structure
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles';
