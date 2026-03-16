-- Fix RLS policies for blog images and their storage objects
-- so that authenticated admin users can reliably list and upload images.

-- Storage bucket policies --------------------------------------------------

-- Drop existing storage policies if they exist (names must match prior migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Blog images are publicly accessible'
  ) THEN
    DROP POLICY "Blog images are publicly accessible" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can upload blog images'
  ) THEN
    DROP POLICY "Admins can upload blog images" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can update blog images'
  ) THEN
    DROP POLICY "Admins can update blog images" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can delete blog images'
  ) THEN
    DROP POLICY "Admins can delete blog images" ON storage.objects;
  END IF;
END
$$;

-- Public can read all files from the blog-images bucket
CREATE POLICY "blog-images-public-read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

-- Any authenticated user can upload to the blog-images bucket
CREATE POLICY "blog-images-authenticated-insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Any authenticated user can update objects they can see in the blog-images bucket
CREATE POLICY "blog-images-authenticated-update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

-- Any authenticated user can delete objects in the blog-images bucket
CREATE POLICY "blog-images-authenticated-delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');


-- blog_images table policies -----------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_images'
      AND policyname = 'Anyone can view blog images metadata'
  ) THEN
    DROP POLICY "Anyone can view blog images metadata" ON public.blog_images;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_images'
      AND policyname = 'Admins can insert blog images'
  ) THEN
    DROP POLICY "Admins can insert blog images" ON public.blog_images;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_images'
      AND policyname = 'Admins can update blog images'
  ) THEN
    DROP POLICY "Admins can update blog images" ON public.blog_images;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_images'
      AND policyname = 'Admins can delete blog images'
  ) THEN
    DROP POLICY "Admins can delete blog images" ON public.blog_images;
  END IF;
END
$$;

-- Anyone (including anon) can read image metadata, required for public blogs
CREATE POLICY "blog-images-public-select"
ON public.blog_images
FOR SELECT
USING (true);

-- Authenticated users can insert metadata rows (used by the admin UI)
CREATE POLICY "blog-images-authenticated-insert"
ON public.blog_images
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update metadata rows
CREATE POLICY "blog-images-authenticated-update"
ON public.blog_images
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete metadata rows
CREATE POLICY "blog-images-authenticated-delete"
ON public.blog_images
FOR DELETE
TO authenticated
USING (true);

