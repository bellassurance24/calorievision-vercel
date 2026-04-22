import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import { AnalyticsDateFilter, DateRange, QuickFilter, getDateRangeForFilter } from "@/components/admin/AnalyticsDateFilter";
import { AnalyticsMetricCard } from "@/components/admin/AnalyticsMetricCard";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { LiveVisitorsSection } from "@/components/admin/LiveVisitorsSection";
import { UserScansSection } from "@/components/admin/UserScansSection";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { 
  Eye, 
  Users, 
  BarChart3, 
  Utensils, 
  Smartphone, 
  Monitor, 
  Tablet,
  Globe,
  Clock,
  RefreshCw,
  MapPin,
  Route,
  Timer,
  BookOpen,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { subDays } from "date-fns";
import { Loader2 } from "lucide-react";

// ── Meta Ads types ────────────────────────────────────────────────────────────
interface MetaCampaign {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  cpc: number;
  spend: number;
}
interface MetaDayPoint {
  date: string;
  impressions: number;
  clicks: number;
}
// ── Supabase growth types ─────────────────────────────────────────────────────
interface GrowthStats {
  scansToday: number;
  scansWeek: number;
  scansMonth: number;
  signupsToday: number;
  signupsWeek: number;
  activeSubscribers: number;
  scansDailyLast30: { date: string; count: number }[];
  signupsDailyLast30: { date: string; count: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(221, 83%, 53%)",
  "hsl(47, 96%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(0, 84%, 60%)",
];

const sourceIcons: Record<string, string> = {
  "Google (Organic)": "🔍",
  "Direct": "📱",
  "Facebook": "📘",
  "Twitter/X": "🐦",
  "Instagram": "📸",
  "LinkedIn": "💼",
  "YouTube": "🎥",
  "Pinterest": "🔴",
  "Referral": "🔗",
  "Bing": "🔎",
  "Email": "📧",
};

const languageFlags: Record<string, string> = {
  "EN": "🇬🇧",
  "FR": "🇫🇷",
  "ES": "🇪🇸",
  "DE": "🇩🇪",
  "PT": "🇵🇹",
  "IT": "🇮🇹",
  "NL": "🇳🇱",
  "AR": "🇸🇦",
  "ZH": "🇨🇳",
};

const countryFlags: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Spain": "🇪🇸",
  "Italy": "🇮🇹",
  "Netherlands": "🇳🇱",
  "Portugal": "🇵🇹",
  "Brazil": "🇧🇷",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "Morocco": "🇲🇦",
  "Algeria": "🇩🇿",
  "Tunisia": "🇹🇳",
  "Egypt": "🇪🇬",
  "Saudi Arabia": "🇸🇦",
  "United Arab Emirates": "🇦🇪",
  "China": "🇨🇳",
  "Japan": "🇯🇵",
  "India": "🇮🇳",
  "Mexico": "🇲🇽",
  "Argentina": "🇦🇷",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Poland": "🇵🇱",
  "Russia": "🇷🇺",
  "Unknown": "🌐",
};

const deviceIcons: Record<string, React.ElementType> = {
  "Mobile": Smartphone,
  "Desktop": Monitor,
  "Tablet": Tablet,
};

const AdminAnalytics = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<QuickFilter>("last7days");
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeForFilter("last7days"));

  // ── Meta Ads state ──────────────────────────────────────────────────────────
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaign[]>([]);
  const [metaDailyData, setMetaDailyData] = useState<MetaDayPoint[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  // ── Supabase growth state ───────────────────────────────────────────────────
  const [growthStats, setGrowthStats] = useState<GrowthStats>({
    scansToday: 0, scansWeek: 0, scansMonth: 0,
    signupsToday: 0, signupsWeek: 0, activeSubscribers: 0,
    scansDailyLast30: [], signupsDailyLast30: [],
  });
  const [growthLoading, setGrowthLoading] = useState(true);

  // Calculate previous period for comparison
  const previousDateRange = useMemo(() => {
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    return {
      from: subDays(dateRange.from, daysDiff + 1),
      to: subDays(dateRange.from, 1),
    };
  }, [dateRange]);

  const {
    loading,
    isAutoRefreshing,
    metrics,
    trafficSources,
    topPages,
    deviceStats,
    browserStats,
    osStats,
    languageStats,
    countryStats,
    cityStats,
    hourlyStats,
    dailyStats,
    sessionJourneys,
    sessionDurationStats,
    blogAnalytics,
    exportToCSV,
    refresh,
  } = useAnalyticsData(dateRange, previousDateRange);

  // ── Fetch Meta Ads data ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMetaAds = async () => {
      setMetaLoading(true);
      setMetaError(null);
      // Env vars must be VITE_ prefixed in Vite projects (add VITE_META_ACCESS_TOKEN
      // and VITE_META_AD_ACCOUNT_ID to your .env file).
      const token = import.meta.env.VITE_META_ACCESS_TOKEN as string | undefined;
      const rawAccountId = import.meta.env.VITE_META_AD_ACCOUNT_ID as string | undefined;

      if (!token || !rawAccountId) {
        setMetaError("Meta Ads env vars not set (VITE_META_ACCESS_TOKEN / VITE_META_AD_ACCOUNT_ID)");
        setMetaLoading(false);
        return;
      }

      const accountId = rawAccountId.startsWith("act_") ? rawAccountId : `act_${rawAccountId}`;
      const base = "https://graph.facebook.com/v19.0";

      try {
        // Campaign-level stats
        const campRes = await fetch(
          `${base}/${accountId}/campaigns?fields=name,insights%7Bimpressions%2Cclicks%2Ccpc%2Cspend%7D&access_token=${token}`,
        );
        const campJson = await campRes.json();
        if (campJson.error) throw new Error(campJson.error.message);

        const campaigns: MetaCampaign[] = (campJson.data || []).map((c: Record<string, unknown>) => {
          const ins = (c.insights as { data?: Record<string, string>[] } | undefined)?.data?.[0] ?? {};
          return {
            id: c.id as string,
            name: c.name as string,
            impressions: parseInt(ins.impressions ?? "0", 10),
            clicks: parseInt(ins.clicks ?? "0", 10),
            cpc: parseFloat(ins.cpc ?? "0"),
            spend: parseFloat(ins.spend ?? "0"),
          };
        });
        setMetaCampaigns(campaigns);

        // Account-level daily insights (last 7 days)
        const insRes = await fetch(
          `${base}/${accountId}/insights?fields=impressions%2Cclicks%2Cdate_start&time_increment=1&date_preset=last_7_days&access_token=${token}`,
        );
        const insJson = await insRes.json();
        if (insJson.error) throw new Error(insJson.error.message);

        const daily: MetaDayPoint[] = (insJson.data || []).map((d: Record<string, string>) => ({
          date: d.date_start?.slice(5) ?? "", // MM-DD
          impressions: parseInt(d.impressions ?? "0", 10),
          clicks: parseInt(d.clicks ?? "0", 10),
        }));
        setMetaDailyData(daily);
      } catch (err) {
        setMetaError(err instanceof Error ? err.message : "Failed to load Meta Ads data");
      } finally {
        setMetaLoading(false);
      }
    };

    fetchMetaAds();
  }, []);

  // ── Fetch Supabase growth stats ─────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;

    const fetchGrowthStats = async () => {
      setGrowthLoading(true);
      try {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
        const thirtyDaysAgo = monthAgo.toISOString();

        // ── Scans: today / week / month ────────────────────────────────────
        const { count: scansToday } = await supabase
          .from("user_scans")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${todayStr}T00:00:00`);

        const { count: scansWeek } = await supabase
          .from("user_scans")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString());

        const { count: scansMonth } = await supabase
          .from("user_scans")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo);

        // ── Scans daily trend (last 30 days) ───────────────────────────────
        const { data: scanRows } = await supabase
          .from("user_scans")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo)
          .order("created_at", { ascending: true });

        const scansByDay: Record<string, number> = {};
        (scanRows || []).forEach((r) => {
          const d = r.created_at.slice(0, 10);
          scansByDay[d] = (scansByDay[d] ?? 0) + 1;
        });
        const scansDailyLast30 = Array.from({ length: 30 }, (_, i) => {
          const d = new Date(monthAgo); d.setDate(d.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          return { date: key.slice(5), count: scansByDay[key] ?? 0 };
        });

        // ── Signups: today / week (from profiles) ──────────────────────────
        const { count: signupsToday } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${todayStr}T00:00:00`);

        const { count: signupsWeek } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString());

        // ── Signups daily trend (last 30 days) ─────────────────────────────
        const { data: signupRows } = await supabase
          .from("profiles")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo)
          .order("created_at", { ascending: true });

        const signupsByDay: Record<string, number> = {};
        (signupRows || []).forEach((r) => {
          const d = (r as { created_at: string }).created_at.slice(0, 10);
          signupsByDay[d] = (signupsByDay[d] ?? 0) + 1;
        });
        const signupsDailyLast30 = Array.from({ length: 30 }, (_, i) => {
          const d = new Date(monthAgo); d.setDate(d.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          return { date: key.slice(5), count: signupsByDay[key] ?? 0 };
        });

        // ── Active Pro/Ultimate subscribers ────────────────────────────────
        let activeSubscribers = 0;
        // Try user_roles table first
        const { count: roleCount } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .in("role", ["pro", "ultimate"] as never[]);
        if (typeof roleCount === "number") {
          activeSubscribers = roleCount;
        } else {
          // Fallback: try subscriptions table
          const { count: subCount } = await supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");
          activeSubscribers = subCount ?? 0;
        }

        setGrowthStats({
          scansToday: scansToday ?? 0,
          scansWeek: scansWeek ?? 0,
          scansMonth: scansMonth ?? 0,
          signupsToday: signupsToday ?? 0,
          signupsWeek: signupsWeek ?? 0,
          activeSubscribers,
          scansDailyLast30,
          signupsDailyLast30,
        });
      } catch (err) {
        console.error("growthStats error:", err);
      } finally {
        setGrowthLoading(false);
      }
    };

    fetchGrowthStats();
  }, [isAdmin]);

  // ── Format duration for display
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    navigate("/auth");
    return null;
  }

  return (
    <AdminLayout forceDark>
      <div className="space-y-6 p-6 min-h-screen">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Analytics
              {isAutoRefreshing && (
                <span className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  Auto-refresh...
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Track your website performance and visitor behavior
              <span className="text-xs ml-2 opacity-70">(auto-refresh: 30s)</span>
            </p>
          </div>
          <Button onClick={refresh} variant="outline" disabled={loading || isAutoRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading || isAutoRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Date Filter */}
        <AnalyticsDateFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Live Visitors */}
        <LiveVisitorsSection />

        {/* User Scans */}
        <UserScansSection />

        {/* ── Supabase Growth Stats ─────────────────────────────────────────── */}
        <div
          style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", padding: "24px" }}
        >
          <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            📊 App Growth Stats
          </h2>

          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Scans Today",    value: growthStats.scansToday },
              { label: "Scans This Week",value: growthStats.scansWeek },
              { label: "Scans This Month",value: growthStats.scansMonth },
              { label: "Signups Today",  value: growthStats.signupsToday },
              { label: "Signups This Week",value: growthStats.signupsWeek },
              { label: "Active Subscribers",value: growthStats.activeSubscribers },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #334155", padding: "16px 20px" }}
              >
                {growthLoading ? (
                  <div style={{ height: 32, background: "#334155", borderRadius: 6, animation: "pulse 1.5s infinite" }} />
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#FF6B00" }}>{value}</span>
                )}
                <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Scans per day — Line */}
            <div>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Scans / day (last 30 days)</p>
              {growthLoading ? (
                <div style={{ height: 180, background: "#0f172a", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={growthStats.scansDailyLast30}>
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} interval={6} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#FF6B00" strokeWidth={2} dot={false} name="Scans" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Signups per day — Bar */}
            <div>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>New Signups / day (last 30 days)</p>
              {growthLoading ? (
                <div style={{ height: 180, background: "#0f172a", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={growthStats.signupsDailyLast30}>
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} interval={6} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                    />
                    <Bar dataKey="count" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Signups" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Meta Ads Stats ────────────────────────────────────────────────── */}
        <div
          style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", padding: "24px" }}
        >
          <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            📣 Meta Ads Performance
          </h2>
          <p style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>
            Live data from Meta Marketing API · Campaigns under act_{String(import.meta.env.VITE_META_AD_ACCOUNT_ID ?? "—")}
          </p>

          {metaLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 88, background: "#0f172a", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          )}

          {!metaLoading && metaError && (
            <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 10, padding: "16px 20px", color: "#fca5a5", marginBottom: 24 }}>
              <strong>Error loading Meta Ads:</strong> {metaError}
              <p style={{ marginTop: 6, fontSize: 12, color: "#f87171" }}>
                Set <code>VITE_META_ACCESS_TOKEN</code> and <code>VITE_META_AD_ACCOUNT_ID</code> in your <code>.env</code> file.
              </p>
            </div>
          )}

          {!metaLoading && !metaError && (
            <>
              {/* Campaign cards */}
              {metaCampaigns.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "32px 0" }}>No campaign data found.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
                  {metaCampaigns.map((c) => (
                    <div
                      key={c.id}
                      style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #334155", padding: "16px 20px" }}
                    >
                      <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                        {c.name}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { label: "Impressions", value: c.impressions.toLocaleString() },
                          { label: "Clicks",       value: c.clicks.toLocaleString() },
                          { label: "CPC",          value: `$${c.cpc.toFixed(2)}` },
                          { label: "Spend",        value: `$${c.spend.toFixed(2)}` },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p style={{ color: "#FF6B00", fontSize: 18, fontWeight: 700 }}>{value}</p>
                            <p style={{ color: "#64748b", fontSize: 11 }}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 7-day evolution chart */}
              {metaDailyData.length > 0 && (
                <div>
                  <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 10 }}>Impressions & Clicks — last 7 days</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={metaDailyData}>
                      <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                      />
                      <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                      <Line yAxisId="left"  type="monotone" dataKey="impressions" stroke="#FF6B00" strokeWidth={2} dot={false} name="Impressions" />
                      <Line yAxisId="right" type="monotone" dataKey="clicks"      stroke="#38bdf8" strokeWidth={2} dot={false} name="Clicks" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsMetricCard
            title="Total Page Views"
            value={metrics.pageViews.value.toLocaleString()}
            change={metrics.pageViews.change}
            icon={Eye}
            loading={loading}
          />
          <AnalyticsMetricCard
            title="Unique Visitors"
            value={metrics.uniqueVisitors.value.toLocaleString()}
            change={metrics.uniqueVisitors.change}
            icon={Users}
            loading={loading}
          />
          <AnalyticsMetricCard
            title="Total Sessions"
            value={metrics.sessions.value.toLocaleString()}
            change={metrics.sessions.change}
            icon={BarChart3}
            loading={loading}
          />
          <AnalyticsMetricCard
            title="Meal Analyses"
            value={metrics.mealAnalyses.value.toLocaleString()}
            change={metrics.mealAnalyses.change}
            icon={Utensils}
            loading={loading}
          />
        </div>

        {/* Traffic Sources & Top Pages */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsSection
            title="Traffic Sources"
            loading={loading}
            onExport={() => exportToCSV(trafficSources, "traffic-sources")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSources.slice(0, 6)}
                      dataKey="visitors"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                    >
                      {trafficSources.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {trafficSources.slice(0, 8).map((source) => (
                  <div key={source.source} className="flex items-center justify-between text-sm">
                    <span>
                      {sourceIcons[source.source] || "🔗"} {source.source}
                    </span>
                    <span className="font-medium">
                      {source.visitors} ({source.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnalyticsSection>

          <AnalyticsSection
            title="Top Pages"
            loading={loading}
            onExport={() => exportToCSV(topPages, "top-pages")}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Unique</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  topPages.slice(0, 8).map((page) => (
                    <TableRow key={page.page}>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {page.page}
                      </TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                      <TableCell className="text-right">{page.uniqueViews}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AnalyticsSection>
        </div>

        {/* Devices & Technology */}
        <div className="grid gap-6 lg:grid-cols-3">
          <AnalyticsSection
            title="Device Types"
            loading={loading}
            onExport={() => exportToCSV(deviceStats, "device-stats")}
          >
            <div className="space-y-4">
              {deviceStats.length === 0 ? (
                <p className="text-center text-muted-foreground">No data available</p>
              ) : (
                deviceStats.map((device) => {
                  const Icon = deviceIcons[device.type] || Monitor;
                  return (
                    <div key={device.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {device.type}
                        </span>
                        <span>{device.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  );
                })
              )}
            </div>
          </AnalyticsSection>

          <AnalyticsSection
            title="Browsers"
            loading={loading}
            onExport={() => exportToCSV(browserStats, "browser-stats")}
          >
            <div className="space-y-4">
              {browserStats.length === 0 ? (
                <p className="text-center text-muted-foreground">No data available</p>
              ) : (
                browserStats.slice(0, 5).map((browser) => (
                  <div key={browser.browser} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{browser.browser}</span>
                      <span>{browser.count} ({browser.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={browser.percentage} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </AnalyticsSection>

          <AnalyticsSection
            title="Operating Systems"
            loading={loading}
            onExport={() => exportToCSV(osStats, "os-stats")}
          >
            <div className="space-y-4">
              {osStats.length === 0 ? (
                <p className="text-center text-muted-foreground">No data available</p>
              ) : (
                osStats.slice(0, 5).map((os) => (
                  <div key={os.os} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{os.os}</span>
                      <span>{os.count} ({os.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={os.percentage} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </AnalyticsSection>
        </div>

        {/* User Behavior */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsSection
            title="Most Active Hours"
            loading={loading}
            onExport={() => exportToCSV(hourlyStats, "hourly-stats")}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyStats}>
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [value, "Views"]}
                    labelFormatter={(hour) => `${hour}:00`}
                  />
                  <Bar dataKey="views" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsSection>

          <AnalyticsSection
            title="Most Active Days"
            loading={loading}
            onExport={() => exportToCSV(dailyStats, "daily-stats")}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => [value, "Views"]} />
                  <Bar dataKey="views" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsSection>
        </div>

        {/* Geographic Data */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsSection
            title="Top Countries"
            loading={loading}
            onExport={() => exportToCSV(countryStats, "country-stats")}
          >
            {countryStats.length === 0 ? (
              <p className="text-center text-muted-foreground">No data available</p>
            ) : (
              <div className="space-y-3">
                {countryStats.slice(0, 10).map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{countryFlags[country.country] || "🌐"}</span>
                      <span className="font-medium">{country.country}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {country.visitors} ({country.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsSection>

          <AnalyticsSection
            title="Top Cities"
            loading={loading}
            onExport={() => exportToCSV(cityStats, "city-stats")}
          >
            {cityStats.length === 0 ? (
              <p className="text-center text-muted-foreground">No data available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityStats.slice(0, 8).map((city) => (
                    <TableRow key={`${city.city}-${city.country}`}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {city.city}
                        </span>
                      </TableCell>
                      <TableCell>{city.country}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          {sourceIcons[city.topSource] || "🔗"} {city.topSource}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{city.visitors}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AnalyticsSection>
        </div>

        {/* Languages */}
        <AnalyticsSection
          title="Languages"
          loading={loading}
          onExport={() => exportToCSV(languageStats, "language-stats")}
        >
          {languageStats.length === 0 ? (
            <p className="text-center text-muted-foreground">No data available</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {languageStats.slice(0, 9).map((lang) => (
                <div 
                  key={lang.language} 
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{languageFlags[lang.language] || "🌐"}</span>
                    <span className="font-medium">{lang.language}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {lang.visitors} ({lang.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsSection>

        {/* Session Duration & User Journey */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Session Duration Stats */}
          <AnalyticsSection
            title="Session Duration"
            loading={loading}
            onExport={() => exportToCSV(sessionDurationStats.durationBuckets, "session-duration")}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                <div className="flex items-center gap-3">
                  <Timer className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Session Duration</p>
                    <p className="text-2xl font-bold">{formatDuration(sessionDurationStats.avgDuration)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-xl font-semibold">{sessionDurationStats.sessionCount}</p>
                </div>
              </div>
              
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionDurationStats.durationBuckets}>
                    <XAxis dataKey="label" fontSize={10} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value, name) => [value, name === "count" ? "Sessions" : name]}
                    />
                    <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AnalyticsSection>

          {/* User Journey */}
          <AnalyticsSection
            title="Recent User Journeys"
            loading={loading}
            onExport={() => exportToCSV(
              sessionJourneys.slice(0, 50).map(j => ({
                session_id: j.sessionId,
                start_time: j.startTime,
                duration_seconds: j.duration,
                pages_visited: j.pages.length,
                path: j.pages.map(p => p.path).join(" → "),
                country: j.country,
                device: j.device,
              })),
              "user-journeys"
            )}
          >
            {sessionJourneys.length === 0 ? (
              <p className="text-center text-muted-foreground">No session data available</p>
            ) : (
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                {sessionJourneys.slice(0, 10).map((journey) => (
                  <div 
                    key={journey.sessionId} 
                    className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Route className="h-4 w-4 text-primary" />
                        <span className="font-medium">{journey.pages.length} pages</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{formatDuration(journey.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {journey.country && (
                          <span>{countryFlags[journey.country] || "🌐"}</span>
                        )}
                        {journey.device && (
                          <span className="capitalize">{journey.device}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      {journey.pages.map((page, idx) => (
                        <span key={idx} className="flex items-center">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                            {page.path.length > 20 ? page.path.substring(0, 20) + "..." : page.path}
                          </span>
                          {idx < journey.pages.length - 1 && (
                            <span className="mx-1 text-muted-foreground">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(journey.startTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsSection>
        </div>

        {/* Blog Analytics Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Blog Analytics</h2>
          </div>
          
          {/* Blog Overview Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AnalyticsMetricCard
              title="Total Blog Views"
              value={blogAnalytics.totalBlogViews.toLocaleString()}
              icon={BookOpen}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Avg. Time on Blog"
              value={formatDuration(blogAnalytics.avgTimeOnBlog)}
              icon={Timer}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Blog Bounce Rate"
              value={`${blogAnalytics.blogBounceRate.toFixed(1)}%`}
              icon={TrendingUp}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Blog Posts Tracked"
              value={blogAnalytics.topPosts.length}
              icon={BarChart3}
              loading={loading}
            />
          </div>

          {/* Top Blog Posts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsSection
              title="Top Blog Posts"
              loading={loading}
              onExport={() => exportToCSV(blogAnalytics.topPosts, "top-blog-posts")}
            >
              {blogAnalytics.topPosts.length === 0 ? (
                <p className="text-center text-muted-foreground">No blog data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Avg. Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogAnalytics.topPosts.slice(0, 10).map((post) => (
                      <TableRow key={post.slug}>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {post.slug}
                        </TableCell>
                        <TableCell className="text-right">
                          {post.views} <span className="text-muted-foreground text-xs">({post.uniqueViews} unique)</span>
                        </TableCell>
                        <TableCell className="text-right">{formatDuration(post.avgTimeOnPage)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AnalyticsSection>

            {/* Entry Points */}
            <AnalyticsSection
              title="Where Readers Come From"
              loading={loading}
              onExport={() => exportToCSV(blogAnalytics.entryPoints, "blog-entry-points")}
            >
              {blogAnalytics.entryPoints.length === 0 ? (
                <p className="text-center text-muted-foreground">No data available</p>
              ) : (
                <div className="space-y-3">
                  {blogAnalytics.entryPoints.slice(0, 8).map((entry) => (
                    <div key={entry.source} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="font-medium truncate max-w-[200px]">{entry.source}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {entry.count} ({entry.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </AnalyticsSection>
          </div>

          {/* Exit Pages & Reader Journeys */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsSection
              title="Where Readers Go After"
              loading={loading}
              onExport={() => exportToCSV(blogAnalytics.exitPages, "blog-exit-pages")}
            >
              {blogAnalytics.exitPages.length === 0 ? (
                <p className="text-center text-muted-foreground">No data available</p>
              ) : (
                <div className="space-y-3">
                  {blogAnalytics.exitPages.slice(0, 8).map((exit) => (
                    <div key={exit.page} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                        <span className="font-medium truncate max-w-[200px]">{exit.page}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {exit.count} ({exit.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </AnalyticsSection>

            <AnalyticsSection
              title="Reader Journeys (Post to Post)"
              loading={loading}
              onExport={() => exportToCSV(blogAnalytics.readerJourneys, "reader-journeys")}
            >
              {blogAnalytics.readerJourneys.length === 0 ? (
                <p className="text-center text-muted-foreground">No inter-post navigation data</p>
              ) : (
                <div className="space-y-3">
                  {blogAnalytics.readerJourneys.slice(0, 8).map((journey, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate max-w-[100px] rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {journey.from}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[100px] rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {journey.to}
                        </span>
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {journey.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </AnalyticsSection>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsMetricCard
            title="Avg. Session Duration"
            value={formatDuration(sessionDurationStats.avgDuration)}
            icon={Timer}
            loading={loading}
          />
          <AnalyticsMetricCard
            title="Avg. Pages/Session"
            value={metrics.pagesPerSession.toFixed(2)}
            icon={BarChart3}
            loading={loading}
          />
          <AnalyticsMetricCard
            title="Total Events Tracked"
            value={(metrics.pageViews.value + metrics.mealAnalyses.value).toLocaleString()}
            icon={Clock}
            loading={loading}
          />
          <AnalyticsMetricCard
            title="Tracked Sources"
            value={trafficSources.length}
            icon={Globe}
            loading={loading}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
