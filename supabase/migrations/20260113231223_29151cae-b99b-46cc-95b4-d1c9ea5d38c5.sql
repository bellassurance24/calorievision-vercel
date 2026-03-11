-- Add dimension, position, and text alignment columns to media_showcase_items
ALTER TABLE public.media_showcase_items
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '16:9',
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS text_align TEXT DEFAULT 'left',
ADD COLUMN IF NOT EXISTS image_width INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_height INTEGER DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.media_showcase_items.aspect_ratio IS 'Aspect ratio: 16:9, 4:3, 1:1, 9:16, auto';
COMMENT ON COLUMN public.media_showcase_items.image_position IS 'Image horizontal position: left, center, right';
COMMENT ON COLUMN public.media_showcase_items.text_align IS 'Text alignment: left, center, right';
COMMENT ON COLUMN public.media_showcase_items.image_width IS 'Custom width in pixels';
COMMENT ON COLUMN public.media_showcase_items.image_height IS 'Custom height in pixels';