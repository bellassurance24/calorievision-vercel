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

-- Ensure the capture toggle setting row exists in site_settings (default: enabled)
-- Uses site_settings (the real table); gracefully skips if table doesn't exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_settings'
  ) THEN
    INSERT INTO public.site_settings (key, value)
    VALUES ('capture_user_scans_enabled', 'true')
    ON CONFLICT (key) DO NOTHING;
  END IF;
END $$;
