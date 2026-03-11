import { useRealtimePresence, ActiveUser } from "@/hooks/useRealtimePresence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Monitor, Smartphone, Tablet, Globe, MapPin, Cpu } from "lucide-react";

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const formatDeviceInfo = (brand: string | null, model: string | null) => {
  if (brand && model) {
    return `${brand} ${model}`;
  }
  if (brand) {
    return brand;
  }
  return null;
};

const getCountryFlag = (country: string | null) => {
  const countryFlags: Record<string, string> = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    "France": "🇫🇷",
    "Germany": "🇩🇪",
    "Spain": "🇪🇸",
    "Italy": "🇮🇹",
    "Portugal": "🇵🇹",
    "Netherlands": "🇳🇱",
    "Belgium": "🇧🇪",
    "Switzerland": "🇨🇭",
    "Canada": "🇨🇦",
    "Australia": "🇦🇺",
    "Brazil": "🇧🇷",
    "Mexico": "🇲🇽",
    "Japan": "🇯🇵",
    "China": "🇨🇳",
    "India": "🇮🇳",
    "Morocco": "🇲🇦",
    "Algeria": "🇩🇿",
    "Tunisia": "🇹🇳",
    "Egypt": "🇪🇬",
    "Saudi Arabia": "🇸🇦",
    "United Arab Emirates": "🇦🇪",
  };
  
  return country ? countryFlags[country] || "🌍" : "🌍";
};

const formatPagePath = (path: string) => {
  if (path === "/" || path.match(/^\/[a-z]{2}$/)) return "Home";
  
  // Remove language prefix
  const cleanPath = path.replace(/^\/[a-z]{2}/, "");
  
  if (cleanPath === "" || cleanPath === "/") return "Home";
  
  // Format the path nicely
  return cleanPath
    .split("/")
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "))
    .join(" → ");
};

const getTimeSinceJoined = (joinedAt: string) => {
  const now = new Date();
  const joined = new Date(joinedAt);
  const diffMs = now.getTime() - joined.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 min ago";
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  return `${diffHours} hours ago`;
};

export const LiveVisitorsSection = () => {
  const { activeUsers, isConnected, isRefreshing } = useRealtimePresence();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <Users className="h-5 w-5" />
              {isConnected && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
            Live Now
            {isRefreshing && (
              <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-ping" />
            )}
          </CardTitle>
          <Badge variant="secondary" className={`text-lg px-3 py-1 transition-all duration-300 ${isRefreshing ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
            {activeUsers.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activeUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active visitors right now</p>
            <p className="text-sm">Visitors will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {activeUsers.map((user, index) => (
              <div
                key={user.visitorId || index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    {getDeviceIcon(user.deviceType)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {formatPagePath(user.pagePath)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {user.browser}
                      </span>
                      {formatDeviceInfo(user.deviceBrand, user.deviceModel) && (
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          {formatDeviceInfo(user.deviceBrand, user.deviceModel)}
                        </span>
                      )}
                      {user.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {user.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg" title={user.country || "Unknown"}>
                    {getCountryFlag(user.country)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTimeSinceJoined(user.joinedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isConnected && (
          <div className="mt-4 pt-3 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Real-time updates active
          </div>
        )}
      </CardContent>
    </Card>
  );
};
