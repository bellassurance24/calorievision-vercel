-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: usage_stats trigger silently fails when daily_scans / monthly_scans
-- keys don't exist yet in the JSONB column.
--
-- Root cause: jsonb_set('{}'::jsonb, '{daily_scans, 2026-04-08}', '1') is a
-- no-op when the intermediate key 'daily_scans' is missing. The trigger runs
-- without error but usage_stats stays '{}', so useSubscription reads 0 scans
-- and isAtLimit is always false → Free users can scan without limit.
--
-- Fix: ensure the parent objects exist before calling jsonb_set, and backfill
-- any profiles that already have an empty or malformed usage_stats.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Replace the trigger function with a version that creates parent keys
CREATE OR REPLACE FUNCTION public.update_profile_usage_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today     text := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  month_key text := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM');
  current   jsonb;
BEGIN
  -- Read current value
  SELECT COALESCE(usage_stats, '{}'::jsonb)
    INTO current
    FROM public.profiles
   WHERE id = NEW.user_id;

  -- If profile doesn't exist yet, nothing to update
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Ensure parent objects exist
  IF NOT (current ? 'daily_scans') THEN
    current := current || '{"daily_scans":{}}'::jsonb;
  END IF;
  IF NOT (current ? 'monthly_scans') THEN
    current := current || '{"monthly_scans":{}}'::jsonb;
  END IF;

  -- Increment counters
  current := jsonb_set(
    current,
    ARRAY['daily_scans', today],
    (COALESCE((current -> 'daily_scans' ->> today)::int, 0) + 1)::text::jsonb
  );
  current := jsonb_set(
    current,
    ARRAY['monthly_scans', month_key],
    (COALESCE((current -> 'monthly_scans' ->> month_key)::int, 0) + 1)::text::jsonb
  );

  -- Write back
  UPDATE public.profiles
     SET usage_stats = current
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- 2. Backfill: add missing parent keys to any existing profiles
UPDATE public.profiles
   SET usage_stats = COALESCE(usage_stats, '{}'::jsonb)
                     || CASE WHEN NOT (COALESCE(usage_stats, '{}'::jsonb) ? 'daily_scans')
                             THEN '{"daily_scans":{}}'::jsonb ELSE '{}'::jsonb END
                     || CASE WHEN NOT (COALESCE(usage_stats, '{}'::jsonb) ? 'monthly_scans')
                             THEN '{"monthly_scans":{}}'::jsonb ELSE '{}'::jsonb END
 WHERE NOT (COALESCE(usage_stats, '{}'::jsonb) ? 'daily_scans')
    OR NOT (COALESCE(usage_stats, '{}'::jsonb) ? 'monthly_scans');
