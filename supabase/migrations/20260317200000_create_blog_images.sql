-- Create blog_images table and blog-images storage bucket
-- This migration is fully idempotent (safe to run multiple times)

-- 1. Create the blog_images table -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path  text NOT NULL,
  original_name text NOT NULL,
  file_size     bigint NOT NULL DEFAULT 0,
  width         integer,
  height        integer,
  mime_type     text NOT NULL DEFAULT 'image/png',
  is_optimized  boolean NOT NULL DEFAULT false,
  blog_post_id  uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  uploaded_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_blog_images_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_blog_images_updated_at ON public.blog_images;
CREATE TRIGGER set_blog_images_updated_at
  BEFORE UPDATE ON public.blog_images
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_images_updated_at();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS blog_images_created_at_idx  ON public.blog_images (created_at DESC);
CREATE INDEX IF NOT EXISTS blog_images_blog_post_id_idx ON public.blog_images (blog_post_id);
CREATE INDEX IF NOT EXISTS blog_images_uploaded_by_idx  ON public.blog_images (uploaded_by);

-- 2. Enable RLS and create policies --------------------------------------------
ALTER TABLE public.blog_images ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'blog_images'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.blog_images', pol);
  END LOOP;
END $$;

-- Public can read all image metadata (needed for blog rendering)
CREATE POLICY "blog-images-public-select"
  ON public.blog_images FOR SELECT
  USING (true);

-- Any authenticated user can insert (admin check is done in the app)
CREATE POLICY "blog-images-authenticated-insert"
  ON public.blog_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Any authenticated user can update
CREATE POLICY "blog-images-authenticated-update"
  ON public.blog_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Any authenticated user can delete
CREATE POLICY "blog-images-authenticated-delete"
  ON public.blog_images FOR DELETE
  TO authenticated
  USING (true);

-- 3. Create the blog-images storage bucket -------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760,  -- 10 MB
  ARRAY['image/png','image/jpeg','image/jpg','image/gif','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 10485760,
  allowed_mime_types = ARRAY['image/png','image/jpeg','image/jpg','image/gif','image/webp','image/svg+xml'];

-- 4. Storage bucket RLS policies -----------------------------------------------

-- Drop old storage policies for this bucket
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (policyname LIKE '%blog-images%' OR policyname LIKE '%blog image%' OR policyname LIKE '%Blog image%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol);
  END LOOP;
END $$;

-- Public read access
CREATE POLICY "blog-images-public-read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Authenticated users can upload
CREATE POLICY "blog-images-authenticated-insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

-- Authenticated users can update (replace/compress/resize)
CREATE POLICY "blog-images-authenticated-update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images')
  WITH CHECK (bucket_id = 'blog-images');

-- Authenticated users can delete
CREATE POLICY "blog-images-authenticated-delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
