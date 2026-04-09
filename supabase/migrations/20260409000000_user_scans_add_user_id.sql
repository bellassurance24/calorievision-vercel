-- ─────────────────────────────────────────────────────────────────────────────
-- Add user_id to user_scans so scan history can be linked to authenticated
-- users. Guests remain anonymous (user_id = NULL).
--
-- Also adjusts expires_at defaults:
--   Guest / Starter → 1 day  (set by Edge Function)
--   Pro             → 7 days
--   Ultimate        → 30 days
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add user_id column (nullable)
ALTER TABLE public.user_scans
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index for per-user history queries
CREATE INDEX IF NOT EXISTS idx_user_scans_user_id
  ON public.user_scans (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- 3. RLS: authenticated users can read their own scans
CREATE POLICY "Users can read own scans"
  ON public.user_scans FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Change default expires_at to 1 day (guests/free)
-- The Edge Function overrides this per plan.
ALTER TABLE public.user_scans
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '1 day');
