import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "notification_popup_dismissed";
const HAS_USED_APP_KEY = "has_used_app_once";
const APP_INSTALLED_KEY = "pwa_installed";
const SHOW_DELAY_MS = 3000;

const translations = {
  en: {
    title: "Stay informed!",
    description: "Enable notifications to receive meal reminders and updates.",
    enable: "Enable",
    later: "Not now",
  },
  fr: {
    title: "Restez informé !",
    description: "Activez les notifications pour recevoir des rappels et mises à jour.",
    enable: "Activer",
    later: "Plus tard",
  },
  es: {
    title: "¡Mantente informado!",
    description: "Activa las notificaciones para recibir recordatorios y actualizaciones.",
    enable: "Activar",
    later: "Ahora no",
  },
  pt: {
    title: "Fique informado!",
    description: "Ative as notificações para receber lembretes e atualizações.",
    enable: "Ativar",
    later: "Agora não",
  },
  zh: {
    title: "保持关注！",
    description: "启用通知以接收餐饮提醒和更新。",
    enable: "启用",
    later: "稍后",
  },
  ar: {
    title: "ابقَ على اطلاع!",
    description: "فعّل الإشعارات لتلقي التذكيرات والتحديثات.",
    enable: "تفعيل",
    later: "ليس الآن",
  },
  it: {
    title: "Resta informato!",
    description: "Attiva le notifiche per ricevere promemoria e aggiornamenti.",
    enable: "Attiva",
    later: "Non ora",
  },
  de: {
    title: "Bleiben Sie informiert!",
    description: "Aktivieren Sie Benachrichtigungen für Erinnerungen und Updates.",
    enable: "Aktivieren",
    later: "Später",
  },
  nl: {
    title: "Blijf op de hoogte!",
    description: "Schakel meldingen in voor herinneringen en updates.",
    enable: "Inschakelen",
    later: "Later",
  },
  ru: {
    title: "Будьте в курсе!",
    description: "Включите уведомления, чтобы получать напоминания и обновления.",
    enable: "Включить",
    later: "Не сейчас",
  },
  ja: {
    title: "最新情報をお届け！",
    description: "通知を有効にして、リマインダーや更新情報を受け取りましょう。",
    enable: "有効にする",
    later: "後で",
  },
} as const;

export function NotificationPermissionPopup() {
  const { language } = useLanguage();
  const { isSupported, permissionStatus, isLoading, registerDevice } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const t = translations[language as keyof typeof translations] || translations.en;

  // Check if app is installed (running as standalone PWA)
  const isAppInstalled = () => {
    if (typeof window === "undefined") return false;
    
    // Check if running as standalone PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
    
    // Check localStorage flag
    if (localStorage.getItem(APP_INSTALLED_KEY) === "true") return true;
    
    return false;
  };

  // Mark that user has used the app
  useEffect(() => {
    // Set flag that user has visited at least once
    const hasUsed = localStorage.getItem(HAS_USED_APP_KEY);
    if (!hasUsed) {
      // Mark as used after first page load
      localStorage.setItem(HAS_USED_APP_KEY, "true");
    }
  }, []);

  useEffect(() => {
    // Don't show if notifications not supported
    if (!isSupported) return;
    
    // Don't show if permission already granted or denied
    if (permissionStatus === "granted" || permissionStatus === "denied") return;
    
    // Don't show if already dismissed today (reset after 24 hours)
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneDay) {
        return;
      }
    }

    // Only show if app is installed (for reminders) or if user has used app before
    const hasUsedApp = localStorage.getItem(HAS_USED_APP_KEY) === "true";
    const installed = isAppInstalled();
    
    // Show notification popup after user has used the app at least once
    // OR if app is installed (in which case they need notifications for reminders)
    if (!hasUsedApp && !installed) return;

    // Show popup after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isSupported, permissionStatus]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 200);
  };

  const handleDismiss = () => {
    // Dismiss with timestamp so it resets after 24 hours
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    handleClose();
  };

  const handleEnable = async () => {
    const success = await registerDevice();
    if (success) {
      handleClose();
    }
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
            <Bell className="h-5 w-5" />
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
                onClick={handleEnable}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </span>
                ) : (
                  t.enable
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isLoading}
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
