// Supabase Edge Function: auto-translate-blog-post
// ONE language per call. Forced character-based chunking at 1000 chars.
// Paste this entire file into the Supabase Dashboard editor, then click Deploy.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const JSON_HEADERS = { ...CORS, "Content-Type": "application/json" };

const VALID_LANGS = ["ar", "fr", "es", "de", "it", "nl", "pt", "ru", "zh", "ja"] as const;
type Lang = typeof VALID_LANGS[number];

const LANG_NAMES: Record<Lang, string> = {
  ar: "Arabic",  fr: "French",   es: "Spanish",
  de: "German",  it: "Italian",  nl: "Dutch",
  pt: "Portuguese", ru: "Russian", zh: "Chinese (Simplified)", ja: "Japanese",
};

// ── Tuneable constants ────────────────────────────────────────────────────
const CHUNK_SIZE   = 1000;   // chars per chunk — small = fast, reliable OpenAI responses
const MAX_CHUNKS   = 50;     // generous cap: 50 × 1000 = 50 000 chars max translated
const CALL_TIMEOUT = 55_000; // 55s per individual call
// ─────────────────────────────────────────────────────────────────────────

// ── Single OpenAI call ────────────────────────────────────────────────────
async function callOpenAI(
  apiKey: string,
  model: string,
  system: string,
  user: string,
  lang: Lang,
): Promise<string> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CALL_TIMEOUT);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 2048,
        messages: [
          { role: "system", content: system },
          { role: "user",   content: user   },
        ],
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error(`[OpenAI][${lang}] HTTP ${res.status}`, raw.slice(0, 300));
      throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 200)}`);
    }
    const json = JSON.parse(raw);
    const out  = json?.choices?.[0]?.message?.content;
    if (!out) throw new Error(`Empty response from OpenAI (lang=${lang})`);
    return out.trim();

  } catch (e: any) {
    if (e.name === "AbortError") {
      throw new Error(`OpenAI timed out after ${CALL_TIMEOUT / 1000}s (lang=${lang})`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ── Force-split text into character-based chunks ─────────────────────────
// Tries to break at the nearest HTML tag boundary or whitespace to avoid
// cutting mid-word, but always guarantees chunks <= CHUNK_SIZE chars.
function splitIntoChunks(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  let pos = 0;

  while (pos < text.length) {
    if (pos + maxChars >= text.length) {
      // Last piece — take everything remaining
      chunks.push(text.slice(pos));
      break;
    }

    let end = pos + maxChars;

    // Try to break at a closing HTML tag just after the cut point
    const tagMatch = text.slice(end - 50, end + 100).match(/<\/[a-zA-Z]+>/);
    if (tagMatch && tagMatch.index !== undefined) {
      const tagEnd = end - 50 + tagMatch.index + tagMatch[0].length;
      if (tagEnd > pos) end = tagEnd;
    } else {
      // Fall back: break at last whitespace before cut point
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > pos) end = lastSpace + 1;
    }

    chunks.push(text.slice(pos, end));
    pos = end;
  }

  return chunks;
}

// ── Translate a short plain-text field ───────────────────────────────────
async function translateField(
  apiKey: string, model: string, text: string, lang: Lang,
): Promise<string> {
  const system = `You are a professional translator. Translate from English to ${LANG_NAMES[lang]}. Output ONLY the translated text, nothing else.`;
  return callOpenAI(apiKey, model, system, text, lang);
}

// ── Translate HTML content using forced character chunks ─────────────────
async function translateContent(
  apiKey: string, model: string, content: string, lang: Lang,
): Promise<string> {
  const system = `You are a professional translator. Translate from English to ${LANG_NAMES[lang]}. Preserve ALL HTML tags exactly as they appear. Output ONLY the translated content, nothing else.`;

  // Short enough for one shot?
  if (content.length <= CHUNK_SIZE) {
    return callOpenAI(apiKey, model, system, content, lang);
  }

  const allChunks   = splitIntoChunks(content, CHUNK_SIZE);
  const toTranslate = allChunks.slice(0, MAX_CHUNKS);
  const tail        = allChunks.slice(MAX_CHUNKS).join("");

  if (tail) {
    console.warn(`[CHUNK][${lang}] Exceeds ${MAX_CHUNKS} chunks — appending ${tail.length} chars untranslated`);
  }

  console.log(`[CHUNK][${lang}] ${toTranslate.length} chunk(s) | total chars: ${content.length}`);

  const translated: string[] = [];
  for (let i = 0; i < toTranslate.length; i++) {
    console.log(`[CHUNK][${lang}] ${i + 1}/${toTranslate.length} — ${toTranslate[i].length} chars`);
    translated.push(await callOpenAI(apiKey, model, system, toTranslate[i], lang));
  }

  return translated.join("") + (tail ? "\n" + tail : "");
}

// ── Main handler ─────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  // 1. Env vars
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")              ?? "";
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const OPENAI_KEY   = Deno.env.get("OPENAI_API_KEY")            ?? "";
  const MODEL        = Deno.env.get("OPENAI_TRANSLATION_MODEL")  ?? "gpt-4o-mini";

  console.log("[BOOT] URL:", !!SUPABASE_URL, "| SVC:", !!SERVICE_KEY,
    "| OAI:", !!OPENAI_KEY, "| prefix:", OPENAI_KEY.slice(0, 10),
    "| len:", OPENAI_KEY.length, "| ws:", /\s/.test(OPENAI_KEY));

  if (!SUPABASE_URL || !SERVICE_KEY || !OPENAI_KEY) {
    const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"]
      .filter(k => !Deno.env.get(k)).join(", ");
    console.error("[BOOT] Missing env vars:", missing);
    return new Response(JSON.stringify({ error: `Missing env vars: ${missing}` }),
      { status: 500, headers: JSON_HEADERS });
  }

  // 2. Parse body — expects { postId, targetLang, force? }
  let postId: string | undefined;
  let targetLang: Lang | undefined;
  let force = false;

  try {
    const body = await req.json();
    postId    = body?.postId;
    force     = body?.force === true;
    const tl  = String(body?.targetLang ?? "").trim().toLowerCase();
    if (VALID_LANGS.includes(tl as Lang)) targetLang = tl as Lang;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: JSON_HEADERS });
  }

  if (!postId) {
    return new Response(JSON.stringify({ error: "Missing postId" }),
      { status: 400, headers: JSON_HEADERS });
  }
  if (!targetLang) {
    return new Response(
      JSON.stringify({ error: `Missing/invalid targetLang. Valid: ${VALID_LANGS.join(", ")}` }),
      { status: 400, headers: JSON_HEADERS });
  }

  console.log("[REQ] postId:", postId, "| lang:", targetLang, "| force:", force);

  // 3. Fetch source post
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: post, error: postErr } = await db
    .from("blog_posts").select("*").eq("id", postId).single();

  if (postErr || !post) {
    console.error("[DB] Post not found:", postErr?.message);
    return new Response(JSON.stringify({ error: "Post not found", detail: postErr?.message }),
      { status: 404, headers: JSON_HEADERS });
  }

  if (String(post.language ?? "").trim().toLowerCase() !== "en") {
    return new Response(JSON.stringify({ ok: true, skipped: true, reason: "not_english" }),
      { headers: JSON_HEADERS });
  }

  // 4. Skip if already translated (unless force=true)
  if (!force) {
    const { data: exists } = await db.from("blog_posts")
      .select("id").eq("slug", post.slug).eq("language", targetLang).maybeSingle();
    if (exists) {
      console.log("[SKIP] Already exists:", post.slug, targetLang);
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "already_exists", lang: targetLang }),
        { headers: JSON_HEADERS });
    }
  }

  // 5. Translate
  console.log("[TRANSLATE] Starting", targetLang, "| slug:", post.slug,
    "| content length:", post.content?.length ?? 0);

  try {
    const title   = post.title              ? await translateField  (OPENAI_KEY, MODEL, post.title,              targetLang) : post.title;
    const mTitle  = post.meta_title         ? await translateField  (OPENAI_KEY, MODEL, post.meta_title,         targetLang) : null;
    const mDesc   = post.meta_description   ? await translateField  (OPENAI_KEY, MODEL, post.meta_description,   targetLang) : null;
    const fAlt    = post.featured_image_alt ? await translateField  (OPENAI_KEY, MODEL, post.featured_image_alt, targetLang) : null;
    const content = post.content            ? await translateContent(OPENAI_KEY, MODEL, post.content,            targetLang) : post.content;

    console.log("[TRANSLATE] Done for", targetLang, "— upserting...");

    const { error: upsertErr } = await db.from("blog_posts").upsert(
      {
        slug:               post.slug,
        language:           targetLang,
        title,
        content,
        meta_title:         mTitle,
        meta_description:   mDesc,
        featured_image_alt: fAlt,
        status:             post.status,
        published_at:       post.published_at  ?? null,
        author_id:          post.author_id,
        category_id:        post.category_id   ?? null,
        featured_image_url: post.featured_image_url ?? null,
      },
      { onConflict: "slug,language", ignoreDuplicates: !force },
    );

    if (upsertErr) throw new Error("DB upsert failed: " + upsertErr.message);

    console.log("[DONE] Created:", post.slug, targetLang);
    return new Response(
      JSON.stringify({ ok: true, postId, slug: post.slug, lang: targetLang, status: "created" }),
      { headers: JSON_HEADERS });

  } catch (e: any) {
    console.error("[ERROR]", targetLang, e?.message);
    return new Response(
      JSON.stringify({ ok: false, postId, slug: post.slug, lang: targetLang, error: e?.message }),
      { status: 500, headers: JSON_HEADERS });
  }
});
