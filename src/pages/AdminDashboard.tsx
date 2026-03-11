import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { isLikelyBotUserAgent } from "@/lib/analyticsBot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, BarChart3, Users, Eye, Activity, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { HomeVideoManager } from "@/components/admin/HomeVideoManager";

interface AnalyticsEvent {
  id: string;
  event_type: string;
  page_path: string | null;
  created_at: string;
  metadata: unknown;
  session_id: string | null;
  user_agent: string | null;
}

interface Stats {
  totalVisits: number;
  totalAnalyses: number;
  uniqueSessions: number;
  todayVisits: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [stats, setStats] = useState<Stats>({ totalVisits: 0, totalAnalyses: 0, uniqueSessions: 0, todayVisits: 0 });
  const [loadingData, setLoadingData] = useState(true);

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
    const fetchAnalytics = async () => {
      if (!isAdmin) return;

      try {
        const { data: eventsData, error } = await supabase
          .from("analytics_events")
          .select("id, event_type, page_path, created_at, metadata, session_id, user_agent")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        const allEvents = (eventsData || []) as AnalyticsEvent[];
        const humanEvents = allEvents.filter((e) => !isLikelyBotUserAgent(e.user_agent));

        setEvents(humanEvents);

        // Calculate stats (humans only)
        const today = new Date().toISOString().split("T")[0];
        const humanPageViews = humanEvents.filter((e) => e.event_type === "page_view");

        const totalVisits = humanPageViews.length;
        const totalAnalyses = humanEvents.filter((e) => e.event_type === "meal_analysis").length;
        const uniqueSessions = new Set(humanEvents.map((e) => e.session_id).filter(Boolean)).size;
        const todayVisits = humanPageViews.filter((e) => e.created_at.startsWith(today)).length;

        setStats({ totalVisits, totalAnalyses, uniqueSessions, todayVisits });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

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
              <div className="text-2xl font-bold">{stats.totalVisits}</div>
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
              <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
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
              <div className="text-2xl font-bold">{stats.uniqueSessions}</div>
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
              <div className="text-2xl font-bold">{stats.todayVisits}</div>
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
                  {events.length === 0 ? (
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
