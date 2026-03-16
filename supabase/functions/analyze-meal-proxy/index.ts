import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS_PER_WINDOW = 10;

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const ipRequestLog = new Map<string, RateLimitEntry>();

function rateLimit(req: Request): Response | null {
  const clientIp =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip");

  if (!clientIp) {
    return null;
  }

  const now = Date.now();
  const existing = ipRequestLog.get(clientIp);

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestLog.set(clientIp, { count: 1, windowStart: now });
    return null;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS_PER_WINDOW) {
    console.log(`Rate limit exceeded for IP: ${clientIp.slice(0, 10)}...`);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  existing.count += 1;
  ipRequestLog.set(clientIp, existing);
  return null;
}

const N8N_WEBHOOK_URL = "https://n8n.birdstyl.com/webhook/Calorie_Vision";

// Background task to save scan image
async function saveScanImage(
  imageBytes: Uint8Array,
  mimeType: string,
  deviceType: string | null,
  browser: string | null,
  language: string | null,
  country: string | null,
  city: string | null,
  deviceBrand: string | null
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("saveScanImage: Missing Supabase credentials");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if capture is enabled
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "capture_user_scans_enabled")
      .single();

    if (!setting || setting.value !== "true") {
      console.log("saveScanImage: Capture is disabled");
      return;
    }

    // Generate unique filename
    const ext = mimeType.split("/")[1] || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `scans/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("user-scans")
      .upload(storagePath, imageBytes, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("saveScanImage: Upload error", uploadError);
      return;
    }

    // Save metadata to database
    const { error: insertError } = await supabase
      .from("user_scans")
      .insert({
        storage_path: storagePath,
        device_type: deviceType,
        browser: browser,
        language: language,
        country: country,
        city: city,
        device_brand: deviceBrand,
      });

    if (insertError) {
      console.error("saveScanImage: Insert error", insertError);
      return;
    }

    console.log("saveScanImage: Successfully saved scan", storagePath);
  } catch (error) {
    console.error("saveScanImage: Unexpected error", error);
  }
}

serve(async (req) => {
  console.log("analyze-meal-proxy: received request", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rateLimitResponse = rateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Get the form data from the request
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const language = formData.get("language") as string | null;
    const deviceType = formData.get("device_type") as string | null;
    const browser = formData.get("browser") as string | null;
    const deviceBrand = formData.get("device_brand") as string | null;

    // Extract geo info from request headers (Cloudflare / Deno Deploy)
    const country = req.headers.get("cf-ipcountry") ?? req.headers.get("x-country") ?? null;
    const city = req.headers.get("cf-ipcity") ?? req.headers.get("x-city") ?? null;

    if (!image) {
      console.log("analyze-meal-proxy: no image provided");
      return new Response(
        JSON.stringify({ error: "Missing image" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (image.size > MAX_FILE_SIZE) {
      console.log("analyze-meal-proxy: image too large", image.size);
      return new Response(
        JSON.stringify({ error: "Image too large. Please upload a smaller image (max 10MB)." }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(image.type)) {
      console.log("analyze-meal-proxy: invalid file type", image.type);
      return new Response(
        JSON.stringify({ error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Read image bytes for potential saving (before forwarding)
    const imageBytes = new Uint8Array(await image.arrayBuffer());
    
    // Start background task to save scan (non-blocking)
    // Use globalThis to access EdgeRuntime in Deno environment
    const runtime = globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<void>) => void } };
    if (runtime.EdgeRuntime?.waitUntil) {
      runtime.EdgeRuntime.waitUntil(
        saveScanImage(imageBytes, image.type, deviceType, browser, language, country, city, deviceBrand)
      );
    } else {
      saveScanImage(imageBytes, image.type, deviceType, browser, language, country, city, deviceBrand).catch(console.error);
    }

    // Create a new FormData to forward to the webhook
    const forwardFormData = new FormData();
    // Recreate the file from bytes
    const imageBlob = new Blob([imageBytes], { type: image.type });
    forwardFormData.append("image", imageBlob, image.name);
    if (language) {
      forwardFormData.append("language", language);
    }

    console.log("analyze-meal-proxy: forwarding to n8n webhook");

    // Forward to the n8n webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: forwardFormData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("analyze-meal-proxy: webhook response status", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("analyze-meal-proxy: webhook error", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Analysis service error. Please try again." }),
        {
          status: response.status >= 500 ? 502 : response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const responseText = await response.text();
    console.log("analyze-meal-proxy: webhook response received");

    // Return the response as-is
    return new Response(responseText, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-meal-proxy: unexpected error", error);
    
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(
        JSON.stringify({ error: "Analysis timed out. Please try again with a clearer image." }),
        {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
