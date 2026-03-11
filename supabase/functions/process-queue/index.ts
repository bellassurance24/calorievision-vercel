import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_BATCH_SIZE = 50;
const RETRY_DELAYS = [60, 300, 900]; // 1min, 5min, 15min

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    log("INFO", "Starting queue processing", { batch_size: MAX_BATCH_SIZE });

    // Fetch pending notifications ready to be sent
    const { data: notifications, error } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("priority", { ascending: true })
      .order("scheduled_for", { ascending: true })
      .limit(MAX_BATCH_SIZE);

    if (error) {
      log("ERROR", "Failed to fetch queue", { error: error.message });
      throw new Error(`Failed to fetch queue: ${error.message}`);
    }

    if (!notifications || notifications.length === 0) {
      log("INFO", "No pending notifications");
      return new Response(
        JSON.stringify({ message: "No pending notifications", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("INFO", "Processing notifications", { count: notifications.length });

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      retried: 0,
    };

    for (const notification of notifications) {
      results.processed++;

      // Check rate limits before sending
      const { data: rateLimit } = await supabase
        .from("notification_rate_limits")
        .select("*")
        .eq("user_id", notification.user_id)
        .single();

      if (rateLimit) {
        const dailyLimit = 8;
        const cooldownMinutes = 30;

        // Check daily limit
        if (rateLimit.daily_count >= dailyLimit) {
          log("WARN", "User exceeded daily limit", { user_id: notification.user_id, daily_count: rateLimit.daily_count });
          await supabase
            .from("notification_queue")
            .update({
              status: "cancelled",
              error_message: "Daily limit exceeded",
              processed_at: now,
            })
            .eq("id", notification.id);
          continue;
        }

        // Check cooldown
        if (rateLimit.last_notification_at) {
          const lastSent = new Date(rateLimit.last_notification_at);
          const cooldownEnd = new Date(lastSent.getTime() + cooldownMinutes * 60 * 1000);
          
          if (new Date() < cooldownEnd) {
            log("INFO", "User in cooldown, rescheduling", { 
              user_id: notification.user_id, 
              notification_id: notification.id,
              cooldown_end: cooldownEnd.toISOString() 
            });
            // Reschedule after cooldown
            await supabase
              .from("notification_queue")
              .update({ scheduled_for: cooldownEnd.toISOString() })
              .eq("id", notification.id);
            results.retried++;
            continue;
          }
        }
      }

      // Call send-notification function
      try {
        const sendResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ notification_id: notification.id }),
          }
        );

        const result = await sendResponse.json();

        if (result.success) {
          results.sent++;
          log("INFO", "Notification sent", { notification_id: notification.id });
        } else if (result.reason === "quiet_hours" && result.rescheduled) {
          results.retried++;
          log("INFO", "Notification rescheduled due to quiet hours", { notification_id: notification.id });
        } else {
          // Handle failure with retry logic
          const attempts = (notification.attempts || 0) + 1;
          
          if (attempts >= notification.max_attempts) {
            log("WARN", "Notification failed, max attempts reached", { 
              notification_id: notification.id, 
              attempts,
              reason: result.reason 
            });
            await supabase
              .from("notification_queue")
              .update({
                status: "failed",
                attempts,
                error_message: result.reason || "Max attempts reached",
                processed_at: now,
              })
              .eq("id", notification.id);
            results.failed++;
          } else {
            log("INFO", "Notification failed, scheduling retry", { 
              notification_id: notification.id, 
              attempts,
              retry_delay_seconds: RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)]
            });
            // Schedule retry with exponential backoff
            const delaySeconds = RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)];
            const retryAt = new Date(Date.now() + delaySeconds * 1000);
            
            await supabase
              .from("notification_queue")
              .update({
                attempts,
                scheduled_for: retryAt.toISOString(),
                error_message: result.reason,
              })
              .eq("id", notification.id);
            results.retried++;
          }
        }
      } catch (sendError) {
        const errorMessage = sendError instanceof Error ? sendError.message : "Unknown error";
        log("ERROR", "Error sending notification", { notification_id: notification.id, error: errorMessage });
        
        const attempts = (notification.attempts || 0) + 1;
        
        if (attempts >= notification.max_attempts) {
          await supabase
            .from("notification_queue")
            .update({
              status: "failed",
              attempts,
              error_message: errorMessage,
              processed_at: now,
            })
            .eq("id", notification.id);
          results.failed++;
        } else {
          const delaySeconds = RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)];
          const retryAt = new Date(Date.now() + delaySeconds * 1000);
          
          await supabase
            .from("notification_queue")
            .update({
              attempts,
              scheduled_for: retryAt.toISOString(),
              error_message: errorMessage,
            })
            .eq("id", notification.id);
          results.retried++;
        }
      }
    }

    log("INFO", "Queue processing complete", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Process queue error", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
