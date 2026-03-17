/**
 * useAnalytics — client-side event tracking
 *
 * Sends events to the `track-event` Supabase Edge Function which:
 *  • uses the service-role key (bypasses RLS / anon restrictions)
 *  • enriches geo from reliable Cloudflare headers (no 3rd-party IP API)
 *  • responds in <5 ms — never blocks navigation
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isLikelyBotUserAgent } from "@/lib/analyticsBot";

// ── Persistent IDs ────────────────────────────────────────────────────────────
const getVisitorId = (): string => {
  let id = localStorage.getItem("cv_visitor_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("cv_visitor_id", id); }
  return id;
};

const getSessionId = (): string => {
  let id = sessionStorage.getItem("cv_session_id");
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("cv_session_id", id); }
  return id;
};

// ── User-agent parsing ────────────────────────────────────────────────────────
const parseUserAgent = (ua: string) => {
  const u = ua.toLowerCase();

  let deviceType = "desktop";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(u)) {
    deviceType = /tablet|ipad/i.test(u) ? "tablet" : "mobile";
  }

  let browser = "Other";
  if (u.includes("edg"))                                 browser = "Edge";
  else if (u.includes("chrome"))                         browser = "Chrome";
  else if (u.includes("safari") && !u.includes("chrome")) browser = "Safari";
  else if (u.includes("firefox"))                        browser = "Firefox";
  else if (u.includes("opera") || u.includes("opr"))     browser = "Opera";

  let os = "Other";
  if (u.includes("windows"))                                      os = "Windows";
  else if (u.includes("mac os") || u.includes("macos"))           os = "macOS";
  else if (u.includes("android"))                                  os = "Android";
  else if (u.includes("iphone") || u.includes("ipad"))            os = "iOS";
  else if (u.includes("linux"))                                    os = "Linux";

  return { deviceType, browser, os };
};

// ── UTM helpers ───────────────────────────────────────────────────────────────
const getUtmParams = () => {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source:   p.get("utm_source")   ?? null,
    utm_medium:   p.get("utm_medium")   ?? null,
    utm_campaign: p.get("utm_campaign") ?? null,
  };
};

// ── Edge function URL ─────────────────────────────────────────────────────────
const getTrackUrl = (): string => {
  const base =
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    "https://ttjcfwspcpnxtxzqnfrh.supabase.co";
  return `${base}/functions/v1/track-event`;
};

const getAnonKey = (): string =>
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  "";

// ── Core tracking function ────────────────────────────────────────────────────
export const trackEvent = (
  eventType: string,
  metadata: Record<string, unknown> = {},
): void => {
  // Skip bots and crawlers
  if (isLikelyBotUserAgent(navigator.userAgent)) return;

  const ua = navigator.userAgent;
  const { deviceType, browser, os } = parseUserAgent(ua);
  const utm = getUtmParams();
  const lang = (navigator.language || "en").split("-")[0];

  const payload = {
    event_type:    eventType,
    page_path:     window.location.pathname,
    session_id:    getSessionId(),
    visitor_id:    getVisitorId(),
    user_agent:    ua,
    device_type:   deviceType,
    browser,
    os,
    language:      lang,
    referrer:      document.referrer || null,
    utm_source:    utm.utm_source,
    utm_medium:    utm.utm_medium,
    utm_campaign:  utm.utm_campaign,
    screen_width:  window.screen.width,
    screen_height: window.screen.height,
    // country / city come from Cloudflare headers on the edge function side
    metadata,
  };

  // Fire-and-forget — never blocks the page
  const url    = getTrackUrl();
  const anonKey = getAnonKey();

  fetch(url, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
    },
    body:      JSON.stringify(payload),
    keepalive: true, // survives page unload
  }).catch((err) => {
    // Silently swallow network errors — tracking must never break the app
    if (import.meta.env.DEV) {
      console.debug("[analytics] track-event failed:", err);
    }
  });
};

// ── Page tracking hook ────────────────────────────────────────────────────────
export const usePageTracking = (): void => {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", { path: location.pathname });
  }, [location.pathname]);
};

// ── Convenience helpers ───────────────────────────────────────────────────────
export const trackMealAnalysis = (success: boolean): void =>
  trackEvent("meal_analysis", { success });

export const trackButtonClick = (
  buttonName: string,
  extra: Record<string, unknown> = {},
): void => trackEvent("button_click", { button: buttonName, ...extra });

export const trackFormSubmit = (
  formName: string,
  extra: Record<string, unknown> = {},
): void => trackEvent("form_submit", { form: formName, ...extra });
