import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage, SUPPORTED_LANGUAGES, Language } from "@/contexts/LanguageContext";
import { extractLanguageFromPath, removeLanguagePrefix } from "@/hooks/useLocalizedPath";

/**
 * Component that handles language detection and URL redirection
 * - Redirects old URLs without language prefix to new localized URLs
 * - Syncs language context with URL language
 */
const LanguageRedirect = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Exclude admin and auth routes from language redirect
    const excludedPaths = ['/admin', '/auth'];
    const isExcluded = excludedPaths.some(path => location.pathname.startsWith(path));
    
    if (isExcluded) {
      return; // Don't redirect admin or auth routes
    }
    
    const urlLang = extractLanguageFromPath(location.pathname);
    
    if (urlLang) {
      // URL has a valid language prefix - sync context if different
      if (urlLang !== language) {
        setLanguage(urlLang);
      }
    } else {
      // No language prefix in URL - redirect to localized version
      const cleanPath = location.pathname === "/" ? "" : location.pathname;
      const newPath = `/${language}${cleanPath}`;
      navigate(newPath + location.search + location.hash, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, language, setLanguage, navigate]);

  return null;
};

export default LanguageRedirect;
