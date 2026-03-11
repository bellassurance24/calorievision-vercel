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

type ScheduleType = "meal_reminders" | "weekly_summary" | "motivation";

interface ScheduleRequest {
  type: ScheduleType;
}

// AI-generated motivation messages
const MOTIVATION_MESSAGES = [
  { title: "Continuez comme ça ! 💪", body: "Chaque repas sain vous rapproche de votre objectif." },
  { title: "Bravo pour votre régularité ! 🌟", body: "Votre constance paie. Continuez à tracker vos repas." },
  { title: "Nouveau jour, nouvelles opportunités ! 🌅", body: "Prenez un moment pour planifier vos repas d'aujourd'hui." },
  { title: "Vous êtes sur la bonne voie ! 🎯", body: "Vos efforts comptent. Restez concentré sur vos objectifs." },
  { title: "Petit rappel santé 🥗", body: "N'oubliez pas de boire suffisamment d'eau aujourd'hui !" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type }: ScheduleRequest = await req.json();

    log("INFO", "Scheduling notifications", { type });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let results = { queued: 0, skipped: 0 };

    if (type === "meal_reminders") {
      // Get users with meal reminders enabled
      const { data: users } = await supabase
        .from("notification_preferences")
        .select("user_id, breakfast_reminder_time, lunch_reminder_time, dinner_reminder_time, timezone")
        .eq("meal_reminder_enabled", true);

      if (!users) {
        log("INFO", "No users with meal reminders enabled");
        return new Response(
          JSON.stringify({ message: "No users with meal reminders", ...results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      log("INFO", "Found users with meal reminders", { count: users.length });

      const now = new Date();
      const mealTypes = [
        { key: "breakfast_reminder_time", title: "Petit-déjeuner", body: "N'oubliez pas de scanner votre petit-déjeuner ! 🥐" },
        { key: "lunch_reminder_time", title: "Déjeuner", body: "C'est l'heure de scanner votre déjeuner ! 🥗" },
        { key: "dinner_reminder_time", title: "Dîner", body: "Pensez à scanner votre dîner ! 🍽️" },
      ];

      for (const user of users) {
        const timezone = user.timezone || "Europe/Paris";
        
        for (const meal of mealTypes) {
          const reminderTime = user[meal.key as keyof typeof user] as string;
          if (!reminderTime) continue;

          // Calculate next occurrence
          const [hours, minutes] = reminderTime.split(":").map(Number);
          const scheduledFor = new Date(now);
          scheduledFor.setHours(hours, minutes, 0, 0);
          
          // If time has passed today, schedule for tomorrow
          if (scheduledFor <= now) {
            scheduledFor.setDate(scheduledFor.getDate() + 1);
          }

          // Queue the notification
          const { error } = await supabase.from("notification_queue").insert({
            user_id: user.user_id,
            category: "meal_reminder",
            title: meal.title,
            body: meal.body,
            scheduled_for: scheduledFor.toISOString(),
            priority: 3,
            status: "pending",
            data: { meal_type: meal.key.replace("_reminder_time", "") },
          });

          if (!error) results.queued++;
          else results.skipped++;
        }
      }
    } else if (type === "weekly_summary") {
      // Get users with weekly summary enabled
      const { data: users } = await supabase
        .from("notification_preferences")
        .select("user_id")
        .eq("weekly_summary_enabled", true);

      if (users) {
        for (const user of users) {
          const { error } = await supabase.from("notification_queue").insert({
            user_id: user.user_id,
            category: "weekly_summary",
            title: "Votre résumé hebdomadaire 📊",
            body: "Découvrez vos statistiques nutritionnelles de la semaine !",
            scheduled_for: new Date().toISOString(),
            priority: 5,
            status: "pending",
          });

          if (!error) results.queued++;
          else results.skipped++;
        }
      }
    } else if (type === "motivation") {
      // Get users with motivation enabled
      const { data: users } = await supabase
        .from("notification_preferences")
        .select("user_id")
        .eq("motivation_enabled", true);

      if (users) {
        // Pick a random message
        const message = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];

        for (const user of users) {
          const { error } = await supabase.from("notification_queue").insert({
            user_id: user.user_id,
            category: "motivation",
            title: message.title,
            body: message.body,
            scheduled_for: new Date().toISOString(),
            priority: 4,
            status: "pending",
          });

          if (!error) results.queued++;
          else results.skipped++;
        }
      }
    }

    log("INFO", "Scheduling complete", { type, ...results });

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", "Schedule notifications error", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
