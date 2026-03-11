import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const INSTALL_DISMISSED_KEY = "install_prompt_dismissed";
const APP_INSTALLED_KEY = "pwa_installed";
const SHOW_DELAY_MS = 2000;

const translations = {
  en: {
    title: "Install CalorieVision",
    description: "Add to your home screen for quick access and a better experience!",
    install: "Install",
    later: "Not now",
    learnMore: "Learn how",
  },
  fr: {
    title: "Installer CalorieVision",
    description: "Ajoutez à votre écran d'accueil pour un accès rapide !",
    install: "Installer",
    later: "Plus tard",
    learnMore: "Comment faire",
  },
  es: {
    title: "Instalar CalorieVision",
    description: "¡Añade a tu pantalla de inicio para un acceso rápido!",
    install: "Instalar",
    later: "Ahora no",
    learnMore: "Cómo hacerlo",
  },
  pt: {
    title: "Instalar CalorieVision",
    description: "Adicione à sua tela inicial para acesso rápido!",
    install: "Instalar",
    later: "Agora não",
    learnMore: "Como fazer",
  },
  zh: {
    title: "安装 CalorieVision",
    description: "添加到主屏幕以快速访问！",
    install: "安装",
    later: "稍后",
    learnMore: "了解方法",
  },
  ar: {
    title: "تثبيت CalorieVision",
    description: "أضف إلى شاشتك الرئيسية للوصول السريع!",
    install: "تثبيت",
    later: "ليس الآن",
    learnMore: "كيفية التثبيت",
  },
  it: {
    title: "Installa CalorieVision",
    description: "Aggiungi alla schermata iniziale per un accesso rapido!",
    install: "Installa",
    later: "Non ora",
    learnMore: "Come fare",
  },
  de: {
    title: "CalorieVision installieren",
    description: "Zum Startbildschirm hinzufügen für schnellen Zugriff!",
    install: "Installieren",
    later: "Später",
    learnMore: "So geht's",
  },
  nl: {
    title: "CalorieVision installeren",
    description: "Voeg toe aan je startscherm voor snelle toegang!",
    install: "Installeren",
    later: "Later",
    learnMore: "Hoe installeren",
  },
} as const;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const t = translations[language as keyof typeof translations] || translations.en;

  // Check if app is running in standalone mode (installed)
  const isInstalled = () => {
    if (typeof window === "undefined") return false;
    
    // Check if running as standalone PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
    
    // Check localStorage flag
    if (localStorage.getItem(APP_INSTALLED_KEY) === "true") return true;
    
    return false;
  };

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled()) return;
    
    // Don't show if already dismissed
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissed) return;

    // Capture the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show popup after a delay
    const timer = setTimeout(() => {
      if (!isInstalled()) {
        setIsVisible(true);
      }
    }, SHOW_DELAY_MS);

    // Listen for app installed event
    const handleAppInstalled = () => {
      localStorage.setItem(APP_INSTALLED_KEY, "true");
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Also check display mode changes (for when user installs)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        localStorage.setItem(APP_INSTALLED_KEY, "true");
        setIsVisible(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 200);
  };

  const handleDismiss = () => {
    // Only dismiss for this session (user can see it again next visit)
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    handleClose();
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Use native install prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        localStorage.setItem(APP_INSTALLED_KEY, "true");
      }
      
      setDeferredPrompt(null);
      handleClose();
    } else {
      // Redirect to install page for manual instructions
      const langPath = language === "en" ? "/en" : `/${language}`;
      window.location.href = `${langPath}/install`;
    }
  };

  const handleLearnMore = () => {
    const langPath = language === "en" ? "/en" : `/${language}`;
    window.location.href = `${langPath}/install`;
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm",
        "transform transition-all duration-200 ease-out",
        isClosing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      )}
    >
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-foreground">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.description}
            </p>

            {/* Buttons */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                {deferredPrompt ? t.install : t.learnMore}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                {t.later}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
