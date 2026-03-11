import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Camera, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  Clock,
  RefreshCw,
  Trash2,
  ImageOff,
  AlertCircle,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserScan {
  id: string;
  created_at: string;
  storage_path: string;
  device_type: string | null;
  browser: string | null;
  language: string | null;
  expires_at: string;
  country: string | null;
  city: string | null;
  device_brand: string | null;
  imageUrl?: string;
}

const getDeviceIcon = (deviceType: string | null) => {
  switch (deviceType?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const languageFlags: Record<string, string> = {
  "en": "🇬🇧",
  "fr": "🇫🇷",
  "es": "🇪🇸",
  "de": "🇩🇪",
  "pt": "🇵🇹",
  "it": "🇮🇹",
  "nl": "🇳🇱",
  "ar": "🇸🇦",
  "zh": "🇨🇳",
};

export const UserScansSection = () => {
  const [scans, setScans] = useState<UserScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureEnabled, setCaptureEnabled] = useState(false);
  const [settingLoading, setSettingLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSetting = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "capture_user_scans_enabled")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching setting:", error);
      }
      
      setCaptureEnabled(data?.value === "true");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSettingLoading(false);
    }
  };

  const fetchScans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching scans:", error);
        return;
      }

      // Get signed URLs for each scan
      const scansWithUrls = await Promise.all(
        (data || []).map(async (scan) => {
          const { data: urlData } = await supabase.storage
            .from("user-scans")
            .createSignedUrl(scan.storage_path, 3600); // 1 hour

          return {
            ...scan,
            imageUrl: urlData?.signedUrl,
          };
        })
      );

      setScans(scansWithUrls);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
    fetchScans();
  }, []);

  const toggleCapture = async () => {
    const newValue = !captureEnabled;
    setSettingLoading(true);

    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: newValue ? "true" : "false" })
        .eq("key", "capture_user_scans_enabled");

      if (error) throw error;

      setCaptureEnabled(newValue);
      toast({
        title: newValue ? "Capture activée" : "Capture désactivée",
        description: newValue 
          ? "Les images des scans seront maintenant enregistrées."
          : "Les images ne seront plus enregistrées.",
      });
    } catch (err) {
      console.error("Error updating setting:", err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre.",
        variant: "destructive",
      });
    } finally {
      setSettingLoading(false);
    }
  };

  const deleteScan = async (scan: UserScan) => {
    try {
      // Delete from storage
      await supabase.storage
        .from("user-scans")
        .remove([scan.storage_path]);

      // Delete from database
      const { error } = await supabase
        .from("user_scans")
        .delete()
        .eq("id", scan.id);

      if (error) throw error;

      setScans((prev) => prev.filter((s) => s.id !== scan.id));
      toast({
        title: "Scan supprimé",
        description: "L'image a été supprimée avec succès.",
      });
    } catch (err) {
      console.error("Error deleting scan:", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le scan.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            Scans utilisateurs
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="capture-toggle"
                checked={captureEnabled}
                onCheckedChange={toggleCapture}
                disabled={settingLoading}
              />
              <Label htmlFor="capture-toggle" className="text-sm">
                {captureEnabled ? "Activé" : "Désactivé"}
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchScans}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {!captureEnabled && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            La capture est désactivée. Activez-la pour enregistrer les images scannées.
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun scan enregistré</p>
            <p className="text-sm">
              {captureEnabled
                ? "Les nouveaux scans apparaîtront ici"
                : "Activez la capture pour commencer"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div
                    className="aspect-square bg-muted cursor-pointer"
                    onClick={() => setSelectedImage(scan.imageUrl || null)}
                  >
                    {scan.imageUrl ? (
                      <img
                        src={scan.imageUrl}
                        alt="User scan"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(scan.created_at), "dd/MM HH:mm")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteScan(scan)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>

                    {/* Location */}
                    {(scan.country || scan.city) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {[scan.city, scan.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {scan.device_brand && (
                        <Badge variant="default" className="text-xs">
                          {scan.device_brand}
                        </Badge>
                      )}
                      {scan.device_type && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          {getDeviceIcon(scan.device_type)}
                          {scan.device_type}
                        </Badge>
                      )}
                      {scan.browser && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Globe className="h-3 w-3" />
                          {scan.browser}
                        </Badge>
                      )}
                      {scan.language && (
                        <span className="text-sm">
                          {languageFlags[scan.language.toLowerCase()] || "🌐"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Les images sont automatiquement supprimées après 7 jours
            </p>
          </>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Scan en grand"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
