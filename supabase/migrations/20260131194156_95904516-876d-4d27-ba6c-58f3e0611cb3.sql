-- Create storage bucket for user scans
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-scans', 'user-scans', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for admin read access
CREATE POLICY "Admins can read user scans"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-scans' AND public.has_role(auth.uid(), 'admin'));

-- RLS policy for service role insert (edge function)
CREATE POLICY "Service role can insert user scans"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'user-scans');

-- Create user_scans table
CREATE TABLE public.user_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  storage_path TEXT NOT NULL,
  device_type TEXT,
  browser TEXT,
  language TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.user_scans ENABLE ROW LEVEL SECURITY;

-- Admin read policy
CREATE POLICY "Admins can read user scans"
ON public.user_scans
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Service role insert policy
CREATE POLICY "Service role can insert user scans"
ON public.user_scans
FOR INSERT
WITH CHECK (true);

-- Add the setting for opt-in
INSERT INTO public.settings (key, value, description)
VALUES ('capture_user_scans_enabled', 'false', 'Enable capturing of user meal scan images for admin review')
ON CONFLICT (key) DO NOTHING;

-- Create index for expiry cleanup
CREATE INDEX idx_user_scans_expires_at ON public.user_scans(expires_at);