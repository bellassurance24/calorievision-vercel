/**
 * track-event — lightweight analytics ingestion endpoint
 *
 * Receives structured event payloads from the frontend, enriches them
 * with reliable server-side geo (Cloudflare headers), and inserts into
 * analytics_events using the service-role key (bypasses RLS / anon limits).
 *
 * Responds immediately with 200 { ok: true } — the DB insert happens in
 * the background so it never blocks page navigation.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: cors });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // ── Respond immediately — insert happens in background ───────────────────
  const insertPromise = (async () => {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceKey) {
        console.error("track-event: missing env vars");
        return;
      }

      const sb = createClient(supabaseUrl, serviceKey);

      // ── Geo: prefer Cloudflare headers (100% reliable on Deno Deploy) ──────
      // Falls back to body values if headers are absent (local dev).
      const country =
        req.headers.get("cf-ipcountry") ??
        (body.country as string | null) ??
        null;
      const city =
        req.headers.get("cf-ipcity") ??
        (body.city as string | null) ??
        null;

      // Cloudflare passes the real IP here:
      const ipRaw = req.headers.get("cf-connecting-ip") ??
                    req.headers.get("x-real-ip") ??
                    req.headers.get("x-forwarded-for") ??
                    null;
      // Hash IP for privacy — we only need uniqueness, not the raw value
      const ipHash = ipRaw ? await hashIp(ipRaw.split(",")[0].trim()) : null;

      const { error } = await sb.from("analytics_events").insert({
        event_type:    body.event_type   ?? "page_view",
        page_path:     body.page_path    ?? null,
        session_id:    body.session_id   ?? null,
        visitor_id:    body.visitor_id   ?? null,
        user_agent:    body.user_agent   ?? null,
        device_type:   body.device_type  ?? null,
        browser:       body.browser      ?? null,
        os:            body.os           ?? null,
        language:      body.language     ?? null,
        referrer:      body.referrer     ?? null,
        utm_source:    body.utm_source   ?? null,
        utm_medium:    body.utm_medium   ?? null,
        utm_campaign:  body.utm_campaign ?? null,
        screen_width:  body.screen_width  ?? null,
        screen_height: body.screen_height ?? null,
        country,
        city,
        ip_hash:       ipHash,
        metadata:      body.metadata ?? {},
      });

      if (error) {
        console.error("track-event: insert error", error.message, error.details);
      } else {
        console.log(
          `track-event: ${body.event_type ?? "page_view"} — ` +
          `${body.page_path ?? "?"} — ${country ?? "?"}/${city ?? "?"}`,
        );
      }
    } catch (e) {
      console.error("track-event: unexpected error", e);
    }
  })();

  // Register with Deno Deploy waitUntil so insert completes after response
  const runtime = globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<void>) => void } };
  if (runtime.EdgeRuntime?.waitUntil) {
    runtime.EdgeRuntime.waitUntil(insertPromise);
  } else {
    insertPromise.catch(console.error);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});

// ── Simple SHA-256 IP hash for privacy ───────────────────────────────────────
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "calorievision_salt_2026");
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16); // short prefix is enough for uniqueness
}
