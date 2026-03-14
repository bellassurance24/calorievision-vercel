import { createClient } from "@supabase/supabase-js";

// ── Keys ─────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ttjcfwspcpnxtxzqnfrh.supabase.co";
const ANON_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0amNmd3NwY3BueHR4enFuZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTE1MjgsImV4cCI6MjA4Nzk4NzUyOH0.wxynpIi5qzWdFlFNdhe5GjKRKQJwTIpJsInCdY59jhE";
const SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0amNmd3NwY3BueHR4enFuZnJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQxMTUyOCwiZXhwIjoyMDg3OTg3NTI4fQ.nBjpnQmLNiQBRCMibiCltStri6YGG0EIIYODbVf35xw";
// ─────────────────────────────────────────────────────────────────────────────

const EDGE_URL     = `${SUPABASE_URL}/functions/v1/auto-translate-blog-post`;
const TARGET_LANGS = ["ar", "fr", "es", "de", "it", "nl", "pt", "ru", "zh", "ja"] as const;

// ── Throttle settings ─────────────────────────────────────────────────────────
const CALL_DELAY_MS  = 10_000;  // 10 s between every individual call
const BATCH_SIZE     = 5;       // process 5 languages, then take a long break
const BATCH_PAUSE_MS = 60_000;  // 60 s cooldown between batches
const MAX_RETRIES    = 3;       // retry up to 3× on WORKER_LIMIT / 5xx errors
const RETRY_BASE_MS  = 30_000;  // first retry wait: 30 s (doubles each time)
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(statusCode: number, bodyText: string): boolean {
  if (statusCode === 429) return true;                        // rate-limit
  if (statusCode >= 500) return true;                        // server errors
  if (bodyText.includes("WORKER_LIMIT")) return true;        // quota exceeded
  if (bodyText.includes("Worker limit")) return true;
  return false;
}

async function callEdgeFunction(
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

    // Success path
    if (res.ok) {
      if (body?.skipped) return { ok: true, status: `skipped (${body.reason ?? "unknown"})` };
      if (body?.ok)      return { ok: true, status: body.status ?? "created" };
      return { ok: false, status: "failed", error: body?.error ?? text.slice(0, 200) };
    }

    // Decide whether to retry
    if (isRetryable(res.status, text)) {
      const waitMs = RETRY_BASE_MS * Math.pow(2, attempt - 1); // 30s, 60s, 120s
      lastError = `HTTP ${res.status} (${text.slice(0, 120).trim()})`;
      if (attempt < MAX_RETRIES) {
        process.stdout.write(
          ` ⚠ ${lastError} — retry ${attempt}/${MAX_RETRIES - 1} in ${waitMs / 1000}s...`,
        );
        await sleep(waitMs);
        continue;
      }
    } else {
      // Non-retryable error (400 bad request etc.) — bail immediately
      return { ok: false, status: "failed", error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
  }

  return { ok: false, status: "failed", error: `Exhausted retries. Last: ${lastError}` };
}

async function main() {
  console.log("Starting translation for all English posts...\n");
  console.log(`Settings: delay=${CALL_DELAY_MS / 1000}s | batch=${BATCH_SIZE} langs | batch-pause=${BATCH_PAUSE_MS / 1000}s | retries=${MAX_RETRIES}\n`);

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug")
    .eq("language", "en")
    .eq("status", "published");

  if (error || !posts) {
    console.error("Error fetching posts:", error);
    process.exit(1);
  }

  if (posts.length === 0) {
    console.log("No published English posts found.");
    return;
  }

  const total     = posts.length * TARGET_LANGS.length;
  let   succeeded = 0;
  let   skipped   = 0;
  let   failed    = 0;
  let   callIndex = 0;

  console.log(`Found ${posts.length} post(s) × ${TARGET_LANGS.length} languages = ${total} calls to make.\n`);

  for (const post of posts) {
    console.log(`\nPost: "${post.title}" (${post.id})`);

    // Split TARGET_LANGS into batches of BATCH_SIZE
    for (let bStart = 0; bStart < TARGET_LANGS.length; bStart += BATCH_SIZE) {
      const batch = TARGET_LANGS.slice(bStart, bStart + BATCH_SIZE);

      if (bStart > 0) {
        console.log(`  ⏸  Batch pause — waiting ${BATCH_PAUSE_MS / 1000}s before next batch...`);
        await sleep(BATCH_PAUSE_MS);
      }

      for (const lang of batch) {
        callIndex++;
        const label = `  [${callIndex}/${total}][${lang}]`;
        process.stdout.write(`${label} translating...`);

        try {
          const result = await callEdgeFunction(post.id, lang);

          if (result.ok && result.status.startsWith("skipped")) {
            process.stdout.write(` SKIPPED (${result.status})\n`);
            skipped++;
          } else if (result.ok) {
            process.stdout.write(` ✓ OK (${result.status})\n`);
            succeeded++;
          } else {
            process.stdout.write(` ✗ FAILED — ${result.error}\n`);
            failed++;
          }
        } catch (err: any) {
          process.stdout.write(` ✗ ERROR — ${err.message}\n`);
          failed++;
        }

        // Inter-call delay (skip after the very last call)
        if (callIndex < total) {
          await sleep(CALL_DELAY_MS);
        }
      }
    }
  }

  console.log(`\n${"─".repeat(55)}`);
  console.log(`Done!  ✓ Created: ${succeeded}  |  → Skipped: ${skipped}  |  ✗ Failed: ${failed}`);
  console.log(`Total calls: ${callIndex}/${total}`);
}

main();
