-- ─────────────────────────────────────────────────────────────────────────────
-- profiles: add plan_type + usage_stats columns
-- plan_type mirrors subscriptions.plan_type and is kept in sync by the trigger
-- below so any downstream query can join profiles alone for plan info.
-- usage_stats is a lightweight JSONB snapshot (daily/monthly scan counts)
-- updated after every scan — avoids a full usage_logs aggregation on each load.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add columns (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_type  text    NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS usage_stats jsonb  NOT NULL DEFAULT '{}'::jsonb;

-- 2. Back-fill plan_type from the active subscription (if one exists)
UPDATE public.profiles p
SET    plan_type = s.plan_type
FROM   public.subscriptions s
WHERE  s.user_id = p.id
  AND  s.status  = 'active';

-- 3. Function: keep profiles.plan_type in sync when subscriptions change
CREATE OR REPLACE FUNCTION public.sync_profile_plan_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.profiles
    SET    plan_type = NEW.plan_type
    WHERE  id = NEW.user_id;
  ELSE
    -- Subscription cancelled / expired — revert to starter
    UPDATE public.profiles
    SET    plan_type = 'starter'
    WHERE  id = NEW.user_id
      AND  NOT EXISTS (
             SELECT 1 FROM public.subscriptions
             WHERE  user_id = NEW.user_id
               AND  status  = 'active'
               AND  id     <> NEW.id
           );
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Trigger on subscriptions INSERT / UPDATE
DROP TRIGGER IF EXISTS trg_sync_profile_plan_type ON public.subscriptions;
CREATE TRIGGER trg_sync_profile_plan_type
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan_type();

-- 5. Function: increment usage_stats counters after a scan is logged
CREATE OR REPLACE FUNCTION public.update_profile_usage_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today       text := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  month_key   text := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM');
BEGIN
  UPDATE public.profiles
  SET usage_stats = jsonb_set(
        jsonb_set(
          usage_stats,
          ARRAY['daily_scans', today],
          (COALESCE((usage_stats->'daily_scans'->today)::int, 0) + 1)::text::jsonb
        ),
        ARRAY['monthly_scans', month_key],
        (COALESCE((usage_stats->'monthly_scans'->month_key)::int, 0) + 1)::text::jsonb
      )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- 6. Trigger on usage_logs INSERT
DROP TRIGGER IF EXISTS trg_update_profile_usage_stats ON public.usage_logs;
CREATE TRIGGER trg_update_profile_usage_stats
  AFTER INSERT ON public.usage_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_usage_stats();
