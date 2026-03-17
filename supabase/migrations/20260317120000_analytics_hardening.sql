-- ── Analytics hardening migration ────────────────────────────────────────────
-- Idempotent: safe to run multiple times on existing databases.
-- 1. Ensures all analytics_events columns exist
-- 2. Drops & re-creates permissive INSERT policy so anon + service-role work
-- 3. Adds indexes for all query patterns used in useAnalyticsData.ts

-- ── Ensure all columns exist ──────────────────────────────────────────────────
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS referrer      TEXT,
  ADD COLUMN IF NOT EXISTS utm_source    TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium    TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign  TEXT,
  ADD COLUMN IF NOT EXISTS device_type   TEXT,
  ADD COLUMN IF NOT EXISTS browser       TEXT,
  ADD COLUMN IF NOT EXISTS os            TEXT,
  ADD COLUMN IF NOT EXISTS language      TEXT,
  ADD COLUMN IF NOT EXISTS country       TEXT,
  ADD COLUMN IF NOT EXISTS city          TEXT,
  ADD COLUMN IF NOT EXISTS visitor_id    TEXT,
  ADD COLUMN IF NOT EXISTS screen_width  INTEGER,
  ADD COLUMN IF NOT EXISTS screen_height INTEGER;

-- ── DROP stale INSERT policies and re-create cleanly ─────────────────────────
-- This handles the case where the original policy was too restrictive.
DO $$
BEGIN
  -- Drop any existing INSERT policies on analytics_events
  DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
  DROP POLICY IF EXISTS "Public can insert analytics events" ON public.analytics_events;
  DROP POLICY IF EXISTS "Anon insert analytics" ON public.analytics_events;
END $$;

-- Allow anyone (anon, authenticated, service_role) to INSERT
CREATE POLICY "analytics_public_insert"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Ensure admin SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analytics_events'
      AND policyname = 'Admins can view analytics'
  ) THEN
    CREATE POLICY "Admins can view analytics"
    ON public.analytics_events
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- ── Indexes (all idempotent) ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON public.analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id
  ON public.analytics_events(visitor_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
  ON public.analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type
  ON public.analytics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path
  ON public.analytics_events(page_path);

CREATE INDEX IF NOT EXISTS idx_analytics_events_country
  ON public.analytics_events(country);

-- ── Composite index for the most common admin dashboard query ─────────────────
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON public.analytics_events(event_type, created_at DESC);
