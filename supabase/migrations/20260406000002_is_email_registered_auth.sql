-- Drop the previous version that queried public.profiles (unreliable if trigger
-- never fired for older accounts). This version queries auth.users directly —
-- the only ground-truth source for every registered email in Supabase.
--
-- SECURITY DEFINER is required: auth.users is not accessible to the anon or
-- authenticated roles directly. Running as the function owner (postgres/service)
-- bypasses that restriction.

DROP FUNCTION IF EXISTS public.is_email_registered(TEXT);

CREATE OR REPLACE FUNCTION public.is_email_registered(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = lower(trim(p_email))
  )
$$;

-- Grant to anon so an unauthenticated signup form call works
GRANT EXECUTE ON FUNCTION public.is_email_registered(TEXT) TO anon, authenticated;
