import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // These are public Firebase configuration values (safe to expose)
    const config = {
      apiKey: Deno.env.get("VITE_FIREBASE_API_KEY") || "",
      authDomain: Deno.env.get("VITE_FIREBASE_AUTH_DOMAIN") || "",
      projectId: Deno.env.get("VITE_FIREBASE_PROJECT_ID") || "",
      storageBucket: Deno.env.get("VITE_FIREBASE_STORAGE_BUCKET") || "",
      messagingSenderId: Deno.env.get("VITE_FIREBASE_MESSAGING_SENDER_ID") || "",
      appId: Deno.env.get("VITE_FIREBASE_APP_ID") || "",
      vapidKey: Deno.env.get("VITE_FIREBASE_VAPID_KEY") || "",
    };

    // Validate that essential config is present (apiKey required to avoid 400 errors)
    if (!config.apiKey || !config.projectId || !config.messagingSenderId) {
      console.error("Firebase configuration is incomplete in secrets");
      return new Response(
        JSON.stringify({ error: "Firebase configuration not available" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(config),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Firebase configuration" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
