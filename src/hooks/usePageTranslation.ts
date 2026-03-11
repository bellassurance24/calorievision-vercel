import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface TranslationCache {
  [key: string]: {
    [lang: string]: {
      sourceHash: string;
      value: string;
    };
  };
}

const translationCache: TranslationCache = {};

const hashText = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  return `${input.length}:${hash >>> 0}`;
};

export function usePageTranslation(pageId: string) {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  const translateHtml = useCallback(async (html: string): Promise<string> => {
    if (language === 'en') {
      return html;
    }

    const textId = `${pageId}-content`;
    const sourceHash = hashText(html);

    // Check local memory cache first
    const cached = translationCache[textId]?.[language];
    if (cached && cached.sourceHash === sourceHash) {
      return cached.value;
    }

    setIsTranslating(true);

    try {
      // Pass pageId for server-side database caching
      const { data, error } = await supabase.functions.invoke('translate-blog', {
        body: { text: html, targetLanguage: language, pageId: textId }
      });

      if (error) {
        console.error('Translation error:', error);
        return html;
      }

      const translatedText = data?.translatedText;
      if (typeof translatedText !== 'string' || !translatedText) {
        return html;
      }

      // Cache in local memory for instant subsequent access
      if (!translationCache[textId]) {
        translationCache[textId] = {};
      }
      translationCache[textId][language] = { sourceHash, value: translatedText };

      // Log if served from database cache
      if (data?.cached) {
        console.log(`Translation for ${textId} served from database cache`);
      }

      return translatedText;
    } catch (err) {
      console.error('Translation error:', err);
      return html;
    } finally {
      setIsTranslating(false);
    }
  }, [language, pageId]);

  return {
    translateHtml,
    isTranslating,
    currentLanguage: language,
    translatedContent,
    setTranslatedContent
  };
}
