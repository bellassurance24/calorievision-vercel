/**
 * KPI queries for the admin dashboard.
 *
 * Every KPI is computed server-side over the whole analytics_events table
 * (no "last N events" window). Counts use `head: true`, so no rows are
 * downloaded; only the unique-sessions KPI fetches a single column, bounded
 * to the last SESSION_WINDOW_DAYS days and paginated.
 *
 * Events recorded on /admin pages are excluded from all public KPIs.
 * Any query error (or a missing session, which RLS would silently turn into
 * zero rows) throws, so the UI can tell "failed to load" from a real zero.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const DASHBOARD_TIME_ZONE = "Europe/Paris";
export const SESSION_WINDOW_DAYS = 30;
const PAGE_SIZE = 1000;
const MAX_SESSION_ROWS = 50_000;

// Public events: page_path missing (legacy rows) or not under /admin
const PUBLIC_PATHS_FILTER = "page_path.is.null,page_path.not.like./admin*";

export interface DashboardStats {
  totalVisits: number;
  todayVisits: number;
  totalAnalyses: number;
  uniqueSessions: number;
  /** true when the 30-day session scan hit MAX_SESSION_ROWS (value is a lower bound) */
  uniqueSessionsCapped: boolean;
}

/** UTC instant of 00:00 today in `timeZone` (DST-safe). */
export function startOfDayInTimeZone(now: Date, timeZone: string): Date {
  const wall = wallClock(now, timeZone);
  const midnightAsUtc = Date.UTC(wall.year, wall.month - 1, wall.day);
  // Offset can differ between now and midnight on DST days: refine once.
  let instant = midnightAsUtc - offsetMs(now, timeZone);
  instant = midnightAsUtc - offsetMs(new Date(instant), timeZone);
  return new Date(instant);
}

export async function fetchDashboardStats(
  client: SupabaseClient,
  now: Date = new Date(),
  maxSessionRows: number = MAX_SESSION_ROWS,
): Promise<DashboardStats> {
  const { data: { session } } = await client.auth.getSession();
  if (!session) throw new Error("No active session");

  const todayStart  = startOfDayInTimeZone(now, DASHBOARD_TIME_ZONE).toISOString();
  const windowStart = new Date(now.getTime() - SESSION_WINDOW_DAYS * 86_400_000).toISOString();

  const count = async (eventType: string, since?: string): Promise<number> => {
    let q = client
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", eventType)
      .or(PUBLIC_PATHS_FILTER);
    if (since) q = q.gte("created_at", since);
    const { count: n, error } = await q;
    if (error) throw error;
    if (n === null || n === undefined) throw new Error("Count unavailable");
    return n;
  };

  const sessions = async (): Promise<{ size: number; capped: boolean }> => {
    const ids = new Set<string>();
    for (let from = 0; from < maxSessionRows; from += PAGE_SIZE) {
      const to = Math.min(from + PAGE_SIZE, maxSessionRows) - 1;
      const { data, error } = await client
        .from("analytics_events")
        .select("session_id")
        .eq("event_type", "page_view")
        .or(PUBLIC_PATHS_FILTER)
        .gte("created_at", windowStart)
        .not("session_id", "is", null)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      const rows = (data ?? []) as { session_id: string | null }[];
      for (const r of rows) if (r.session_id) ids.add(r.session_id);
      if (rows.length < to - from + 1) return { size: ids.size, capped: false };
    }
    return { size: ids.size, capped: true };
  };

  const [totalVisits, todayVisits, totalAnalyses, uniq] = await Promise.all([
    count("page_view"),
    count("page_view", todayStart),
    count("meal_analysis"),
    sessions(),
  ]);

  return { totalVisits, todayVisits, totalAnalyses, uniqueSessions: uniq.size, uniqueSessionsCapped: uniq.capped };
}

function wallClock(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(date).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second),
  };
}

function offsetMs(date: Date, timeZone: string): number {
  const w = wallClock(date, timeZone);
  const wallAsUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return wallAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}
