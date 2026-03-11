import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Mail, RefreshCw, Bell, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const AdminSettings = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    enableAnalytics: true,
    enableNotifications: true,
    maintenanceMode: false,
  });
  
  const [contactEmail, setContactEmail] = useState("support@calorievision.online");
  const [originalContactEmail, setOriginalContactEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  
  // Notification broadcast state
  const [notifTitle, setNotifTitle] = useState("🎉 Notification de test");
  const [notifBody, setNotifBody] = useState("Ceci est une notification envoyée depuis le panneau admin.");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Fetch contact email from settings table
  useEffect(() => {
    const fetchContactEmail = async () => {
      if (!user || !isAdmin) return;
      
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("key", "contact_email")
          .single();
        
        if (error) {
          console.error("Error fetching contact email:", error);
          return;
        }
        
        if (data) {
          setContactEmail(data.value);
          setOriginalContactEmail(data.value);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoadingEmail(false);
      }
    };

    fetchContactEmail();
  }, [user, isAdmin]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate saving (in a real app, save to database)
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({ title: "Settings saved", description: "Your settings have been updated." });
    setSaving(false);
  };

  const handleSaveContactEmail = async () => {
    if (!contactEmail.trim()) {
      toast({
        title: "Error",
        description: "Email address cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSavingEmail(true);
    
    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: contactEmail })
        .eq("key", "contact_email");
      
      if (error) {
        throw error;
      }
      
      setOriginalContactEmail(contactEmail);
      toast({
        title: "Contact email updated",
        description: `Form submissions will now be sent to ${contactEmail}`,
      });
    } catch (err) {
      console.error("Failed to save contact email:", err);
      toast({
        title: "Error",
        description: "Failed to save contact email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const hasEmailChanged = contactEmail !== originalContactEmail;

  const handleBroadcastNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre et le message sont requis.",
        variant: "destructive",
      });
      return;
    }

    setSendingNotif(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("broadcast-notification", {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: {
          title: notifTitle,
          body: notifBody,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Notification envoyée",
          description: data.message,
        });
      } else {
        toast({
          title: "Erreur",
          description: data?.error || "Échec de l'envoi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Broadcast failed:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'envoi de la notification.",
        variant: "destructive",
      });
    } finally {
      setSendingNotif(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage application settings</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Push Notification Broadcast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Test de notification push
              </CardTitle>
              <CardDescription>
                Envoyer une notification à tous les appareils enregistrés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notif-title">Titre</Label>
                <Input
                  id="notif-title"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="🎉 Titre de la notification"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notif-body">Message</Label>
                <Textarea
                  id="notif-body"
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Contenu de la notification..."
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleBroadcastNotification} 
                disabled={sendingNotif}
                className="w-full"
              >
                {sendingNotif ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer à tous les appareils
              </Button>

              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Cette notification sera envoyée à tous les appareils ayant activé les notifications push, 
                  qu'ils soient connectés ou non.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Form Settings
              </CardTitle>
              <CardDescription>
                Configure where contact form submissions are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Recipient Email Address</Label>
                {loadingEmail ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="support@calorievision.online"
                    />
                    <p className="text-sm text-muted-foreground">
                      Contact form messages will be sent to this email address.
                    </p>
                  </>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={handleSaveContactEmail} 
                  disabled={savingEmail || !hasEmailChanged || loadingEmail}
                  size="sm"
                >
                  {savingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Email
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">⚠️ Important: EmailJS Configuration</p>
                <p className="text-muted-foreground">
                  The contact form uses EmailJS. To change the recipient email, you must also update it in your{" "}
                  <a 
                    href="https://dashboard.emailjs.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    EmailJS Dashboard
                  </a>
                  {" "}→ Email Templates → template_h5qb6zi → To Email.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableAnalytics: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable push notification system
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>System maintenance options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the site for users
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle>Application Info</CardTitle>
              <CardDescription>System information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-mono">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admin Email</span>
                <span className="font-mono">{user?.email}</span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-fit">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
