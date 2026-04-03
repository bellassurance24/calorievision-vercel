/**
 * create-checkout-session
 * Creates a Stripe Checkout Session and returns the redirect URL.
 *
 * Required Supabase secrets (set via Dashboard → Settings → Edge Functions):
 *   STRIPE_SECRET_KEY          — sk_live_... or sk_test_...
 *   STRIPE_PRICE_PRO_MONTHLY   — price_xxx (Pro monthly price ID from Stripe)
 *   STRIPE_PRICE_PRO_YEARLY    — price_xxx (Pro yearly price ID)
 *   STRIPE_PRICE_ULTIMATE_MONTHLY — price_xxx
 *   STRIPE_PRICE_ULTIMATE_YEARLY  — price_xxx
 *
 * Request body (JSON):
 *   { planType: "pro"|"ultimate", billingCycle: "monthly"|"yearly",
 *     priceId?: string, email?: string, origin: string, locale?: string }
 *
 * Security: userId is derived from the validated Supabase JWT — never
 * trusted from the request body. Unauthenticated requests are rejected
 * with 401 before any Stripe API call is made.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @deno-types="https://esm.sh/v135/stripe@14.21.0/types/index.d.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const JSON_HEADERS = { ...CORS, "Content-Type": "application/json" };

/** Fallback used only if the frontend forgets to send `origin` */
const FALLBACK_URL = "https://calorievision.online";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    // ── Server-side auth: validate Supabase JWT ──────────────────────────────
    // supabase.functions.invoke() on the client automatically sends the user's
    // session JWT as the Authorization header. We validate it here — the userId
    // is never trusted from the request body.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: missing or malformed Authorization header." }),
        { status: 401, headers: JSON_HEADERS },
      );
    }

    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create a per-request client scoped to the caller's JWT
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[create-checkout-session] JWT validation failed:", authError?.message ?? "no user");
      return new Response(
        JSON.stringify({ error: "Unauthorized: invalid or expired session. Please sign in again." }),
        { status: 401, headers: JSON_HEADERS },
      );
    }

    // User is authenticated — use the server-verified ID and email
    const userId = user.id;
    const userEmail = user.email;

    console.log(`[create-checkout-session] Authenticated user: ${userId}`);

    // ── Stripe key ───────────────────────────────────────────────────────────
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to Edge Function secrets." }),
        { status: 503, headers: JSON_HEADERS },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

    const { planType, billingCycle, priceId: clientPriceId, origin, locale } = await req.json();

    // Map app language codes to Stripe-supported locale codes.
    const STRIPE_LOCALE_MAP: Record<string, string> = {
      en: "en", fr: "fr", es: "es", pt: "pt", zh: "zh",
      it: "it", de: "de", nl: "nl", ru: "ru", ja: "ja",
      ar: "en",
    };
    const stripeLocale = STRIPE_LOCALE_MAP[locale ?? ""] ?? "auto";

    const baseUrl = (origin && origin.startsWith("http")) ? origin : FALLBACK_URL;

    // ── Price ID resolution ──────────────────────────────────────────────────
    // Priority 1: priceId sent from the frontend (VITE_STRIPE_PRICE_* env vars).
    // Priority 2: server-side secret lookup (fallback for legacy callers).
    let priceId: string | undefined = clientPriceId;

    if (!priceId) {
      const priceMap: Record<string, Record<string, string | undefined>> = {
        pro: {
          monthly: Deno.env.get("STRIPE_PRICE_PRO_MONTHLY"),
          yearly:  Deno.env.get("STRIPE_PRICE_PRO_YEARLY"),
        },
        ultimate: {
          monthly: Deno.env.get("STRIPE_PRICE_ULTIMATE_MONTHLY"),
          yearly:  Deno.env.get("STRIPE_PRICE_ULTIMATE_YEARLY"),
        },
      };
      priceId = priceMap[planType]?.[billingCycle];
    }

    console.log(`[create-checkout-session] userId=${userId} planType=${planType} billingCycle=${billingCycle} priceId=${priceId ?? "MISSING"}`);

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `No Stripe price ID configured for ${planType}/${billingCycle}` }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      locale: stripeLocale,
      allow_promotion_codes: false,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pricing?checkout=success&plan=${planType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/pricing?checkout=canceled`,
      client_reference_id: userId,
      metadata: { userId, planType, billingCycle },
      subscription_data: {
        metadata: { userId, planType, billingCycle },
      },
      customer_email: userEmail ?? undefined,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: JSON_HEADERS },
    );

  } catch (e: any) {
    console.error("[create-checkout-session]", e?.message);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Internal error" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
