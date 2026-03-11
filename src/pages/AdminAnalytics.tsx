import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Tooltip
} from "recharts";
import { subDays } from "date-fns";
import { Loader2 } from "lucide-react";

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

  // Format duration for display
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
