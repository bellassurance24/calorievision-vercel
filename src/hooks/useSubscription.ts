/**
 * useSubscription.ts
 * Fetches the current user's plan from Supabase and counts today's / this
 * month's AI scans from usage_logs to determine whether the limit is reached.
 *
 * Unauthenticated users are treated as "starter" and their daily scans are
 * tracked via localStorage so they don't need an account for the soft-guard.
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
  /** Call after a scan is logged to refresh the counters */
  refresh: () => void;
}

const PLAN_LIMITS: Record<PlanType, { daily: number; monthly: number }> = {
  starter:  { daily: 2,          monthly: 999_999 },
  pro:      { daily: 999_999,    monthly: 1_000   },
  ultimate: { daily: 999_999,    monthly: 5_000   },
};

// ── Guest (unauthenticated) localStorage helpers ─────────────────────────────
const GUEST_LS_KEY = "cv_guest_scans";

interface GuestEntry { date: string; count: number }

export function getGuestScansToday(): number {
  try {
    const raw = localStorage.getItem(GUEST_LS_KEY);
    if (!raw) return 0;
    const entry = JSON.parse(raw) as GuestEntry;
    const today = new Date().toISOString().slice(0, 10);
    return entry.date === today ? entry.count : 0;
  } catch {
    return 0;
  }
}

export function incrementGuestScans(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const count = getGuestScansToday();
    localStorage.setItem(GUEST_LS_KEY, JSON.stringify({ date: today, count: count + 1 }));
  } catch { /* storage unavailable — silent */ }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSubscription(): SubscriptionInfo {
  const { user } = useAuth();

  const [plan, setPlan]               = useState<PlanType>("starter");
  const [dailyScans, setDailyScans]   = useState(0);
  const [monthlyScans, setMonthlyScans] = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [tick, setTick]               = useState(0);

  const refresh = useCallback(() => setTick(n => n + 1), []);

  useEffect(() => {
    // ── Guest path ──────────────────────────────────────────────────────────
    if (!user) {
      const g = getGuestScansToday();
      setPlan("starter");
      setDailyScans(g);
      setMonthlyScans(g);
      setIsLoading(false);
      return;
    }

    // ── Authenticated path ──────────────────────────────────────────────────
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch active subscription (fallback → starter)
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("plan_type")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        const currentPlan: PlanType = (sub?.plan_type as PlanType) ?? "starter";
        if (!cancelled) setPlan(currentPlan);

        // 2. Count scans today (for starter daily limit)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count: dayCount } = await supabase
          .from("usage_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", todayStart.toISOString());

        if (!cancelled) setDailyScans(dayCount ?? 0);

        // 3. Count scans this month (for pro/ultimate monthly limit)
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { count: monthCount } = await supabase
          .from("usage_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", monthStart.toISOString());

        if (!cancelled) setMonthlyScans(monthCount ?? 0);

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
    refresh,
  };
}
