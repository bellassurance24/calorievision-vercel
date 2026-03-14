import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type Language = "en" | "fr" | "es" | "pt" | "zh" | "ar" | "it" | "de" | "nl" | "ru" | "ja";

export const SUPPORTED_LANGUAGES: Language[] = ["en", "fr", "es", "pt", "zh", "ar", "it", "de", "nl", "ru", "ja"];

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  cycleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  cycleLanguage: () => {},
});

const STORAGE_KEY = "calorievision_language";

/**
 * Extract language from URL path
 */
const extractLanguageFromPath = (pathname: string): Language | null => {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (match && SUPPORTED_LANGUAGES.includes(match[1] as Language)) {
    return match[1] as Language;
  }
  return null;
};

/**
 * Get initial language from storage or browser
 */
const getStoredOrBrowserLanguage = (): Language => {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
    return stored;
  }

  const browserLang = window.navigator.language.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    if (browserLang.startsWith(lang)) {
      return lang;
    }
  }

  return "en";
};

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    
    // First, check URL for language
    const urlLang = extractLanguageFromPath(window.location.pathname);
    if (urlLang) {
      return urlLang;
    }
    
    // Otherwise, use stored/browser language
    return getStoredOrBrowserLanguage();
  });

  // Sync language to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
  }, []);

  const cycleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const currentIndex = SUPPORTED_LANGUAGES.indexOf(prev);
      const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
      return SUPPORTED_LANGUAGES[nextIndex];
    });
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, cycleLanguage }),
    [language, setLanguage, cycleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
