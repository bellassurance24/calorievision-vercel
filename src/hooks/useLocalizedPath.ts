import { useLanguage, Language, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Hook to manage localized paths with language prefix
 */
export const useLocalizedPath = () => {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Generate a localized path with the current language prefix
   */
  const localizedPath = useCallback((path: string): string => {
    // Remove any existing language prefix
    const cleanPath = removeLanguagePrefix(path);
    // Add current language prefix
    return `/${language}${cleanPath === "/" ? "" : cleanPath}`;
  }, [language]);

  /**
   * Get the current path without language prefix
   */
  const currentPathWithoutLang = removeLanguagePrefix(location.pathname);

  /**
   * Change language and update URL
   */
  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
    const newPath = `/${newLang}${currentPathWithoutLang === "/" ? "" : currentPathWithoutLang}`;
    navigate(newPath + location.search + location.hash, { replace: true });
  }, [setLanguage, currentPathWithoutLang, location.search, location.hash, navigate]);

  return {
    localizedPath,
    currentPathWithoutLang,
    changeLanguage,
    language,
  };
};

/**
 * Remove language prefix from a path
 */
export const removeLanguagePrefix = (path: string): string => {
  const langPrefixMatch = path.match(/^\/([a-z]{2})(\/|$)/);
  if (langPrefixMatch && SUPPORTED_LANGUAGES.includes(langPrefixMatch[1] as Language)) {
    return path.slice(3) || "/";
  }
  return path;
};

/**
 * Extract language from path
 */
export const extractLanguageFromPath = (path: string): Language | null => {
  const langPrefixMatch = path.match(/^\/([a-z]{2})(\/|$)/);
  if (langPrefixMatch && SUPPORTED_LANGUAGES.includes(langPrefixMatch[1] as Language)) {
    return langPrefixMatch[1] as Language;
  }
  return null;
};
