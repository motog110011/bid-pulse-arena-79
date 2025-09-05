-- Create storage bucket for auction images
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('auction-images', 'auction-images', true, 
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 
        5242880); -- 5MB limit

-- Create storage policies for auction images
CREATE POLICY "Public can view auction images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'auction-images');

CREATE POLICY "Admins can upload auction images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'auction-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update auction images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'auction-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete auction images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'auction-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Add image_file column to auctions table for Supabase Storage URLs
ALTER TABLE public.auctions 
ADD COLUMN image_file TEXT;