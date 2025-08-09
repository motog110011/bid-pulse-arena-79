-- Create app_settings table for globally configurable bank details
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for app_settings
CREATE POLICY "Anyone can view app settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert app settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update app settings" 
ON public.app_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin_notifications table for internal notifications
CREATE TABLE public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid -- which user triggered this notification
);

-- Enable RLS for admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_notifications
CREATE POLICY "Admins can view all notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications" 
ON public.admin_notifications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add new columns to wallet_recharge_requests
ALTER TABLE public.wallet_recharge_requests 
ADD COLUMN payment_proof_url text,
ADD COLUMN admin_comments text;

-- Insert default bank details
INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES 
(
  'bank_details',
  '{
    "bank_name": "Banco Nacional",
    "account_holder": "Empresa Subastas MX",
    "account_number": "1234567890",
    "clabe": "012345678901234567",
    "reference_instructions": "Usar el número de referencia proporcionado en el concepto de pago"
  }'::jsonb,
  'Datos bancarios para transferencias de recarga de billetera'
);

-- Create trigger function to update app_settings updated_at
CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for app_settings
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_app_settings_updated_at();

-- Create function to create admin notifications
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  notification_type text,
  notification_title text,
  notification_message text,
  notification_data jsonb DEFAULT NULL,
  triggering_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, data, user_id)
  VALUES (notification_type, notification_title, notification_message, notification_data, triggering_user_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;