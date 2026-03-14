#!/usr/bin/env npx tsx
/**
 * fix_remaining.ts — Retry the 13 still-failing blog translations
 *
 * Run with:
 *   npx tsx scripts/fix_remaining.ts
 *
 * Requires .env (or .env.local) to contain:
 *   SUPABASE_URL=https://<ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=<service_role_jwt>
 *
 * What it does for each (slug, language) pair:
 *   1. Fetches the English post from Supabase (cached per slug).
 *   2. Calls the translate-blog Edge Function for title, content, and meta_description.
 *   3. Waits 15 seconds before the next pair to avoid rate limits.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load env ────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local'), override: false });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ── The 13 failing (slug → languages) pairs ─────────────────────────────────
const FAILING: { slug: string; title: string; langs: string[] }[] = [
  {
    slug: 'pasta-calories-complete-guide',
    title: 'Pasta Calories Unveiled: From Spaghetti to Lasagna and Beyond',
    langs: ['de', 'ru', 'ja'],
  },
  {
    slug: 'avocado-calories-complete-guide',
    title: 'The Complete Calorie Guide to Avocados: Everything You Need to Know',
    langs: ['ar'],
  },
  {
    slug: 'beet-calories-complete-nutrition-guide',
    title: 'The Ultimate Calorie Guide to Beets: From Raw to Roasted and Everything Between',
    langs: ['ar', 'es', 'it', 'ja'],
  },
  {
    slug: 'eggplant-calories-complete-guide',
    title: 'Eggplant Calories Demystified: Your Complete Guide to This Versatile Vegetable',
    langs: ['ja', 'zh'],
  },
  {
    slug: 'how-many-calories-in-grapes',
    title: "How Many Calories in Grapes? Your Complete Guide to This Sweet Snack",
    langs: ['ja'],
  },
  {
    slug: 'how-many-calories-in-pizza',
    title: 'How Many Calories in Pizza? Complete Nutrition Guide',
    langs: ['es', 'pt'],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache fetched posts so we don't re-query Supabase for the same slug
const postCache: Record<string, { title: string; content: string; meta_description: string }> = {};

async function fetchPost(slug: string) {
  if (postCache[slug]) return postCache[slug];

  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, content, meta_description')
    .eq('slug', slug)
    .eq('language', 'en')
    .single();

  if (error || !data) {
    throw new Error(`Could not fetch post "${slug}": ${error?.message ?? 'not found'}`);
  }

  postCache[slug] = data as { title: string; content: string; meta_description: string };
  return postCache[slug];
}

/** Call the translate-blog Edge Function for a single text + language */
async function translateField(
  text: string,
  targetLanguage: string,
  pageId: string,
  stripHtml = false,
): Promise<'ok' | 'already_cached' | 'error'> {
  const { data, error } = await supabase.functions.invoke('translate-blog', {
    body: { text, targetLanguage, pageId, stripHtml },
  });

  if (error) {
    console.error(`   ⚠  translate-blog error for ${pageId} [${targetLanguage}]: ${error.message}`);
    return 'error';
  }

  return data?.cached ? 'already_cached' : 'ok';
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Build a flat list of all (slug, lang) jobs
  const jobs: { slug: string; lang: string }[] = [];
  for (const entry of FAILING) {
    for (const lang of entry.langs) {
      jobs.push({ slug: entry.slug, lang });
    }
  }

  const total = jobs.length;
  console.log(`\n🔧  fix_remaining.ts — ${total} translation jobs queued\n`);
  console.log('   Post breakdown:');
  for (const entry of FAILING) {
    const postLabel = entry.title.substring(0, 55) + (entry.title.length > 55 ? '…' : '');
    console.log(`   • [${entry.langs.join(', ')}]  ${postLabel}`);
  }
  console.log();

  let done = 0;
  for (const { slug, lang } of jobs) {
    done++;
    console.log(`[${done}/${total}]  ${slug}  →  ${lang.toUpperCase()}`);

    // 1. Fetch the English source post
    let post: { title: string; content: string; meta_description: string };
    try {
      post = await fetchPost(slug);
    } catch (err) {
      console.error(`   ❌  ${(err as Error).message}`);
      console.log(`   ⏳  Waiting 15 s before next job…\n`);
      if (done < total) await sleep(15_000);
      continue;
    }

    // 2. Translate title (plain text)
    console.log(`   ↳  title        (${slug}-title)`);
    const titleStatus = await translateField(post.title, lang, `${slug}-title`, true);
    console.log(`      ${titleStatus === 'ok' ? '✅ translated' : titleStatus === 'already_cached' ? '🔁 already cached' : '❌ failed'}`);

    // 3. Translate content (HTML preserved)
    console.log(`   ↳  content      (${slug}-content)`);
    const contentStatus = await translateField(post.content, lang, `${slug}-content`, false);
    console.log(`      ${contentStatus === 'ok' ? '✅ translated' : contentStatus === 'already_cached' ? '🔁 already cached' : '❌ failed'}`);

    // 4. Translate meta description (plain text)
    console.log(`   ↳  meta         (${slug}-meta)`);
    const metaStatus = await translateField(post.meta_description, lang, `${slug}-meta`, true);
    console.log(`      ${metaStatus === 'ok' ? '✅ translated' : metaStatus === 'already_cached' ? '🔁 already cached' : '❌ failed'}`);

    // 5. Wait 15 s before the next (slug, lang) pair — skip after the last job
    if (done < total) {
      console.log(`   ⏳  Waiting 15 s before next job…\n`);
      await sleep(15_000);
    }
  }

  console.log('\n🎉  All jobs completed.\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
