import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ActiveUser {
  visitorId: string;
  pagePath: string;
  country: string | null;
  city: string | null;
  deviceType: string;
  browser: string;
  deviceBrand: string | null;
  deviceModel: string | null;
  joinedAt: string;
}

// Channel name constant to ensure consistency
const PRESENCE_CHANNEL_NAME = "realtime-visitors";

// Get or create a persistent visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem("cv_visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("cv_visitor_id", visitorId);
  }
  return visitorId;
};

// Get device info using User-Agent Client Hints (more accurate on Chrome/Edge)
const getDeviceInfoFromClientHints = async (): Promise<{
  deviceBrand: string | null;
  deviceModel: string | null;
  platform: string | null;
  isMobile: boolean;
}> => {
  try {
    // Check if User-Agent Client Hints API is available
    if ('userAgentData' in navigator && navigator.userAgentData) {
      const uaData = navigator.userAgentData as NavigatorUAData;
      
      // Get high-entropy values for detailed device info
      const highEntropyValues = await uaData.getHighEntropyValues([
        'model',
        'platform',
        'platformVersion',
        'fullVersionList',
        'architecture',
        'bitness',
        'mobile'
      ]);
      
      // Extract brand from the brands list
      let deviceBrand: string | null = null;
      const brands = uaData.brands || [];
      
      // Filter out generic browser brands to find device manufacturer
      for (const brand of brands) {
        const name = brand.brand.toLowerCase();
        if (!name.includes('chromium') && !name.includes('chrome') && 
            !name.includes('edge') && !name.includes('not') && 
            !name.includes('brand')) {
          deviceBrand = brand.brand;
          break;
        }
      }
      
      return {
        deviceBrand,
        deviceModel: highEntropyValues.model || null,
        platform: highEntropyValues.platform || uaData.platform || null,
        isMobile: highEntropyValues.mobile ?? uaData.mobile ?? false
      };
    }
  } catch (error) {
    console.log("Client Hints not available, falling back to User-Agent parsing");
  }
  
  return { deviceBrand: null, deviceModel: null, platform: null, isMobile: false };
};

// Type definition for User-Agent Client Hints
interface NavigatorUAData {
  brands: { brand: string; version: string }[];
  mobile: boolean;
  platform: string;
  getHighEntropyValues(hints: string[]): Promise<{
    model?: string;
    platform?: string;
    platformVersion?: string;
    fullVersionList?: { brand: string; version: string }[];
    architecture?: string;
    bitness?: string;
    mobile?: boolean;
  }>;
}

// Parse user agent to get device info including brand and model (fallback)
const parseUserAgent = (ua: string) => {
  const uaLower = ua.toLowerCase();
  
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(uaLower)) {
    deviceType = /tablet|ipad/i.test(uaLower) ? "tablet" : "mobile";
  }
  
  let browser = "Other";
  if (uaLower.includes("chrome") && !uaLower.includes("edg")) browser = "Chrome";
  else if (uaLower.includes("safari") && !uaLower.includes("chrome")) browser = "Safari";
  else if (uaLower.includes("firefox")) browser = "Firefox";
  else if (uaLower.includes("edg")) browser = "Edge";
  else if (uaLower.includes("opera") || uaLower.includes("opr")) browser = "Opera";
  
  // Detect device brand and model
  let deviceBrand: string | null = null;
  let deviceModel: string | null = null;
  
  // Apple devices
  if (/iphone/i.test(ua)) {
    deviceBrand = "Apple";
    deviceModel = "iPhone";
  } else if (/ipad/i.test(ua)) {
    deviceBrand = "Apple";
    deviceModel = "iPad";
  } else if (/macintosh|mac os/i.test(ua)) {
    deviceBrand = "Apple";
    deviceModel = "Mac";
  }
  // Samsung
  else if (/samsung|sm-[a-z]/i.test(ua)) {
    deviceBrand = "Samsung";
    const match = ua.match(/SM-[A-Z]\d{3}[A-Z]?/i) || ua.match(/Samsung[\s-]?(Galaxy[\s-]?\w+)/i);
    deviceModel = match ? match[0] : "Galaxy";
  }
  // Xiaomi / Redmi / POCO
  else if (/xiaomi|redmi|poco|mi\s?\d/i.test(ua)) {
    deviceBrand = "Xiaomi";
    const match = ua.match(/(Redmi[\s-]?\w+|POCO[\s-]?\w+|Mi[\s-]?\d+\w*)/i);
    deviceModel = match ? match[0] : null;
  }
  // Huawei / Honor
  else if (/huawei|honor/i.test(ua)) {
    deviceBrand = ua.toLowerCase().includes("honor") ? "Honor" : "Huawei";
    const match = ua.match(/(P\d+|Mate[\s-]?\d+|Nova[\s-]?\d+|Honor[\s-]?\w+)/i);
    deviceModel = match ? match[0] : null;
  }
  // OnePlus
  else if (/oneplus/i.test(ua)) {
    deviceBrand = "OnePlus";
    const match = ua.match(/OnePlus[\s-]?(\w+)/i);
    deviceModel = match ? match[1] : null;
  }
  // Google Pixel
  else if (/pixel/i.test(ua)) {
    deviceBrand = "Google";
    const match = ua.match(/Pixel[\s-]?(\d+\w*)/i);
    deviceModel = match ? `Pixel ${match[1]}` : "Pixel";
  }
  // OPPO
  else if (/oppo/i.test(ua)) {
    deviceBrand = "OPPO";
    const match = ua.match(/OPPO[\s-]?(\w+)/i);
    deviceModel = match ? match[1] : null;
  }
  // Vivo
  else if (/vivo/i.test(ua)) {
    deviceBrand = "Vivo";
    const match = ua.match(/vivo[\s-]?(\w+)/i);
    deviceModel = match ? match[1] : null;
  }
  // Realme
  else if (/realme/i.test(ua)) {
    deviceBrand = "Realme";
    const match = ua.match(/Realme[\s-]?(\w+)/i);
    deviceModel = match ? match[1] : null;
  }
  // Motorola
  else if (/motorola|moto/i.test(ua)) {
    deviceBrand = "Motorola";
    const match = ua.match(/moto[\s-]?(\w+)/i);
    deviceModel = match ? `Moto ${match[1]}` : null;
  }
  // LG
  else if (/lg-|lg\s/i.test(ua)) {
    deviceBrand = "LG";
    const match = ua.match(/LG[-\s]?(\w+)/i);
    deviceModel = match ? match[1] : null;
  }
  // Sony
  else if (/sony|xperia/i.test(ua)) {
    deviceBrand = "Sony";
    const match = ua.match(/Xperia[\s-]?(\w+)/i);
    deviceModel = match ? `Xperia ${match[1]}` : null;
  }
  // Nokia
  else if (/nokia/i.test(ua)) {
    deviceBrand = "Nokia";
    const match = ua.match(/Nokia[\s-]?(\w+)/i);
    deviceModel = match ? match[1] : null;
  }
  // Windows
  else if (/windows/i.test(ua)) {
    deviceBrand = "Windows";
    deviceModel = "PC";
  }
  // Linux
  else if (/linux/i.test(ua) && !/android/i.test(ua)) {
    deviceBrand = "Linux";
    deviceModel = "PC";
  }
  // Generic Android - extract device token even when UA doesn't include `Build/`
  else if (/android/i.test(ua)) {
    const uaStr = ua;

    // Common patterns:
    //  - (Linux; Android 13; SM-G991B) AppleWebKit...
    //  - (Linux; Android 13; Pixel 7 Pro Build/TQ3A...)
    //  - ...; Redmi Note 12 Build/...
    const buildMatch = uaStr.match(/;\s*([^;)]+)\s*Build\//i);
    const androidParenMatch = uaStr.match(/Android\s*[\d.]+;\s*([^;\)]+)\s*\)/i);
    const deviceToken = (buildMatch?.[1] || androidParenMatch?.[1] || "").trim();

    // If we couldn't extract a device token, fall back to keyword detection only.
    const token = deviceToken;

    const setFromToken = (brand: string, model?: string | null) => {
      deviceBrand = brand;
      deviceModel = (model ?? null) ? String(model).trim() : null;
    };

    // Brand detection (token first, then full UA)
    const haystack = `${token} ${uaStr}`;

    // Samsung model codes commonly start with SM-
    if (/\bSM-[A-Z0-9]+\b/i.test(haystack) || /\bSamsung\b/i.test(haystack) || /\bGT-[A-Z0-9]+\b/i.test(haystack)) {
      setFromToken("Samsung", token || (uaStr.match(/\bSM-[A-Z0-9]+\b/i)?.[0] ?? null));
    }
    // Google Pixel
    else if (/\bPixel\b/i.test(haystack)) {
      setFromToken("Google", token || (uaStr.match(/Pixel\s*[A-Za-z0-9\s]+/i)?.[0] ?? "Pixel"));
    }
    // Xiaomi / Redmi / POCO
    else if (/\bXiaomi\b|\bRedmi\b|\bPOCO\b/i.test(haystack)) {
      setFromToken("Xiaomi", token || null);
    }
    // Huawei / Honor
    else if (/\bHuawei\b/i.test(haystack)) {
      setFromToken("Huawei", token || null);
    } else if (/\bHonor\b/i.test(haystack)) {
      setFromToken("Honor", token || null);
    }
    // OnePlus
    else if (/\bOnePlus\b/i.test(haystack)) {
      setFromToken("OnePlus", token || null);
    }
    // OPPO / Vivo / Realme
    else if (/\bOPPO\b/i.test(haystack)) {
      setFromToken("OPPO", token || null);
    } else if (/\bVivo\b/i.test(haystack)) {
      setFromToken("Vivo", token || null);
    } else if (/\bRealme\b/i.test(haystack)) {
      setFromToken("Realme", token || null);
    }
    // Motorola
    else if (/\bMotorola\b|\bmoto\b/i.test(haystack)) {
      setFromToken("Motorola", token || null);
    }
    // Nokia / Sony / LG
    else if (/\bNokia\b/i.test(haystack)) {
      setFromToken("Nokia", token || null);
    } else if (/\bSony\b|\bXperia\b/i.test(haystack)) {
      setFromToken("Sony", token || null);
    } else if (/\bLG\b/i.test(haystack)) {
      setFromToken("LG", token || null);
    }
    // Fallback: at least show the extracted token instead of plain "Android" when possible
    else {
      setFromToken("Android", token || null);
    }
  }
  
  return { deviceType, browser, deviceBrand, deviceModel };
};

// Combined function to get best available device info
const getDeviceInfo = async (ua: string) => {
  // First, try User-Agent Client Hints (more accurate on Chrome/Edge Android)
  const clientHintsInfo = await getDeviceInfoFromClientHints();
  
  // Parse User-Agent as fallback
  const uaInfo = parseUserAgent(ua);
  
  // Use Client Hints data if available, otherwise fall back to UA parsing
  return {
    deviceType: clientHintsInfo.isMobile ? "mobile" : uaInfo.deviceType,
    browser: uaInfo.browser,
    deviceBrand: clientHintsInfo.deviceBrand || uaInfo.deviceBrand,
    deviceModel: clientHintsInfo.deviceModel || uaInfo.deviceModel,
  };
};

// Cache for geolocation
let geoCache: { country: string | null; city: string | null } | null = null;

const getGeolocation = async (): Promise<{ country: string | null; city: string | null }> => {
  if (geoCache) return geoCache;
  
  const geoApis = [
    {
      url: "https://ipwho.is/",
      parse: (data: any) => ({ country: data.country || null, city: data.city || null }),
    },
    {
      url: "https://freeipapi.com/api/json",
      parse: (data: any) => ({ country: data.countryName || null, city: data.cityName || null }),
    },
  ];
  
  for (const api of geoApis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(api.url, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const result = api.parse(data);
        if (result.country) {
          geoCache = result;
          return geoCache;
        }
      }
    } catch (error) {
      // Try next API silently
    }
  }
  
  return { country: null, city: null };
};

// Hook for ADMIN to view live visitors
export const useRealtimePresence = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSync = useCallback((showRefreshIndicator = false) => {
    if (!channelRef.current) return;
    
    if (showRefreshIndicator) {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }
    
    const state = channelRef.current.presenceState();
    const users: ActiveUser[] = [];
    
    Object.keys(state).forEach((key) => {
      const presences = state[key] as unknown as ActiveUser[];
      if (presences && presences.length > 0) {
        users.push(presences[0]);
      }
    });
    
    console.log("Presence sync - Active users:", users.length, users);
    setActiveUsers(users);
  }, []);

  useEffect(() => {
    const visitorId = getVisitorId();
    
    // Create a dedicated channel for admin with unique key
    const channel = supabase.channel(PRESENCE_CHANNEL_NAME, {
      config: {
        presence: {
          key: `admin-${visitorId}`,
        },
      },
    });
    
    channelRef.current = channel;

    // Set up presence listeners BEFORE subscribing
    channel
      .on("presence", { event: "sync" }, () => {
        console.log("Admin: Presence sync event received");
        handleSync();
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("Admin: User joined", key, newPresences);
        handleSync();
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("Admin: User left", key, leftPresences);
        handleSync();
      });

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      console.log("Admin presence channel status:", status);
      
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        // Initial sync after subscription
        setTimeout(() => {
          handleSync(false);
        }, 500);
        
        // Set up periodic sync as fallback (every 30 seconds)
        syncIntervalRef.current = setInterval(() => {
          handleSync(true);
        }, 30000);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setIsConnected(false);
        console.error("Admin presence channel error:", status);
      }
    });

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [handleSync]);

  return { activeUsers, isConnected, isRefreshing };
};

// Hook for PUBLIC pages to track their presence
export const useTrackPresence = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isTracking = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const visitorId = getVisitorId();
    
    // Create channel for this visitor
    const channel = supabase.channel(PRESENCE_CHANNEL_NAME, {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });
    
    channelRef.current = channel;

    const trackPresence = async () => {
      if (!channelRef.current) return;
      
      // Use the combined function that tries Client Hints first, then falls back to UA parsing
      const { deviceType, browser, deviceBrand, deviceModel } = await getDeviceInfo(navigator.userAgent);
      const { country, city } = await getGeolocation();
      
      const presenceData = {
        visitorId,
        pagePath: window.location.pathname,
        country,
        city,
        deviceType,
        browser,
        deviceBrand,
        deviceModel,
        joinedAt: new Date().toISOString(),
      };

      console.log("Tracking presence:", presenceData);
      
      try {
        await channelRef.current.track(presenceData);
        isTracking.current = true;
      } catch (error) {
        console.error("Error tracking presence:", error);
      }
    };

    // Subscribe and then track
    channel.subscribe(async (status) => {
      console.log("Public presence channel status:", status);
      if (status === "SUBSCRIBED") {
        await trackPresence();
      }
    });

    // Update presence when page path changes
    const updatePresence = async () => {
      if (channelRef.current) {
        isTracking.current = false;
        await trackPresence();
      }
    };

    // Listen for route changes
    window.addEventListener("popstate", updatePresence);

    // Also listen for visibility changes
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && channelRef.current) {
        isTracking.current = false;
        trackPresence();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("popstate", updatePresence);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled]);
};
