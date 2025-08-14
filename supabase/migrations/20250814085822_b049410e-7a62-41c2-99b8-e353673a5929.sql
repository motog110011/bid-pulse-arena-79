-- Fix the database constraints and functions for proper admin panel functionality

-- Drop and recreate the amount check constraint to be more permissive
ALTER TABLE public.wallet_recharge_requests DROP CONSTRAINT IF EXISTS wallet_recharge_requests_amount_check;
ALTER TABLE public.wallet_recharge_requests ADD CONSTRAINT wallet_recharge_requests_amount_check CHECK (amount >= 0.01);

-- Ensure auctions table has proper structure
DO $$ 
BEGIN
    -- Check if auctions table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auctions') THEN
        CREATE TABLE public.auctions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            title text NOT NULL,
            description text,
            category text NOT NULL,
            current_bid numeric NOT NULL DEFAULT 0.00,
            minimum_bid numeric NOT NULL DEFAULT 1.00,
            bid_increment numeric NOT NULL DEFAULT 1.00,
            end_time timestamp with time zone NOT NULL,
            status text NOT NULL DEFAULT 'active'::text,
            image_url text,
            current_bidder text,
            total_bids integer NOT NULL DEFAULT 0,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
        );
        
        -- Enable RLS on auctions
        ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for auctions
        CREATE POLICY "Anyone can view active auctions" ON public.auctions
        FOR SELECT USING (status = 'active' OR has_role(auth.uid(), 'admin'::app_role));
        
        CREATE POLICY "Admins can insert auctions" ON public.auctions
        FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
        
        CREATE POLICY "Admins can update auctions" ON public.auctions
        FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
        
        CREATE POLICY "Admins can delete auctions" ON public.auctions
        FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
        
        -- Add trigger for updated_at
        CREATE TRIGGER update_auctions_updated_at
        BEFORE UPDATE ON public.auctions
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Fix the admin_update_user_balance function to handle the constraint properly
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

  -- Validate new_balance is not negative
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Balance cannot be negative';
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
      WHEN balance_difference < 0 THEN 'admin_debit'
      ELSE 'admin_adjustment'
    END,
    COALESCE(admin_notes, 'Balance adjusted by admin'),
    'ADMIN-' || EXTRACT(epoch FROM now())::text
  );

  -- Create admin notification
  BEGIN
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
  EXCEPTION
    WHEN undefined_function THEN
      -- If the notification function doesn't exist, just continue
      NULL;
  END;
END;
$function$;

-- Insert some sample auctions if none exist
INSERT INTO public.auctions (title, description, category, minimum_bid, bid_increment, end_time, image_url, status)
SELECT * FROM (VALUES
  ('Vino Reserva Premium 2018', 'Excelente vino tinto de reserva con notas de frutas maduras y roble', 'Vinos', 150.00, 10.00, (now() + interval '7 days'), '/src/assets/product-liquor.jpg', 'active'),
  ('Vino Blanco Chardonnay', 'Vino blanco fresco con toques cítricos y minerales', 'Vinos', 80.00, 5.00, (now() + interval '5 days'), '/src/assets/product-liquor.jpg', 'active'),
  ('Navaja Suiza Profesional', 'Navaja multiusos con 15 herramientas diferentes', 'Navajas', 45.00, 2.50, (now() + interval '10 days'), '/src/assets/product-swiss-knife.jpg', 'active'),
  ('Navaja de Colección Vintage', 'Navaja antigua de colección con mango de madera', 'Navajas', 120.00, 8.00, (now() + interval '12 days'), '/src/assets/product-swiss-knife.jpg', 'active'),
  ('Set de Vinos Españoles', 'Colección de 3 vinos españoles de diferentes regiones', 'Vinos', 200.00, 15.00, (now() + interval '8 days'), '/src/assets/product-liquor.jpg', 'active'),
  ('Navaja Táctica Militar', 'Navaja táctica de grado militar con funda incluida', 'Navajas', 75.00, 5.00, (now() + interval '6 days'), '/src/assets/product-tactical-gear.jpg', 'active')
) AS sample_auctions(title, description, category, minimum_bid, bid_increment, end_time, image_url, status)
WHERE NOT EXISTS (SELECT 1 FROM public.auctions LIMIT 1);