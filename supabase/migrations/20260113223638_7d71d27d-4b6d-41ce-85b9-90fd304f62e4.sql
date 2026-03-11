-- Add media showcase section fields to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS media_showcase_show_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS media_showcase_title TEXT DEFAULT 'Discover Our Features',
ADD COLUMN IF NOT EXISTS media_showcase_description TEXT DEFAULT 'See how CalorieVision can help you understand your meals better';

-- Create a table for media showcase items (photos and videos)
CREATE TABLE IF NOT EXISTS public.media_showcase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on media_showcase_items
ALTER TABLE public.media_showcase_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying on homepage)
CREATE POLICY "Media showcase items are publicly viewable"
ON public.media_showcase_items
FOR SELECT
USING (true);

-- Allow admin users to manage media showcase items
CREATE POLICY "Admins can insert media showcase items"
ON public.media_showcase_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update media showcase items"
ON public.media_showcase_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete media showcase items"
ON public.media_showcase_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_media_showcase_items_updated_at
BEFORE UPDATE ON public.media_showcase_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();