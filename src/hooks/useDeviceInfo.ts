// Get device info using User-Agent Client Hints (more accurate on Chrome/Edge)
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

const getDeviceInfoFromClientHints = async (): Promise<{
  deviceBrand: string | null;
  deviceModel: string | null;
  platform: string | null;
  isMobile: boolean;
}> => {
  try {
    if ('userAgentData' in navigator && navigator.userAgentData) {
      const uaData = navigator.userAgentData as NavigatorUAData;
      
      const highEntropyValues = await uaData.getHighEntropyValues([
        'model',
        'platform',
        'platformVersion',
        'fullVersionList',
        'architecture',
        'bitness',
        'mobile'
      ]);
      
      let deviceBrand: string | null = null;
      const brands = uaData.brands || [];
      
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
  // Generic Android
  else if (/android/i.test(ua)) {
    const buildMatch = ua.match(/;\s*([^;)]+)\s*Build\//i);
    const androidParenMatch = ua.match(/Android\s*[\d.]+;\s*([^;\)]+)\s*\)/i);
    const deviceToken = (buildMatch?.[1] || androidParenMatch?.[1] || "").trim();
    
    const haystack = `${deviceToken} ${ua}`;
    
    if (/\bSM-[A-Z0-9]+\b/i.test(haystack) || /\bSamsung\b/i.test(haystack)) {
      deviceBrand = "Samsung";
      deviceModel = deviceToken || (ua.match(/\bSM-[A-Z0-9]+\b/i)?.[0] ?? null);
    } else if (/\bPixel\b/i.test(haystack)) {
      deviceBrand = "Google";
      deviceModel = deviceToken || "Pixel";
    } else if (/\bXiaomi\b|\bRedmi\b|\bPOCO\b/i.test(haystack)) {
      deviceBrand = "Xiaomi";
      deviceModel = deviceToken || null;
    } else if (/\bHuawei\b/i.test(haystack)) {
      deviceBrand = "Huawei";
      deviceModel = deviceToken || null;
    } else if (/\bHonor\b/i.test(haystack)) {
      deviceBrand = "Honor";
      deviceModel = deviceToken || null;
    } else if (/\bOnePlus\b/i.test(haystack)) {
      deviceBrand = "OnePlus";
      deviceModel = deviceToken || null;
    } else if (/\bOPPO\b/i.test(haystack)) {
      deviceBrand = "OPPO";
      deviceModel = deviceToken || null;
    } else if (/\bVivo\b/i.test(haystack)) {
      deviceBrand = "Vivo";
      deviceModel = deviceToken || null;
    } else if (/\bRealme\b/i.test(haystack)) {
      deviceBrand = "Realme";
      deviceModel = deviceToken || null;
    } else if (/\bMotorola\b|\bmoto\b/i.test(haystack)) {
      deviceBrand = "Motorola";
      deviceModel = deviceToken || null;
    } else if (/\bNokia\b/i.test(haystack)) {
      deviceBrand = "Nokia";
      deviceModel = deviceToken || null;
    } else if (/\bSony\b|\bXperia\b/i.test(haystack)) {
      deviceBrand = "Sony";
      deviceModel = deviceToken || null;
    } else if (/\bLG\b/i.test(haystack)) {
      deviceBrand = "LG";
      deviceModel = deviceToken || null;
    } else {
      deviceBrand = "Android";
      deviceModel = deviceToken || null;
    }
  }
  
  return { deviceType, browser, deviceBrand, deviceModel };
};

// Combined function to get best available device info
export const getDeviceInfo = async () => {
  const ua = navigator.userAgent;
  const clientHintsInfo = await getDeviceInfoFromClientHints();
  const uaInfo = parseUserAgent(ua);
  
  return {
    deviceType: clientHintsInfo.isMobile ? "mobile" : uaInfo.deviceType,
    browser: uaInfo.browser,
    deviceBrand: clientHintsInfo.deviceBrand || uaInfo.deviceBrand,
    deviceModel: clientHintsInfo.deviceModel || uaInfo.deviceModel,
  };
};

// Cache for geolocation
let geoCache: { country: string | null; city: string | null } | null = null;

export const getGeolocation = async (): Promise<{ country: string | null; city: string | null }> => {
  if (geoCache) return geoCache;
  
  const geoApis = [
    {
      url: "https://ipwho.is/",
      parse: (data: { country?: string; city?: string }) => ({ 
        country: data.country || null, 
        city: data.city || null 
      }),
    },
    {
      url: "https://freeipapi.com/api/json",
      parse: (data: { countryName?: string; cityName?: string }) => ({ 
        country: data.countryName || null, 
        city: data.cityName || null 
      }),
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
    } catch {
      // Try next API silently
    }
  }
  
  return { country: null, city: null };
};
