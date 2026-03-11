-- =============================================================
-- Step 1: Fix UNIQUE constraint for multi-language blog posts
-- Run this ONCE in Supabase SQL editor before inserting batches
-- Safe to run multiple times (fully idempotent)
-- =============================================================

DO $$
BEGIN
  -- Drop old single-column slug constraint (blocks multi-language rows)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_posts_slug_key'
      AND conrelid = 'public.blog_posts'::regclass
  ) THEN
    ALTER TABLE public.blog_posts DROP CONSTRAINT blog_posts_slug_key;
    RAISE NOTICE 'Dropped blog_posts_slug_key';
  ELSE
    RAISE NOTICE 'blog_posts_slug_key not found, skipping';
  END IF;

  -- Add composite unique constraint (slug + language)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_posts_slug_language_key'
      AND conrelid = 'public.blog_posts'::regclass
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_slug_language_key UNIQUE (slug, language);
    RAISE NOTICE 'Added blog_posts_slug_language_key UNIQUE(slug, language)';
  ELSE
    RAISE NOTICE 'blog_posts_slug_language_key already exists, skipping';
  END IF;
END $$;

-- Tag every existing row that has no language as English
UPDATE public.blog_posts
SET language = 'en'
WHERE language IS NULL OR language = '';

-- Verify current state
SELECT language, COUNT(*) AS posts
FROM public.blog_posts
GROUP BY language
ORDER BY language;
