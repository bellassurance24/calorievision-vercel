import { usePageTracking } from "@/hooks/useAnalytics";
import { useTrackPresence } from "@/hooks/useRealtimePresence";
import { useLocation } from "react-router-dom";

/**
 * Global analytics tracker component.
 * Must be rendered inside BrowserRouter to access location.
 * Tracks page views and real-time presence.
 */
const AnalyticsTracker = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  usePageTracking();
  // Avoid creating a second presence channel on admin pages (admin already subscribes via useRealtimePresence)
  useTrackPresence({ enabled: !isAdminRoute });
  return null;
};

export default AnalyticsTracker;
