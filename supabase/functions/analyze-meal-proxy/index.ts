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

// ── Background scan save ──────────────────────────────────────────────────────
async function saveScanImage(
  imageBytes: Uint8Array,
  mimeType: string,
  deviceType: string | null,
  browser: string | null,
  language: string | null,
  country: string | null,
  city: string | null,
  deviceBrand: string | null,
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) return;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: setting } = await supabase
      .from("settings").select("value").eq("key", "capture_user_scans_enabled").single();
    if (!setting || setting.value !== "true") return;
    const ext = mimeType.split("/")[1] || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("user-scans").upload(`scans/${fileName}`, imageBytes, { contentType: mimeType, upsert: false });
    if (uploadError) { console.error("saveScanImage: upload error", uploadError); return; }
    await supabase.from("user_scans").insert({
      storage_path: `scans/${fileName}`, device_type: deviceType,
      browser, language, country, city, device_brand: deviceBrand,
    });
  } catch (e) { console.error("saveScanImage: unexpected error", e); }
}

// ── OpenAI Vision (direct — no n8n) ──────────────────────────────────────────
interface AnalysisItem {
  name: string; calories: number; protein: number;
  carbs: number; fat: number; confidence: number; notes: string;
}
interface AnalysisPayload {
  items: AnalysisItem[];
  totalCalories: number; totalProtein: number;
  totalCarbs: number; totalFat: number;
}

async function analyzeWithOpenAI(
  imageBytes: Uint8Array,
  mimeType: string,
  language: string,
): Promise<AnalysisPayload> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY secret is not set in Supabase Edge Function secrets.");

  // Convert to base64 without spreading large arrays (stack-safe)
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

  const body = {
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
  };

  console.log("analyze-meal-proxy: calling OpenAI gpt-4o-mini vision directly");

  const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const rawText = await oaRes.text();
  console.log(`analyze-meal-proxy: OpenAI HTTP ${oaRes.status}, body (first 400):`, rawText.slice(0, 400));

  if (!oaRes.ok) {
    // Expose the real OpenAI error code + message to the caller
    let oaErr = rawText;
    try {
      const parsed = JSON.parse(rawText) as { error?: { message?: string; code?: string } };
      oaErr = parsed.error?.message ?? rawText;
    } catch { /* keep raw */ }
    throw new Error(`OpenAI ${oaRes.status}: ${oaErr}`);
  }

  let oaData: { choices?: Array<{ message?: { content?: string } }> };
  try { oaData = JSON.parse(rawText) as typeof oaData; }
  catch { throw new Error("OpenAI returned non-JSON response"); }

  const content = oaData.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty message content");

  // Attempt strict parse; fall back to regex extraction if model adds prose
  let result: AnalysisPayload;
  try {
    result = JSON.parse(content) as AnalysisPayload;
  } catch {
    console.warn("analyze-meal-proxy: strict JSON parse failed, trying regex extraction");
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`OpenAI content is not parseable JSON:\n${content.slice(0, 300)}`);
    result = JSON.parse(match[0]) as AnalysisPayload;
  }

  if (!Array.isArray(result.items)) {
    throw new Error(`Unexpected OpenAI schema — 'items' is not an array. Keys: ${Object.keys(result).join(", ")}`);
  }

  return result;
}

// ── n8n fallback (kept for optional use) ─────────────────────────────────────
async function analyzeWithN8n(
  imageBytes: Uint8Array,
  mimeType: string,
  imageName: string,
  language: string,
): Promise<AnalysisPayload> {
  const webhookUrl = Deno.env.get("N8N_WEBHOOK_URL") ?? "https://n8n.birdstyl.com/webhook/Calorie_Vision";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  const fwd = new FormData();
  fwd.append("image", new Blob([imageBytes], { type: mimeType }), imageName);
  if (language) fwd.append("language", language);

  const res = await fetch(webhookUrl, { method: "POST", body: fwd, signal: controller.signal });
  clearTimeout(timeoutId);

  console.log(`analyze-meal-proxy: n8n HTTP ${res.status}`);
  const rawText = await res.text();
  console.log(`analyze-meal-proxy: n8n body (${rawText.length} bytes):`, rawText.slice(0, 400));

  if (!res.ok) throw new Error(`n8n HTTP ${res.status}: ${rawText.slice(0, 200)}`);
  if (!rawText.trim()) throw new Error("n8n returned empty body. Webhook node must use 'Respond to Webhook' node.");

  // ── Parse & normalise ──────────────────────────────────────────────────────
  let parsed: unknown;
  try { parsed = JSON.parse(rawText); }
  catch {
    // Regex fallback: extract first {...} block
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`n8n returned non-JSON: ${rawText.slice(0, 200)}`);
    parsed = JSON.parse(match[0]);
  }

  // Unwrap n8n array wrapper
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) throw new Error("n8n returned empty array");
    const first = parsed[0] as Record<string, unknown>;
    parsed = first["json"] !== undefined ? first["json"] : first;
  }

  const obj = parsed as Record<string, unknown>;
  // Unwrap { analysis: { output: {...} } }
  const analysisRaw = obj["analysis"] as Record<string, unknown> | undefined;
  if (analysisRaw && "output" in analysisRaw && !("items" in analysisRaw)) {
    obj["analysis"] = analysisRaw["output"];
  }

  const analysis = (obj["analysis"] ?? obj) as Record<string, unknown>;
  if (!Array.isArray(analysis["items"])) {
    throw new Error(`n8n wrong schema — expected 'items' array, got keys: ${Object.keys(analysis).join(", ")}`);
  }

  return analysis as unknown as AnalysisPayload;
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  console.log("analyze-meal-proxy: received request", req.method);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const rateLimitRes = rateLimit(req);
  if (rateLimitRes) return rateLimitRes;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image    = formData.get("image") as File | null;
    const language = (formData.get("language") as string | null) ?? "en";
    const deviceType  = formData.get("device_type") as string | null;
    const browser     = formData.get("browser") as string | null;
    const deviceBrand = formData.get("device_brand") as string | null;
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
    console.log(`analyze-meal-proxy: image ${image.name} ${image.type} ${imageBytes.length} bytes`);

    // Background save
    const runtime = globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<void>) => void } };
    if (runtime.EdgeRuntime?.waitUntil) {
      runtime.EdgeRuntime.waitUntil(
        saveScanImage(imageBytes, image.type, deviceType, browser, language, country, city, deviceBrand),
      );
    } else {
      saveScanImage(imageBytes, image.type, deviceType, browser, language, country, city, deviceBrand).catch(console.error);
    }

    // ── Strategy: OpenAI direct (preferred) → n8n (fallback) ─────────────
    const hasOpenAiKey = Boolean(Deno.env.get("OPENAI_API_KEY"));
    console.log(`analyze-meal-proxy: strategy = ${hasOpenAiKey ? "OpenAI direct" : "n8n fallback"}`);

    let result: AnalysisPayload;
    try {
      result = hasOpenAiKey
        ? await analyzeWithOpenAI(imageBytes, image.type, language)
        : await analyzeWithN8n(imageBytes, image.type, image.name, language);
    } catch (innerErr) {
      const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
      console.error("analyze-meal-proxy: analysis failed:", msg);
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`analyze-meal-proxy: success — ${result.items.length} items, ${result.totalCalories} kcal`);
    return new Response(JSON.stringify({ analysis: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("analyze-meal-proxy: unexpected top-level error:", msg);

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
