import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ImageOff, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { ScrollAnimation } from "@/components/ScrollAnimation";

interface ScanRow {
  id: string;
  created_at: string;
  storage_path: string | null;
  total_calories: number | null;
  analysis_result: {
    items: { name: string; calories: number; protein: number; carbs: number; fat: number }[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  } | null;
}

const History = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { plan, isLoading: planLoading } = useSubscription();
  const navigate = useNavigate();

  const [scans, setScans] = useState<ScanRow[]>([]);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const t = (en: string, fr: string) => (language === "fr" ? fr : en);

  usePageMetadata({
    title: t("Scan History — CalorieVision", "Historique des scans — CalorieVision"),
    description: t(
      "View your past meal scans with nutritional breakdown.",
      "Consultez vos analyses de repas passées avec le détail nutritionnel.",
    ),
    path: "/history",
  });

  // Auth guard
  useEffect(() => {
    if (!planLoading && !user) {
      navigate("/auth?returnTo=/history", { replace: true });
    }
  }, [user, planLoading, navigate]);

  // Fetch scans
  useEffect(() => {
    if (!user || plan === "starter") return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_scans")
        .select("id, created_at, storage_path, total_calories, analysis_result")
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (!error && data) {
        setScans(data as ScanRow[]);

        // Generate signed URLs for thumbnails
        const paths = data
          .map((s: any) => s.storage_path)
          .filter((p: string | null): p is string => !!p);

        if (paths.length > 0) {
          const { data: signed } = await supabase.storage
            .from("user-scans")
            .createSignedUrls(paths, 300);

          if (signed) {
            const map: Record<string, string> = {};
            signed.forEach((s) => {
              if (s.signedUrl) map[s.path] = s.signedUrl;
            });
            setThumbUrls(map);
          }
        }
      }
      setLoading(false);
    };

    load();
  }, [user, plan]);

  // Loading state
  if (planLoading) {
    return (
      <section className="section-card flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  // Not logged in (guard will redirect)
  if (!user) return null;

  // Starter / Free — upgrade prompt
  if (plan === "starter") {
    return (
      <section className="section-card flex flex-col items-center justify-center min-h-[40vh] gap-6 text-center">
        <Crown className="h-16 w-16 text-primary/60" />
        <h1 className="text-2xl font-semibold md:text-3xl">
          {t("Upgrade to access scan history", "Passez à Pro pour accéder à l'historique")}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {t(
            "Pro users can review the last 7 days of scans. Ultimate users get 30 days.",
            "Les utilisateurs Pro peuvent consulter les 7 derniers jours. Ultimate : 30 jours.",
          )}
        </p>
        <Button asChild>
          <LocalizedNavLink to="/pricing">
            {t("View plans", "Voir les plans")}
          </LocalizedNavLink>
        </Button>
      </section>
    );
  }

  // Pro / Ultimate — scan history table
  return (
    <section className="section-card">
      <h1 className="mb-2 text-2xl font-semibold md:text-3xl">
        {t("Scan History", "Historique des scans")}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {plan === "ultimate"
          ? t("Last 30 days", "30 derniers jours")
          : t("Last 7 days", "7 derniers jours")}
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
          <ImageOff className="h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">
            {t("No scans yet", "Aucun scan pour l'instant")}
          </p>
          <Button variant="outline" asChild>
            <LocalizedNavLink to="/analyze">
              {t("Analyze a meal", "Analyser un repas")}
            </LocalizedNavLink>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3">{t("Photo", "Photo")}</th>
                <th className="px-3 py-3">{t("Date", "Date")}</th>
                <th className="px-3 py-3 text-right">{t("Calories", "Calories")}</th>
                <th className="px-3 py-3 text-right">{t("Protein", "Protéines")}</th>
                <th className="px-3 py-3 text-right">{t("Carbs", "Glucides")}</th>
                <th className="px-3 py-3 text-right">{t("Fat", "Lipides")}</th>
                <th className="px-3 py-3">{t("Foods detected", "Aliments détectés")}</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan, idx) => {
                const ar = scan.analysis_result;
                const thumbUrl = scan.storage_path ? thumbUrls[scan.storage_path] : null;
                const foods = ar?.items?.map((i) => i.name).join(", ") ?? "—";
                const date = new Date(scan.created_at);
                const dateStr = date.toLocaleDateString(language, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <ScrollAnimation key={scan.id} animation="fade-up" duration={300 + idx * 50}>
                    <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <ImageOff className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{dateStr}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {ar?.totalCalories ? `${Math.round(ar.totalCalories)} kcal` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {ar?.totalProtein != null ? `${Math.round(ar.totalProtein)}g` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {ar?.totalCarbs != null ? `${Math.round(ar.totalCarbs)}g` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {ar?.totalFat != null ? `${Math.round(ar.totalFat)}g` : "—"}
                      </td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={foods}>
                        {foods}
                      </td>
                    </tr>
                  </ScrollAnimation>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default History;
