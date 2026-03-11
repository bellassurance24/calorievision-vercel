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

// Stale token threshold: 30 days without use
const STALE_DAYS = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("INFO", "Starting stale token cleanup");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate the stale threshold date
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - STALE_DAYS);
    const staleDateISO = staleDate.toISOString();

    log("INFO", "Deactivating tokens older than", { threshold_date: staleDateISO });

    // Find and deactivate stale tokens
    const { data: staleTokens, error: selectError } = await supabase
      .from("device_tokens")
      .select("id, user_id, platform, last_used_at")
      .eq("is_active", true)
      .or(`last_used_at.is.null,last_used_at.lt.${staleDateISO}`);

    if (selectError) {
      log("ERROR", "Failed to fetch stale tokens", { error: selectError.message });
      throw new Error(`Failed to fetch stale tokens: ${selectError.message}`);
    }

    if (!staleTokens || staleTokens.length === 0) {
      log("INFO", "No stale tokens found");
      return new Response(
        JSON.stringify({ success: true, deactivated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("INFO", "Found stale tokens", { count: staleTokens.length });

    // Deactivate stale tokens
    const staleIds = staleTokens.map((t) => t.id);
    const { error: updateError } = await supabase
      .from("device_tokens")
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .in("id", staleIds);

    if (updateError) {
      log("ERROR", "Failed to deactivate tokens", { error: updateError.message });
      throw new Error(`Failed to deactivate tokens: ${updateError.message}`);
    }

    log("INFO", "Successfully deactivated stale tokens", { 
      count: staleTokens.length,
      platforms: staleTokens.reduce((acc, t) => {
        acc[t.platform] = (acc[t.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        deactivated: staleTokens.length,
        details: staleTokens.map(t => ({
          id: t.id,
          platform: t.platform,
          last_used_at: t.last_used_at
        }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Stale token cleanup failed", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
