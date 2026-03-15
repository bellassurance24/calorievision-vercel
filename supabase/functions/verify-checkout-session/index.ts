/**
 * verify-checkout-session
 * ─────────────────────────────────────────────────────────────────────────────
 * Called by the frontend immediately after Stripe redirects back with
 * ?checkout=success&session_id=cs_...
 *
 * This is the PRIMARY subscription-activation path. It handles BOTH:
 *   A) Logged-in users  — userId supplied by the frontend
 *   B) Guest users      — no userId; we find or create the Supabase account
 *                         by the email the customer entered in Stripe Checkout
 *
 * Guest flow (most common for "scan & pay"):
 *   1. Retrieve Stripe session → confirm payment_status = "paid"
 *   2. Extract email from session.customer_details.email
 *   3. Call get_user_id_by_email() RPC → look up existing Supabase user
 *   4. If none found → create user via auth.admin.createUser (email confirmed)
 *   5. Upsert subscription row with service-role key (bypasses RLS)
 *   6. Generate a magic-link (one-time login URL) → return to frontend
 *   7. Frontend navigates to magic-link → user is instantly logged in as Pro
 *
 * Request body:
 *   { sessionId: string, userId?: string, origin?: string }
 *
 * Response:
 *   { success: true, plan: string, email: string, magicLink?: string }
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
    // ── Environment ──────────────────────────────────────────────────────────
    const stripeKey   = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")               ?? "";
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")  ?? "";

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

    // Service-role client — bypasses RLS, can call auth.admin.*
    const db = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Request body ─────────────────────────────────────────────────────────
    const { sessionId, userId: suppliedUserId, origin } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "sessionId is required" }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    // ── 1. Retrieve & validate the Stripe Checkout Session ───────────────────
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
        { status: 402, headers: JSON_HEADERS },
      );
    }

    // ── 2. Resolve email & plan ───────────────────────────────────────────────
    const email    = session.customer_details?.email ?? (session.customer as Stripe.Customer)?.email ?? "";
    const planType = (session.metadata?.planType ?? "pro") as string;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "No email found on Stripe session. Cannot activate subscription." }),
        { status: 422, headers: JSON_HEADERS },
      );
    }

    // ── 3. Find or create the Supabase user ───────────────────────────────────
    let userId = suppliedUserId as string | null | undefined;
    let isNewUser = false;

    if (!userId) {
      // Try to find an existing Supabase user by email via our helper RPC
      const { data: existingId, error: rpcError } = await db.rpc(
        "get_user_id_by_email",
        { p_email: email },
      );

      if (rpcError) {
        console.error("[verify-checkout-session] RPC error:", rpcError.message);
      }

      if (existingId) {
        userId = existingId as string;
        console.log(`[verify-checkout-session] Found existing user ${userId} for ${email}`);
      } else {
        // Create a new Supabase user (email already confirmed — they just paid)
        const { data: newUserData, error: createError } = await db.auth.admin.createUser({
          email,
          email_confirm: true, // skip confirmation email — payment is proof of identity
        });

        if (createError || !newUserData?.user) {
          console.error("[verify-checkout-session] createUser error:", createError?.message);
          return new Response(
            JSON.stringify({ error: "Failed to create user account", detail: createError?.message }),
            { status: 500, headers: JSON_HEADERS },
          );
        }

        userId = newUserData.user.id;
        isNewUser = true;
        console.log(`[verify-checkout-session] Created new user ${userId} for ${email}`);
      }
    }

    // ── 4. Upsert subscription row ─────────────────────────────────────────
    const sub       = session.subscription as Stripe.Subscription;
    const subStatus = sub?.status === "active" || sub?.status === "trialing" ? "active" : "past_due";

    const { error: dbError } = await db.from("subscriptions").upsert(
      {
        user_id:                userId,
        plan_type:              planType,
        status:                 subStatus,
        stripe_subscription_id: sub?.id ?? null,
        stripe_customer_id:     (sub?.customer ?? session.customer) as string,
        current_period_end:     sub?.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
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

    console.log(`[verify-checkout-session] ✅ Subscription activated: user=${userId} plan=${planType}`);

    // ── 5. Generate magic link for auto-login (guest / new user only) ─────────
    let magicLink: string | null = null;

    if (!suppliedUserId) {
      // Redirect the magic link back to /analyze so they can use Pro immediately
      const redirectTo = origin
        ? `${origin}/en/analyze`
        : "https://calorievision.online/en/analyze";

      const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });

      if (linkError) {
        // Non-fatal: subscription is already saved; user can request link manually
        console.warn("[verify-checkout-session] generateLink error:", linkError.message);
      } else {
        magicLink = linkData?.properties?.action_link ?? null;
      }
    }

    return new Response(
      JSON.stringify({
        success:   true,
        plan:      planType,
        email,
        isNewUser,
        magicLink, // null for already-logged-in users
      }),
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
