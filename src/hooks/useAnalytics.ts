import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Get or create a persistent visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem("cv_visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("cv_visitor_id", visitorId);
  }
  return visitorId;
};

// Get or create session ID (resets each session)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("cv_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("cv_session_id", sessionId);
  }
  return sessionId;
};

// Parse user agent to get device info
const parseUserAgent = (ua: string) => {
  const uaLower = ua.toLowerCase();
  
  // Device type
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(uaLower)) {
    deviceType = /tablet|ipad/i.test(uaLower) ? "tablet" : "mobile";
  }
  
  // Browser
  let browser = "Other";
  if (uaLower.includes("chrome") && !uaLower.includes("edg")) browser = "Chrome";
  else if (uaLower.includes("safari") && !uaLower.includes("chrome")) browser = "Safari";
  else if (uaLower.includes("firefox")) browser = "Firefox";
  else if (uaLower.includes("edg")) browser = "Edge";
  else if (uaLower.includes("opera") || uaLower.includes("opr")) browser = "Opera";
  
  // OS
  let os = "Other";
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("mac os") || uaLower.includes("macos")) os = "macOS";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ios")) os = "iOS";
  else if (uaLower.includes("linux")) os = "Linux";
  
  return { deviceType, browser, os };
};

// Get UTM parameters from URL
const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
  };
};

// Get user's preferred language
const getUserLanguage = () => {
  const lang = navigator.language || (navigator as any).userLanguage || "en";
  return lang.split("-")[0]; // Get base language code
};

// Cache for geolocation data (to avoid repeated API calls)
let geoCache: { country: string | null; city: string | null } | null = null;

// Fetch geolocation data from IP with multiple fallback APIs
const getGeolocation = async (): Promise<{ country: string | null; city: string | null }> => {
  if (geoCache) return geoCache;
  
  // List of geolocation APIs to try (in order of preference)
  const geoApis = [
    {
      url: "https://api.ipgeolocation.io/ipgeo?apiKey=API_KEY_PLACEHOLDER",
      skip: true, // Skip this one as it requires API key
    },
    {
      url: "https://ipwho.is/",
      parse: (data: any) => ({ country: data.country || null, city: data.city || null }),
    },
    {
      url: "https://freeipapi.com/api/json",
      parse: (data: any) => ({ country: data.countryName || null, city: data.cityName || null }),
    },
    {
      url: "https://ipapi.co/json/",
      parse: (data: any) => ({ country: data.country_name || null, city: data.city || null }),
    },
  ];
  
  for (const api of geoApis) {
    if (api.skip) continue;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
      
      const response = await fetch(api.url, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (api.parse) {
          const result = api.parse(data);
          if (result.country) {
            geoCache = result;
            return geoCache;
          }
        }
      }
    } catch (error) {
      // Try next API
      console.debug(`Geolocation API ${api.url} failed, trying next...`);
    }
  }
  
  return { country: null, city: null };
};

export const trackEvent = async (
  eventType: string,
  metadata: Record<string, unknown> = {}
) => {
  try {
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const pagePath = window.location.pathname;
    const { deviceType, browser, os } = parseUserAgent(navigator.userAgent);
    const utmParams = getUtmParams();
    const referrer = document.referrer;
    const language = getUserLanguage();
    
    // Fetch geolocation data
    const { country, city } = await getGeolocation();

    await supabase.from("analytics_events").insert([{
      event_type: eventType,
      page_path: pagePath,
      session_id: sessionId,
      visitor_id: visitorId,
      user_agent: navigator.userAgent,
      device_type: deviceType,
      browser: browser,
      os: os,
      language: language,
      referrer: referrer || null,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      country: country,
      city: city,
      metadata: metadata as Json,
    }]);
  } catch (err) {
    console.error("Error tracking event:", err);
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", { path: location.pathname });
  }, [location.pathname]);
};

export const trackMealAnalysis = (success: boolean) => {
  trackEvent("meal_analysis", { success });
};

export const trackButtonClick = (buttonName: string, metadata: Record<string, unknown> = {}) => {
  trackEvent("button_click", { button: buttonName, ...metadata });
};

export const trackFormSubmit = (formName: string, metadata: Record<string, unknown> = {}) => {
  trackEvent("form_submit", { form: formName, ...metadata });
};
