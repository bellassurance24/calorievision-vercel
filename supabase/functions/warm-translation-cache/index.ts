import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Priority languages for cache warming (all supported languages except EN)
const priorityLanguages = ['fr', 'es', 'pt', 'de', 'it', 'zh', 'ar', 'nl'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageId, content, languages } = await req.json();

    if (!pageId || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing pageId or content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetLanguages = languages || priorityLanguages;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log(`Warming cache for ${pageId} in languages: ${targetLanguages.join(', ')}`);

    const results: Record<string, string> = {};

    // Warm cache for each language sequentially to avoid rate limits
    for (const lang of targetLanguages) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/translate-blog`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            text: content,
            targetLanguage: lang,
            pageId: pageId
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results[lang] = data.cached ? 'already_cached' : 'translated';
          console.log(`${pageId} ${lang}: ${results[lang]}`);
        } else {
          results[lang] = 'failed';
          console.error(`Failed to warm ${pageId} for ${lang}`);
        }

        // Small delay between translations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        results[lang] = 'error';
        console.error(`Error warming ${pageId} for ${lang}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, pageId, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cache warming error:', error);
    return new Response(
      JSON.stringify({ error: 'Cache warming failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
