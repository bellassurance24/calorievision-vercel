-- Add featured_image_alt column to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN featured_image_alt text;