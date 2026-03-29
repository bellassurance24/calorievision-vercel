/**
 * trackVisit
 * Fire-and-forget POST to the n8n analytics-master webhook.
 * n8n enriches the visit with geo data (ip-api.com) and writes
 * to the `analytics_master` Supabase table.
 *
 * Required env var (add to .env.local and Vercel project settings):
 *   VITE_N8N_VISIT_WEBHOOK_URL=https://YOUR_N8N_INSTANCE/webhook/track-visit
 *
 * If the env var is not set, this function is a no-op so it never
 * breaks the app in development.
 */

import { isLikelyBotUserAgent } from "@/lib/analyticsBot";

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

const parseUA = (ua: string) => {
  const u = ua.toLowerCase();
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(u))
    deviceType = /tablet|ipad/i.test(u) ? "tablet" : "mobile";
  let browser = "Other";
  if      (u.includes("edg"))                                  browser = "Edge";
  else if (u.includes("chrome"))                               browser = "Chrome";
  else if (u.includes("safari") && !u.includes("chrome"))      browser = "Safari";
  else if (u.includes("firefox"))                              browser = "Firefox";
  else if (u.includes("opera") || u.includes("opr"))           browser = "Opera";
  let os = "Other";
  if      (u.includes("windows"))                              os = "Windows";
  else if (u.includes("mac os") || u.includes("macos"))        os = "macOS";
  else if (u.includes("android"))                              os = "Android";
  else if (u.includes("iphone") || u.includes("ipad"))         os = "iOS";
  else if (u.includes("linux"))                                os = "Linux";
  return { deviceType, browser, os };
};

const FALLBACK_WEBHOOK_URL = "https://n8n.birdstyl.com/webhook/track-visit";

export const trackVisit = (path: string): void => {
  const webhookUrl =
    (import.meta.env.VITE_N8N_VISIT_WEBHOOK_URL as string | undefined) ||
    FALLBACK_WEBHOOK_URL;

  // Skip bots
  if (isLikelyBotUserAgent(navigator.userAgent)) return;

  const ua  = navigator.userAgent;
  const utm = new URLSearchParams(window.location.search);
  const { deviceType, browser, os } = parseUA(ua);

  const payload = {
    path,
    visitor_id:   getVisitorId(),
    session_id:   getSessionId(),
    user_agent:   ua,
    device_type:  deviceType,
    browser,
    os,
    language:     (navigator.language || "en").split("-")[0],
    referrer:     document.referrer || null,
    utm_source:   utm.get("utm_source"),
    utm_medium:   utm.get("utm_medium"),
    utm_campaign: utm.get("utm_campaign"),
  };

  // Fire-and-forget — never blocks the page
  fetch(webhookUrl, {
    method:    "POST",
    headers:   { "Content-Type": "application/json" },
    body:      JSON.stringify(payload),
    keepalive: true,
  }).catch((err) => {
    if (import.meta.env.DEV) {
      console.debug("[trackVisit] n8n webhook failed:", err);
    }
  });
};
