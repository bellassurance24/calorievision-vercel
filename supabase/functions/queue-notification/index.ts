import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationCategory =
  | "meal_reminder"
  | "calorie_alert"
  | "weekly_summary"
  | "motivation"
  | "system"
  | "promotional";

interface QueueRequest {
  user_id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, string>;
  scheduled_for?: string;
  priority?: number;
}

const CATEGORY_PRIORITIES: Record<NotificationCategory, number> = {
  system: 1,
  calorie_alert: 2,
  meal_reminder: 3,
  motivation: 4,
  weekly_summary: 5,
  promotional: 6,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: QueueRequest = await req.json();

    if (!payload.user_id || !payload.category || !payload.title || !payload.body) {
      throw new Error("user_id, category, title, and body are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check GDPR consent for promotional notifications
    if (payload.category === "promotional") {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("gdpr_consent_given, promotional_enabled")
        .eq("user_id", payload.user_id)
        .single();

      if (!prefs?.gdpr_consent_given || !prefs?.promotional_enabled) {
        return new Response(
          JSON.stringify({ success: false, reason: "no_consent" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert into queue
    const { data, error } = await supabase
      .from("notification_queue")
      .insert({
        user_id: payload.user_id,
        category: payload.category,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        scheduled_for: payload.scheduled_for || new Date().toISOString(),
        priority: payload.priority || CATEGORY_PRIORITIES[payload.category] || 5,
        status: "pending",
        attempts: 0,
        max_attempts: 3,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to queue notification: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, notification_id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Queue notification error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
