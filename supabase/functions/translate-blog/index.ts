import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languageNames: Record<string, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
  zh: 'Chinese (Simplified)',
  ar: 'Arabic',
  it: 'Italian',
  de: 'German',
  nl: 'Dutch'
};

const hashText = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  return `${input.length}:${hash >>> 0}`;
};

const protectLeadingMarkers = (input: string): string => {
  let result = input.replace(/(>)(\s*)(\d+\.)(\s*)/g, '$1$2⟦NUM:$3⟧$4');
  result = result.replace(/(>)(\s*)([•·.\-–—])(\s*)(?=\S)/g, '$1$2⟦MARKER:$3⟧$4');
  return result;
};

const restoreLeadingMarkers = (input: string): string => {
  let result = input.replace(/⟦NUM:(\d+\.)⟧/g, '$1');
  result = result.replace(/⟦MARKER:([^⟧])⟧/g, '$1');
  return result;
};

// Comprehensive HTML stripping and text cleaning
const stripHtmlTags = (input: string): string => {
  // Remove all HTML tags completely
  let text = input.replace(/<[^>]*>/g, '');
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&apos;/g, "'")
             .replace(/&#x27;/g, "'")
             .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
             .replace(/&[a-zA-Z0-9#]+;/g, ''); // Remove any remaining entities
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, pageId, stripHtml } = await req.json();

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing text or targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if we need plain text output (for titles, excerpts, meta descriptions)
    const needsPlainText = stripHtml === true || 
      (pageId && (pageId.endsWith('-title') || pageId.endsWith('-excerpt') || pageId.endsWith('-meta')));

    // If target is English, return original (optionally stripped)
    if (targetLanguage === 'en') {
      const result = needsPlainText ? stripHtmlTags(String(text)) : text;
      return new Response(
        JSON.stringify({ translatedText: result, cached: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sourceHash = hashText(String(text));
    const cacheKey = pageId || sourceHash;

    // Initialize Supabase client with service role for cache access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check database cache first
    const { data: cachedTranslation, error: cacheError } = await supabase
      .from('translation_cache')
      .select('translated_content, source_hash')
      .eq('page_id', cacheKey)
      .eq('language', targetLanguage)
      .single();

    if (!cacheError && cachedTranslation && cachedTranslation.source_hash === sourceHash) {
      let cachedContent = cachedTranslation.translated_content;
      
      // Check if cached content has HTML but we need plain text - if so, clean it
      if (needsPlainText && /<[^>]+>/.test(cachedContent)) {
        cachedContent = stripHtmlTags(cachedContent);
        // Update the cache with cleaned version
        await supabase
          .from('translation_cache')
          .update({ 
            translated_content: cachedContent,
            updated_at: new Date().toISOString()
          })
          .eq('page_id', cacheKey)
          .eq('language', targetLanguage);
        console.log(`Cleaned cached translation for ${cacheKey} in ${targetLanguage}`);
      }
      
      console.log(`Cache hit for ${cacheKey} in ${targetLanguage}`);
      return new Response(
        JSON.stringify({ translatedText: cachedContent, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache miss or stale - perform translation
    const targetLangName = languageNames[targetLanguage] || 'English';
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ translatedText: text, cached: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For plain text translations, strip HTML from input first
    const inputText = needsPlainText ? stripHtmlTags(String(text)) : String(text);
    const protectedText = needsPlainText ? inputText : protectLeadingMarkers(inputText);

    console.log(`Translating ${cacheKey} to ${targetLangName} (plainText: ${needsPlainText})...`);

    // Use different prompts for plain text vs HTML content
    const systemPrompt = needsPlainText
      ? `You are a professional translator. Translate the following plain text from English to ${targetLangName}.
Output ONLY the translated text, nothing else.
Do NOT add any HTML tags, markdown formatting, or explanations.
Keep the translation natural and fluent.`
      : `You are a professional translator. Translate the following text from English to ${targetLangName}.
Preserve ALL HTML tags, attributes, links, whitespace, and punctuation.
Do NOT remove or normalize leading markers/bullets such as ".", "•", "·", "-", "–", "—" at the start of headings/lines.
The text may include tokens like ⟦MARKER:x⟧ — keep them EXACTLY unchanged.
Only output the translated text, nothing else. Do not add explanations or notes.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: protectedText
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Translation API error:', await response.text());
      return new Response(
        JSON.stringify({ translatedText: text, cached: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let translatedRaw = data.choices?.[0]?.message?.content || text;
    
    // For plain text, ensure no HTML tags crept in; for HTML content, restore markers
    let translatedText: string;
    if (needsPlainText) {
      translatedText = stripHtmlTags(String(translatedRaw));
    } else {
      translatedText = restoreLeadingMarkers(String(translatedRaw));
    }

    // Store in database cache (upsert)
    const { error: upsertError } = await supabase
      .from('translation_cache')
      .upsert({
        page_id: cacheKey,
        language: targetLanguage,
        source_hash: sourceHash,
        translated_content: translatedText,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'page_id,language'
      });

    if (upsertError) {
      console.error('Cache upsert error:', upsertError);
    } else {
      console.log(`Cached translation for ${cacheKey} in ${targetLangName}`);
    }

    return new Response(
      JSON.stringify({ translatedText, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: 'Translation failed', translatedText: '' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
