import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * PKCE recovery callback — /auth/callback
 *
 * Supabase reset-password emails redirect here with ?code=XXXX.
 * We exchange the code for a session (server-side token is consumed here,
 * NOT in the email link itself, so Gmail link-preview scanners cannot
 * invalidate the token by pre-fetching the Supabase verify URL).
 *
 * After exchange:
 *   success → /auth?type=recovery   (Auth.tsx shows "Set new password")
 *   failure → /auth?type=recovery&error_description=... (shows expired-link UI)
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");

    // Supabase forwarded an error (e.g. OTP already used or expired)
    if (errorCode || errorDescription) {
      const qs = new URLSearchParams({ type: "recovery" });
      if (errorCode) qs.set("error_code", errorCode);
      if (errorDescription) qs.set("error_description", errorDescription);
      navigate(`/auth?${qs.toString()}`, { replace: true });
      return;
    }

    if (!code) {
      navigate("/auth", { replace: true });
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        const qs = new URLSearchParams({
          type: "recovery",
          error_description: error.message,
        });
        navigate(`/auth?${qs.toString()}`, { replace: true });
      } else {
        // Session established — Auth.tsx PASSWORD_RECOVERY listener will
        // lock the "Set new password" form in place.
        navigate("/auth?type=recovery", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default AuthCallback;
