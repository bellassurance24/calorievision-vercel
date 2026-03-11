import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function log(level: "INFO" | "WARN" | "ERROR", message: string, data?: Record<string, unknown>) {
  const logEntry = { timestamp: new Date().toISOString(), level, message, ...data };
  if (level === "ERROR") {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from the token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    log("INFO", "Sending test notification", { user_id: user.id });

    // Check if user has active devices
    const { data: devices, error: devicesError } = await supabase
      .from("device_tokens")
      .select("id, token, platform, device_name")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (devicesError) {
      throw new Error(`Failed to fetch devices: ${devicesError.message}`);
    }

    if (!devices || devices.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "no_devices", message: "Aucun appareil enregistré. Veuillez d'abord autoriser les notifications." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert a test notification into the queue
    const { data: queueEntry, error: queueError } = await supabase
      .from("notification_queue")
      .insert({
        user_id: user.id,
        category: "system",
        title: "🎉 Test de notification",
        body: "Félicitations ! Vos notifications fonctionnent correctement.",
        scheduled_for: new Date().toISOString(),
        priority: 10,
        data: { test: true, sent_at: new Date().toISOString() },
      })
      .select()
      .single();

    if (queueError) {
      throw new Error(`Failed to queue notification: ${queueError.message}`);
    }

    log("INFO", "Test notification queued", { queue_id: queueEntry.id, devices_count: devices.length });

    // Immediately process this notification
    const { data: sendResult, error: sendError } = await supabase.functions.invoke("send-notification", {
      body: { notification_id: queueEntry.id },
    });

    if (sendError) {
      log("WARN", "Send notification invoke failed", { error: sendError.message });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification de test envoyée",
        devices_count: devices.length,
        queue_id: queueEntry.id,
        send_result: sendResult
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Test notification failed", { error: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
