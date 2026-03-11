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
  // Lightweight stable hash to invalidate cache when the source text changes
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  return `${input.length}:${hash >>> 0}`;
};

export function useBlogTranslation() {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = useCallback(async (text: string, textId: string): Promise<string> => {
    // If language is English, return original
    if (language === 'en') {
      return text;
    }

    const sourceHash = hashText(text);

    // Check local memory cache first (only if source text is identical)
    const cached = translationCache[textId]?.[language];
    if (cached && cached.sourceHash === sourceHash) {
      return cached.value;
    }

    setIsTranslating(true);

    try {
      // Pass pageId for server-side database caching
      const { data, error } = await supabase.functions.invoke('translate-blog', {
        body: { text, targetLanguage: language, pageId: textId }
      });

      if (error) {
        console.error('Translation error:', error);
        return text;
      }

      const translatedText = data?.translatedText;
      if (typeof translatedText !== 'string' || !translatedText) {
        return text;
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
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateContent = useCallback(async (
    title: string,
    content: string,
    postId: string
  ): Promise<{ title: string; content: string }> => {
    if (language === 'en') {
      return { title, content };
    }

    const [translatedTitle, translatedContent] = await Promise.all([
      translateText(title, `${postId}-title`),
      translateText(content, `${postId}-content`)
    ]);

    return { title: translatedTitle, content: translatedContent };
  }, [language, translateText]);

  return {
    translateText,
    translateContent,
    isTranslating,
    currentLanguage: language
  };
}

