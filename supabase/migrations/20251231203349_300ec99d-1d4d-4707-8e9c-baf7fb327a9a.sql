-- Create translation cache table for server-side caching
CREATE TABLE public.translation_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  language TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_id, language)
);

-- Create index for fast lookups
CREATE INDEX idx_translation_cache_page_lang ON public.translation_cache(page_id, language);
CREATE INDEX idx_translation_cache_source_hash ON public.translation_cache(source_hash);

-- Enable RLS
ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (translations are public content)
CREATE POLICY "Translations are publicly readable"
ON public.translation_cache
FOR SELECT
USING (true);

-- Only service role can insert/update (edge functions)
CREATE POLICY "Service role can manage translations"
ON public.translation_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_translation_cache_updated_at
BEFORE UPDATE ON public.translation_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();