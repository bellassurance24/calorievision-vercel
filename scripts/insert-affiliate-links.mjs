#!/usr/bin/env node
/**
 * insert-affiliate-links.mjs
 *
 * Inserts up to 2 affiliate links into every blog post stored in Supabase.
 *
 * Safety rules:
 *   - Skips posts that already contain rel="sponsored"
 *   - Never wraps a keyword that is already inside an <a> tag
 *   - Only replaces the FIRST unlinked occurrence per keyword
 *   - MAX 2 links inserted per article
 *
 * Usage:
 *   node scripts/insert-affiliate-links.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Load .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
// ---------------------------------------------------------------------------
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env");
const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Affiliate link definitions
// ---------------------------------------------------------------------------
const EUROPE_LANGS = new Set(["fr", "de", "es", "it", "nl"]);

const EUROPE_LINKS = [
  {
    pattern: /\b(balance|Waage|báscula|bilancia|weegschaal)\b/i,
    url: "https://amzn.to/4cpiLaa",
  },
  {
    pattern: /\b(poids|Gewicht|peso|gewicht)\b/i,
    url: "https://amzn.to/4tSFjYh",
  },
  {
    pattern: /\b(eau|Wasser|agua|acqua|water)\b/i,
    url: "https://amzn.to/4tdEn0L",
  },
];

const INTL_LINKS = [
  {
    pattern: /\b(scale|weight)\b/i,
    url: "https://amzn.to/4szrWLk",
  },
  {
    pattern: /\b(pounds|kilos|kg)\b/i,
    url: "https://amzn.to/4sxbDyw",
  },
  {
    pattern: /\b(water|drink)\b/i,
    url: "https://amzn.to/3Qnnvpv",
  },
];

// ---------------------------------------------------------------------------
// Find the FIRST occurrence of a keyword that is NOT inside an <a> tag,
// wrap it in an affiliate link, and return the modified HTML.
// Returns null if no eligible occurrence found.
// ---------------------------------------------------------------------------
function insertOneLink(html, { pattern, url }) {
  const re = new RegExp(pattern.source, pattern.flags.replace("g", ""));
  let searchFrom = 0;

  while (searchFrom < html.length) {
    const m = re.exec(html.slice(searchFrom));
    if (!m) return null;

    const matchStart = searchFrom + m.index;
    const matchEnd = matchStart + m[0].length;
    const keyword = m[0];

    // Check whether this match sits inside an open <a> tag
    const beforeMatch = html.slice(0, matchStart);
    const lastOpenA = beforeMatch.lastIndexOf("<a ");
    const lastCloseA = beforeMatch.lastIndexOf("</a");

    if (lastOpenA > lastCloseA) {
      // Already inside an anchor — skip and keep searching
      searchFrom = matchEnd;
      continue;
    }

    // Safe to wrap
    const replacement = `<a href="${url}" rel="nofollow sponsored" target="_blank">${keyword}</a>`;
    return html.slice(0, matchStart) + replacement + html.slice(matchEnd);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // Fetch all posts
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, slug, language, content");

  if (error) {
    console.error("Supabase fetch error:", error.message);
    process.exit(1);
  }

  let updatedCount = 0;

  for (const post of posts) {
    const { id, slug, language, content } = post;

    // Skip posts that already have affiliate links
    if (
      content.includes('rel="sponsored"') ||
      content.includes("rel='sponsored'")
    ) {
      continue;
    }

    const links = EUROPE_LANGS.has(language) ? EUROPE_LINKS : INTL_LINKS;
    let html = content;
    let inserted = 0;

    for (const link of links) {
      if (inserted >= 2) break;
      const updated = insertOneLink(html, link);
      if (updated) {
        html = updated;
        inserted++;
      }
    }

    if (inserted === 0) continue;

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ content: html })
      .eq("id", id);

    if (updateError) {
      console.error(`Error [${lang}] ${slug}: ${updateError.message}`);
    } else {
      console.log(`Updated: [${language}] ${slug}`);
      updatedCount++;
    }
  }

  console.log(`Done: ${updatedCount} articles updated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
