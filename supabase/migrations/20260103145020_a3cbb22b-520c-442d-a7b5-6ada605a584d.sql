-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images', 
  'blog-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to blog images
CREATE POLICY "Blog images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create a table to track image metadata and usage
CREATE TABLE public.blog_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  mime_type TEXT NOT NULL,
  is_optimized BOOLEAN DEFAULT false,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blog_images
ALTER TABLE public.blog_images ENABLE ROW LEVEL SECURITY;

-- Public can view images metadata
CREATE POLICY "Anyone can view blog images metadata"
ON public.blog_images FOR SELECT
USING (true);

-- Admins can manage blog images
CREATE POLICY "Admins can insert blog images"
ON public.blog_images FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blog images"
ON public.blog_images FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog images"
ON public.blog_images FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_blog_images_updated_at
BEFORE UPDATE ON public.blog_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();