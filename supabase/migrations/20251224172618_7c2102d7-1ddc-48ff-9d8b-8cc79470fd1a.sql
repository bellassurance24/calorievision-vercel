-- Create function to increment notification count for rate limiting
CREATE OR REPLACE FUNCTION public.increment_notification_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamp with time zone := now();
  v_today date := v_now::date;
BEGIN
  INSERT INTO notification_rate_limits (user_id, daily_count, weekly_count, last_notification_at, last_reset_at)
  VALUES (p_user_id, 1, 1, v_now, v_now)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    -- Reset daily count if it's a new day
    daily_count = CASE 
      WHEN notification_rate_limits.last_reset_at::date < v_today 
      THEN 1 
      ELSE notification_rate_limits.daily_count + 1 
    END,
    -- Reset weekly count if it's been more than 7 days
    weekly_count = CASE 
      WHEN notification_rate_limits.last_reset_at < v_now - interval '7 days'
      THEN 1 
      ELSE notification_rate_limits.weekly_count + 1 
    END,
    last_notification_at = v_now,
    -- Update reset timestamp if we reset
    last_reset_at = CASE 
      WHEN notification_rate_limits.last_reset_at::date < v_today 
      THEN v_now 
      ELSE notification_rate_limits.last_reset_at 
    END;
END;
$$;