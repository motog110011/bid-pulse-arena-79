-- Fix foreign key constraint for wallet_recharge_requests to point to auth.users
ALTER TABLE public.wallet_recharge_requests 
DROP CONSTRAINT IF EXISTS wallet_recharge_requests_user_id_fkey;

ALTER TABLE public.wallet_recharge_requests 
ADD CONSTRAINT wallet_recharge_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update handle_new_user function to also create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create user role (default: user)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create user wallet with $0 balance
  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  -- Create user profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users who don't have them
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
SELECT 
  au.id, 
  COALESCE(au.raw_user_meta_data ->> 'full_name', '') as full_name,
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;