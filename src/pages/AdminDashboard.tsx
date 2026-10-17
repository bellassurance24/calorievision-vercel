import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { isLikelyBotUserAgent } from "@/lib/analyticsBot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, BarChart3, Users, Eye, Activity, TrendingUp, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { HomeVideoManager } from "@/components/admin/HomeVideoManager";
import {
  DASHBOARD_TIME_ZONE,
  SESSION_WINDOW_DAYS,
  fetchDashboardStats,
  type DashboardStats,
} from "@/lib/adminDashboardStats";

interface AnalyticsEvent {
  id: string;
  event_type: string;
  page_path: string | null;
  created_at: string;
  metadata: unknown;
  session_id: string | null;
  user_agent: string | null;
}

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  // null = not loaded (or failed) — never rendered as 0
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [eventsError, setEventsError] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const t = (en: string, fr: string) => (language === "fr" ? fr : en);

  // Redirect non-admin users. Instead of reacting to every isAdmin change
  // (which flickers due to transient auth events), we do a single server-side
  // check after the initial auth load completes.
  const accessCheckedRef = React.useRef(false);
  useEffect(() => {
    if (isLoading) return;
    if (isAdmin && user) {
      accessCheckedRef.current = true;
      return; // Already confirmed admin
    }
    if (accessCheckedRef.current) return; // Already verified, don't re-check

    let cancelled = false;
    const verifyAccess = async () => {
      // Give auth state time to fully settle after login
      await new Promise((r) => setTimeout(r, 2500));
      if (cancelled) return;

      // Fresh session check from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Fresh RPC check
      try {
        const { data: hasAdminRole } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (cancelled) return;
        if (hasAdminRole) {
          accessCheckedRef.current = true;
          return; // User IS admin, stay on page
        }
      } catch {
        // Fall through to redirect
      }
      if (!cancelled) navigate("/auth");
    };

    verifyAccess();
    return () => { cancelled = true; };
  }, [isLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    const fetchRecentEvents = async () => {
      // Recent-activity table only: the 100 latest events
      const { data: eventsData, error } = await supabase
        .from("analytics_events")
        .select("id, event_type, page_path, created_at, metadata, session_id, user_agent")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return ((eventsData || []) as AnalyticsEvent[]).filter((e) => !isLikelyBotUserAgent(e.user_agent));
    };

    const fetchAnalytics = async () => {
      const [statsResult, eventsResult] = await Promise.allSettled([
        fetchDashboardStats(supabase),
        fetchRecentEvents(),
      ]);
      if (cancelled) return;

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
        setStatsError(false);
      } else {
        console.error("Error fetching dashboard stats:", statsResult.reason);
        setStatsError(true); // keep previously loaded values, if any
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value);
        setEventsError(false);
      } else {
        console.error("Error fetching recent events:", eventsResult.reason);
        setEventsError(true);
      }

      setLoadingData(false);
    };

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [isAdmin, reloadKey]);

  const kpi = (value: number | undefined) => (value === undefined ? "—" : value.toLocaleString());

  if (isLoading || loadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("Dashboard", "Tableau de bord")}
          </h1>
          <p className="text-muted-foreground">
            {t("Overview of CalorieVision analytics", "Aperçu des analytiques CalorieVision")}
          </p>
        </div>

        {statsError && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              {stats
                ? t("Refresh failed — showing the last loaded values.", "Échec de l'actualisation — dernières valeurs chargées affichées.")
                : t("Statistics could not be loaded. Values are unavailable, not zero.", "Impossible de charger les statistiques. Les valeurs sont indisponibles, pas nulles.")}
            </span>
            <Button size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              {t("Retry", "Réessayer")}
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Total Page Views", "Total des vues")}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi(stats?.totalVisits)}</div>
              <p className="text-xs text-muted-foreground">{t("All time, excluding /admin", "Depuis le début, hors /admin")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Meal Analyses", "Analyses de repas")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi(stats?.totalAnalyses)}</div>
              <p className="text-xs text-muted-foreground">{t("All time", "Depuis le début")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Unique Sessions", "Sessions uniques")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi(stats?.uniqueSessions)}{stats?.uniqueSessionsCapped ? "+" : ""}
              </div>
              <p className="text-xs text-muted-foreground">
                {t(`Last ${SESSION_WINDOW_DAYS} days`, `${SESSION_WINDOW_DAYS} derniers jours`)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Today's Visits", "Visites du jour")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi(stats?.todayVisits)}</div>
              <p className="text-xs text-muted-foreground">{t(`Since midnight (${DASHBOARD_TIME_ZONE})`, `Depuis minuit (${DASHBOARD_TIME_ZONE})`)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Home Video Manager */}
        <HomeVideoManager />

        {/* Recent Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("Recent Activity", "Activité récente")}
            </CardTitle>
            <CardDescription>
              {t("Last 100 events recorded", "Les 100 derniers événements")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Event Type", "Type")}</TableHead>
                    <TableHead>{t("Page", "Page")}</TableHead>
                    <TableHead>{t("Date", "Date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsError && events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-destructive py-8">
                        {t("Recent activity could not be loaded", "Impossible de charger l'activité récente")}
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        {t("No events recorded yet", "Aucun événement enregistré")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            event.event_type === "meal_analysis" 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {event.event_type}
                          </span>
                        </TableCell>
                        <TableCell>{event.page_path || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(event.created_at).toLocaleString(language === "fr" ? "fr-FR" : "en-US")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
