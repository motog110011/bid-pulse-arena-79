-- Fix security warnings by setting search_path for functions

-- Update app_settings trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update admin notification function with proper search_path
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  notification_type text,
  notification_title text,
  notification_message text,
  notification_data jsonb DEFAULT NULL,
  triggering_user_id uuid DEFAULT NULL
)
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, data, user_id)
  VALUES (notification_type, notification_title, notification_message, notification_data, triggering_user_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;