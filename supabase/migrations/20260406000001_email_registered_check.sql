-- Reliable duplicate-signup guard.
--
-- Queries public.profiles (populated by the handle_new_user trigger on every
-- real signup) with SECURITY DEFINER so it runs as the function owner and
-- bypasses RLS — the caller (anon role, unauthenticated signup form) cannot
-- query profiles directly because RLS only allows authenticated users.
--
-- Granted to anon so the client-side Supabase call works before login.

CREATE OR REPLACE FUNCTION public.is_email_registered(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE email = lower(trim(p_email))
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_email_registered(TEXT) TO anon, authenticated;
