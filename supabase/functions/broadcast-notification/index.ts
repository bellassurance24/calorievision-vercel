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

const FCM_API_URL = "https://fcm.googleapis.com/v1/projects";

// Standard base64 decoder that handles both regular and URL-safe base64
function base64Decode(str: string): Uint8Array {
  // Convert URL-safe base64 to standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  const binString = atob(base64);
  return Uint8Array.from(binString, (c) => c.charCodeAt(0));
}

// Base64url encode without padding
function base64UrlEncode(data: string | Uint8Array): string {
  let base64: string;
  if (typeof data === 'string') {
    base64 = btoa(data);
  } else {
    base64 = btoa(String.fromCharCode(...data));
  }
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAccessToken(): Promise<string> {
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");
  let privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase credentials not configured");
  }

  // Handle escaped newlines (common when storing in env vars)
  privateKey = privateKey.replace(/\\n/g, "\n");

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

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Extract the key content between BEGIN and END markers
  const keyMatch = privateKey.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!keyMatch) {
    throw new Error("Invalid private key format - missing PEM markers");
  }
  
  // Remove all whitespace including newlines from the key data
  const keyData = keyMatch[1].replace(/\s+/g, '');
  
  log("INFO", "Processing private key", { keyLength: keyData.length });
  
  let binaryKey: Uint8Array;
  try {
    binaryKey = base64Decode(keyData);
  } catch (e) {
    log("ERROR", "Failed to decode private key base64", { error: String(e) });
    throw new Error("Failed to decode base64 private key");
  }
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    log("ERROR", "Failed to get FCM access token", { status: tokenResponse.status, error: errorText });
    throw new Error("Failed to get FCM access token");
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function sendToFCM(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<{ success: boolean; error?: string; invalidToken?: boolean }> {
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
            payload: { aps: { sound: "default", badge: 1 } },
          },
          webpush: {
            headers: { Urgency: "high" },
            notification: { icon: "/favicon.png", badge: "/favicon.png" },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorCode = errorData.error?.details?.[0]?.errorCode || "";
      const errorMessage = errorData.error?.message || "FCM error";
      
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
      
      return { success: false, error: errorMessage, invalidToken: isInvalidToken };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

interface BroadcastRequest {
  title: string;
  body: string;
  data?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const payload: BroadcastRequest = await req.json();

    if (!payload.title || !payload.body) {
      throw new Error("title and body are required");
    }

    log("INFO", "Admin broadcast notification initiated", { 
      admin_id: user.id,
      title: payload.title 
    });

    // Fetch ALL active device tokens (both authenticated and anonymous)
    const { data: devices, error: devicesError } = await supabase
      .from("device_tokens")
      .select("id, token, platform, user_id, visitor_id")
      .eq("is_active", true);

    if (devicesError) {
      throw new Error(`Failed to fetch devices: ${devicesError.message}`);
    }

    if (!devices || devices.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "no_devices", 
          message: "Aucun appareil enregistré" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("INFO", "Broadcasting to devices", { total_devices: devices.length });

    // Get FCM access token
    const accessToken = await getAccessToken();
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;

    let successCount = 0;
    let failCount = 0;
    const batchId = crypto.randomUUID();
    const logEntries: Array<{
      user_id: string | null;
      visitor_id: string | null;
      device_token_id: string;
      category: string;
      title: string;
      body: string;
      data: Record<string, string>;
      status: string;
      error_message: string | null;
      sent_at: string;
      batch_id: string;
    }> = [];

    // Send to all devices
    for (const device of devices) {
      const result = await sendToFCM(
        accessToken,
        projectId,
        device.token,
        payload.title,
        payload.body,
        payload.data || {}
      );

      const logEntry = {
        user_id: device.user_id,
        visitor_id: device.visitor_id,
        device_token_id: device.id,
        category: "system" as const,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        status: result.success ? "sent" : "failed",
        error_message: result.error || null,
        sent_at: new Date().toISOString(),
        batch_id: batchId,
      };

      logEntries.push(logEntry);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
        
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

    // Log all results
    if (logEntries.length > 0) {
      await supabase.from("notification_logs").insert(logEntries);
    }

    log("INFO", "Broadcast complete", { 
      batch_id: batchId,
      success_count: successCount, 
      fail_count: failCount,
      total: devices.length 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification envoyée à ${successCount}/${devices.length} appareils`,
        sent: successCount,
        failed: failCount,
        total: devices.length,
        batch_id: batchId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Broadcast notification failed", { error: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
