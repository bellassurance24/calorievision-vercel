import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SettingsRow = { key: string; value: string };

function getSettingValue(rows: SettingsRow[] | null | undefined, key: string): string | null {
  const row = rows?.find((r) => r.key === key);
  return row?.value ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Backend misconfigured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: settingsRows, error: settingsError } = await supabase
      .from("settings")
      .select("key,value")
      .in("key", [
        "favicon_version",
        "favicon_deleted",
        "og_image_version",
        "og_image_deleted",
      ]);

    if (settingsError) throw settingsError;

    const faviconVersion = getSettingValue(settingsRows as SettingsRow[] | null, "favicon_version");
    const faviconDeletedRaw = getSettingValue(settingsRows as SettingsRow[] | null, "favicon_deleted");

    const ogImageVersion = getSettingValue(settingsRows as SettingsRow[] | null, "og_image_version");
    const ogImageDeletedRaw = getSettingValue(settingsRows as SettingsRow[] | null, "og_image_deleted");

    const faviconDeleted = faviconDeletedRaw === "true";
    const ogImageDeleted = ogImageDeletedRaw === "true";

    const { data: faviconUrlData } = supabase.storage.from("site-assets").getPublicUrl("favicon.png");
    const { data: ogImageUrlData } = supabase.storage.from("site-assets").getPublicUrl("og-image.png");

    return new Response(
      JSON.stringify({
        favicon: {
          url: faviconUrlData.publicUrl,
          version: faviconVersion,
          deleted: faviconDeleted,
        },
        ogImage: {
          url: ogImageUrlData.publicUrl,
          version: ogImageVersion,
          deleted: ogImageDeleted,
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
    console.error("public-site-assets error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
