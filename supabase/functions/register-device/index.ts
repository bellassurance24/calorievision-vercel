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

type DevicePlatform = "ios" | "android" | "web";

interface RegisterDeviceRequest {
  token: string;
  platform: DevicePlatform;
  device_name?: string;
  visitor_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RegisterDeviceRequest = await req.json();

    if (!payload.token || !payload.platform) {
      throw new Error("token and platform are required");
    }

    // Validate platform
    if (!["ios", "android", "web"].includes(payload.platform)) {
      throw new Error("platform must be ios, android, or web");
    }

    log("INFO", "Device registration request", { 
      platform: payload.platform, 
      device_name: payload.device_name,
      has_visitor_id: !!payload.visitor_id,
      token_length: payload.token.length 
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to get user from authorization header (optional now)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      
      if (!authError && user) {
        userId = user.id;
        log("INFO", "Authenticated user registering device", { user_id: userId });
      }
    }

    // Use visitor_id for anonymous tracking
    const visitorId = payload.visitor_id || null;

    if (!userId && !visitorId) {
      log("WARN", "Registration attempt without user_id or visitor_id");
      throw new Error("Either authentication or visitor_id is required");
    }

    // Check if token already exists
    let existingQuery = supabase
      .from("device_tokens")
      .select("id, user_id, visitor_id")
      .eq("token", payload.token);

    const { data: existingTokens } = await existingQuery;

    if (existingTokens && existingTokens.length > 0) {
      const existing = existingTokens[0];
      
      // Update existing token
      const { error } = await supabase
        .from("device_tokens")
        .update({
          is_active: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          device_name: payload.device_name,
          user_id: userId || existing.user_id,
          visitor_id: visitorId || existing.visitor_id,
        })
        .eq("id", existing.id);

      if (error) {
        log("ERROR", "Failed to update token", { error: error.message, device_id: existing.id });
        throw new Error(`Failed to update token: ${error.message}`);
      }

      log("INFO", "Device token updated", { 
        device_id: existing.id, 
        user_id: userId,
        visitor_id: visitorId 
      });

      return new Response(
        JSON.stringify({ success: true, action: "updated", device_id: existing.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new token
    const { data, error } = await supabase
      .from("device_tokens")
      .insert({
        user_id: userId,
        visitor_id: visitorId,
        token: payload.token,
        platform: payload.platform,
        device_name: payload.device_name,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      log("ERROR", "Failed to register token", { error: error.message, user_id: userId, visitor_id: visitorId });
      throw new Error(`Failed to register token: ${error.message}`);
    }

    log("INFO", "New device token registered", { 
      device_id: data.id, 
      user_id: userId,
      visitor_id: visitorId,
      platform: payload.platform 
    });

    return new Response(
      JSON.stringify({ success: true, action: "registered", device_id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Register device error", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
