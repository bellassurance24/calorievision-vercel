import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "@/lib/visitorId";

type DevicePlatform = "ios" | "android" | "web";

interface RegisterDeviceResult {
  success: boolean;
  action?: "registered" | "updated";
  device_id?: string;
  error?: string;
}

export function usePushNotifications() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerDevice = useCallback(async (
    token: string,
    platform: DevicePlatform,
    deviceName?: string
  ): Promise<RegisterDeviceResult> => {
    setIsRegistering(true);
    setError(null);

    try {
      // Get visitor ID for anonymous tracking
      const visitorId = getVisitorId();
      
      // Get session if available (optional now)
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error: fnError } = await supabase.functions.invoke<RegisterDeviceResult>(
        "register-device",
        {
          body: {
            token,
            platform,
            device_name: deviceName,
            visitor_id: visitorId,
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to register device");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const unregisterDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from("device_tokens")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", deviceId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return false;
    }
  }, []);

  const getActiveDevices = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("device_tokens")
        .select("id, platform, device_name, created_at, last_used_at")
        .eq("is_active", true)
        .order("last_used_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    }
  }, []);

  return {
    registerDevice,
    unregisterDevice,
    getActiveDevices,
    isRegistering,
    error,
  };
}
