-- Add missing author_id column to blog_posts
-- Idempotent: safe to run multiple times

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON public.blog_posts (author_id);

-- Reload PostgREST schema cache so Supabase recognizes the new column immediately
NOTIFY pgrst, 'reload schema';
