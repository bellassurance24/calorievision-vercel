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
  MapPin,
  Flame,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AnalysisResult {
  items: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
    notes: string;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface UserScan {
  id: string;
  created_at: string;
  storage_path: string | null;
  device_type: string | null;
  browser: string | null;
  language: string | null;
  expires_at: string | null;
  country: string | null;
  city: string | null;
  device_brand: string | null;
  total_calories: number | null;
  analysis_result: AnalysisResult | null;
  imageUrl?: string;
}

const getDeviceIcon = (deviceType: string | null) => {
  switch (deviceType?.toLowerCase()) {
    case "mobile": return <Smartphone className="h-3 w-3" />;
    case "tablet": return <Tablet className="h-3 w-3" />;
    default:       return <Monitor className="h-3 w-3" />;
  }
};

const languageFlags: Record<string, string> = {
  en: "🇬🇧", fr: "🇫🇷", es: "🇪🇸", de: "🇩🇪",
  pt: "🇵🇹", it: "🇮🇹", nl: "🇳🇱", ar: "🇸🇦",
  zh: "🇨🇳", ru: "🇷🇺", ja: "🇯🇵",
};

export const UserScansSection = () => {
  const [scans, setScans] = useState<UserScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureEnabled, setCaptureEnabled] = useState(false);
  const [settingLoading, setSettingLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  // ── Fetch capture toggle setting from site_settings ───────────────────────
  const fetchSetting = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "capture_user_scans_enabled")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching capture setting:", error);
      }
      // value is jsonb: may be boolean true or string "true"
      setCaptureEnabled(data?.value === true || data?.value === "true");
    } catch (err) {
      console.error("fetchSetting error:", err);
    } finally {
      setSettingLoading(false);
    }
  };

  // ── Fetch scans with signed image URLs ───────────────────────────────────
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

      const scansWithUrls = await Promise.all(
        (data || []).map(async (scan) => {
          let imageUrl: string | undefined;
          if (scan.storage_path) {
            const { data: urlData } = await supabase.storage
              .from("user-scans")
              .createSignedUrl(scan.storage_path, 3600);
            imageUrl = urlData?.signedUrl;
          }
          return { ...scan, imageUrl } as UserScan;
        }),
      );

      setScans(scansWithUrls);
    } catch (err) {
      console.error("fetchScans error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
    fetchScans();
  }, []);

  // ── Toggle capture enabled ────────────────────────────────────────────────
  const toggleCapture = async () => {
    const newValue = !captureEnabled;
    setSettingLoading(true);
    try {
      // Upsert into site_settings (jsonb value)
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key: "capture_user_scans_enabled", value: newValue },
          { onConflict: "key" },
        );

      if (error) throw error;

      setCaptureEnabled(newValue);
      toast({
        title: newValue ? "Capture activée ✅" : "Capture désactivée",
        description: newValue
          ? "Les scans seront maintenant enregistrés avec l'analyse complète."
          : "Les scans ne seront plus enregistrés.",
      });
    } catch (err) {
      console.error("toggleCapture error:", err);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le paramètre.", variant: "destructive" });
    } finally {
      setSettingLoading(false);
    }
  };

  // ── Delete a scan (DB row + storage object) ───────────────────────────────
  const deleteScan = async (scan: UserScan) => {
    try {
      if (scan.storage_path) {
        await supabase.storage.from("user-scans").remove([scan.storage_path]);
      }
      const { error } = await supabase.from("user_scans").delete().eq("id", scan.id);
      if (error) throw error;

      setScans((prev) => prev.filter((s) => s.id !== scan.id));
      toast({ title: "Scan supprimé", description: "L'entrée a été supprimée avec succès." });
    } catch (err) {
      console.error("deleteScan error:", err);
      toast({ title: "Erreur", description: "Impossible de supprimer le scan.", variant: "destructive" });
    }
  };

  // ── Stats bar ─────────────────────────────────────────────────────────────
  const avgCalories = scans.length > 0
    ? Math.round(scans.filter(s => s.total_calories).reduce((sum, s) => sum + (s.total_calories ?? 0), 0) / scans.filter(s => s.total_calories).length)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            Scans utilisateurs
            {scans.length > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">
                {scans.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="capture-toggle"
                checked={captureEnabled}
                onCheckedChange={toggleCapture}
                disabled={settingLoading}
              />
              <Label htmlFor="capture-toggle" className="text-sm cursor-pointer">
                {captureEnabled ? "Capture ON" : "Capture OFF"}
              </Label>
            </div>
            <Button variant="outline" size="sm" onClick={fetchScans} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {!captureEnabled && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            La capture est désactivée. Activez-la pour enregistrer les scans avec l'analyse IA.
          </div>
        )}

        {/* Quick stats */}
        {scans.length > 0 && (
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" />
              {scans.length} scan{scans.length > 1 ? "s" : ""}
            </span>
            {avgCalories > 0 && (
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Moy. {avgCalories} kcal
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <ImageOff className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucun scan enregistré</p>
            <p className="text-sm mt-1">
              {captureEnabled
                ? "Les nouveaux scans apparaîtront ici automatiquement"
                : "Activez la capture pour commencer à enregistrer les scans"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="group relative rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image thumbnail */}
                  <div
                    className="aspect-square bg-muted cursor-pointer relative"
                    onClick={() => scan.imageUrl && setSelectedImage(scan.imageUrl)}
                  >
                    {scan.imageUrl ? (
                      <img
                        src={scan.imageUrl}
                        alt="Scan utilisateur"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <Camera className="h-8 w-8 text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground">Image expirée</span>
                      </div>
                    )}

                    {/* Calorie overlay badge */}
                    {scan.total_calories != null && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                        <Flame className="h-3 w-3 text-orange-400" />
                        {scan.total_calories} kcal
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-3 space-y-2">
                    {/* Date + delete */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(scan.created_at), "dd/MM/yy HH:mm")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteScan(scan)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>

                    {/* Food items preview */}
                    {scan.analysis_result?.items && scan.analysis_result.items.length > 0 && (
                      <div className="space-y-1">
                        {scan.analysis_result.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-foreground truncate max-w-[130px]" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-muted-foreground shrink-0 ml-1">
                              {Math.round(item.calories)} kcal
                            </span>
                          </div>
                        ))}
                        {scan.analysis_result.items.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{scan.analysis_result.items.length - 3} autres
                          </p>
                        )}
                      </div>
                    )}

                    {/* Macros totals */}
                    {scan.analysis_result && (
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="rounded bg-blue-500/10 px-1.5 py-1 text-center">
                          <p className="text-muted-foreground">P</p>
                          <p className="font-medium text-foreground">{Math.round(scan.analysis_result.totalProtein)}g</p>
                        </div>
                        <div className="rounded bg-yellow-500/10 px-1.5 py-1 text-center">
                          <p className="text-muted-foreground">C</p>
                          <p className="font-medium text-foreground">{Math.round(scan.analysis_result.totalCarbs)}g</p>
                        </div>
                        <div className="rounded bg-red-500/10 px-1.5 py-1 text-center">
                          <p className="text-muted-foreground">F</p>
                          <p className="font-medium text-foreground">{Math.round(scan.analysis_result.totalFat)}g</p>
                        </div>
                      </div>
                    )}

                    {/* Location + device badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(scan.city || scan.country) && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[scan.city, scan.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {scan.device_type && (
                        <Badge variant="secondary" className="text-xs gap-1 h-5 px-1.5">
                          {getDeviceIcon(scan.device_type)}
                          {scan.device_type}
                        </Badge>
                      )}
                      {scan.browser && (
                        <Badge variant="outline" className="text-xs gap-1 h-5 px-1.5">
                          <Globe className="h-3 w-3" />
                          {scan.browser}
                        </Badge>
                      )}
                      {scan.language && (
                        <span className="text-sm" title={scan.language}>
                          {languageFlags[scan.language.toLowerCase()] ?? "🌐"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Les enregistrements expirent après 30 jours · {scans.length} scan{scans.length > 1 ? "s" : ""} au total
            </p>
          </>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Scan en grand"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
