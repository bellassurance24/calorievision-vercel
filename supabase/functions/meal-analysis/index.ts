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
    // If we can't determine the client IP, skip rate limiting but allow the request.
    return null;
  }

  const now = Date.now();
  const existing = ipRequestLog.get(clientIp);

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestLog.set(clientIp, { count: 1, windowStart: now });
    return null;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS_PER_WINDOW) {
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

// Background task to save scan image
async function saveScanImage(
  imageDataUrl: string,
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

    // Extract base64 data and mime type from data URL
    const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      console.log("saveScanImage: Invalid data URL format");
      return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Decode base64 to bytes
    const binaryString = atob(base64Data);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
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

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  notes?: string;
}

interface MealAnalysis {
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tips: string[];
}

serve(async (req) => {
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
    const MAX_BODY_BYTES = 2_000_000; // ~2 MB limit for request body
    const contentLengthHeader = req.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (!Number.isNaN(contentLength) && contentLength > MAX_BODY_BYTES) {
        return new Response(
          JSON.stringify({
            error: "Image too large. Please upload a smaller image.",
          }),
          {
            status: 413,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    const { imageDataUrl, language, deviceType, browser, country, city, deviceBrand } = (await req.json()) as { 
      imageDataUrl?: string; 
      language?: string;
      deviceType?: string;
      browser?: string;
      country?: string;
      city?: string;
      deviceBrand?: string;
    };
    
    // Map language codes to full names for the AI prompt
    const languageNames: Record<string, string> = {
      en: "English",
      fr: "French",
      es: "Spanish",
      pt: "Portuguese",
      zh: "Chinese",
      ar: "Arabic",
      it: "Italian",
      de: "German",
      nl: "Dutch",
    };
    const targetLanguage = languageNames[language || "en"] || "English";

    // Start background task to save scan (non-blocking)
    const runtime = globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<void>) => void } };
    if (runtime.EdgeRuntime?.waitUntil) {
      runtime.EdgeRuntime.waitUntil(
        saveScanImage(imageDataUrl || "", deviceType || null, browser || null, language || null, country || null, city || null, deviceBrand || null)
      );
    } else {
      // Fallback: don't await, just fire and forget
      saveScanImage(imageDataUrl || "", deviceType || null, browser || null, language || null, country || null, city || null, deviceBrand || null).catch(console.error);
    }

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid imageDataUrl" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!imageDataUrl.startsWith("data:image/")) {
      return new Response(
        JSON.stringify({ error: "imageDataUrl must be a data:image URL" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const commaIndex = imageDataUrl.indexOf(",");
    if (commaIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Invalid data URL format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const base64Data = imageDataUrl.slice(commaIndex + 1);
    const MAX_BASE64_LENGTH = 5_000_000; // ~5 MB base64 (~3.75 MB binary)
    if (base64Data.length > MAX_BASE64_LENGTH) {
      return new Response(
        JSON.stringify({
          error: "Image too large. Please upload a smaller image.",
        }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const VISION_PROVIDER_API_KEY = Deno.env.get("VISION_PROVIDER_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!VISION_PROVIDER_API_KEY) {
      console.error("meal-analysis: VISION_PROVIDER_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI backend is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            `LANGUAGE REQUIREMENT (HIGHEST PRIORITY): Every single word in your response — all food names, all notes, all tips — MUST be written entirely in ${targetLanguage}. Never use English words or anglicisms regardless of what language the food is typically named in. You are a nutrition assistant that analyzes meal photos. Use the provided image to infer foods, rough portion sizes, approximate calories, macronutrients (protein, carbohydrates, fat in grams), and 2-4 simple, encouraging tips. Be conservative with certainty and portion sizes. Use standard nutrition databases as reference. Translate food names fully into ${targetLanguage} — for example in Spanish: "tomates cereza" not "cherry tomatoes", "patatas fritas" not "french fries", "huevos revueltos" not "scrambled eggs". Apply the same total-translation principle for ${targetLanguage}.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Analyze this meal photo. Use typical nutrition reference data and visual cues to estimate: (1) a list of foods with approximate calories, protein (g), carbohydrates (g), fat (g), and a confidence score between 0 and 1, (2) the total calories and total macros (protein, carbs, fat in grams), and (3) 2-4 short, non-medical nutrition tips. Avoid judgmental language. CRITICAL: Write ALL food names and nutrition tips ENTIRELY in ${targetLanguage} without ANY English words or anglicisms. Every word must be fully translated.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_meal",
            description:
              `Return an approximate calorie and macronutrient breakdown for the visible meal and simple educational nutrition tips. IMPORTANT: ALL text fields — including every food name, every note, and every tip — MUST be written entirely in ${targetLanguage}. Do not use English under any circumstances.`,
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  description:
                    "List of visible meal components with approximate calories and macros.",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description:
                          `Short name of the food item written entirely in ${targetLanguage}. Must not contain any English words or anglicisms.`,
                      },
                      calories: {
                        type: "number",
                        description:
                          "Approximate calories for this item in kilocalories.",
                      },
                      protein: {
                        type: "number",
                        description:
                          "Approximate protein content in grams.",
                      },
                      carbs: {
                        type: "number",
                        description:
                          "Approximate carbohydrates content in grams.",
                      },
                      fat: {
                        type: "number",
                        description:
                          "Approximate fat content in grams.",
                      },
                      confidence: {
                        type: "number",
                        description:
                          "Confidence in the identification and portion estimate from 0 to 1.",
                      },
                      notes: {
                        type: "string",
                        description:
                          `Optional short note about portion assumptions or cooking method, written entirely in ${targetLanguage}. Must not contain any English words.`,
                      },
                    },
                    required: ["name", "calories", "protein", "carbs", "fat", "confidence"],
                    additionalProperties: false,
                  },
                },
                totalCalories: {
                  type: "number",
                  description:
                    "Approximate total calories for the full visible meal.",
                },
                totalProtein: {
                  type: "number",
                  description:
                    "Approximate total protein in grams for the full visible meal.",
                },
                totalCarbs: {
                  type: "number",
                  description:
                    "Approximate total carbohydrates in grams for the full visible meal.",
                },
                totalFat: {
                  type: "number",
                  description:
                    "Approximate total fat in grams for the full visible meal.",
                },
                tips: {
                  type: "array",
                  description:
                    `2-4 short, friendly nutrition suggestions based on the visible meal, written entirely in ${targetLanguage}. Must be educational, non-medical, and must not contain any English words.`,
                  items: {
                    type: "string",
                  },
                },
              },
              required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFat", "tips"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: {
          name: "analyze_meal",
        },
      },
    };

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VISION_PROVIDER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      console.error(
        "meal-analysis: AI gateway error",
        aiResponse.status,
        text,
      );

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limits exceeded, please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "Payment required, please add funds to your AI provider workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResponse.json();

    let analysis: MealAnalysis | null = null;

    try {
      const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
      const argsRaw = toolCall?.function?.arguments;
      if (typeof argsRaw === "string") {
        analysis = JSON.parse(argsRaw) as MealAnalysis;
      }
    } catch (err) {
      console.error("meal-analysis: failed to parse tool arguments", err);
    }

    if (!analysis) {
      return new Response(
        JSON.stringify({ error: "Unable to interpret AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("meal-analysis: unexpected error", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

