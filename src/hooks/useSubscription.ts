/**
 * useSubscription.ts
 * Single-query, DB-driven subscription and usage hook.
 *
 * Reads plan_type and usage_stats from the `profiles` table in one round-trip.
 * These columns are kept in sync automatically by DB triggers:
 *   - trg_sync_profile_plan_type      → updates plan_type when subscriptions change
 *   - trg_update_profile_usage_stats  → increments daily/monthly counters after each scan
 *
 * Scan counting uses TWO layers:
 *  1. incrementLocalCount() — synchronous, zero-latency state update applied
 *     immediately after a scan so isAtLimit reflects the new total before the
 *     next click, with no DB round-trip required.
 *  2. refresh() — triggers a full DB re-fetch to reconcile the server-side
 *     count (catches scans from other devices, corrects any drift).
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Plan types ──────────────────────────────────────────────────────────────
export type PlanType = "starter" | "pro" | "ultimate";

export interface SubscriptionInfo {
  plan: PlanType;
  dailyScans: number;
  monthlyScans: number;
  isAtLimit: boolean;
  /** Hard cap for the current plan's relevant window */
  dailyLimit: number;
  monthlyLimit: number;
  isLoading: boolean;
  /**
   * Call immediately after a scan completes to increment counters
   * synchronously. This ensures isAtLimit is true on the very next render,
   * before the async DB refresh has a chance to complete.
   */
  incrementLocalCount: () => void;
  /** Call after incrementLocalCount to reconcile with the DB */
  refresh: () => void;
}

const PLAN_LIMITS: Record<PlanType, { daily: number; monthly: number }> = {
  starter:  { daily: 2,              monthly: 999_999_999 },
  pro:      { daily: 999_999_999,    monthly: 1_000       },
  ultimate: { daily: 999_999_999,    monthly: 5_000       },
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSubscription(): SubscriptionInfo {
  const { user } = useAuth();

  const [plan, setPlan]               = useState<PlanType>("starter");
  const [dailyScans, setDailyScans]   = useState(0);
  const [monthlyScans, setMonthlyScans] = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [tick, setTick]               = useState(0);

  const refresh = useCallback(() => setTick(n => n + 1), []);

  /**
   * Increment both counters synchronously so isAtLimit updates on the
   * very next render — no waiting for a DB round-trip.
   */
  const incrementLocalCount = useCallback(() => {
    setDailyScans(n => n + 1);
    setMonthlyScans(n => n + 1);
  }, []);

  useEffect(() => {
    // ── Unauthenticated: treat as over-limit (Analyze redirects to /auth) ───
    if (!user) {
      setPlan("starter");
      setDailyScans(999);
      setMonthlyScans(999);
      setIsLoading(false);
      return;
    }

    // ── Authenticated path ──────────────────────────────────────────────────
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        // Single query: profiles table has plan_type (synced from subscriptions
        // by trigger) and usage_stats (incremented after each scan by trigger).
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type, usage_stats")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        const currentPlan: PlanType = (profile?.plan_type as PlanType) ?? "starter";

        // usage_stats shape:
        // { daily_scans: { "2026-04-02": 3 }, monthly_scans: { "2026-04": 5 } }
        const usageStats = (profile?.usage_stats ?? {}) as {
          daily_scans?: Record<string, number>;
          monthly_scans?: Record<string, number>;
        };

        const today = new Date().toISOString().slice(0, 10);       // "2026-04-02"
        const month = today.slice(0, 7);                           // "2026-04"

        const dayCount   = usageStats.daily_scans?.[today]   ?? 0;
        const monthCount = usageStats.monthly_scans?.[month] ?? 0;

        setPlan(currentPlan);
        setDailyScans(dayCount);
        setMonthlyScans(monthCount);

      } catch (err) {
        console.error("[useSubscription] load error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user, tick]);

  const limits = PLAN_LIMITS[plan];

  const isAtLimit =
    plan === "starter"
      ? dailyScans >= limits.daily
      : monthlyScans >= limits.monthly;

  return {
    plan,
    dailyScans,
    monthlyScans,
    isAtLimit,
    dailyLimit:   limits.daily,
    monthlyLimit: limits.monthly,
    isLoading,
    incrementLocalCount,
    refresh,
  };
}
