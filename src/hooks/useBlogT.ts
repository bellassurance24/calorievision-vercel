/**
 * useBlogT — returns blog UI strings for the current language.
 *
 * Usage:
 *   const t = useBlogT();
 *   <span>{t.back}</span>
 *   <span>{t.fallback.replace('{lang}', language.toUpperCase())}</span>
 */

import { useLanguage } from '@/contexts/LanguageContext';
import translations from '@/locales/blog';

export function useBlogT() {
  const { language } = useLanguage();
  return translations[language] ?? translations['en'];
}
