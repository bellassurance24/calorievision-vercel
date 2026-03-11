import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getVisitorId } from "@/lib/visitorId";
import {
  getFCMToken,
  onForegroundMessage,
  isNotificationsSupported,
  getNotificationPermission,
  requestNotificationPermission,
  initializeFirebase,
} from "@/lib/firebase";

type PermissionStatus = "granted" | "denied" | "default" | "unsupported";

interface NotificationContextType {
  isSupported: boolean;
  permissionStatus: PermissionStatus;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  requestPermission: () => Promise<boolean>;
  registerDevice: () => Promise<boolean>;
  unregisterDevice: () => Promise<boolean>;
  markAsRead: (notificationId?: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, session } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>("default");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get visitor ID for anonymous tracking
  const visitorId = getVisitorId();

  // Initialize Firebase and check support
  useEffect(() => {
    const init = async () => {
      const supported = isNotificationsSupported();
      setIsSupported(supported);

      if (supported) {
        const permission = getNotificationPermission();
        setPermissionStatus(permission || "unsupported");

        // Initialize Firebase
        await initializeFirebase();
      } else {
        setPermissionStatus("unsupported");
      }
    };

    init();
  }, []);

  // Fetch unread notification count - works for both authenticated and anonymous users
  const fetchUnreadCount = useCallback(async () => {
    try {
      // Try user-based query first, then fallback to visitor-based
      if (user) {
        const { count, error: countError } = await supabase
          .from("notification_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("opened_at", null)
          .in("status", ["sent", "delivered"]);

        if (!countError && count !== null) {
          setUnreadCount(count);
          return;
        }
      }
      
      // For anonymous users, we don't have access to notification_logs via RLS
      // so we just set count to 0 - they'll still receive push notifications
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      setUnreadCount(0);
    }
  }, [user]);

  // Fetch unread count when user changes
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Setup foreground message handler
  useEffect(() => {
    if (!isSupported || permissionStatus !== "granted") return;

    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const message = payload as { notification?: { title?: string; body?: string } };
      if (message.notification) {
        toast.info(message.notification.title || "Notification", {
          description: message.notification.body,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSupported, permissionStatus]);

  // Auto-register when permission is granted (works for both logged-in and anonymous users)
  useEffect(() => {
    const autoRegister = async () => {
      if (permissionStatus === "granted" && !isRegistered && !isLoading) {
        await registerDeviceInternal();
      }
    };

    autoRegister();
  }, [permissionStatus, isRegistered, isLoading]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Notifications are not supported in this browser");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        // Auto-register after permission granted
        if (user && session) {
          await registerDeviceInternal();
        }
        return true;
      } else if (permission === "denied") {
        setError("Notification permission was denied");
        return false;
      }

      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to request permission";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, session]);

  const registerDeviceInternal = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Get FCM token
      const token = await getFCMToken();
      if (!token) {
        throw new Error("Failed to get FCM token");
      }

      // Determine platform
      const platform = detectPlatform();
      const deviceName = getDeviceName();

      // Register with backend - works for both authenticated and anonymous users
      const { data, error: fnError } = await supabase.functions.invoke("register-device", {
        body: {
          token,
          platform,
          device_name: deviceName,
          visitor_id: visitorId,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to register device");
      }

      setCurrentToken(token);
      setIsRegistered(true);
      console.log("Device registered successfully:", data.action);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register device";
      console.error("Device registration failed:", message);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerDevice = useCallback(async (): Promise<boolean> => {
    if (permissionStatus !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    return registerDeviceInternal();
  }, [permissionStatus, requestPermission]);

  const unregisterDevice = useCallback(async (): Promise<boolean> => {
    if (!currentToken) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Find and deactivate the device token - supports both user and visitor
      let query = supabase
        .from("device_tokens")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("token", currentToken);

      if (user) {
        query = query.eq("user_id", user.id);
      }

      const { error: updateError } = await query;

      if (updateError) {
        throw new Error(updateError.message);
      }

      setIsRegistered(false);
      setCurrentToken(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unregister device";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentToken, user]);

  // Mark notification(s) as read
  const markAsRead = useCallback(async (notificationId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from("notification_logs")
        .update({ opened_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("opened_at", null);

      if (notificationId) {
        query = query.eq("id", notificationId);
      }

      const { error } = await query;
      
      if (error) {
        console.error("Failed to mark as read:", error);
        return;
      }
      
      await fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [user, fetchUnreadCount]);

  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  const value: NotificationContextType = {
    isSupported,
    permissionStatus,
    isRegistered,
    isLoading,
    error,
    unreadCount,
    requestPermission,
    registerDevice,
    unregisterDevice,
    markAsRead,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Helper functions
function detectPlatform(): "ios" | "android" | "web" {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  } else if (/android/.test(userAgent)) {
    return "android";
  }
  
  return "web";
}

function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  
  // Try to extract browser and OS info
  const browser = getBrowserName(userAgent);
  const os = getOSName(userAgent);
  
  return `${browser} on ${os}`;
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) return "Chrome";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Edg")) return "Edge";
  if (userAgent.includes("Opera")) return "Opera";
  return "Browser";
}

function getOSName(userAgent: string): string {
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  return "Unknown";
}
