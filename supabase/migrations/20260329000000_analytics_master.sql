-- analytics_master
-- Single table that stores both page-view visits (from n8n visit webhook)
-- and Stripe sale events (from n8n stripe-sale webhook).
-- event_type = 'page_view' | 'sale'

CREATE TABLE IF NOT EXISTS public.analytics_master (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type       text        NOT NULL CHECK (event_type IN ('page_view', 'sale')),

  -- ── Visitor / geo ─────────────────────────────────────────────────────────
  visitor_ip       text,
  country          text,
  city             text,
  region           text,
  visitor_id       text,
  session_id       text,

  -- ── Page view fields ──────────────────────────────────────────────────────
  path             text,
  referrer         text,
  user_agent       text,
  device_type      text,
  browser          text,
  os               text,
  language         text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,

  -- ── Sale fields ───────────────────────────────────────────────────────────
  customer_email   text,
  amount           numeric(12, 2),
  currency         text,
  stripe_session_id text,
  plan_type        text,
  billing_cycle    text,
  status           text        DEFAULT 'active',

  -- ── Timestamps ────────────────────────────────────────────────────────────
  timestamp        timestamptz,
  created_at       timestamptz DEFAULT now() NOT NULL
);

-- Index for time-series queries (most common dashboard query)
CREATE INDEX IF NOT EXISTS analytics_master_created_at_idx
  ON public.analytics_master (created_at DESC);

-- Index for filtering by event type
CREATE INDEX IF NOT EXISTS analytics_master_event_type_idx
  ON public.analytics_master (event_type);

-- Index for visitor-level funnel queries
CREATE INDEX IF NOT EXISTS analytics_master_visitor_id_idx
  ON public.analytics_master (visitor_id)
  WHERE visitor_id IS NOT NULL;

-- Index for country-level reporting
CREATE INDEX IF NOT EXISTS analytics_master_country_idx
  ON public.analytics_master (country)
  WHERE country IS NOT NULL;

-- ── Row-level security ────────────────────────────────────────────────────────
ALTER TABLE public.analytics_master ENABLE ROW LEVEL SECURITY;

-- Only service-role (n8n via Supabase API key) can insert
CREATE POLICY "service_role_insert"
  ON public.analytics_master
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service-role can read (admin dashboard queries)
CREATE POLICY "service_role_select"
  ON public.analytics_master
  FOR SELECT
  TO service_role
  USING (true);

-- Public anonymous users have NO access
-- (n8n uses the service-role key, not the anon key)
