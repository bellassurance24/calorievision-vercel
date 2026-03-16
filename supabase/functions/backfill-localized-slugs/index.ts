// Supabase Edge Function: backfill-localized-slugs
//
// One-time (or re-runnable) script to retroactively generate localized_slug
// for all existing translated blog posts that are missing one.
//
// Covers: ar (Arabic), ru (Russian), zh (Chinese), ja (Japanese),
//         and any Latin-script posts the SQL migration missed.
//
// Usage:
//   POST /functions/v1/backfill-localized-slugs
//   Body: { "dryRun": false }       ← set true to preview without writing
//   Body: { "dryRun": false, "lang": "ar" }  ← process only one language
//
// Auth: call with service-role key in Authorization header.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const JSON_HEADERS = { ...CORS, "Content-Type": "application/json" };

// ═════════════════════════════════════════════════════════════════════════
// SAME localizedSlugify used in auto-translate-blog-post
// (kept in sync manually — shared module not available in Deno Edge Functions)
// ═════════════════════════════════════════════════════════════════════════

const CYRILLIC_MAP: Record<string, string> = {
  "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"zh",
  "з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o",
  "п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"kh","ц":"ts",
  "ч":"ch","ш":"sh","щ":"shch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu",
  "я":"ya",
};

const ARABIC_MAP: Record<string, string> = {
  "ا":"a","أ":"a","إ":"i","آ":"aa","ب":"b","ت":"t","ث":"th","ج":"j",
  "ح":"h","خ":"kh","د":"d","ذ":"dh","ر":"r","ز":"z","س":"s","ش":"sh",
  "ص":"s","ض":"d","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q",
  "ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ي":"y","ى":"a",
  "ة":"a","ء":"","ئ":"y","ؤ":"w","ّ":"","َ":"a","ِ":"i","ُ":"u",
  "ً":"an","ٍ":"in","ٌ":"un","ْ":"","ـ":"",
};

function localizedSlugify(title: string, lang: string): string {
  if (!title || !title.trim()) return "";

  let s = title.trim();

  if (lang === "ru") {
    s = s.split("").map(ch => {
      const lower = ch.toLowerCase();
      if (lower in CYRILLIC_MAP) {
        const trans = CYRILLIC_MAP[lower];
        return ch !== lower ? (trans.charAt(0).toUpperCase() + trans.slice(1)) : trans;
      }
      return ch;
    }).join("");
  } else if (lang === "ar") {
    s = s.split("").map(ch => ARABIC_MAP[ch] ?? ch).join("");
    s = s.replace(/[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufefc]/g, "");
  }

  s = s.toLowerCase();

  if (lang === "zh" || lang === "ja") {
    return s
      .replace(/[\s\u3000\u00a0]+/g, "-")
      .replace(/[^\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9fa-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "post";
  }

  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return s
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "post";
}

// ─────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")              ?? "";
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }

  let dryRun = true;   // safe default: never writes unless explicitly told to
  let filterLang: string | null = null;

  try {
    const body    = await req.json();
    dryRun        = body?.dryRun !== false;   // must pass false explicitly to write
    filterLang    = body?.lang ?? null;
  } catch { /* no body is fine — uses defaults */ }

  console.log(`[backfill] dryRun=${dryRun} filterLang=${filterLang ?? "all"}`);

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  // Fetch all non-English published posts that still need a localized_slug
  let query = db
    .from("blog_posts")
    .select("id, slug, title, language, localized_slug")
    .neq("language", "en")
    .eq("status", "published");

  if (filterLang) query = query.eq("language", filterLang);

  const { data: posts, error: fetchErr } = await query;

  if (fetchErr) {
    return new Response(
      JSON.stringify({ error: "DB fetch error: " + fetchErr.message }),
      { status: 500, headers: JSON_HEADERS },
    );
  }

  const all     = posts ?? [];
  const missing = all.filter(p => !p.localized_slug);
  console.log(`[backfill] total=${all.length} missing localized_slug=${missing.length}`);

  if (missing.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, message: "Nothing to backfill — all posts already have localized_slug.", total: all.length }),
      { headers: JSON_HEADERS },
    );
  }

  // Generate slugs and build update payload
  const updates: { id: string; slug: string; language: string; old: string | null; localized_slug: string }[] = [];

  // Track generated slugs per language to detect and resolve collisions
  const seenSlugs: Record<string, Set<string>> = {};

  for (const post of missing) {
    const lang = post.language as string;
    const raw  = localizedSlugify(post.title ?? "", lang);

    // Fallback to base English slug if slugification yields nothing
    let candidate = raw || post.slug;

    // Collision detection within this batch
    if (!seenSlugs[lang]) seenSlugs[lang] = new Set();
    let suffix = 0;
    let unique = candidate;
    while (seenSlugs[lang].has(unique)) {
      suffix++;
      unique = `${candidate}-${suffix}`;
    }
    seenSlugs[lang].add(unique);

    updates.push({
      id:            post.id,
      slug:          post.slug,
      language:      lang,
      old:           post.localized_slug,
      localized_slug: unique,
    });
  }

  console.log(`[backfill] prepared ${updates.length} updates`);

  if (dryRun) {
    return new Response(
      JSON.stringify({
        ok:      true,
        dryRun:  true,
        count:   updates.length,
        preview: updates.slice(0, 20),   // show first 20 for review
      }),
      { headers: JSON_HEADERS },
    );
  }

  // Write updates in batches of 50 to avoid timeout
  const BATCH = 50;
  let successCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    for (const u of batch) {
      const { error: upErr } = await db
        .from("blog_posts")
        .update({ localized_slug: u.localized_slug })
        .eq("id", u.id);

      if (upErr) {
        errors.push(`[${u.language}] ${u.slug} → ${u.localized_slug}: ${upErr.message}`);
        console.error("[backfill] update error:", upErr.message);
      } else {
        successCount++;
        console.log(`[backfill] ✓ [${u.language}] ${u.slug} → ${u.localized_slug}`);
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok:           errors.length === 0,
      dryRun:       false,
      total:        missing.length,
      success:      successCount,
      failed:       errors.length,
      errors:       errors.slice(0, 20),
    }),
    { headers: JSON_HEADERS },
  );
});
