-- Fix the balance system issues
-- Remove the problematic check constraint from wallet_recharge_requests
ALTER TABLE public.wallet_recharge_requests DROP CONSTRAINT IF EXISTS wallet_recharge_requests_amount_check;

-- Recreate the constraint to allow negative amounts (for admin adjustments)
ALTER TABLE public.wallet_recharge_requests ADD CONSTRAINT wallet_recharge_requests_amount_check CHECK (amount >= -999999);

-- Create auctions table for dynamic auction management
CREATE TABLE public.auctions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    current_bid numeric NOT NULL DEFAULT 0.00,
    minimum_bid numeric NOT NULL DEFAULT 1.00,
    bid_increment numeric NOT NULL DEFAULT 1.00,
    end_time timestamp with time zone NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
    image_url text,
    current_bidder text,
    total_bids integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on auctions
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for auctions
CREATE POLICY "Anyone can view active auctions" 
ON public.auctions 
FOR SELECT 
USING (status = 'active' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert auctions" 
ON public.auctions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update auctions" 
ON public.auctions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete auctions" 
ON public.auctions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_auctions_updated_at
BEFORE UPDATE ON public.auctions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample auctions with more wines and knives
INSERT INTO public.auctions (title, description, category, current_bid, minimum_bid, bid_increment, end_time, image_url, current_bidder, total_bids) VALUES
-- Existing categories
('Perfume Chanel No. 5', 'Perfume clásico de lujo', 'Perfumes', 85.50, 50.00, 5.00, now() + interval '2 hours', '/src/assets/product-perfume.jpg', 'Usuario123', 12),
('Whisky Premium', 'Whisky escocés de 18 años', 'Licores', 220.00, 100.00, 10.00, now() + interval '4 hours', '/src/assets/product-premium-spirits.jpg', 'Collector99', 8),
('Set de Herramientas Pro', 'Herramientas profesionales completas', 'Herramientas', 145.00, 80.00, 5.00, now() + interval '6 hours', '/src/assets/product-tools.jpg', 'Builder2024', 15),
('Maquillaje de Lujo', 'Set completo de cosméticos premium', 'Cosméticos', 95.75, 40.00, 2.50, now() + interval '1 hour', '/src/assets/product-luxury-makeup.jpg', 'Beauty_Queen', 22),

-- New Wine auctions
('Vino Tinto Reserva 2015', 'Vino tinto español de reserva, añejado 8 años', 'Vinos', 120.00, 60.00, 5.00, now() + interval '3 hours', '/src/assets/product-premium-spirits.jpg', 'WineLover', 6),
('Champagne Dom Pérignon', 'Champagne francés de lujo, cosecha especial', 'Vinos', 280.00, 150.00, 10.00, now() + interval '5 hours', '/src/assets/product-premium-spirits.jpg', 'Sommelier01', 9),
('Vino Blanco Chardonnay', 'Vino blanco premium de California', 'Vinos', 85.00, 45.00, 5.00, now() + interval '2.5 hours', '/src/assets/product-premium-spirits.jpg', 'CaliforniaFan', 4),
('Vino Rosé Limitado', 'Edición limitada de vino rosé francés', 'Vinos', 150.00, 80.00, 8.00, now() + interval '4.5 hours', '/src/assets/product-premium-spirits.jpg', 'RoseCollector', 7),
('Whisky Single Malt', 'Whisky escocés single malt 25 años', 'Vinos', 450.00, 200.00, 15.00, now() + interval '6 hours', '/src/assets/product-premium-spirits.jpg', 'ScotchMaster', 11),

-- New Knife auctions  
('Navaja Suiza Victorinox', 'Navaja suiza clásica con múltiples herramientas', 'Navajas', 65.00, 30.00, 2.50, now() + interval '3 hours', '/src/assets/product-swiss-knife.jpg', 'OutdoorFan', 8),
('Cuchillo Táctico Militar', 'Cuchillo táctico de grado militar', 'Navajas', 180.00, 90.00, 5.00, now() + interval '4 hours', '/src/assets/product-tactical-gear.jpg', 'TacticalPro', 12),
('Navaja Plegable Premium', 'Navaja plegable de acero japonés', 'Navajas', 220.00, 120.00, 8.00, now() + interval '2 hours', '/src/assets/product-tactical-gear.jpg', 'BladeCollector', 15),
('Set de Cuchillos Chef', 'Set profesional de cuchillos de cocina', 'Navajas', 95.00, 50.00, 3.00, now() + interval '5 hours', '/src/assets/product-tools.jpg', 'ChefMaster', 6),
('Katana Decorativa', 'Réplica de katana japonesa para colección', 'Navajas', 350.00, 180.00, 10.00, now() + interval '6 hours', '/src/assets/product-tactical-gear.jpg', 'SamuraiCollector', 9),
('Navaja Bushcraft', 'Navaja especializada para supervivencia', 'Navajas', 125.00, 70.00, 5.00, now() + interval '3.5 hours', '/src/assets/product-tactical-gear.jpg', 'SurvivalExpert', 4),

-- Ending soon auctions
('Perfume Tom Ford', 'Perfume exclusivo de diseñador', 'Perfumes', 165.00, 90.00, 5.00, now() + interval '15 minutes', '/src/assets/product-luxury-perfumes.jpg', 'LuxuryLover', 18),
('Ron Añejo Especial', 'Ron caribeño añejado 21 años', 'Vinos', 195.00, 100.00, 8.00, now() + interval '8 minutes', '/src/assets/product-premium-spirits.jpg', 'RumConnoisseur', 14);

-- Update the admin_update_user_balance function to handle the recharge approval correctly
CREATE OR REPLACE FUNCTION public.admin_update_user_balance(target_user_id uuid, new_balance numeric, admin_notes text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  old_balance numeric;
  balance_difference numeric;
  wallet_uuid uuid;
BEGIN
  -- Check if current user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Get current balance and wallet id
  SELECT balance, id INTO old_balance, wallet_uuid
  FROM public.user_wallets 
  WHERE user_id = target_user_id;

  IF old_balance IS NULL THEN
    RAISE EXCEPTION 'User wallet not found';
  END IF;

  -- Calculate difference
  balance_difference := new_balance - old_balance;

  -- Update wallet balance
  UPDATE public.user_wallets 
  SET balance = new_balance, updated_at = now()
  WHERE user_id = target_user_id;

  -- Create transaction record
  INSERT INTO public.balance_transactions (
    user_id,
    wallet_id,
    amount,
    transaction_type,
    description,
    reference_number
  )
  VALUES (
    target_user_id,
    wallet_uuid,
    balance_difference,
    CASE 
      WHEN balance_difference > 0 THEN 'admin_credit'
      ELSE 'admin_debit'
    END,
    COALESCE(admin_notes, 'Balance adjusted by admin'),
    'ADMIN-' || EXTRACT(epoch FROM now())::text
  );

  -- Create admin notification
  PERFORM create_admin_notification(
    'balance_update',
    'Balance Updated',
    'User balance updated from ' || old_balance || ' to ' || new_balance,
    jsonb_build_object(
      'user_id', target_user_id,
      'old_balance', old_balance,
      'new_balance', new_balance,
      'admin_notes', admin_notes
    ),
    auth.uid()
  );
END;
$function$;