import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS_PER_WINDOW = 10;

type RateLimitEntry = { count: number; windowStart: number };
const ipRequestLog = new Map<string, RateLimitEntry>();

function rateLimit(req: Request): Response | null {
  const clientIp =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip");
  if (!clientIp) return null;
  const now = Date.now();
  const existing = ipRequestLog.get(clientIp);
  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestLog.set(clientIp, { count: 1, windowStart: now });
    return null;
  }
  if (existing.count >= RATE_LIMIT_MAX_REQUESTS_PER_WINDOW) {
    return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  existing.count += 1;
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalysisItem {
  name: string; calories: number; protein: number;
  carbs: number; fat: number; confidence: number; notes: string;
}
interface AnalysisPayload {
  items: AnalysisItem[];
  totalCalories: number; totalProtein: number;
  totalCarbs: number; totalFat: number;
}

// ── Supabase admin client ─────────────────────────────────────────────────────
function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

// ── Check if scan capture is enabled (reads from site_settings table) ─────────
async function isCaptureEnabled(): Promise<boolean> {
  try {
    const sb = getAdminClient();
    const { data } = await sb
      .from("site_settings")
      .select("value")
      .eq("key", "capture_user_scans_enabled")
      .single();
    // value is jsonb: either true (boolean) or the string "true"
    return data?.value === true || data?.value === "true";
  } catch {
    return false;
  }
}

// ── Upload image to Supabase Storage ─────────────────────────────────────────
async function uploadScanImage(
  imageBytes: Uint8Array,
  mimeType: string,
): Promise<string | null> {
  try {
    const sb = getAdminClient();
    const ext = mimeType.split("/")[1] || "jpg";
    const fileName = `scans/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage
      .from("user-scans")
      .upload(fileName, imageBytes, { contentType: mimeType, upsert: false });
    if (error) {
      console.error("uploadScanImage: error", error.message);
      return null;
    }
    return fileName;
  } catch (e) {
    console.error("uploadScanImage: unexpected", e);
    return null;
  }
}

// ── Save full scan record (image + analysis) after successful analysis ─────────
async function saveScanRecord(
  imageBytes: Uint8Array,
  mimeType: string,
  analysis: AnalysisPayload,
  deviceType: string | null,
  browser: string | null,
  language: string | null,
  country: string | null,
  city: string | null,
  deviceBrand: string | null,
): Promise<void> {
  try {
    const enabled = await isCaptureEnabled();
    if (!enabled) {
      console.log("saveScanRecord: capture disabled — skipping");
      return;
    }

    // Upload image (optional — scan record is saved even if image upload fails)
    const storagePath = await uploadScanImage(imageBytes, mimeType);

    const sb = getAdminClient();
    const { error } = await sb.from("user_scans").insert({
      storage_path:    storagePath,
      device_type:     deviceType,
      browser,
      language,
      country,
      city,
      device_brand:    deviceBrand,
      total_calories:  Math.round(analysis.totalCalories),
      analysis_result: analysis,
    });

    if (error) {
      console.error("saveScanRecord: insert error", error.message);
    } else {
      console.log(
        `saveScanRecord: saved — ${analysis.items.length} items, ` +
        `${analysis.totalCalories} kcal, image=${storagePath ?? "none"}`,
      );
    }
  } catch (e) {
    console.error("saveScanRecord: unexpected error", e);
  }
}

// ── OpenAI Vision (direct — no n8n) ──────────────────────────────────────────
async function analyzeWithOpenAI(
  imageBytes: Uint8Array,
  mimeType: string,
  language: string,
): Promise<AnalysisPayload> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY secret is not set in Supabase Edge Function secrets.");

  // Stack-safe base64 encoding
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < imageBytes.length; i += chunkSize) {
    binary += String.fromCharCode(...imageBytes.subarray(i, i + chunkSize));
  }
  const base64Image = btoa(binary);

  const langName: Record<string, string> = {
    en: "English", fr: "French", es: "Spanish", pt: "Portuguese",
    zh: "Chinese", ar: "Arabic", it: "Italian", de: "German",
    nl: "Dutch", ru: "Russian", ja: "Japanese",
  };
  const outputLang = langName[language] ?? "English";

  const schema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name:       { type: "string" },
            calories:   { type: "number" },
            protein:    { type: "number" },
            carbs:      { type: "number" },
            fat:        { type: "number" },
            confidence: { type: "number" },
            notes:      { type: "string" },
          },
          required: ["name","calories","protein","carbs","fat","confidence","notes"],
          additionalProperties: false,
        },
      },
      totalCalories: { type: "number" },
      totalProtein:  { type: "number" },
      totalCarbs:    { type: "number" },
      totalFat:      { type: "number" },
    },
    required: ["items","totalCalories","totalProtein","totalCarbs","totalFat"],
    additionalProperties: false,
  };

  const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: { name: "meal_analysis", strict: true, schema },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: "high" },
            },
            {
              type: "text",
              text:
                `You are a certified nutrition analyst. Examine this meal photo carefully.\n\n` +
                `For EACH visible food item:\n` +
                `- name: write in ${outputLang}\n` +
                `- calories: kcal (realistic portion estimate)\n` +
                `- protein / carbs / fat: grams\n` +
                `- confidence: 0.0–1.0 (how certain you are about this item)\n` +
                `- notes: brief portion size or cooking method note\n\n` +
                `Also provide totals (sum of all items).\n` +
                `If an item is ambiguous, estimate conservatively. Do NOT refuse — always return at least one item.`,
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  const rawText = await oaRes.text();
  console.log(`analyzeWithOpenAI: HTTP ${oaRes.status}, body[:400]:`, rawText.slice(0, 400));

  if (!oaRes.ok) {
    let oaErr = rawText;
    try {
      const p = JSON.parse(rawText) as { error?: { message?: string } };
      oaErr = p.error?.message ?? rawText;
    } catch { /* keep raw */ }
    throw new Error(`OpenAI ${oaRes.status}: ${oaErr}`);
  }

  let oaData: { choices?: Array<{ message?: { content?: string } }> };
  try { oaData = JSON.parse(rawText) as typeof oaData; }
  catch { throw new Error("OpenAI returned non-JSON response"); }

  const content = oaData.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty message content");

  let result: AnalysisPayload;
  try {
    result = JSON.parse(content) as AnalysisPayload;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`OpenAI content unparseable: ${content.slice(0, 300)}`);
    result = JSON.parse(match[0]) as AnalysisPayload;
  }

  if (!Array.isArray(result.items)) {
    throw new Error(`Unexpected schema — 'items' not an array. Keys: ${Object.keys(result).join(", ")}`);
  }

  return result;
}

// ── Main handler ──────────────────────────────────────────────────────────────
async function checkGuestScanLimit(req: Request): Promise<Response | null> {
  // If the request carries a valid authenticated user JWT, skip guest limiting
  // (authenticated users are limited by the SQL trigger on usage_stats instead).
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const jwt = authHeader.replace("Bearer ", "").trim();
    // Verify the JWT actually resolves to a real user via Supabase
    const sb = getAdminClient();
    const { data: { user } } = await sb.auth.getUser(jwt);
    if (user) return null; // authenticated user — skip guest limit
  }

  const clientIp =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const today = new Date().toISOString().slice(0, 10);
  const sb = getAdminClient();

  const { data, error } = await sb
    .from("guest_scan_limits")
    .select("scan_count")
    .eq("ip_address", clientIp)
    .eq("scan_date", today)
    .single();

  if (!error && data && data.scan_count >= 2) {
    return new Response(
      JSON.stringify({ error: "Daily limit reached" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  await sb.from("guest_scan_limits").upsert(
    { ip_address: clientIp, scan_date: today, scan_count: (data?.scan_count ?? 0) + 1 },
    { onConflict: "ip_address,scan_date" }
  );

  return null;
}serve(async (req) => {
  console.log("analyze-meal-proxy: received", req.method);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rateLimitRes = rateLimit(req);
  const guestLimitRes = await checkGuestScanLimit(req);
if (guestLimitRes) return guestLimitRes;
  if (rateLimitRes) return rateLimitRes;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const formData   = await req.formData();
    const image      = formData.get("image") as File | null;
    const language   = (formData.get("language") as string | null) ?? "en";
    const deviceType = formData.get("device_type") as string | null;
    const browser    = formData.get("browser") as string | null;
    const deviceBrand = formData.get("device_brand") as string | null;

    // Geographic headers (set by Cloudflare/Deno Deploy)
    const country = req.headers.get("cf-ipcountry") ?? req.headers.get("x-country") ?? null;
    const city    = req.headers.get("cf-ipcity")    ?? req.headers.get("x-city")    ?? null;

    if (!image) {
      return new Response(JSON.stringify({ error: "Missing image" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (image.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: "Image too large. Max 10 MB." }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(image.type)) {
      return new Response(JSON.stringify({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageBytes = new Uint8Array(await image.arrayBuffer());
    console.log(`analyze-meal-proxy: image "${image.name}" ${image.type} ${imageBytes.length}B`);

    // ── 1. Analyse with OpenAI ────────────────────────────────────────────────
    let result: AnalysisPayload;
    try {
      result = await analyzeWithOpenAI(imageBytes, image.type, language);
    } catch (innerErr) {
      const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
      console.error("analyze-meal-proxy: OpenAI error:", msg);
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`analyze-meal-proxy: analysis OK — ${result.items.length} items, ${result.totalCalories} kcal`);

    // ── 2. Save scan record in background (non-blocking) ──────────────────────
    const savePromise = saveScanRecord(
      imageBytes, image.type, result,
      deviceType, browser, language, country, city, deviceBrand,
    );
    const runtime = globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<void>) => void } };
    if (runtime.EdgeRuntime?.waitUntil) {
      runtime.EdgeRuntime.waitUntil(savePromise);
    } else {
      savePromise.catch(console.error);
    }

    // ── 3. Return analysis to client ──────────────────────────────────────────
    return new Response(JSON.stringify({ analysis: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("analyze-meal-proxy: top-level error:", msg);

    if (error instanceof Error && error.name === "AbortError") {
      return new Response(JSON.stringify({ error: "Analysis timed out. Please try again." }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unexpected error: ${msg}` }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
