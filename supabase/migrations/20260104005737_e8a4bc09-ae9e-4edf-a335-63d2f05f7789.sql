-- Add aspect_ratio column to home_media table
ALTER TABLE public.home_media 
ADD COLUMN aspect_ratio text DEFAULT 'landscape';

-- Add comment for documentation
COMMENT ON COLUMN public.home_media.aspect_ratio IS 'Display aspect ratio: landscape (16:9), portrait (9:16), or square (1:1)';