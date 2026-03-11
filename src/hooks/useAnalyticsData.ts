import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "@/components/admin/AnalyticsDateFilter";
import { isLikelyBotUserAgent } from "@/lib/analyticsBot";

interface AnalyticsEvent {
  id: string;
  created_at: string;
  event_type: string;
  page_path: string | null;
  session_id: string | null;
  visitor_id: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  language: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  city: string | null;
  metadata: any;
}

interface MetricData {
  value: number;
  change: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

interface PageStats {
  page: string;
  views: number;
  uniqueViews: number;
}

interface DeviceStats {
  type: string;
  count: number;
  percentage: number;
}

interface BrowserStats {
  browser: string;
  count: number;
  percentage: number;
}

interface OsStats {
  os: string;
  count: number;
  percentage: number;
}

interface LanguageStats {
  language: string;
  visitors: number;
  percentage: number;
}

interface CountryStats {
  country: string;
  visitors: number;
  percentage: number;
}

interface CityStats {
  city: string;
  country: string;
  visitors: number;
  topSource: string;
}

interface HourlyStats {
  hour: number;
  views: number;
}

interface DailyStats {
  day: string;
  views: number;
}

interface SessionJourney {
  sessionId: string;
  visitorId: string;
  pages: { path: string; timestamp: string }[];
  duration: number; // in seconds
  startTime: string;
  endTime: string;
  country: string | null;
  city: string | null;
  device: string | null;
}

interface SessionDurationStats {
  avgDuration: number; // in seconds
  totalDuration: number;
  sessionCount: number;
  durationBuckets: { label: string; count: number; percentage: number }[];
}

interface BlogPostStats {
  slug: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number; // in seconds
  bounceRate: number; // percentage
  exitRate: number; // percentage
}

interface BlogAnalytics {
  topPosts: BlogPostStats[];
  totalBlogViews: number;
  avgTimeOnBlog: number;
  blogBounceRate: number;
  entryPoints: { source: string; count: number; percentage: number }[];
  exitPages: { page: string; count: number; percentage: number }[];
  readerJourneys: { from: string; to: string; count: number }[];
}

export const useAnalyticsData = (dateRange: DateRange, previousDateRange: DateRange) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [previousEvents, setPreviousEvents] = useState<AnalyticsEvent[]>([]);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch current period events
      const { data: currentData, error: currentError } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: false });

      if (currentError) throw currentError;
      setEvents((currentData as AnalyticsEvent[]) || []);

      // Fetch previous period events for comparison
      const { data: previousData, error: previousError } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", previousDateRange.from.toISOString())
        .lte("created_at", previousDateRange.to.toISOString());

      if (previousError) throw previousError;
      setPreviousEvents((previousData as AnalyticsEvent[]) || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, previousDateRange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const autoRefresh = async () => {
      setIsAutoRefreshing(true);
      await fetchEvents();
      // Keep indicator visible for 500ms for visual feedback
      setTimeout(() => setIsAutoRefreshing(false), 500);
    };

    autoRefreshIntervalRef.current = setInterval(autoRefresh, 30000);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [fetchEvents]);

  // Calculate metrics
  const calculateMetric = (current: number, previous: number): MetricData => {
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return { value: current, change };
  };

  const isHuman = (e: AnalyticsEvent) => !isLikelyBotUserAgent(e.user_agent);

  const pageViews = events.filter(e => e.event_type === "page_view").filter(isHuman);
  const previousPageViews = previousEvents.filter(e => e.event_type === "page_view").filter(isHuman);
  
  const uniqueVisitors = new Set(pageViews.map(e => e.visitor_id).filter(Boolean)).size;
  const previousUniqueVisitors = new Set(previousPageViews.map(e => e.visitor_id).filter(Boolean)).size;
  
  const totalSessions = new Set(pageViews.map(e => e.session_id).filter(Boolean)).size;
  const previousSessions = new Set(previousPageViews.map(e => e.session_id).filter(Boolean)).size;
  
  const mealAnalyses = events.filter(e => e.event_type === "meal_analysis").length;
  const previousMealAnalyses = previousEvents.filter(e => e.event_type === "meal_analysis").length;

  const metrics = {
    pageViews: calculateMetric(pageViews.length, previousPageViews.length),
    uniqueVisitors: calculateMetric(uniqueVisitors, previousUniqueVisitors),
    sessions: calculateMetric(totalSessions, previousSessions),
    mealAnalyses: calculateMetric(mealAnalyses, previousMealAnalyses),
    pagesPerSession: totalSessions > 0 ? pageViews.length / totalSessions : 0,
  };

  // Traffic sources
  const trafficSources: TrafficSource[] = (() => {
    const sourceMap: Record<string, number> = {};
    
    pageViews.forEach(event => {
      let source = "Direct";
      
      if (event.utm_source) {
        source = event.utm_source.charAt(0).toUpperCase() + event.utm_source.slice(1);
      } else if (event.referrer) {
        const refLower = event.referrer.toLowerCase();
        if (refLower.includes("google.")) source = "Google (Organic)";
        else if (refLower.includes("bing.")) source = "Bing";
        else if (refLower.includes("facebook.") || refLower.includes("fb.")) source = "Facebook";
        else if (refLower.includes("twitter.") || refLower.includes("t.co")) source = "Twitter/X";
        else if (refLower.includes("instagram.")) source = "Instagram";
        else if (refLower.includes("linkedin.")) source = "LinkedIn";
        else if (refLower.includes("youtube.")) source = "YouTube";
        else if (refLower.includes("pinterest.")) source = "Pinterest";
        else source = "Referral";
      }
      
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });

    const total = Object.values(sourceMap).reduce((a, b) => a + b, 0);
    return Object.entries(sourceMap)
      .map(([source, visitors]) => ({
        source,
        visitors,
        percentage: total > 0 ? (visitors / total) * 100 : 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);
  })();

  // Top pages
  const topPages: PageStats[] = (() => {
    const pageMap: Record<string, { views: number; visitors: Set<string> }> = {};
    
    pageViews.forEach(event => {
      const page = event.page_path || "/";
      if (!pageMap[page]) {
        pageMap[page] = { views: 0, visitors: new Set() };
      }
      pageMap[page].views++;
      if (event.visitor_id) {
        pageMap[page].visitors.add(event.visitor_id);
      }
    });

    return Object.entries(pageMap)
      .map(([page, data]) => ({
        page,
        views: data.views,
        uniqueViews: data.visitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  })();

  // Device stats
  const deviceStats: DeviceStats[] = (() => {
    const deviceMap: Record<string, number> = {};
    
    pageViews.forEach(event => {
      const device = event.device_type || "Unknown";
      deviceMap[device] = (deviceMap[device] || 0) + 1;
    });

    const total = Object.values(deviceMap).reduce((a, b) => a + b, 0);
    return Object.entries(deviceMap)
      .map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  })();

  // Browser stats
  const browserStats: BrowserStats[] = (() => {
    const browserMap: Record<string, number> = {};
    
    pageViews.forEach(event => {
      const browser = event.browser || "Unknown";
      browserMap[browser] = (browserMap[browser] || 0) + 1;
    });

    const total = Object.values(browserMap).reduce((a, b) => a + b, 0);
    return Object.entries(browserMap)
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  })();

  // OS stats
  const osStats: OsStats[] = (() => {
    const osMap: Record<string, number> = {};
    
    pageViews.forEach(event => {
      const os = event.os || "Unknown";
      osMap[os] = (osMap[os] || 0) + 1;
    });

    const total = Object.values(osMap).reduce((a, b) => a + b, 0);
    return Object.entries(osMap)
      .map(([os, count]) => ({
        os,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  })();

  // Language stats
  const languageStats: LanguageStats[] = (() => {
    const langMap: Record<string, number> = {};
    
    pageViews.forEach(event => {
      const lang = event.language || "Unknown";
      langMap[lang] = (langMap[lang] || 0) + 1;
    });

    const total = Object.values(langMap).reduce((a, b) => a + b, 0);
    return Object.entries(langMap)
      .map(([language, visitors]) => ({
        language: language.toUpperCase(),
        visitors,
        percentage: total > 0 ? (visitors / total) * 100 : 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);
  })();

  // Country stats
  const countryStats: CountryStats[] = (() => {
    const countryMap: Record<string, number> = {};
    
    pageViews.forEach(event => {
      const country = event.country || "Unknown";
      countryMap[country] = (countryMap[country] || 0) + 1;
    });

    const total = Object.values(countryMap).reduce((a, b) => a + b, 0);
    return Object.entries(countryMap)
      .map(([country, visitors]) => ({
        country,
        visitors,
        percentage: total > 0 ? (visitors / total) * 100 : 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);
  })();

  // Helper function to determine source
  const getSource = (event: AnalyticsEvent): string => {
    if (event.utm_source) {
      return event.utm_source.charAt(0).toUpperCase() + event.utm_source.slice(1);
    } else if (event.referrer) {
      const refLower = event.referrer.toLowerCase();
      if (refLower.includes("google.")) return "Google";
      else if (refLower.includes("bing.")) return "Bing";
      else if (refLower.includes("facebook.") || refLower.includes("fb.")) return "Facebook";
      else if (refLower.includes("twitter.") || refLower.includes("t.co")) return "Twitter/X";
      else if (refLower.includes("instagram.")) return "Instagram";
      else if (refLower.includes("linkedin.")) return "LinkedIn";
      else if (refLower.includes("youtube.")) return "YouTube";
      else if (refLower.includes("pinterest.")) return "Pinterest";
      else return "Referral";
    }
    return "Direct";
  };

  // City stats with top source
  const cityStats: CityStats[] = (() => {
    const cityMap: Record<string, { country: string; count: number; sources: Record<string, number> }> = {};
    
    pageViews.forEach(event => {
      const city = event.city || "Unknown";
      const country = event.country || "Unknown";
      const key = `${city}|${country}`;
      const source = getSource(event);
      
      if (!cityMap[key]) {
        cityMap[key] = { country, count: 0, sources: {} };
      }
      cityMap[key].count++;
      cityMap[key].sources[source] = (cityMap[key].sources[source] || 0) + 1;
    });

    return Object.entries(cityMap)
      .map(([key, data]) => {
        // Find the top source for this city
        const topSource = Object.entries(data.sources)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || "Direct";
        
        return {
          city: key.split("|")[0],
          country: data.country,
          visitors: data.count,
          topSource,
        };
      })
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
  })();

  // Hourly distribution
  const hourlyStats: HourlyStats[] = (() => {
    const hourMap: Record<number, number> = {};
    
    for (let i = 0; i < 24; i++) {
      hourMap[i] = 0;
    }
    
    pageViews.forEach(event => {
      const hour = new Date(event.created_at).getHours();
      hourMap[hour]++;
    });

    return Object.entries(hourMap)
      .map(([hour, views]) => ({
        hour: parseInt(hour),
        views,
      }))
      .sort((a, b) => a.hour - b.hour);
  })();

  // Daily distribution
  const dailyStats: DailyStats[] = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayMap: Record<number, number> = {};
    
    for (let i = 0; i < 7; i++) {
      dayMap[i] = 0;
    }
    
    pageViews.forEach(event => {
      const day = new Date(event.created_at).getDay();
      dayMap[day]++;
    });

    return Object.entries(dayMap)
      .map(([day, views]) => ({
        day: days[parseInt(day)],
        views,
      }));
  })();

  // Session duration and user journey
  const sessionData = useMemo(() => {
    const sessionMap: Record<string, AnalyticsEvent[]> = {};
    
    // Group events by session
    pageViews.forEach(event => {
      if (event.session_id) {
        if (!sessionMap[event.session_id]) {
          sessionMap[event.session_id] = [];
        }
        sessionMap[event.session_id].push(event);
      }
    });

    // Calculate journeys
    const journeys: SessionJourney[] = Object.entries(sessionMap).map(([sessionId, sessionEvents]) => {
      // Sort by time
      const sorted = sessionEvents.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const firstEvent = sorted[0];
      const lastEvent = sorted[sorted.length - 1];
      const startTime = new Date(firstEvent.created_at);
      const endTime = new Date(lastEvent.created_at);
      
      // Duration in seconds
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      return {
        sessionId,
        visitorId: firstEvent.visitor_id || "unknown",
        pages: sorted.map(e => ({ 
          path: e.page_path || "/", 
          timestamp: e.created_at 
        })),
        duration: Math.max(duration, 0), // Minimum 0 seconds
        startTime: firstEvent.created_at,
        endTime: lastEvent.created_at,
        country: firstEvent.country,
        city: firstEvent.city,
        device: firstEvent.device_type,
      };
    });

    // Sort by start time (most recent first)
    journeys.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Calculate duration stats
    const validDurations = journeys.filter(j => j.pages.length > 1);
    const totalDuration = validDurations.reduce((sum, j) => sum + j.duration, 0);
    const avgDuration = validDurations.length > 0 ? totalDuration / validDurations.length : 0;

    // Duration buckets
    const buckets = {
      "< 30s": 0,
      "30s - 1m": 0,
      "1m - 3m": 0,
      "3m - 5m": 0,
      "5m - 10m": 0,
      "> 10m": 0,
    };

    journeys.forEach(j => {
      if (j.duration < 30) buckets["< 30s"]++;
      else if (j.duration < 60) buckets["30s - 1m"]++;
      else if (j.duration < 180) buckets["1m - 3m"]++;
      else if (j.duration < 300) buckets["3m - 5m"]++;
      else if (j.duration < 600) buckets["5m - 10m"]++;
      else buckets["> 10m"]++;
    });

    const totalSessions = journeys.length;
    const durationBuckets = Object.entries(buckets).map(([label, count]) => ({
      label,
      count,
      percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0,
    }));

    const durationStats: SessionDurationStats = {
      avgDuration: Math.round(avgDuration),
      totalDuration,
      sessionCount: journeys.length,
      durationBuckets,
    };

    return { journeys, durationStats };
  }, [pageViews]);

  // Blog Analytics
  const blogAnalytics: BlogAnalytics = useMemo(() => {
    // Filter blog page views
    const blogViews = pageViews.filter(e => 
      e.page_path?.startsWith("/blog/") || 
      e.page_path?.includes("/blog/") ||
      e.page_path === "/blog"
    );
    
    // Blog post views (exclude main /blog page)
    const blogPostViews = blogViews.filter(e => 
      e.page_path && e.page_path !== "/blog" && !e.page_path.endsWith("/blog")
    );
    
    // Group by session for time calculations
    const sessionMap: Record<string, AnalyticsEvent[]> = {};
    blogViews.forEach(event => {
      if (event.session_id) {
        if (!sessionMap[event.session_id]) {
          sessionMap[event.session_id] = [];
        }
        sessionMap[event.session_id].push(event);
      }
    });

    // Calculate per-post stats
    const postStatsMap: Record<string, { 
      views: number; 
      visitors: Set<string>; 
      durations: number[];
      bounces: number;
      exits: number;
    }> = {};

    // Process each session
    Object.values(sessionMap).forEach(sessionEvents => {
      const sorted = sessionEvents.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      sorted.forEach((event, idx) => {
        const path = event.page_path || "";
        if (!path || path === "/blog" || path.endsWith("/blog")) return;
        
        // Extract slug from path (e.g., /en/blog/post-slug -> post-slug)
        const slugMatch = path.match(/\/blog\/([^/]+)/);
        const slug = slugMatch ? slugMatch[1] : path;
        
        if (!postStatsMap[slug]) {
          postStatsMap[slug] = { 
            views: 0, 
            visitors: new Set(), 
            durations: [],
            bounces: 0,
            exits: 0,
          };
        }
        
        postStatsMap[slug].views++;
        if (event.visitor_id) {
          postStatsMap[slug].visitors.add(event.visitor_id);
        }

        // Calculate time on page (if there's a next event)
        if (idx < sorted.length - 1) {
          const nextEvent = sorted[idx + 1];
          const duration = (new Date(nextEvent.created_at).getTime() - new Date(event.created_at).getTime()) / 1000;
          if (duration > 0 && duration < 3600) { // Cap at 1 hour
            postStatsMap[slug].durations.push(duration);
          }
        }

        // Check if this is the last page in session (exit)
        if (idx === sorted.length - 1) {
          postStatsMap[slug].exits++;
        }

        // Check for bounce (only one blog page in session)
        if (sorted.length === 1) {
          postStatsMap[slug].bounces++;
        }
      });
    });

    // Build top posts array
    const topPosts: BlogPostStats[] = Object.entries(postStatsMap)
      .map(([slug, data]) => {
        const avgTime = data.durations.length > 0 
          ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length 
          : 0;
        
        return {
          slug,
          title: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          views: data.views,
          uniqueViews: data.visitors.size,
          avgTimeOnPage: Math.round(avgTime),
          bounceRate: data.views > 0 ? (data.bounces / data.views) * 100 : 0,
          exitRate: data.views > 0 ? (data.exits / data.views) * 100 : 0,
        };
      })
      .sort((a, b) => b.views - a.views);

    // Calculate overall blog stats
    const totalBlogViews = blogPostViews.length;
    const allDurations = Object.values(postStatsMap).flatMap(p => p.durations);
    const avgTimeOnBlog = allDurations.length > 0 
      ? allDurations.reduce((a, b) => a + b, 0) / allDurations.length 
      : 0;
    const totalBounces = Object.values(postStatsMap).reduce((sum, p) => sum + p.bounces, 0);
    const blogBounceRate = totalBlogViews > 0 ? (totalBounces / totalBlogViews) * 100 : 0;

    // Entry points (where readers come from before visiting blog)
    const entryPointsMap: Record<string, number> = {};
    sessionData.journeys.forEach(journey => {
      const blogPageIndex = journey.pages.findIndex(p => 
        p.path.includes("/blog/") && p.path !== "/blog"
      );
      
      if (blogPageIndex > 0) {
        const prevPage = journey.pages[blogPageIndex - 1].path;
        const simplified = prevPage.replace(/^\/(en|fr|es|pt|zh|ar|it|de|nl)/, "") || "/";
        entryPointsMap[simplified] = (entryPointsMap[simplified] || 0) + 1;
      } else if (blogPageIndex === 0) {
        entryPointsMap["Direct Entry"] = (entryPointsMap["Direct Entry"] || 0) + 1;
      }
    });

    const totalEntries = Object.values(entryPointsMap).reduce((a, b) => a + b, 0);
    const entryPoints = Object.entries(entryPointsMap)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Exit pages (where readers go after blog)
    const exitPagesMap: Record<string, number> = {};
    sessionData.journeys.forEach(journey => {
      const blogPages = journey.pages.filter(p => 
        p.path.includes("/blog/") && p.path !== "/blog"
      );
      
      if (blogPages.length > 0) {
        // Find last blog index manually for ES compatibility
        let lastBlogIndex = -1;
        for (let i = journey.pages.length - 1; i >= 0; i--) {
          if (journey.pages[i].path.includes("/blog/") && journey.pages[i].path !== "/blog") {
            lastBlogIndex = i;
            break;
          }
        }
        
        if (lastBlogIndex >= 0 && lastBlogIndex < journey.pages.length - 1) {
          const nextPage = journey.pages[lastBlogIndex + 1].path;
          const simplified = nextPage.replace(/^\/(en|fr|es|pt|zh|ar|it|de|nl)/, "") || "/";
          exitPagesMap[simplified] = (exitPagesMap[simplified] || 0) + 1;
        }
      }
    });

    const totalExits = Object.values(exitPagesMap).reduce((a, b) => a + b, 0);
    const exitPages = Object.entries(exitPagesMap)
      .map(([page, count]) => ({
        page,
        count,
        percentage: totalExits > 0 ? (count / totalExits) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Reader journeys (blog post to blog post navigation)
    const journeyMap: Record<string, number> = {};
    sessionData.journeys.forEach(journey => {
      const blogPages = journey.pages.filter(p => 
        p.path.includes("/blog/") && p.path !== "/blog"
      );
      
      for (let i = 0; i < blogPages.length - 1; i++) {
        const from = blogPages[i].path.match(/\/blog\/([^/]+)/)?.[1] || blogPages[i].path;
        const to = blogPages[i + 1].path.match(/\/blog\/([^/]+)/)?.[1] || blogPages[i + 1].path;
        const key = `${from}|${to}`;
        journeyMap[key] = (journeyMap[key] || 0) + 1;
      }
    });

    const readerJourneys = Object.entries(journeyMap)
      .map(([key, count]) => {
        const [from, to] = key.split("|");
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      topPosts,
      totalBlogViews,
      avgTimeOnBlog: Math.round(avgTimeOnBlog),
      blogBounceRate,
      entryPoints,
      exitPages,
      readerJourneys,
    };
  }, [pageViews, sessionData.journeys]);

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] ?? "")).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return {
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
    sessionJourneys: sessionData.journeys,
    sessionDurationStats: sessionData.durationStats,
    blogAnalytics,
    exportToCSV,
    refresh: fetchEvents,
  };
};
