-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: add localized_slug to blog_posts
-- Purpose  : Enable per-language SEO-optimised slugs for all 10 languages.
--            English posts keep their existing slug as localized_slug.
--            Other languages are backfilled by the backfill-localized-slugs
--            Edge Function (or via the SQL helpers below for Latin scripts).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the new column (idempotent)
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS localized_slug TEXT;

-- 2. Enable unaccent extension for Latin-script languages
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 3. Helper SQL slugify function (used for Latin-script backfill below)
CREATE OR REPLACE FUNCTION public.slugify_latin(input_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT
    -- 3d. collapse multiple hyphens, strip leading/trailing
    regexp_replace(
      regexp_replace(
        -- 3c. replace any remaining non-alphanumeric (except hyphens) with ''
        regexp_replace(
          -- 3b. replace spaces with hyphens
          regexp_replace(
            -- 3a. lowercase + strip diacritics via unaccent
            lower(unaccent(input_text)),
            '\s+', '-', 'g'
          ),
          '[^a-z0-9\-]', '', 'g'
        ),
        '\-+', '-', 'g'
      ),
      '^-|-$', '', 'g'
    );
$$;

-- 4. Backfill: English posts — localized_slug IS the base slug
UPDATE blog_posts
SET    localized_slug = slug
WHERE  language = 'en'
  AND  localized_slug IS NULL;

-- 5. Backfill: Latin-script translated languages (fr, es, pt, it, de, nl)
--    Uses the slugify_latin helper above which strips diacritics cleanly.
UPDATE blog_posts
SET    localized_slug = public.slugify_latin(title)
WHERE  language IN ('fr', 'es', 'pt', 'it', 'de', 'nl')
  AND  localized_slug IS NULL
  AND  title IS NOT NULL
  AND  title <> '';

-- 6. De-duplicate: if a generated slug already exists for the same language,
--    append "-[id-suffix]" to keep the unique index happy.
--    (Runs only where conflicts exist.)
UPDATE blog_posts p
SET    localized_slug = p.localized_slug || '-' || substring(p.id::text, 1, 8)
WHERE  p.language IN ('fr', 'es', 'pt', 'it', 'de', 'nl')
  AND  EXISTS (
    SELECT 1 FROM blog_posts p2
    WHERE  p2.localized_slug = p.localized_slug
      AND  p2.language       = p.language
      AND  p2.id            <> p.id
  );

-- 7. Unique partial index — NULLs excluded so non-Latin posts can be
--    backfilled progressively by the Edge Function without violating the index.
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_localized_slug_language_idx
  ON blog_posts (localized_slug, language)
  WHERE localized_slug IS NOT NULL;

-- 8. Supporting index for fast language+status queries (sitemap, routing)
CREATE INDEX IF NOT EXISTS blog_posts_lang_status_idx
  ON blog_posts (language, status);

-- Summary of what still needs backfilling after this migration:
--   • ar (Arabic)   — needs Edge Function transliteration
--   • ru (Russian)  — needs Edge Function transliteration
--   • zh (Chinese)  — needs Edge Function (keep Unicode chars)
--   • ja (Japanese) — needs Edge Function (keep Unicode chars)
-- Run: POST /functions/v1/backfill-localized-slugs  {"dryRun": false}
