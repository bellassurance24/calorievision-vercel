import { createClient } from "@supabase/supabase-js";

// ── Keys (same as run_translate.ts — proven to work) ─────────────────────────
const SUPABASE_URL = "https://ttjcfwspcpnxtxzqnfrh.supabase.co";
const ANON_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0amNmd3NwY3BueHR4enFuZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTE1MjgsImV4cCI6MjA4Nzk4NzUyOH0.wxynpIi5qzWdFlFNdhe5GjKRKQJwTIpJsInCdY59jhE";
const SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0amNmd3NwY3BueHR4enFuZnJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQxMTUyOCwiZXhwIjoyMDg3OTg3NTI4fQ.nBjpnQmLNiQBRCMibiCltStri6YGG0EIIYODbVf35xw";
// ─────────────────────────────────────────────────────────────────────────────

const EDGE_URL    = `${SUPABASE_URL}/functions/v1/auto-translate-blog-post`;
const DELAY_MS    = 15_000;   // 15 s between each (slug, lang) call
const MAX_RETRIES = 3;
const RETRY_BASE  = 30_000;   // first retry wait: 30 s, then 60 s, then 120 s

// ── The 13 failing (slug → languages) pairs ──────────────────────────────────
const FAILING: { slug: string; langs: string[] }[] = [
  { slug: "pasta-calories-complete-guide",            langs: ["de", "ru", "ja"] },
  { slug: "avocado-calories-complete-guide",          langs: ["ar"] },
  { slug: "beet-calories-complete-nutrition-guide",   langs: ["ar", "es", "it", "ja"] },
  { slug: "eggplant-calories-complete-guide",         langs: ["ja", "zh"] },
  { slug: "how-many-calories-in-grapes",              langs: ["ja"] },
  { slug: "how-many-calories-in-pizza",               langs: ["es", "pt"] },
];

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(status: number, body: string): boolean {
  return status === 429 || status >= 500 || body.includes("WORKER_LIMIT") || body.includes("Worker limit");
}

async function callEdge(
  postId: string,
  targetLang: string,
): Promise<{ ok: boolean; status: string; error?: string }> {
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":        ANON_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ postId, targetLang }),
    });

    const text = await res.text();
    let body: any;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }

    if (res.ok) {
      if (body?.skipped) return { ok: true,  status: `skipped (${body.reason ?? "unknown"})` };
      if (body?.ok)      return { ok: true,  status: body.status ?? "created" };
      return              { ok: false, status: "failed", error: body?.error ?? text.slice(0, 200) };
    }

    if (isRetryable(res.status, text)) {
      const waitMs = RETRY_BASE * Math.pow(2, attempt - 1);
      lastError = `HTTP ${res.status} — ${text.slice(0, 120).trim()}`;
      if (attempt < MAX_RETRIES) {
        console.log(`   ⚠  ${lastError}`);
        console.log(`   ↻  retry ${attempt}/${MAX_RETRIES - 1} in ${waitMs / 1000}s…`);
        await sleep(waitMs);
        continue;
      }
    } else {
      return { ok: false, status: "failed", error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
  }

  return { ok: false, status: "failed", error: `Exhausted retries. Last: ${lastError}` };
}

async function main() {
  // ── Build flat job list ───────────────────────────────────────────────────
  const jobs: { slug: string; lang: string }[] = [];
  for (const entry of FAILING) {
    for (const lang of entry.langs) {
      jobs.push({ slug: entry.slug, lang });
    }
  }

  const total = jobs.length;
  console.log(`\n🔧  fix_remaining.ts — ${total} translation jobs queued\n`);

  // ── Fetch all needed English post UUIDs in one query ─────────────────────
  const slugs = [...new Set(FAILING.map(e => e.slug))];
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title")
    .eq("language", "en")
    .in("slug", slugs);

  if (error || !posts) {
    console.error("❌  Could not fetch posts from Supabase:", error?.message);
    process.exit(1);
  }

  const slugToId: Record<string, string> = {};
  for (const p of posts) slugToId[p.slug] = p.id;

  console.log("   Posts found in Supabase:");
  for (const entry of FAILING) {
    const id  = slugToId[entry.slug];
    const ok  = id ? "✅" : "❌ NOT FOUND";
    console.log(`   ${ok}  [${entry.langs.join(", ")}]  ${entry.slug}${id ? "  ("+id+")" : ""}`);
  }

  const missing = FAILING.filter(e => !slugToId[e.slug]);
  if (missing.length > 0) {
    console.error(`\n❌  ${missing.length} slug(s) not found in the database. Aborting.`);
    process.exit(1);
  }

  console.log();

  // ── Run jobs ──────────────────────────────────────────────────────────────
  let succeeded = 0, skipped = 0, failed = 0;

  for (let i = 0; i < jobs.length; i++) {
    const { slug, lang } = jobs[i];
    const postId = slugToId[slug];
    const label  = `[${i + 1}/${total}]`;

    process.stdout.write(`${label}  ${slug}  →  ${lang.toUpperCase()}  …`);

    try {
      const result = await callEdge(postId, lang);

      if (result.ok && result.status.startsWith("skipped")) {
        process.stdout.write(` 🔁 SKIPPED (${result.status})\n`);
        skipped++;
      } else if (result.ok) {
        process.stdout.write(` ✅ OK (${result.status})\n`);
        succeeded++;
      } else {
        process.stdout.write(` ❌ FAILED — ${result.error}\n`);
        failed++;
      }
    } catch (err: any) {
      process.stdout.write(` ❌ ERROR — ${err.message}\n`);
      failed++;
    }

    // 15-second delay between jobs (skip after the last one)
    if (i < jobs.length - 1) {
      console.log(`   ⏳  Waiting ${DELAY_MS / 1000}s before next job…`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n${"─".repeat(55)}`);
  console.log(`🎉  Done!  ✅ Created: ${succeeded}  |  🔁 Skipped: ${skipped}  |  ❌ Failed: ${failed}`);
  console.log(`   Total: ${jobs.length} jobs`);
}

main();
