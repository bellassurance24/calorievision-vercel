-- Automatically translate new EN blog posts into multiple languages
-- Uses pg_net to call a Supabase Edge Function.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Ensure we can dedupe translations per (slug, language)
-- (Your app already relies on this pattern via ON CONFLICT (slug, language).)
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_language_unique
  ON public.blog_posts (slug, language);

CREATE OR REPLACE FUNCTION public.auto_translate_blog_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  supabase_url text;
  request_id bigint;
BEGIN
  -- Only translate English source posts (typically your admin inserts).
  IF COALESCE(NEW.language, 'en') <> 'en' THEN
    RETURN NEW;
  END IF;

  -- Only translate when the post is published.
  IF NEW.status IS DISTINCT FROM 'published' THEN
    RETURN NEW;
  END IF;

  supabase_url := current_setting('app.settings.supabase_url', true);
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://smsikaqybxtnzjvruhsa.supabase.co';
  END IF;

  -- Fire-and-forget HTTP call to Edge Function (no need for auth; it uses service role internally).
  SELECT extensions.net.http_post(
    url := supabase_url || '/functions/v1/auto-translate-blog-post',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'postId', NEW.id
    )
  ) INTO request_id;

  RAISE LOG 'Queued auto-translation for blog_post % (request_id: %)', NEW.id, request_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_translate_blog_post_on_publish ON public.blog_posts;
CREATE TRIGGER auto_translate_blog_post_on_publish
AFTER INSERT ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.auto_translate_blog_post();

