-- Allow storage_path to be NULL (scans saved without image if upload fails)
ALTER TABLE public.user_scans
  ALTER COLUMN storage_path DROP NOT NULL;

-- Add analysis result columns
ALTER TABLE public.user_scans
  ADD COLUMN IF NOT EXISTS total_calories   INTEGER,
  ADD COLUMN IF NOT EXISTS analysis_result  JSONB;

-- Index for quick calorie queries in admin
CREATE INDEX IF NOT EXISTS idx_user_scans_total_calories
  ON public.user_scans (total_calories)
  WHERE total_calories IS NOT NULL;

-- Ensure the capture toggle setting row exists (default: enabled)
INSERT INTO public.settings (key, value)
VALUES ('capture_user_scans_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
