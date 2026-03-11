import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SiteSettingsRow = {
  header_logo_url: string | null;
  header_logo_alt: string | null;
  footer_logo_url: string | null;
  updated_at: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Backend misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("site_settings")
      .select("header_logo_url,header_logo_alt,footer_logo_url,updated_at")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const row = data as SiteSettingsRow | null;
    const version = row?.updated_at ?? String(Date.now());

    return new Response(
      JSON.stringify({
        headerLogo: {
          url: row?.header_logo_url ?? null,
          alt: row?.header_logo_alt ?? null,
          version,
        },
        footerLogo: {
          url: row?.footer_logo_url ?? null,
          alt: "CalorieVision",
          version,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("public-site-settings error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
