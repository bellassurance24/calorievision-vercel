// One-time script: force-retranslate a specific blog post into all 10 languages
// Uses raw fetch to avoid supabase-js import issues

const SUPABASE_URL = 'https://ttjcfwspcpnxtxzqnfrh.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0amNmd3NwY3BueHR4enFuZnJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQxMTUyOCwiZXhwIjoyMDg3OTg3NTI4fQ.nBjpnQmLNiQBRCMibiCltStri6YGG0EIIYODbVf35xw';
const ANON_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0amNmd3NwY3BueHR4enFuZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTE1MjgsImV4cCI6MjA4Nzk4NzUyOH0.wxynpIi5qzWdFlFNdhe5GjKRKQJwTIpJsInCdY59jhE';

const TARGET_SLUG = 'comprehensive-guide-ai-nutrition-photo-analysis-2026';
const LANGS = ['ar','fr','es','de','it','nl','pt','ru','zh','ja'];

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function dbQuery(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`DB query failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function invokeFunction(name, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Function ${name} failed: ${res.status} ${text}`);
  return JSON.parse(text);
}

async function main() {
  // 1. Find the English source post
  console.log('Looking up English post...');
  const posts = await dbQuery(
    `blog_posts?slug=eq.${TARGET_SLUG}&language=eq.en&select=id,title,slug,language`
  );

  if (!posts.length) {
    console.error('English post not found for slug:', TARGET_SLUG);
    process.exit(1);
  }
  const enPost = posts[0];
  console.log(`Found EN post: id=${enPost.id}, title="${enPost.title}"\n`);

  // 2. Force-retranslate all 10 languages (sequentially to avoid rate limits)
  for (const lang of LANGS) {
    try {
      console.log(`[${lang}] Force retranslating...`);
      const data = await invokeFunction('auto-translate-blog-post', {
        postId: enPost.id,
        targetLang: lang,
        force: true,
      });
      console.log(`[${lang}] OK:`, data.skipped ? 'SKIPPED' : 'TRANSLATED');
    } catch (err) {
      console.error(`[${lang}] FAILED:`, err.message);
    }
  }

  // 3. Fetch and display all 11 rows
  console.log('\n=== ALL ROWS IN DATABASE ===');
  const allRows = await dbQuery(
    `blog_posts?slug=eq.${TARGET_SLUG}&select=id,slug,language,title,localized_slug,status,published_at&order=language`
  );

  console.log(`Found ${allRows.length} rows:\n`);
  for (const row of allRows) {
    const title = row.title || '(empty)';
    console.log(`  [${row.language.toUpperCase().padEnd(2)}] id=${row.id}`);
    console.log(`       title: "${title.length > 80 ? title.slice(0, 80) + '...' : title}"`);
    console.log(`       localized_slug: ${row.localized_slug}`);
    console.log(`       status: ${row.status} | published: ${row.published_at}`);
    console.log('');
  }
}

main().catch(console.error);
