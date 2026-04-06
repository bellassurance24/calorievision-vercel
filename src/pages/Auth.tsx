import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const { user, signIn, signUp, signInWithGoogle, isLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const mergeAuthParams = (search: string, hash: string) => {
    const merged = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    if (hash) {
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      hashParams.forEach((value, key) => merged.set(key, value));
    }
    return merged;
  };

  const hasNavigatedRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(() => {
    const params = mergeAuthParams(window.location.search ?? "", window.location.hash ?? "");
    return params.get("type") === "recovery";
  });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [confirmPasswordSignup, setConfirmPasswordSignup] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const t = (en: string, fr: string) => (language === "fr" ? fr : en);

  useEffect(() => {
    const params = mergeAuthParams(location.search ?? "", location.hash ?? "");
    const type = params.get("type");
    const errorDescription = params.get("error_description");
    const errorCode = params.get("error_code") ?? params.get("error");

    if (type === "recovery") {
      setIsUpdateMode(true);
      setIsResetMode(false);
      setLinkError(null);
    }

    if (errorDescription || errorCode) {
      const message = (errorDescription ?? errorCode ?? "").replace(/\+/g, " ").trim();
      setLinkError(message || t("Email link is invalid or has expired", "Le lien email est invalide ou a expiré"));
      setIsUpdateMode(false);
      setIsResetMode(true);
    }
  }, [language, location.search, location.hash]);

  useEffect(() => {
    if (isLoading || !isUpdateMode || user) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        if (!session) {
          setLinkError(t("Email link is invalid or has expired", "Le lien email est invalide ou a expiré"));
          setIsUpdateMode(false);
          setIsResetMode(true);
        }
      });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isLoading, isUpdateMode, user, language]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsUpdateMode(true);
        setIsResetMode(false);
        setLinkError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Track whether login was initiated — disables auto-redirect once user interacts
  const loginInitiatedRef = useRef(false);

  // Auto-redirect already-logged-in users. Respects ?returnTo= so a session-expiry
  // bounce from Pricing does not send the admin to /admin instead of /pricing.
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (loginInitiatedRef.current) return;
    if (user && !isLoading && !isUpdateMode) {
      hasNavigatedRef.current = true;
      const params = new URLSearchParams(location.search);
      const returnTo = params.get("returnTo");
      const destination = returnTo ?? (isAdmin ? "/admin" : "/");
      navigate(destination);
    }
  }, [user, isLoading, isUpdateMode, isAdmin, navigate, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginInitiatedRef.current = true;
    setIsSubmitting(true);
    try {
      const { error, isAdmin: adminResult } = await signIn(email, password);
      if (error) {
        toast({ title: t("Error", "Erreur"), description: error.message, variant: "destructive" });
        loginInitiatedRef.current = false;
        setIsSubmitting(false);
        return;
      }
      hasNavigatedRef.current = true;
      const params = new URLSearchParams(location.search);
      const returnTo = params.get("returnTo");
      navigate(returnTo ?? (adminResult ? "/admin" : "/"));
    } catch {
      loginInitiatedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: t("Error", "Erreur"),
        description: t("Password must be at least 6 characters", "Le mot de passe doit contenir au moins 6 caractères"),
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPasswordSignup) {
      toast({
        title: t("Error", "Erreur"),
        description: t("Passwords do not match", "Les mots de passe ne correspondent pas"),
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        const msg = error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("user already")
          ? t("This email is already registered. Please sign in instead.", "Cet email est déjà enregistré. Veuillez vous connecter.")
          : error.message;
        toast({ title: t("Error", "Erreur"), description: msg, variant: "destructive" });
        return;
      }
      setSignupSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) {
        toast({ title: t("Error", "Erreur"), description: error.message, variant: "destructive" });
      } else {
        toast({
          title: t("Email sent", "Email envoyé"),
          description: t(
            "Check your inbox for the password reset link (use the most recent email)",
            "Vérifiez votre boîte de réception pour le lien (utilisez l'email le plus récent)"
          ),
        });
        setIsResetMode(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: t("Error", "Erreur"),
        description: t("Password must be at least 6 characters", "Le mot de passe doit contenir au moins 6 caractères"),
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
        toast({ title: t("Error", "Erreur"), description: error.message, variant: "destructive" });
        return;
      }
      toast({
        title: t("Password updated", "Mot de passe mis à jour"),
        description: t("You can now access your account", "Vous pouvez maintenant accéder à votre compte"),
      });
      setNewPassword("");
      setConfirmPassword("");
      setIsUpdateMode(false);
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero px-4">
      <Card className="w-full max-w-md glass-panel border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isUpdateMode
              ? t("Set a new password", "Définir un nouveau mot de passe")
              : isResetMode
                ? t("Reset Password", "Réinitialiser le mot de passe")
                : isSignupMode
                  ? t("Create an account", "Créer un compte")
                  : t("Sign in to CalorieVision", "Connexion à CalorieVision")}
          </CardTitle>
          <CardDescription>
            {isUpdateMode
              ? t("Choose a new password to regain access", "Choisissez un nouveau mot de passe pour retrouver l'accès")
              : isResetMode
                ? t("Enter your email to receive a reset link", "Entrez votre email pour recevoir un lien de réinitialisation")
                : isSignupMode
                  ? t("Enter your details to create a free CalorieVision account", "Renseignez vos informations pour créer un compte CalorieVision gratuit")
                  : t("Enter your credentials to access your account", "Entrez vos identifiants pour accéder à votre compte")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {linkError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {linkError}
            </div>
          )}

          {/* ── Update password (recovery flow) ── */}
          {isUpdateMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Update password", "Mettre à jour")}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setIsUpdateMode(false); setIsResetMode(true); }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("Request a new link", "Demander un nouveau lien")}
              </Button>
            </form>

          /* ── Reset password (forgot password) ── */
          ) : isResetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t("Email address", "Adresse email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Send reset link", "Envoyer le lien")}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setLinkError(null); setIsResetMode(false); }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("Back to login", "Retour à la connexion")}
              </Button>
            </form>

          /* ── Sign-up form ── */
          ) : isSignupMode ? (
            signupSuccess ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{t("Check your inbox!", "Vérifiez votre boîte mail !")}</p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    `We've sent a confirmation link to ${email}. Click it to activate your account and sign in.`,
                    `Nous avons envoyé un lien de confirmation à ${email}. Cliquez dessus pour activer votre compte et vous connecter.`
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => { setIsSignupMode(false); setSignupSuccess(false); setEmail(""); setPassword(""); setConfirmPasswordSignup(""); }}
                >
                  {t("Back to sign in", "Retour à la connexion")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t("Email address", "Adresse email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                <div className="relative">
  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    type={showPassword ? "text" : "password"}
    placeholder={t("Password (min. 6 characters)", "Mot de passe (min. 6 caractères)")}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength={6}
    className="pl-10 pr-10"
    autoComplete="new-password"
  />
  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
                </div>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
   type={showPassword ? "text" : "password"}
   placeholder={t("Confirm password", "Confirmer le mot de passe")}
   value={confirmPasswordSignup}
   onChange={(e) => setConfirmPasswordSignup(e.target.value)}
   required
   minLength={6}
   className="pl-10 pr-10"
   autoComplete="new-password"
 />
 <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
</div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Create account", "Créer un compte")}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t("or continue with", "ou continuer avec")}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    const { error } = await signInWithGoogle();
                    if (error) toast({ title: t("Google sign-in failed", "Échec de la connexion Google"), description: error.message, variant: "destructive" });
                  }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t("Continue with Google", "Continuer avec Google")}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  {t("Already have an account?", "Vous avez déjà un compte ?")}{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => { setIsSignupMode(false); setSignupSuccess(false); setPassword(""); setConfirmPasswordSignup(""); setLinkError(null); }}
                  >
                    {t("Sign in", "Se connecter")}
                  </button>
                </p>
              </form>
            )

          /* ── Sign-in form (default) ── */
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t("Email address", "Adresse email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
              <div className="relative">
  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    type={showPassword ? "text" : "password"}
    placeholder={t("Password", "Mot de passe")}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength={6}
    className="pl-10 pr-10"
    autoComplete="current-password"
  />
  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Sign in", "Se connecter")}
              </Button>
              <Button type="button" variant="link" className="w-full text-muted-foreground" onClick={() => { setLinkError(null); setIsResetMode(true); }}>
                {t("Forgot password?", "Mot de passe oublié ?")}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t("or continue with", "ou continuer avec")}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={async () => {
                  const { error } = await signInWithGoogle();
                  if (error) toast({ title: t("Google sign-in failed", "Échec de la connexion Google"), description: error.message, variant: "destructive" });
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("Continue with Google", "Continuer avec Google")}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-1">
                {t("Don't have an account?", "Pas encore de compte ?")}{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => { setIsSignupMode(true); setLinkError(null); setPassword(""); setConfirmPasswordSignup(""); }}
                >
                  {t("Sign up", "S'inscrire")}
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
