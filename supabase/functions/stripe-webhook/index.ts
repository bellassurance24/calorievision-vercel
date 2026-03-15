/**
 * stripe-webhook
 * Handles Stripe webhook events to keep the `subscriptions` table in sync.
 *
 * Required Supabase secrets:
 *   STRIPE_SECRET_KEY       — same key used for checkout
 *   STRIPE_WEBHOOK_SECRET   — whsec_... from Stripe Dashboard → Webhooks
 *   SUPABASE_URL            — auto-injected by Supabase runtime
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase runtime
 *
 * Stripe events handled:
 *   checkout.session.completed        → create/activate subscription row
 *   customer.subscription.updated     → sync status + period_end
 *   customer.subscription.deleted     → mark as canceled
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @deno-types="https://esm.sh/v135/stripe@14.21.0/types/index.d.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const stripeKey     = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl   = Deno.env.get("SUPABASE_URL")              ?? "";
  const serviceKey    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!stripeKey || !webhookSecret) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });
  const db     = createClient(supabaseUrl, serviceKey);

  // Verify webhook signature
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (e: any) {
    console.error("[stripe-webhook] Signature verification failed:", e.message);
    return new Response(`Webhook Error: ${e.message}`, { status: 400 });
  }

  console.log(`[stripe-webhook] Event: ${event.type}`);

  // ── Helper: upsert subscription row ─────────────────────────────────────
  const upsertSub = async (sub: Stripe.Subscription) => {
    const userId   = sub.metadata?.userId;
    const planType = sub.metadata?.planType ?? "pro";

    if (!userId) {
      console.warn("[stripe-webhook] Subscription missing userId metadata:", sub.id);
      return;
    }

    const statusMap: Record<string, string> = {
      active:   "active",
      trialing: "active",
      past_due: "past_due",
      canceled: "canceled",
      unpaid:   "past_due",
    };

    const { error } = await db.from("subscriptions").upsert(
      {
        user_id:               userId,
        plan_type:             planType,
        status:                statusMap[sub.status] ?? "canceled",
        stripe_subscription_id: sub.id,
        stripe_customer_id:    sub.customer as string,
        current_period_end:    new Date(sub.current_period_end * 1000).toISOString(),
        updated_at:            new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) console.error("[stripe-webhook] DB upsert error:", error.message);
  };

  // ── Event handlers ───────────────────────────────────────────────────────
  switch (event.type) {

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      if (session.mode === "subscription" && session.subscription) {
        // Retrieve full subscription object (session metadata → subscription metadata)
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);

        // Copy metadata from session to subscription (needed for webhook routing)
        if (session.metadata?.userId) {
          await stripe.subscriptions.update(sub.id, {
            metadata: {
              userId:      session.metadata.userId,
              planType:    session.metadata.planType ?? "pro",
              billingCycle: session.metadata.billingCycle ?? "monthly",
            },
          });
          sub.metadata = {
            ...sub.metadata,
            userId:   session.metadata.userId,
            planType: session.metadata.planType ?? "pro",
          };
        }

        await upsertSub(sub);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSub(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted": {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await db.from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
      break;
    }

    default:
      console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
