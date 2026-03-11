/**
 * extract-blog-sql.mjs
 * Reads every public/en/blog/<slug>/index.html and emits a SQL INSERT script.
 * Run:  node scripts/extract-blog-sql.mjs > scripts/blog-insert.sql
 */
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR  = path.resolve(__dirname, '../public/en/blog');

// ── helpers ──────────────────────────────────────────────────────────────────

function extract(html, re, group = 1) {
  const m = html.match(re);
  return m ? m[group] : null;
}

/** Return the first <div> child of <article> (its innerHTML). */
function extractArticleDiv(html) {
  // Find <article ...> ... </article>
  const artStart = html.indexOf('<article');
  const artEnd   = html.lastIndexOf('</article>');
  if (artStart === -1 || artEnd === -1) return '';
  const article = html.slice(artStart, artEnd + '</article>'.length);

  // First <div inside that article
  const divStart = article.indexOf('<div');
  if (divStart === -1) return '';

  // Walk forward counting open/close <div> to find the matching </div>
  let depth = 0;
  let i = divStart;
  while (i < article.length) {
    if (article.slice(i, i + 4) === '<div') {
      depth++;
      i += 4;
    } else if (article.slice(i, i + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        return article.slice(divStart, i + 6);
      }
      i += 6;
    } else {
      i++;
    }
  }
  return article.slice(divStart); // fallback: everything from first div
}

/** Minimal SQL string escaping: double-up single quotes */
function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
}

// ── main ──────────────────────────────────────────────────────────────────────

const slugs = fs.readdirSync(BLOG_DIR).filter(d => {
  if (!fs.statSync(path.join(BLOG_DIR, d)).isDirectory()) return false;
  // Skip placeholder directories (post-1, post-2, … post-32) — empty stubs
  if (/^post-\d+$/.test(d)) return false;
  return true;
});

const rows = [];

for (const slug of slugs) {
  const filePath = path.join(BLOG_DIR, slug, 'index.html');
  if (!fs.existsSync(filePath)) continue;

  const html = fs.readFileSync(filePath, 'utf8');

  // title — strip "| CalorieVision" suffix
  let title = extract(html, /<title[^>]*>([^<]+)<\/title>/i);
  if (title) title = title.replace(/\s*\|\s*CalorieVision\s*$/i, '').trim();

  // meta description
  const metaDesc = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
                || extract(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);

  // og:image (featured image)
  const ogImage = extract(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
               || extract(html, /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

  // datePublished from JSON-LD
  const datePublished = extract(html, /"datePublished"\s*:\s*"([^"]+)"/);

  // content HTML
  const contentHtml = extractArticleDiv(html);

  rows.push({ slug, title, metaDesc, ogImage, datePublished, contentHtml });
}

// Sort: named posts first (no "post-N" / "welcome") then post-N numerically, then welcome
rows.sort((a, b) => {
  const isPost  = s => /^post-\d+$/.test(s);
  const isWelc  = s => s === 'welcome-to-calorievision';
  const numPost = s => parseInt(s.replace('post-', ''), 10);
  if (!isPost(a.slug) && !isWelc(a.slug) && (isPost(b.slug) || isWelc(b.slug))) return -1;
  if ((isPost(a.slug) || isWelc(a.slug)) && !isPost(b.slug) && !isWelc(b.slug)) return  1;
  if (isPost(a.slug) && isPost(b.slug)) return numPost(a.slug) - numPost(b.slug);
  return a.slug.localeCompare(b.slug);
});

// ── output ───────────────────────────────────────────────────────────────────

const lines = [];
lines.push(`-- =============================================================`);
lines.push(`-- Blog posts migration — generated ${new Date().toISOString()}`);
lines.push(`-- ${rows.length} posts extracted from public/en/blog/*/index.html`);
lines.push(`-- =============================================================`);
lines.push('');
lines.push(`-- Ensure the status column accepts 'published' as text`);
lines.push(`-- (safe no-op if the enum / check already allows it)`);
lines.push('');

for (const r of rows) {
  const pub = r.datePublished ? sqlStr(r.datePublished) : `'2026-01-01T00:00:00.000+00:00'`;
  lines.push(`-- slug: ${r.slug}`);
  lines.push(`INSERT INTO public.blog_posts`);
  lines.push(`  (slug, title, meta_description, featured_image_url, content, status, is_published, language, published_at, created_at, updated_at)`);
  lines.push(`VALUES`);
  lines.push(`  (`);
  lines.push(`    ${sqlStr(r.slug)},`);
  lines.push(`    ${sqlStr(r.title)},`);
  lines.push(`    ${sqlStr(r.metaDesc)},`);
  lines.push(`    ${sqlStr(r.ogImage)},`);
  lines.push(`    ${sqlStr(r.contentHtml)},`);
  lines.push(`    'published',`);
  lines.push(`    true,`);
  lines.push(`    'en',`);
  lines.push(`    ${pub},`);
  lines.push(`    ${pub},`);
  lines.push(`    ${pub}`);
  lines.push(`  )`);
  lines.push(`ON CONFLICT (slug, language) DO UPDATE SET`);
  lines.push(`  title              = EXCLUDED.title,`);
  lines.push(`  meta_description   = EXCLUDED.meta_description,`);
  lines.push(`  featured_image_url = EXCLUDED.featured_image_url,`);
  lines.push(`  content            = EXCLUDED.content,`);
  lines.push(`  status             = 'published',`);
  lines.push(`  is_published       = true,`);
  lines.push(`  language           = 'en',`);
  lines.push(`  published_at       = EXCLUDED.published_at,`);
  lines.push(`  updated_at         = NOW();`);
  lines.push('');
}

lines.push(`-- Done — ${rows.length} posts upserted.`);
lines.push(`SELECT slug, title, status FROM public.blog_posts ORDER BY published_at DESC;`);

process.stdout.write(lines.join('\n') + '\n');
process.stderr.write(`✅  ${rows.length} posts processed.\n`);
