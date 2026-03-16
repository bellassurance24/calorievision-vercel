// Multilingual sitemap generator for CalorieVision
// Includes all static pages + all published blog posts in all 10 languages.
// Blog posts use per-language localized_slug for true multilingual SEO URLs.
// Falls back to the base English slug when localized_slug is missing.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPPORTED_LANGUAGES = ["en", "fr", "es", "pt", "zh", "ar", "it", "de", "nl", "ru", "ja"];
const BASE_URL  = "https://calorievision.online";
const LAST_MOD  = new Date().toISOString().split("T")[0]; // today's date, auto-updated

interface PageConfig {
  path:       string;
  changefreq: string;
  priority:   string;
}

const STATIC_PAGES: PageConfig[] = [
  { path: "",                changefreq: "weekly",  priority: "1.0" },
  { path: "/analyze",        changefreq: "weekly",  priority: "0.9" },
  { path: "/how-it-works",   changefreq: "monthly", priority: "0.8" },
  { path: "/about",          changefreq: "monthly", priority: "0.7" },
  { path: "/faq",            changefreq: "monthly", priority: "0.7" },
  { path: "/contact",        changefreq: "monthly", priority: "0.6" },
  { path: "/blog",           changefreq: "daily",   priority: "0.8" },
  { path: "/privacy-policy", changefreq: "yearly",  priority: "0.3" },
  { path: "/terms",          changefreq: "yearly",  priority: "0.3" },
  { path: "/cookie-policy",  changefreq: "yearly",  priority: "0.3" },
  { path: "/disclaimer",     changefreq: "yearly",  priority: "0.3" },
];

// ── Build one <url> block ─────────────────────────────────────────────────
function urlEntry(
  loc:        string,
  changefreq: string,
  priority:   string,
  lastmod:    string,
  alternates: { hreflang: string; href: string }[],
): string {
  const altTags = alternates
    .map(a => `      <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
    .join("\n");
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${altTags}
  </url>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Generate static-page entries ─────────────────────────────────────────
function staticPageEntries(): string[] {
  const entries: string[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const page of STATIC_PAGES) {
      const loc = `${BASE_URL}/${lang}${page.path}`;
      const alternates = [
        ...SUPPORTED_LANGUAGES.map(l => ({
          hreflang: l,
          href:     `${BASE_URL}/${l}${page.path}`,
        })),
        { hreflang: "x-default", href: `${BASE_URL}/en${page.path}` },
      ];
      entries.push(urlEntry(loc, page.changefreq, page.priority, LAST_MOD, alternates));
    }
  }
  return entries;
}

// ── Generate blog-post entries ────────────────────────────────────────────
// Groups posts by their base English slug, then builds one <url> block per
// (language × post) pair with full hreflang cross-links.
function blogPostEntries(posts: {
  slug:          string;
  language:      string;
  localized_slug: string | null;
  published_at:  string | null;
  updated_at:    string;
}[]): string[] {
  // Build map: base_slug → { lang → localized_slug }
  const bySlug = new Map<string, Map<string, string>>();

  for (const p of posts) {
    const effectiveSlug = p.localized_slug?.trim() || p.slug; // fallback to English slug
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, new Map());
    bySlug.get(p.slug)!.set(p.language, effectiveSlug);
  }

  const entries: string[] = [];

  for (const [baseSlug, langMap] of bySlug.entries()) {
    // Find the post's lastmod date
    const post = posts.find(p => p.slug === baseSlug);
    const lastmod = (post?.published_at ?? post?.updated_at ?? LAST_MOD).split("T")[0];

    for (const [lang, localSlug] of langMap.entries()) {
      const loc = `${BASE_URL}/${lang}/blog/${encodeURIComponent(localSlug)}`;

      // Build alternates from all available language versions of this post
      const alternates = [...langMap.entries()].map(([altLang, altSlug]) => ({
        hreflang: altLang,
        href:     `${BASE_URL}/${altLang}/blog/${encodeURIComponent(altSlug)}`,
      }));

      // x-default → English version (or first available language if no English)
      const enSlug = langMap.get("en") ?? [...langMap.values()][0];
      alternates.push({
        hreflang: "x-default",
        href:     `${BASE_URL}/en/blog/${encodeURIComponent(enSlug ?? baseSlug)}`,
      });

      entries.push(urlEntry(loc, "monthly", "0.7", lastmod, alternates));
    }
  }

  return entries;
}

// ── Edge Function handler ─────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")              ?? "";
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  let blogEntries: string[] = [];

  // Fetch published blog posts only if Supabase is configured
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      const db = createClient(SUPABASE_URL, SERVICE_KEY);

      const { data: posts, error } = await db
        .from("blog_posts")
        .select("slug, language, localized_slug, published_at, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("[sitemap] DB error:", error.message);
        // Continue — we'll still serve static-only sitemap rather than fail
      } else {
        blogEntries = blogPostEntries(posts ?? []);
        console.log(`[sitemap] ${posts?.length ?? 0} published posts → ${blogEntries.length} blog URL entries`);
      }
    } catch (e: any) {
      console.error("[sitemap] Unexpected error fetching posts:", e?.message);
    }
  } else {
    console.warn("[sitemap] No Supabase credentials — serving static pages only");
  }

  const allEntries = [...staticPageEntries(), ...blogEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allEntries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type":  "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=43200", // cache 12h
    },
  });
});
