import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { removeLanguagePrefix } from "@/hooks/useLocalizedPath";

const BASE_URL = "https://calorievision.online";

/**
 * Component that manages hreflang tags for SEO
 * Dynamically adds/updates hreflang link tags based on current path
 */
const HreflangTags = () => {
  const location = useLocation();

  useEffect(() => {
    // Get the path without language prefix
    const cleanPath = removeLanguagePrefix(location.pathname);
    const pathSuffix = cleanPath === "/" ? "" : cleanPath;

    // Remove existing hreflang tags
    const existingTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingTags.forEach(tag => tag.remove());

    // Add hreflang tags for all supported languages
    SUPPORTED_LANGUAGES.forEach(lang => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = `${BASE_URL}/${lang}${pathSuffix}`;
      document.head.appendChild(link);
    });

    // Add x-default hreflang (points to English version)
    const defaultLink = document.createElement("link");
    defaultLink.rel = "alternate";
    defaultLink.hreflang = "x-default";
    defaultLink.href = `${BASE_URL}/en${pathSuffix}`;
    document.head.appendChild(defaultLink);

    // Update canonical URL to current language version
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `${BASE_URL}${location.pathname}`;

    // Cleanup on unmount
    return () => {
      const tags = document.querySelectorAll('link[rel="alternate"][hreflang]');
      tags.forEach(tag => tag.remove());
    };
  }, [location.pathname]);

  return null;
};

export default HreflangTags;
