-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to warm translation cache for a blog post
CREATE OR REPLACE FUNCTION public.warm_blog_post_translation_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  supabase_url text;
  service_key text;
  request_id bigint;
BEGIN
  -- Only trigger when status changes to 'published' or content is updated on a published post
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'published' AND 
      (OLD.status != 'published' OR OLD.content != NEW.content OR OLD.title != NEW.title)) THEN
    
    -- Get Supabase URL from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.service_role_key', true);
    
    -- If settings not available, use hardcoded project URL
    IF supabase_url IS NULL OR supabase_url = '' THEN
      supabase_url := 'https://smsikaqybxtnzjvruhsa.supabase.co';
    END IF;
    
    -- Queue HTTP request to warm cache for title
    SELECT extensions.net.http_post(
      url := supabase_url || '/functions/v1/warm-translation-cache',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtc2lrYXF5Ynh0bnpqdnJ1aHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTI3ODcsImV4cCI6MjA4MDI2ODc4N30.DuukXxWBfqpyF7Ue_WJsYl6iQCWYMpbDWJ7OsiTPRbQ'
      ),
      body := jsonb_build_object(
        'pageId', NEW.slug || '-title',
        'content', NEW.title,
        'languages', ARRAY['fr', 'es', 'pt', 'de', 'it', 'zh', 'ar', 'nl']
      )
    ) INTO request_id;
    
    RAISE LOG 'Queued translation cache warming for blog post title: % (request_id: %)', NEW.slug, request_id;
    
    -- Queue HTTP request to warm cache for content
    SELECT extensions.net.http_post(
      url := supabase_url || '/functions/v1/warm-translation-cache',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtc2lrYXF5Ynh0bnpqdnJ1aHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTI3ODcsImV4cCI6MjA4MDI2ODc4N30.DuukXxWBfqpyF7Ue_WJsYl6iQCWYMpbDWJ7OsiTPRbQ'
      ),
      body := jsonb_build_object(
        'pageId', NEW.slug || '-content',
        'content', NEW.content,
        'languages', ARRAY['fr', 'es', 'pt', 'de', 'it', 'zh', 'ar', 'nl']
      )
    ) INTO request_id;
    
    RAISE LOG 'Queued translation cache warming for blog post content: % (request_id: %)', NEW.slug, request_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on blog_posts table
DROP TRIGGER IF EXISTS warm_translation_cache_on_publish ON public.blog_posts;
CREATE TRIGGER warm_translation_cache_on_publish
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.warm_blog_post_translation_cache();