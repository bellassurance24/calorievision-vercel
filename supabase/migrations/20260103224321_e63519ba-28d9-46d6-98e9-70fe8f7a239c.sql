-- Create storage bucket for homepage videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'home-videos', 
  'home-videos', 
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create table to track homepage media
CREATE TABLE IF NOT EXISTS public.home_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'poster')),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds NUMERIC,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.home_media ENABLE ROW LEVEL SECURITY;

-- Only admins can manage home media
CREATE POLICY "Admins can view home media"
ON public.home_media
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert home media"
ON public.home_media
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update home media"
ON public.home_media
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete home media"
ON public.home_media
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Public can read active media (for the frontend)
CREATE POLICY "Public can view active home media"
ON public.home_media
FOR SELECT
USING (is_active = true);

-- Storage policies for home-videos bucket
CREATE POLICY "Public can view home videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'home-videos');

CREATE POLICY "Admins can upload home videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'home-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update home videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'home-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete home videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'home-videos' AND public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_home_media_updated_at
BEFORE UPDATE ON public.home_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();