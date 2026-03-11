import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Smartphone, Laptop, Trash2, Send, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface DeviceToken {
  id: string;
  token: string;
  platform: "ios" | "android" | "web";
  device_name: string | null;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface NotificationPreferences {
  meal_reminder_enabled: boolean;
  calorie_alert_enabled: boolean;
  weekly_summary_enabled: boolean;
  motivation_enabled: boolean;
  system_enabled: boolean;
  promotional_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const translations = {
  en: {
    title: "Notification Settings",
    description: "Manage your notification preferences and registered devices",
    devicesTitle: "Registered Devices",
    devicesDescription: "Devices that can receive push notifications",
    noDevices: "No devices registered",
    enableNotifications: "Enable Notifications",
    testNotification: "Send Test",
    sending: "Sending...",
    testSuccess: "Test notification sent!",
    testError: "Failed to send test notification",
    removeDevice: "Remove",
    removing: "Removing...",
    deviceRemoved: "Device removed",
    preferencesTitle: "Notification Preferences",
    mealReminders: "Meal Reminders",
    mealRemindersDesc: "Get reminded to log your meals",
    calorieAlerts: "Calorie Alerts",
    calorieAlertsDesc: "Alert when exceeding calorie goals",
    weeklySummary: "Weekly Summary",
    weeklySummaryDesc: "Receive weekly progress reports",
    motivation: "Motivational Tips",
    motivationDesc: "Daily motivation and tips",
    system: "System Notifications",
    systemDesc: "Important app updates",
    promotional: "Promotional",
    promotionalDesc: "News and special offers",
    quietHours: "Quiet Hours",
    quietHoursDesc: "No notifications during these hours",
    platform: {
      ios: "iOS",
      android: "Android",
      web: "Web Browser",
    },
    refresh: "Refresh",
    lastUsed: "Last used",
    registered: "Registered",
    active: "Active",
    inactive: "Inactive",
  },
  fr: {
    title: "Paramètres de notifications",
    description: "Gérez vos préférences de notifications et appareils enregistrés",
    devicesTitle: "Appareils enregistrés",
    devicesDescription: "Appareils pouvant recevoir des notifications push",
    noDevices: "Aucun appareil enregistré",
    enableNotifications: "Activer les notifications",
    testNotification: "Envoyer un test",
    sending: "Envoi...",
    testSuccess: "Notification de test envoyée !",
    testError: "Échec de l'envoi de la notification",
    removeDevice: "Supprimer",
    removing: "Suppression...",
    deviceRemoved: "Appareil supprimé",
    preferencesTitle: "Préférences de notifications",
    mealReminders: "Rappels de repas",
    mealRemindersDesc: "Rappels pour enregistrer vos repas",
    calorieAlerts: "Alertes calories",
    calorieAlertsDesc: "Alerte si dépassement des objectifs",
    weeklySummary: "Résumé hebdomadaire",
    weeklySummaryDesc: "Recevez des rapports de progression",
    motivation: "Conseils motivants",
    motivationDesc: "Motivation et conseils quotidiens",
    system: "Notifications système",
    systemDesc: "Mises à jour importantes de l'app",
    promotional: "Promotionnel",
    promotionalDesc: "Actualités et offres spéciales",
    quietHours: "Heures silencieuses",
    quietHoursDesc: "Pas de notifications pendant ces heures",
    platform: {
      ios: "iOS",
      android: "Android",
      web: "Navigateur Web",
    },
    refresh: "Actualiser",
    lastUsed: "Dernière utilisation",
    registered: "Enregistré le",
    active: "Actif",
    inactive: "Inactif",
  },
};

export default function NotificationSettings() {
  const { user, session } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { 
    isSupported, 
    permissionStatus, 
    isRegistered, 
    isLoading: notifLoading,
    registerDevice 
  } = useNotifications();

  const [devices, setDevices] = useState<DeviceToken[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null);
  const [updatingPref, setUpdatingPref] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations] || translations.en;
  const dateLocale = language === "fr" ? fr : enUS;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch devices and preferences
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const [devicesResult, prefsResult] = await Promise.all([
        supabase
          .from("device_tokens")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single(),
      ]);

      if (devicesResult.data) {
        setDevices(devicesResult.data as DeviceToken[]);
      }

      if (prefsResult.data) {
        setPreferences(prefsResult.data as NotificationPreferences);
      }
    } catch (error) {
      console.error("Failed to fetch notification data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleEnableNotifications = async () => {
    const success = await registerDevice();
    if (success) {
      toast.success(t.testSuccess);
      fetchData();
    }
  };

  const handleSendTest = async () => {
    if (!session) return;
    setSendingTest(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("test-notification", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(t.testSuccess);
      } else {
        toast.error(data?.message || t.testError);
      }
    } catch (error) {
      console.error("Test notification failed:", error);
      toast.error(t.testError);
    } finally {
      setSendingTest(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setRemovingDeviceId(deviceId);
    
    try {
      const { error } = await supabase
        .from("device_tokens")
        .delete()
        .eq("id", deviceId);

      if (error) throw error;

      setDevices(devices.filter(d => d.id !== deviceId));
      toast.success(t.deviceRemoved);
    } catch (error) {
      console.error("Failed to remove device:", error);
      toast.error("Failed to remove device");
    } finally {
      setRemovingDeviceId(null);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user || !preferences) return;
    setUpdatingPref(key);

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences({ ...preferences, [key]: value });
    } catch (error) {
      console.error("Failed to update preference:", error);
      toast.error("Failed to update preference");
    } finally {
      setUpdatingPref(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "ios":
      case "android":
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Devices Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {t.devicesTitle}
                </CardTitle>
                <CardDescription>{t.devicesDescription}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  {t.refresh}
                </Button>
                {isSupported && permissionStatus !== "granted" && (
                  <Button onClick={handleEnableNotifications} disabled={notifLoading}>
                    <Bell className="h-4 w-4 mr-2" />
                    {t.enableNotifications}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t.noDevices}</p>
                {isSupported && (
                  <Button onClick={handleEnableNotifications} className="mt-4" disabled={notifLoading}>
                    <Bell className="h-4 w-4 mr-2" />
                    {t.enableNotifications}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        {getPlatformIcon(device.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {device.device_name || t.platform[device.platform]}
                          </span>
                          <Badge variant={device.is_active ? "default" : "secondary"}>
                            {device.is_active ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />{t.active}</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" />{t.inactive}</>
                            )}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.registered} {format(new Date(device.created_at), "PPP", { locale: dateLocale })}
                          {device.last_used_at && (
                            <> • {t.lastUsed} {format(new Date(device.last_used_at), "PPP", { locale: dateLocale })}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDevice(device.id)}
                      disabled={removingDeviceId === device.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {removingDeviceId === device.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}

                {/* Test notification button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSendTest}
                    disabled={sendingTest || devices.filter(d => d.is_active).length === 0}
                    className="w-full"
                  >
                    {sendingTest ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.sending}</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" />{t.testNotification}</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences Section */}
        {preferences && (
          <Card>
            <CardHeader>
              <CardTitle>{t.preferencesTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="meal_reminder">{t.mealReminders}</Label>
                    <p className="text-sm text-muted-foreground">{t.mealRemindersDesc}</p>
                  </div>
                  <Switch
                    id="meal_reminder"
                    checked={preferences.meal_reminder_enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("meal_reminder_enabled", checked)}
                    disabled={updatingPref === "meal_reminder_enabled"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="calorie_alert">{t.calorieAlerts}</Label>
                    <p className="text-sm text-muted-foreground">{t.calorieAlertsDesc}</p>
                  </div>
                  <Switch
                    id="calorie_alert"
                    checked={preferences.calorie_alert_enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("calorie_alert_enabled", checked)}
                    disabled={updatingPref === "calorie_alert_enabled"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly_summary">{t.weeklySummary}</Label>
                    <p className="text-sm text-muted-foreground">{t.weeklySummaryDesc}</p>
                  </div>
                  <Switch
                    id="weekly_summary"
                    checked={preferences.weekly_summary_enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("weekly_summary_enabled", checked)}
                    disabled={updatingPref === "weekly_summary_enabled"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="motivation">{t.motivation}</Label>
                    <p className="text-sm text-muted-foreground">{t.motivationDesc}</p>
                  </div>
                  <Switch
                    id="motivation"
                    checked={preferences.motivation_enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("motivation_enabled", checked)}
                    disabled={updatingPref === "motivation_enabled"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system">{t.system}</Label>
                    <p className="text-sm text-muted-foreground">{t.systemDesc}</p>
                  </div>
                  <Switch
                    id="system"
                    checked={preferences.system_enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("system_enabled", checked)}
                    disabled={updatingPref === "system_enabled"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotional">{t.promotional}</Label>
                    <p className="text-sm text-muted-foreground">{t.promotionalDesc}</p>
                  </div>
                  <Switch
                    id="promotional"
                    checked={preferences.promotional_enabled}
                    onCheckedChange={(checked) => handlePreferenceChange("promotional_enabled", checked)}
                    disabled={updatingPref === "promotional_enabled"}
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="pt-4 border-t">
                <Label>{t.quietHours}</Label>
                <p className="text-sm text-muted-foreground mb-3">{t.quietHoursDesc}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-2 bg-muted rounded-md font-mono">
                    {preferences.quiet_hours_start}
                  </span>
                  <span>–</span>
                  <span className="px-3 py-2 bg-muted rounded-md font-mono">
                    {preferences.quiet_hours_end}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
