-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: subscriptions + usage_logs
-- Purpose  : Track user subscription plan and AI scan usage for rate limiting
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. subscriptions table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type              TEXT        NOT NULL DEFAULT 'starter'
                                     CHECK (plan_type IN ('starter', 'pro', 'ultimate')),
  status                 TEXT        NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service-role (webhooks) can write anything
CREATE POLICY "subscriptions_all_service"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON public.subscriptions (user_id, status);


-- 2. usage_logs table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_key  TEXT,          -- IP-hash or localStorage key for unauthenticated users
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read & insert their own rows
CREATE POLICY "usage_logs_select_own"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usage_logs_insert_own"
  ON public.usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service-role can manage everything
CREATE POLICY "usage_logs_all_service"
  ON public.usage_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Composite index for fast daily/monthly count queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_created
  ON public.usage_logs (user_id, created_at DESC);
