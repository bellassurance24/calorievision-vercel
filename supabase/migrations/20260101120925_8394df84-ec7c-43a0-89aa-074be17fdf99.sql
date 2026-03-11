-- Drop the trigger first
DROP TRIGGER IF EXISTS warm_translation_cache_on_publish ON public.blog_posts;

-- Drop the function with CASCADE to remove dependent objects
DROP FUNCTION IF EXISTS public.warm_blog_post_translation_cache() CASCADE;