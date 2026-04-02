import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractLanguageFromPath } from "@/hooks/useLocalizedPath";

/**
 * Component that handles language detection and URL redirection.
 * - Redirects URLs without a language prefix to their localized equivalent.
 * - Syncs the language context when the URL prefix changes (e.g. direct navigation,
 *   back/forward, or external links).
 *
 * IMPORTANT: `language` is intentionally NOT in the effect's dependency array.
 * Including it would cause a race condition: when the language switcher calls
 * setLanguage("en") + navigate("/en/...") in the same handler, React may commit
 * the language state change BEFORE React Router commits the new pathname. The
 * effect would then fire with language="en" but pathname still="/fr/...", detect
 * the mismatch and revert the language back to "fr". Using a ref lets us always
 * read the latest language value without re-running the effect on every change.
 */
const LanguageRedirect = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Always-current ref — updated on every render, never stale inside the effect.
  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    // Admin and auth routes are not localized — skip them.
    const excludedPaths = ["/admin", "/auth"];
    if (excludedPaths.some((p) => location.pathname.startsWith(p))) return;

    const urlLang = extractLanguageFromPath(location.pathname);

    if (urlLang) {
      // URL carries a language prefix — it is the source of truth.
      // Sync the context only if it differs (e.g. user pasted a /en/ link while
      // their stored preference was "fr").
      if (urlLang !== languageRef.current) {
        setLanguage(urlLang);
      }
    } else {
      // No language prefix — redirect to the prefixed version using the current
      // language preference (read via ref to avoid stale-closure issues).
      const cleanPath = location.pathname === "/" ? "" : location.pathname;
      const newPath = `/${languageRef.current}${cleanPath}`;
      navigate(newPath + location.search + location.hash, { replace: true });
    }
    // Only re-run when the URL changes — NOT when `language` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default LanguageRedirect;
