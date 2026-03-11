import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Structured logging helper
function log(level: "INFO" | "WARN" | "ERROR", message: string, data?: Record<string, unknown>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  if (level === "ERROR") {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

interface CalorieAlertRequest {
  user_id: string;
  current_calories: number;
  daily_goal: number;
  meal_name?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: CalorieAlertRequest = await req.json();

    if (!payload.user_id || payload.current_calories === undefined || !payload.daily_goal) {
      throw new Error("user_id, current_calories, and daily_goal are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("calorie_alert_enabled")
      .eq("user_id", payload.user_id)
      .single();

    if (!prefs?.calorie_alert_enabled) {
      return new Response(
        JSON.stringify({ success: false, reason: "alerts_disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const percentage = (payload.current_calories / payload.daily_goal) * 100;
    let title = "";
    let body = "";
    let shouldNotify = false;

    if (percentage >= 100) {
      title = "Objectif calorique dépassé ⚠️";
      body = `Vous avez consommé ${payload.current_calories} kcal sur ${payload.daily_goal} kcal prévues.`;
      shouldNotify = true;
    } else if (percentage >= 90) {
      title = "Proche de votre limite 🎯";
      body = `Vous êtes à ${Math.round(percentage)}% de votre objectif (${payload.current_calories}/${payload.daily_goal} kcal).`;
      shouldNotify = true;
    } else if (percentage >= 75) {
      title = "3/4 de votre objectif atteint 📊";
      body = `Vous avez consommé ${payload.current_calories} kcal. Il vous reste ${payload.daily_goal - payload.current_calories} kcal.`;
      shouldNotify = true;
    }

    if (!shouldNotify) {
      return new Response(
        JSON.stringify({ success: false, reason: "threshold_not_reached", percentage: Math.round(percentage) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Queue the notification
    const { data, error } = await supabase
      .from("notification_queue")
      .insert({
        user_id: payload.user_id,
        category: "calorie_alert",
        title,
        body,
        scheduled_for: new Date().toISOString(),
        priority: 2,
        status: "pending",
        data: {
          current_calories: String(payload.current_calories),
          daily_goal: String(payload.daily_goal),
          percentage: String(Math.round(percentage)),
          meal_name: payload.meal_name || "",
        },
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to queue alert: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, notification_id: data.id, percentage: Math.round(percentage) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Trigger calorie alert error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
