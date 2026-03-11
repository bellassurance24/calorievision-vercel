-- Add soft delete column for media showcase items
ALTER TABLE public.media_showcase_items 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add image dimension fields
ALTER TABLE public.media_showcase_items 
ADD COLUMN IF NOT EXISTS image_width_custom INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_height_custom INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_auto_scale BOOLEAN DEFAULT TRUE;

-- Add compression settings
ALTER TABLE public.media_showcase_items 
ADD COLUMN IF NOT EXISTS compression_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS compression_quality INTEGER DEFAULT 80;

-- Add index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_media_showcase_deleted_at ON public.media_showcase_items(deleted_at);

-- Add soft delete column to homepage_section_items  
ALTER TABLE public.homepage_section_items
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_width INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_height INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_auto_scale BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS text_align TEXT DEFAULT 'left';

-- Index for homepage_section_items soft delete
CREATE INDEX IF NOT EXISTS idx_homepage_section_items_deleted_at ON public.homepage_section_items(deleted_at);

-- Add soft delete to homepage_images
ALTER TABLE public.homepage_images
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_width INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_height INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_auto_scale BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS compression_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS compression_quality INTEGER DEFAULT 80;

CREATE INDEX IF NOT EXISTS idx_homepage_images_deleted_at ON public.homepage_images(deleted_at);