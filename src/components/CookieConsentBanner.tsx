import { useState, useEffect, useCallback } from "react";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const COOKIE_CONSENT_KEY = "calorievision_cookie_consent";
const COOKIE_PREFERENCES_KEY = "calorievision_cookie_preferences";

export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  advertising: false,
  functional: false,
};

// Custom event for reopening the banner
const REOPEN_BANNER_EVENT = "reopen-cookie-consent";

export const reopenCookieConsent = () => {
  window.dispatchEvent(new CustomEvent(REOPEN_BANNER_EVENT));
};

export const getCookiePreferences = (): CookiePreferences => {
  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading cookie preferences:", e);
  }
  return DEFAULT_PREFERENCES;
};

const CookieConsentBanner = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  const t = (
    en: string,
    fr: string,
    es: string,
    pt: string,
    zh: string,
    ar: string,
    it: string,
    de: string,
    nl: string
  ) => {
    const translations: Record<string, string> = { en, fr, es, pt, zh, ar, it, de, nl };
    return translations[language] || en;
  };

  const showBanner = useCallback(() => {
    // Load current preferences when reopening
    const currentPrefs = getCookiePreferences();
    setPreferences(currentPrefs);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      // Load saved preferences
      setPreferences(getCookiePreferences());
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for reopen event
  useEffect(() => {
    const handleReopen = () => {
      showBanner();
    };
    window.addEventListener(REOPEN_BANNER_EVENT, handleReopen);
    return () => window.removeEventListener(REOPEN_BANNER_EVENT, handleReopen);
  }, [showBanner]);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "custom");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      advertising: true,
      functional: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected: CookiePreferences = {
      essential: true, // Essential always stays true
      analytics: false,
      advertising: false,
      functional: false,
    };
    setPreferences(allRejected);
    savePreferences(allRejected);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "essential") return; // Cannot disable essential
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const isRTL = language === "ar";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 transition-transform duration-500",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl">
        <div className="relative p-4 md:p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 p-2 rounded-full hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t("Close", "Fermer", "Cerrar", "Fechar", "关闭", "إغلاق", "Chiudi", "Schließen", "Sluiten")}
          >
            <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {t(
                    "We value your privacy",
                    "Nous respectons votre vie privée",
                    "Valoramos su privacidad",
                    "Valorizamos a sua privacidade",
                    "我们重视您的隐私",
                    "نحن نقدر خصوصيتك",
                    "Teniamo alla tua privacy",
                    "Wir schätzen Ihre Privatsphäre",
                    "Wij waarderen uw privacy"
                  )}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "We use cookies to personalize content, analyze traffic, and serve relevant ads. You can customize your preferences below or accept/reject all.",
                    "Nous utilisons des cookies pour personnaliser le contenu, analyser le trafic et afficher des publicités pertinentes. Vous pouvez personnaliser vos préférences ci-dessous ou tout accepter/refuser.",
                    "Usamos cookies para personalizar el contenido, analizar el tráfico y mostrar anuncios relevantes. Puede personalizar sus preferencias a continuación o aceptar/rechazar todo.",
                    "Usamos cookies para personalizar conteúdo, analisar tráfego e exibir anúncios relevantes. Você pode personalizar suas preferências abaixo ou aceitar/rejeitar tudo.",
                    "我们使用 Cookie 来个性化内容、分析流量并投放相关广告。您可以在下方自定义偏好设置，或全部接受/拒绝。",
                    "نستخدم ملفات تعريف الارتباط لتخصيص المحتوى وتحليل حركة المرور وعرض إعلانات ذات صلة. يمكنك تخصيص تفضيلاتك أدناه أو قبول/رفض الكل.",
                    "Utilizziamo i cookie per personalizzare i contenuti, analizzare il traffico e mostrare annunci pertinenti. Puoi personalizzare le tue preferenze qui sotto o accettare/rifiutare tutto.",
                    "Wir verwenden Cookies, um Inhalte zu personalisieren, den Datenverkehr zu analysieren und relevante Werbung anzuzeigen. Sie können Ihre Präferenzen unten anpassen oder alle akzeptieren/ablehnen.",
                    "We gebruiken cookies om inhoud te personaliseren, verkeer te analyseren en relevante advertenties weer te geven. U kunt uw voorkeuren hieronder aanpassen of alles accepteren/weigeren."
                  )}
                </p>
                <div className="flex items-center gap-4">
                  <LocalizedNavLink
                    to="/cookie-policy"
                    className="text-sm text-primary underline hover:text-primary/80 transition-colors"
                  >
                    {t(
                      "Cookie Policy",
                      "Politique de cookies",
                      "Política de cookies",
                      "Política de Cookies",
                      "Cookie 政策",
                      "سياسة الكوكيز",
                      "Politica sui cookie",
                      "Cookie-Richtlinie",
                      "Cookiebeleid"
                    )}
                  </LocalizedNavLink>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {showDetails
                      ? t("Hide options", "Masquer les options", "Ocultar opciones", "Ocultar opções", "隐藏选项", "إخفاء الخيارات", "Nascondi opzioni", "Optionen ausblenden", "Opties verbergen")
                      : t("Customize", "Personnaliser", "Personalizar", "Personalizar", "自定义", "تخصيص", "Personalizza", "Anpassen", "Aanpassen")}
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Granular Options */}
            {showDetails && (
              <div className="grid gap-3 rounded-xl bg-muted/50 p-4 md:grid-cols-2">
                {/* Essential Cookies - Always enabled */}
                <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("Essential", "Essentiels", "Esenciales", "Essenciais", "必需", "ضرورية", "Essenziali", "Erforderlich", "Essentieel")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "Required for the website to function properly.",
                        "Nécessaires au bon fonctionnement du site.",
                        "Requeridas para el funcionamiento del sitio.",
                        "Necessários para o funcionamento do site.",
                        "网站正常运行所必需。",
                        "ضرورية لعمل الموقع بشكل صحيح.",
                        "Necessari per il corretto funzionamento del sito.",
                        "Erforderlich für die ordnungsgemäße Funktion der Website.",
                        "Vereist voor de goede werking van de website."
                      )}
                    </p>
                  </div>
                  <Switch checked={true} disabled className="opacity-50" />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("Analytics", "Analytiques", "Analíticas", "Analíticos", "分析", "تحليلية", "Analitici", "Analyse", "Analytisch")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "Help us understand how visitors use the site.",
                        "Nous aident à comprendre comment les visiteurs utilisent le site.",
                        "Nos ayudan a entender cómo los visitantes usan el sitio.",
                        "Ajudam-nos a entender como os visitantes usam o site.",
                        "帮助我们了解访问者如何使用网站。",
                        "تساعدنا على فهم كيفية استخدام الزوار للموقع.",
                        "Ci aiutano a capire come i visitatori usano il sito.",
                        "Helfen uns zu verstehen, wie Besucher die Website nutzen.",
                        "Helpen ons begrijpen hoe bezoekers de site gebruiken."
                      )}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => updatePreference("analytics", checked)}
                  />
                </div>

                {/* Advertising Cookies */}
                <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("Advertising", "Publicitaires", "Publicidad", "Publicidade", "广告", "إعلانية", "Pubblicitari", "Werbung", "Advertenties")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "Used to show relevant ads and measure their effectiveness.",
                        "Utilisés pour afficher des publicités pertinentes et mesurer leur efficacité.",
                        "Utilizadas para mostrar anuncios relevantes y medir su efectividad.",
                        "Usados para mostrar anúncios relevantes e medir sua eficácia.",
                        "用于显示相关广告并衡量其效果。",
                        "تُستخدم لعرض إعلانات ذات صلة وقياس فعاليتها.",
                        "Utilizzati per mostrare annunci pertinenti e misurarne l'efficacia.",
                        "Werden verwendet, um relevante Werbung anzuzeigen und deren Wirksamkeit zu messen.",
                        "Gebruikt om relevante advertenties te tonen en hun effectiviteit te meten."
                      )}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.advertising}
                    onCheckedChange={(checked) => updatePreference("advertising", checked)}
                  />
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between gap-4 rounded-lg bg-background/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("Functional", "Fonctionnels", "Funcionales", "Funcionais", "功能", "وظيفية", "Funzionali", "Funktional", "Functioneel")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "Remember your preferences (language, display settings).",
                        "Mémorisent vos préférences (langue, paramètres d'affichage).",
                        "Recuerdan sus preferencias (idioma, configuración de visualización).",
                        "Lembram suas preferências (idioma, configurações de exibição).",
                        "记住您的偏好设置（语言、显示设置）。",
                        "تتذكر تفضيلاتك (اللغة، إعدادات العرض).",
                        "Ricordano le tue preferenze (lingua, impostazioni di visualizzazione).",
                        "Merken sich Ihre Einstellungen (Sprache, Anzeigeeinstellungen).",
                        "Onthouden uw voorkeuren (taal, weergave-instellingen)."
                      )}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(checked) => updatePreference("functional", checked)}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="whitespace-nowrap"
              >
                {t(
                  "Reject All",
                  "Tout refuser",
                  "Rechazar todo",
                  "Rejeitar tudo",
                  "全部拒绝",
                  "رفض الكل",
                  "Rifiuta tutto",
                  "Alle ablehnen",
                  "Alles weigeren"
                )}
              </Button>
              {showDetails && (
                <Button
                  variant="secondary"
                  onClick={handleSavePreferences}
                  className="whitespace-nowrap"
                >
                  {t(
                    "Save Preferences",
                    "Enregistrer les préférences",
                    "Guardar preferencias",
                    "Salvar preferências",
                    "保存偏好",
                    "حفظ التفضيلات",
                    "Salva preferenze",
                    "Einstellungen speichern",
                    "Voorkeuren opslaan"
                  )}
                </Button>
              )}
              <Button
                variant="hero"
                onClick={handleAcceptAll}
                className="whitespace-nowrap"
              >
                {t(
                  "Accept All",
                  "Tout accepter",
                  "Aceptar todo",
                  "Aceitar tudo",
                  "全部接受",
                  "قبول الكل",
                  "Accetta tutto",
                  "Alle akzeptieren",
                  "Alles accepteren"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
