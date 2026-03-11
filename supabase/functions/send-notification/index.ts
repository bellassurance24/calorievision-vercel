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

// FCM v1 API endpoint
const FCM_API_URL = "https://fcm.googleapis.com/v1/projects";

interface NotificationPayload {
  notification_id: string;
}

interface DeviceToken {
  id: string;
  token: string;
  platform: string;
}

interface NotificationPreferences {
  meal_reminder_enabled: boolean;
  calorie_alert_enabled: boolean;
  weekly_summary_enabled: boolean;
  motivation_enabled: boolean;
  system_enabled: boolean;
  promotional_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

// Get OAuth2 access token for FCM v1 API
async function getAccessToken(): Promise<string> {
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");
  const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase credentials not configured");
  }

  // Create JWT for Google OAuth2
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const keyData = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get FCM access token");
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Check if notification is allowed based on user preferences
function isNotificationAllowed(category: string, prefs: NotificationPreferences): boolean {
  const categoryMap: Record<string, keyof NotificationPreferences> = {
    meal_reminder: "meal_reminder_enabled",
    calorie_alert: "calorie_alert_enabled",
    weekly_summary: "weekly_summary_enabled",
    motivation: "motivation_enabled",
    system: "system_enabled",
    promotional: "promotional_enabled",
  };

  const prefKey = categoryMap[category];
  return prefKey ? (prefs[prefKey] as boolean) : false;
}

// Check quiet hours
function isInQuietHours(prefs: NotificationPreferences, category: string): boolean {
  // System notifications bypass quiet hours
  if (category === "system") return false;

  const now = new Date();
  const timezone = prefs.timezone || "Europe/Paris";
  
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const currentTime = formatter.format(now);
    const [currentHour, currentMinute] = currentTime.split(":").map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = prefs.quiet_hours_start.split(":").map(Number);
    const [endHour, endMinute] = prefs.quiet_hours_end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } catch {
    return false;
  }
}

// Send notification via FCM v1
async function sendToFCM(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<{ success: boolean; error?: string; errorCode?: string; invalidToken?: boolean }> {
  try {
    const response = await fetch(`${FCM_API_URL}/${projectId}/messages:send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data,
          android: {
            priority: "high",
            notification: { sound: "default" },
          },
          apns: {
            payload: {
              aps: { sound: "default", badge: 1 },
            },
          },
          webpush: {
            headers: {
              Urgency: "high",
            },
            notification: {
              icon: "/favicon.png",
              badge: "/favicon.png",
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorCode = errorData.error?.details?.[0]?.errorCode || "";
      const errorMessage = errorData.error?.message || "FCM error";
      
      log("WARN", "FCM API error response", { 
        status: response.status, 
        errorCode, 
        errorMessage,
        details: errorData.error?.details
      });
      
      // Check for invalid/expired token errors
      const invalidTokenCodes = [
        "UNREGISTERED",
        "INVALID_ARGUMENT", 
        "NOT_FOUND",
        "messaging/invalid-registration-token",
        "messaging/registration-token-not-registered"
      ];
      
      const isInvalidToken = invalidTokenCodes.some(code => 
        errorCode.includes(code) || errorMessage.includes(code)
      );
      
      if (isInvalidToken) {
        return { success: false, error: errorMessage, errorCode, invalidToken: true };
      }
      
      return { success: false, error: errorMessage, errorCode };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "FCM send exception", { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notification_id }: NotificationPayload = await req.json();

    if (!notification_id) {
      throw new Error("notification_id is required");
    }

    log("INFO", "Processing notification", { notification_id });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch notification from queue
    const { data: notification, error: notifError } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("id", notification_id)
      .single();

    if (notifError || !notification) {
      log("ERROR", "Notification not found", { notification_id });
      throw new Error("Notification not found");
    }

    // Fetch user preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", notification.user_id)
      .single();

    // Check if notification is allowed
    if (prefs && !isNotificationAllowed(notification.category, prefs)) {
      await supabase
        .from("notification_queue")
        .update({ status: "cancelled", processed_at: new Date().toISOString() })
        .eq("id", notification_id);

      return new Response(
        JSON.stringify({ success: false, reason: "disabled_by_user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check quiet hours
    if (prefs && isInQuietHours(prefs, notification.category)) {
      // Reschedule for after quiet hours
      const quietEnd = prefs.quiet_hours_end;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [h, m] = quietEnd.split(":").map(Number);
      tomorrow.setHours(h, m, 0, 0);

      await supabase
        .from("notification_queue")
        .update({ scheduled_for: tomorrow.toISOString() })
        .eq("id", notification_id);

      return new Response(
        JSON.stringify({ success: false, reason: "quiet_hours", rescheduled: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch active device tokens
    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("id, token, platform")
      .eq("user_id", notification.user_id)
      .eq("is_active", true);

    if (!tokens || tokens.length === 0) {
      await supabase
        .from("notification_queue")
        .update({ status: "failed", error_message: "No active devices", processed_at: new Date().toISOString() })
        .eq("id", notification_id);

      return new Response(
        JSON.stringify({ success: false, reason: "no_devices" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get FCM access token
    const accessToken = await getAccessToken();
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;

    let successCount = 0;
    let failCount = 0;
    const logs: Array<{ device_token_id: string; status: string; error?: string }> = [];

    log("INFO", "Sending to devices", { 
      notification_id, 
      user_id: notification.user_id, 
      device_count: tokens.length 
    });

    // Send to all devices
    for (const device of tokens as DeviceToken[]) {
      const result = await sendToFCM(
        accessToken,
        projectId,
        device.token,
        notification.title,
        notification.body,
        notification.data || {}
      );

      if (result.success) {
        successCount++;
        logs.push({ device_token_id: device.id, status: "sent" });
        log("INFO", "Notification sent successfully", { 
          notification_id, 
          device_id: device.id, 
          platform: device.platform 
        });
      } else {
        failCount++;
        logs.push({ device_token_id: device.id, status: "failed", error: result.error });
        log("WARN", "Failed to send notification", { 
          notification_id, 
          device_id: device.id, 
          error: result.error,
          invalidToken: result.invalidToken 
        });

        // Mark invalid tokens as inactive
        if (result.invalidToken) {
          await supabase
            .from("device_tokens")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", device.id);
          log("INFO", "Marked token as inactive", { device_id: device.id });
        }
      }
    }

    // Log results
    const logEntries = logs.map((log) => ({
      user_id: notification.user_id,
      device_token_id: log.device_token_id,
      category: notification.category,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      status: log.status,
      error_message: log.error,
      sent_at: new Date().toISOString(),
    }));

    await supabase.from("notification_logs").insert(logEntries);

    // Update queue status
    const finalStatus = successCount > 0 ? "sent" : "failed";
    await supabase
      .from("notification_queue")
      .update({
        status: finalStatus,
        processed_at: new Date().toISOString(),
        error_message: failCount > 0 ? `${failCount}/${tokens.length} devices failed` : null,
      })
      .eq("id", notification_id);

    // Update rate limits
    await supabase.rpc("increment_notification_count", { p_user_id: notification.user_id });

    return new Response(
      JSON.stringify({ success: true, sent: successCount, failed: failCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Send notification failed", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
