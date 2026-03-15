/**
 * verify-checkout-session
 * Called by the frontend immediately after Stripe redirects back to the
 * success URL.  This is the PRIMARY mechanism for activating a subscription
 * — it does not depend on webhooks being delivered.
 *
 * Flow:
 *   1. Stripe redirects → /pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}
 *   2. Pricing.tsx reads session_id and calls this function
 *   3. We retrieve the session from Stripe, confirm payment_status === "paid"
 *   4. Upsert the subscription row using the service-role key (bypasses RLS)
 *
 * The stripe-webhook function remains as a redundant backup for edge cases
 * where the user closes the browser before the redirect completes.
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const stripeKey   = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")              ?? "";
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 503, headers: JSON_HEADERS },
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });
    const db = createClient(supabaseUrl, serviceKey);

    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return new Response(
        JSON.stringify({ error: "sessionId and userId are required" }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    // ── 1. Retrieve the Checkout Session from Stripe ──────────────────────
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    // ── 2. Guard: only proceed for paid subscriptions ────────────────────
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
        { status: 402, headers: JSON_HEADERS },
      );
    }

    // ── 3. Extract subscription data ──────────────────────────────────────
    const sub       = session.subscription as Stripe.Subscription;
    const planType  = (session.metadata?.planType ?? "pro") as string;
    const subStatus = sub.status === "active" || sub.status === "trialing"
      ? "active"
      : "past_due";

    // ── 4. Upsert subscription row (service role → bypasses RLS) ─────────
    const { error: dbError } = await db.from("subscriptions").upsert(
      {
        user_id:                userId,
        plan_type:              planType,
        status:                 subStatus,
        stripe_subscription_id: sub.id,
        stripe_customer_id:     sub.customer as string,
        current_period_end:     new Date(sub.current_period_end * 1000).toISOString(),
        updated_at:             new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (dbError) {
      console.error("[verify-checkout-session] DB upsert error:", dbError.message);
      return new Response(
        JSON.stringify({ error: "Failed to activate subscription", detail: dbError.message }),
        { status: 500, headers: JSON_HEADERS },
      );
    }

    console.log(`[verify-checkout-session] Subscription activated: user=${userId} plan=${planType}`);

    return new Response(
      JSON.stringify({ success: true, plan: planType, status: subStatus }),
      { headers: JSON_HEADERS },
    );

  } catch (e: any) {
    console.error("[verify-checkout-session] Unexpected error:", e?.message);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Internal error" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
