-- Setup Dynamic Auction Rotation System
-- Run this in your Supabase SQL Editor

-- 1. Enable pg_cron extension (if not already enabled)
-- This might require superuser privileges, so it may need to be done by Supabase support
-- or through the Supabase dashboard extensions panel

-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create a function to call the auction-rotator edge function automatically
CREATE OR REPLACE FUNCTION public.rotate_auctions_automatically()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  response_code int;
  response_text text;
BEGIN
  -- Call the auction-rotator edge function
  -- Note: In production, you'd use the actual URL of your deployed function
  SELECT 
    status_code, 
    content::text 
  INTO response_code, response_text
  FROM http_post(
    'https://your-project-ref.supabase.co/functions/v1/auction-rotator',
    '{}',
    'application/json'
  );

  -- Log the result
  IF response_code = 200 THEN
    RAISE NOTICE 'Auction rotation completed successfully: %', response_text;
  ELSE
    RAISE WARNING 'Auction rotation failed with status %: %', response_code, response_text;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in automatic auction rotation: %', SQLERRM;
END;
$function$;

-- 3. Manual trigger function (for testing)
CREATE OR REPLACE FUNCTION public.manual_auction_rotation()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result json;
BEGIN
  PERFORM public.rotate_auctions_automatically();
  
  result := json_build_object(
    'success', true,
    'message', 'Manual auction rotation triggered',
    'timestamp', now()
  );
  
  RETURN result;
END;
$function$;

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.rotate_auctions_automatically() TO authenticated;
GRANT EXECUTE ON FUNCTION public.manual_auction_rotation() TO authenticated;

-- 5. Setup instructions (comments for manual setup)
/*
To set up automatic auction rotation:

Option A: Using Supabase Cron Jobs (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to Database > Cron Jobs
3. Create a new cron job with:
   - Name: "Dynamic Auction Rotation"
   - Schedule: "0 */2 * * *" (every 2 hours)
   - Command: "SELECT public.rotate_auctions_automatically();"

Option B: Using pg_cron (if enabled)
1. Enable pg_cron extension in your database
2. Run this SQL:
   SELECT cron.schedule(
     'auction-rotation',
     '0 */2 * * *',  -- Every 2 hours
     'SELECT public.rotate_auctions_automatically();'
   );

Option C: External Service (Alternatives)
- Use GitHub Actions with scheduled workflows
- Use Vercel Cron Jobs
- Use external cron services like cron-job.org
- Use Supabase Edge Functions with scheduled triggers

For testing, you can manually run:
SELECT public.manual_auction_rotation();
*/

-- 6. Create auction activity log table (optional)
CREATE TABLE IF NOT EXISTS public.auction_rotation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rotation_time timestamp with time zone DEFAULT now(),
  auctions_processed int DEFAULT 0,
  auctions_renewed int DEFAULT 0,
  status text DEFAULT 'success',
  details text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for the log table
ALTER TABLE public.auction_rotation_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading logs for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.auction_rotation_logs
FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Enhanced logging function
CREATE OR REPLACE FUNCTION public.log_auction_rotation(
  processed_count int,
  renewed_count int,
  rotation_status text DEFAULT 'success',
  rotation_details text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.auction_rotation_logs (
    auctions_processed,
    auctions_renewed,
    status,
    details
  ) VALUES (
    processed_count,
    renewed_count,
    rotation_status,
    rotation_details
  );
END;
$function$;

-- 8. Query to check recent rotation activity
/*
To check recent auction rotation activity, run:

SELECT 
  rotation_time,
  auctions_processed,
  auctions_renewed,
  status,
  details
FROM public.auction_rotation_logs
ORDER BY rotation_time DESC
LIMIT 10;
*/

-- 9. Test the system
SELECT 'Dynamic auction rotation system setup complete!' as status;

-- Test manual rotation (uncomment to test)
-- SELECT public.manual_auction_rotation();

-- 10. Instructions for deployment
SELECT 'Next steps:
1. Deploy the updated auction-rotator edge function to Supabase
2. Set up a cron job using one of the methods described above
3. Test with: SELECT public.manual_auction_rotation();
4. Monitor logs with: SELECT * FROM public.auction_rotation_logs ORDER BY rotation_time DESC;

Your auctions will now automatically rotate with dynamic, unique products!
' as instructions;
