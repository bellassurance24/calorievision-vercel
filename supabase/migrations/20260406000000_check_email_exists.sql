-- Creates a SECURITY DEFINER function that checks auth.users directly.
-- Must run as SECURITY DEFINER so the anon role can query auth.users.
-- Granted to anon so the signup form (unauthenticated) can call it.

CREATE OR REPLACE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = lower(trim(p_email))
  )
$$;

-- Allow unauthenticated callers (signup form) to invoke this function
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;
