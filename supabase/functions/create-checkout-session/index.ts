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
 *     userId: string, email?: string, origin: string }
 *
 *  `origin` is window.location.origin sent by the frontend.
 *  This means success/cancel URLs automatically work on localhost AND production
 *  without any changes to this function.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @deno-types="https://esm.sh/v135/stripe@14.21.0/types/index.d.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to Edge Function secrets." }),
        { status: 503, headers: JSON_HEADERS },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

    const { planType, billingCycle, userId, email, origin } = await req.json();

    // Use the origin sent by the browser (works on localhost:8080, localhost:5173,
    // staging URLs, and production — no code changes ever needed).
    const baseUrl = (origin && origin.startsWith("http")) ? origin : FALLBACK_URL;

    // Map plan+cycle → Stripe Price ID (stored as env secrets)
    const priceIds: Record<string, Record<string, string | undefined>> = {
      pro: {
        monthly: Deno.env.get("STRIPE_PRICE_PRO_MONTHLY"),
        yearly:  Deno.env.get("STRIPE_PRICE_PRO_YEARLY"),
      },
      ultimate: {
        monthly: Deno.env.get("STRIPE_PRICE_ULTIMATE_MONTHLY"),
        yearly:  Deno.env.get("STRIPE_PRICE_ULTIMATE_YEARLY"),
      },
    };

    const priceId = priceIds[planType]?.[billingCycle];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `No Stripe price ID configured for ${planType}/${billingCycle}` }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      // Stripe replaces {CHECKOUT_SESSION_ID} with the real session ID.
      // The frontend reads it on redirect and calls verify-checkout-session.
      success_url: `${baseUrl}/pricing?checkout=success&plan=${planType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/pricing?checkout=canceled`,
      metadata: { userId: userId ?? "", planType, billingCycle },
      ...(email ? { customer_email: email } : {}),
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
