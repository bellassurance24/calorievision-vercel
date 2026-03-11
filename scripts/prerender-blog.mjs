#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// prerender-blog.mjs — Static HTML pre-renderer for blog posts
//
// Fetches all published blog posts from Supabase and writes one static HTML
// file per post × language into public/<lang>/blog/<slug>/index.html.
// Those files are copied verbatim into dist/ by the Vite build step, giving
// search engines and AdSense crawlers fully-rendered content.
//
// Usage:
//   node --env-file=.env scripts/prerender-blog.mjs
//   node scripts/prerender-blog.mjs --demo   (dry-run, no files written)
//   node scripts/prerender-blog.mjs --skip   (skip gracefully, no error)
//
// Required env vars for live mode:
//   SUPABASE_URL=https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<service_role_jwt>
// ---------------------------------------------------------------------------

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'pt', 'zh', 'ar', 'it', 'de', 'nl'];
const BASE_URL = 'https://calorievision.online';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isDemoMode = process.argv.includes('--demo');
const isSkipMode = process.argv.includes('--skip');

// Graceful skip: exit 0 without error when called from a build pipeline that
// doesn't have Supabase credentials yet.
if (isSkipMode) {
  console.log('[prerender-blog] --skip flag detected. Skipping pre-render.');
  process.exit(0);
}

// Demo mode: dry run that proves the script works without writing real files.
if (isDemoMode) {
  console.log('[prerender-blog] Running in demo mode.');
  console.log('Would render posts × 9 languages if real credentials were provided.');
  console.log('No files written. Run without --demo to generate real output.');
  process.exit(0);
}

// No credentials: warn and exit cleanly instead of crashing the build.
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.warn('[prerender-blog] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.');
  console.warn('[prerender-blog] Skipping blog pre-render. Set credentials in .env to enable it.');
  process.exit(0);
}

// Only import @supabase/supabase-js when we actually need it (live mode).
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanMetaDescription(html, maxLength = 160) {
  if (!html) return '';
  let text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

function generateHead(post, lang) {
  const title = `${post.title} | CalorieVision Blog`;
  const description = cleanMetaDescription(post.meta_description || '');
  const canonical = `${BASE_URL}/${lang}/blog/${post.slug}`;
  const ogImage = post.featured_image_url || `${BASE_URL}/favicon.png`;

  const alternates = SUPPORTED_LANGUAGES
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/blog/${post.slug}" />`)
    .join('\n    ');

  const xdefault = `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/blog/${post.slug}" />`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || '',
    image: post.featured_image_url || '',
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'CalorieVision' },
    publisher: { '@type': 'Organization', name: 'CalorieVision', url: BASE_URL },
  };

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="CalorieVision" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${ogImage}" />
<meta name="twitter:site" content="@CalorieVision" />
${alternates}
    ${xdefault}
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
</head>
<body>
`;
}

function generateFooter() {
  return `</body>\n</html>`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('[prerender-blog] Fetching published posts from Supabase…');

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*, category:blog_categories(*)')
    .eq('status', 'published');

  if (error) {
    console.error('[prerender-blog] Supabase error:', error.message);
    // Exit 0 so the build doesn't fail — pre-rendering is optional.
    process.exit(0);
  }

  if (!posts || posts.length === 0) {
    console.log('[prerender-blog] No published posts found. Nothing to write.');
    return;
  }

  for (const post of posts) {
    for (const lang of SUPPORTED_LANGUAGES) {
      const outputDir = path.join(process.cwd(), 'public', lang, 'blog', post.slug);
      fs.mkdirSync(outputDir, { recursive: true });

      const head = generateHead(post, lang);
      const bodyContent = `
<article>
  <h1>${post.title}</h1>
  <p><small>${formatDate(post.published_at)}</small></p>
  ${post.featured_image_url
    ? `<img src="${post.featured_image_url}" alt="${post.featured_image_alt || ''}" style="max-width:100%;height:auto;" />`
    : ''}
  <div>${post.content || ''}</div>
</article>
`;
      const html = head + bodyContent + generateFooter();
      const filePath = path.join(outputDir, 'index.html');
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`[prerender-blog] Written ${filePath}`);
    }
  }

  console.log(`[prerender-blog] Done — rendered ${posts.length} posts × ${SUPPORTED_LANGUAGES.length} languages.`);
}

main().catch((err) => {
  console.error('[prerender-blog] Unexpected error:', err);
  // Exit 0 — pre-rendering failure must not block the build.
  process.exit(0);
});
