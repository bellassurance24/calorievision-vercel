-- ─────────────────────────────────────────────────────────────────────────────
-- Create guest_scan_limits table for server-side IP-based scan limiting.
--
-- The Edge Function checkGuestScanLimit() already queries and upserts this
-- table, but no migration existed — so the function silently failed and
-- guest users had NO server-side limit.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.guest_scan_limits (
  ip_address  text        NOT NULL,
  scan_date   date        NOT NULL DEFAULT CURRENT_DATE,
  scan_count  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (ip_address, scan_date)
);

-- Index for fast lookups by IP + date (PK already covers this, but explicit
-- for clarity and possible range queries on scan_date)
CREATE INDEX IF NOT EXISTS idx_guest_scan_limits_date
  ON public.guest_scan_limits (scan_date);

-- RLS: only the service_role key (used by the Edge Function) should access
-- this table. No user-facing access.
ALTER TABLE public.guest_scan_limits ENABLE ROW LEVEL SECURITY;

-- No RLS policies = anon/authenticated roles cannot read or write.
-- The Edge Function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.

-- Auto-cleanup: delete rows older than 7 days (optional, keeps table small)
-- Run this manually or via pg_cron if available:
-- DELETE FROM public.guest_scan_limits WHERE scan_date < CURRENT_DATE - INTERVAL '7 days';

COMMENT ON TABLE public.guest_scan_limits IS
  'Server-side guest scan rate limiting by IP address. Max 2 scans/day per IP.';
