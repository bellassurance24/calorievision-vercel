import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, Shield } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";

const ChangePassword = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (en: string, fr: string) => (language === "fr" ? fr : en);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: t("Error", "Erreur"),
        description: t(
          "Password must be at least 6 characters",
          "Le mot de passe doit contenir au moins 6 caractères"
        ),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("Error", "Erreur"),
        description: t("Passwords do not match", "Les mots de passe ne correspondent pas"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast({
          title: t("Error", "Erreur"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("Password updated", "Mot de passe mis à jour"),
        description: t(
          "Your password has been changed successfully",
          "Votre mot de passe a été modifié avec succès"
        ),
      });
      setNewPassword("");
      setConfirmPassword("");
      navigate("/admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {t("Change Password", "Changer le mot de passe")}
              </CardTitle>
              <CardDescription className="mt-2">
                {t(
                  "Enter your new password below",
                  "Entrez votre nouveau mot de passe ci-dessous"
                )}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={t("New password", "Nouveau mot de passe")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={t("Confirm new password", "Confirmer le mot de passe")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("Update password", "Mettre à jour")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ChangePassword;
