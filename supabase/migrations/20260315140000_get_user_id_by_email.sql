-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: look up a Supabase auth user ID by email address.
-- Used by Edge Functions (stripe-webhook, verify-checkout-session) to find or
-- create the correct user record after a Stripe payment.
--
-- SECURITY DEFINER lets the function query auth.users even when called via the
-- anon / service-role REST client (auth schema is otherwise restricted).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id
  FROM   auth.users
  WHERE  lower(email) = lower(p_email)
  LIMIT  1;
$$;

-- Restrict direct execution to authenticated callers and service role
REVOKE ALL ON FUNCTION public.get_user_id_by_email(TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO service_role;
GRANT  EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;
