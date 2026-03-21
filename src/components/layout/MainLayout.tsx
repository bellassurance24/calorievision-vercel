import { PropsWithChildren, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Bell } from "lucide-react";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage, Language, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

import { WavingFlag } from "@/components/WavingFlag";
import CookieConsentBanner, { reopenCookieConsent } from "@/components/CookieConsentBanner";
import { getBlogLangSlugMap } from "@/utils/blogLangSlugStore";
import { supabase } from "@/integrations/supabase/client";
import { removeLanguagePrefix } from "@/hooks/useLocalizedPath";
import { NotificationPermissionPopup } from "@/components/NotificationPermissionPopup";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { InstallPrompt } from "@/components/InstallPrompt";

const MainLayout = ({
  children
}: PropsWithChildren) => {
  const {
    language,
    setLanguage
  } = useLanguage();
  const {
    logoSize,
    logoAlignment
  } = useBranding();
  const { user, isAdmin, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const navLabels = {
    en: {
      tagline: "Meal insight, not medical advice",
      home: "Home",
      analyze: "Analyze",
      howItWorks: "How it works",
      faq: "FAQ",
      about: "About",
      contact: "Contact",
      blog: "Blog",
      pricing: "Pricing",
      analyzeCta: "Analyze a meal",
      howItWorksCta: "How it works",
      brandingSettingsAria: "Open branding settings"
    },
    fr: {
      tagline: "Analyse de repas, sans avis médical",
      home: "Accueil",
      analyze: "Analyser",
      howItWorks: "Comment ça marche",
      faq: "FAQ",
      about: "À propos",
      contact: "Contact",
      blog: "Blog",
      pricing: "Tarifs",
      analyzeCta: "Analyser un repas",
      howItWorksCta: "Comment ça marche",
      brandingSettingsAria: "Ouvrir les paramètres de branding"
    },
    es: {
      tagline: "Análisis de comidas, no consejo médico",
      home: "Inicio",
      analyze: "Analizar",
      howItWorks: "Cómo funciona",
      faq: "Preguntas",
      about: "Acerca de",
      contact: "Contacto",
      blog: "Blog",
      pricing: "Precios",
      analyzeCta: "Analizar una comida",
      howItWorksCta: "Cómo funciona",
      brandingSettingsAria: "Abrir los ajustes de marca"
    },
    pt: {
      tagline: "Análise de refeições, sem aconselhamento médico",
      home: "Início",
      analyze: "Analisar",
      howItWorks: "Como funciona",
      faq: "Perguntas",
      about: "Sobre",
      contact: "Contacto",
      blog: "Blog",
      pricing: "Preços",
      analyzeCta: "Analisar uma refeição",
      howItWorksCta: "Como funciona",
      brandingSettingsAria: "Abrir as configurações de marca"
    },
    zh: {
      tagline: "膳食洞察，而非医疗建议",
      home: "首页",
      analyze: "分析",
      howItWorks: "工作原理",
      faq: "常见问题",
      about: "关于",
      contact: "联系",
      blog: "博客",
      pricing: "定价",
      analyzeCta: "分析一餐",
      howItWorksCta: "了解工作原理",
      brandingSettingsAria: "打开品牌设置"
    },
    ar: {
      tagline: "رؤية أوضح لوجبتك، وليست نصيحة طبية",
      home: "الرئيسية",
      analyze: "تحليل",
      howItWorks: "كيف يعمل",
      faq: "الأسئلة الشائعة",
      about: "من نحن",
      contact: "اتصل بنا",
      blog: "المدونة",
      pricing: "الأسعار",
      analyzeCta: "حلّل وجبة",
      howItWorksCta: "كيف يعمل",
      brandingSettingsAria: "فتح إعدادات الهوية البصرية"
    },
    it: {
      tagline: "Analisi del pasto, non consigli medici",
      home: "Inizio",
      analyze: "Analizza",
      howItWorks: "Come funziona",
      faq: "FAQ",
      about: "Chi siamo",
      contact: "Contatti",
      blog: "Blog",
      pricing: "Prezzi",
      analyzeCta: "Analizza un pasto",
      howItWorksCta: "Come funziona",
      brandingSettingsAria: "Apri le impostazioni del branding"
    },
    de: {
      tagline: "Mahlzeit-Einblicke, keine medizinische Beratung",
      home: "Startseite",
      analyze: "Analysieren",
      howItWorks: "So funktioniert's",
      faq: "FAQ",
      about: "Über uns",
      contact: "Kontakt",
      blog: "Blog",
      pricing: "Preise",
      analyzeCta: "Mahlzeit analysieren",
      howItWorksCta: "So funktioniert's",
      brandingSettingsAria: "Branding-Einstellungen öffnen"
    },
    nl: {
      tagline: "Maaltijdinzicht, geen medisch advies",
      home: "Home",
      analyze: "Analyseren",
      howItWorks: "Hoe het werkt",
      faq: "FAQ",
      about: "Over ons",
      contact: "Contact",
      blog: "Blog",
      pricing: "Prijzen",
      analyzeCta: "Analyseer een maaltijd",
      howItWorksCta: "Hoe het werkt",
      brandingSettingsAria: "Huisstijl instellingen openen"
    },
    ru: {
      tagline: "Анализ питания, не медицинская консультация",
      home: "Главная",
      analyze: "Анализ",
      howItWorks: "Как это работает",
      faq: "FAQ",
      about: "О нас",
      contact: "Контакты",
      blog: "Блог",
      pricing: "Цены",
      analyzeCta: "Анализировать блюдо",
      howItWorksCta: "Как это работает",
      brandingSettingsAria: "Открыть настройки бренда"
    },
    ja: {
      tagline: "食事の分析、医療アドバイスではありません",
      home: "ホーム",
      analyze: "分析",
      howItWorks: "使い方",
      faq: "よくある質問",
      about: "概要",
      contact: "お問い合わせ",
      blog: "ブログ",
      pricing: "料金",
      analyzeCta: "食事を分析する",
      howItWorksCta: "使い方を見る",
      brandingSettingsAria: "ブランド設定を開く"
    }
  } as const;
  const current = navLabels[language];
  const languageCode = language.toUpperCase();

  // Flag images paths for waving flags
  const flagImages: Record<string, string> = {
    en: "/flags/waving/us.png",
    fr: "/flags/waving/fr.png",
    es: "/flags/waving/es.png",
    pt: "/flags/waving/pt.png",
    zh: "/flags/waving/cn.png",
    ar: "/flags/waving/sa.png",
    it: "/flags/waving/it.png",
    de: "/flags/waving/de.png",
    nl: "/flags/waving/nl.png",
    ru: "/flags/waving/ru.png",
    ja: "/flags/waving/jp.png"
  };

  const languageNames: Record<Language, string> = {
    en: "English",
    fr: "Français",
    es: "Español",
    pt: "Português",
    zh: "中文",
    ar: "العربية",
    it: "Italiano",
    de: "Deutsch",
    nl: "Nederlands",
    ru: "Русский",
    ja: "日本語"
  };

  const isRTL = language === "ar";
  const logoSizeClass = logoSize === "sm" ? "h-5 md:h-6" : logoSize === "lg" ? "h-12 md:h-14" : "h-8 md:h-10";
  const logoWrapperPadding = logoSize === "sm" ? "px-2 py-1" : logoSize === "lg" ? "px-5 py-4" : "px-3 py-2";
  const logoContainerClasses = cn("flex flex-col items-start gap-1.5 md:gap-2", logoAlignment === "center" && "items-center text-center");

  // Check if current page is a legal page (no side ads on legal pages)
  const currentPath = removeLanguagePrefix(location.pathname);
  const isLegalPage = ['/privacy-policy', '/terms', '/disclaimer', '/cookie-policy'].includes(currentPath);

  // Animation state for language change
  const [isAnimating, setIsAnimating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Belt-and-suspenders: main.tsx already kills the overlay synchronously,
  // this catches any edge case where the element reappears after hydration.
  useEffect(() => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [language]);

  // Handle language change - update URL with new language prefix
  const handleLanguageChange = async (newLang: Language) => {
    const cleanPath = removeLanguagePrefix(location.pathname);

    // On blog post pages, resolve the correct slug for the target language
    const blogPostMatch = cleanPath.match(/^\/blog\/(.+)$/);
    if (blogPostMatch) {
      const currentSlug = decodeURIComponent(blogPostMatch[1]);

      // Fast path: use the cached langSlugMap from BlogPost (stores base slugs)
      const slugMap = getBlogLangSlugMap();
      const cachedSlug = slugMap[newLang];
      if (cachedSlug) {
        setLanguage(newLang);
        navigate(`/${newLang}/blog/${encodeURIComponent(cachedSlug)}`, { replace: true });
        return;
      }

      // Slow path: query DB to find base slug, then check if target language exists
      // Step 1: resolve currentSlug → base slug
      let baseSlug: string | null = null;

      // Try slug column first (most URLs now use the base slug)
      const { data: bySlug } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("slug", currentSlug)
        .eq("status", "published")
        .limit(1)
        .maybeSingle();
      baseSlug = bySlug?.slug ?? null;

      if (!baseSlug) {
        // Fallback: maybe the URL still has a localized_slug
        const { data: byLocalized } = await supabase
          .from("blog_posts")
          .select("slug")
          .eq("localized_slug", currentSlug)
          .eq("status", "published")
          .limit(1)
          .maybeSingle();
        baseSlug = byLocalized?.slug ?? null;
      }

      // Step 2: check if target language translation exists
      if (baseSlug) {
        const { data: target } = await supabase
          .from("blog_posts")
          .select("slug")
          .eq("slug", baseSlug)
          .eq("language", newLang)
          .eq("status", "published")
          .maybeSingle();

        if (target) {
          // Translation exists — navigate using the base slug (BlogPost finds it)
          setLanguage(newLang);
          navigate(`/${newLang}/blog/${encodeURIComponent(baseSlug)}`, { replace: true });
          return;
        } else {
          // No translation for this language — redirect to blog home
          setLanguage(newLang);
          navigate(`/${newLang}/blog`, { replace: true });
          return;
        }
      }

      // Couldn't resolve slug at all — navigate with current slug, let BlogPost handle it
      setLanguage(newLang);
      navigate(`/${newLang}/blog/${encodeURIComponent(currentSlug)}`, { replace: true });
      return;
    }

    const newPath = `/${newLang}${cleanPath === "/" ? "" : cleanPath}`;
    setLanguage(newLang);
    navigate(newPath + location.search + location.hash, { replace: true });
  };

  return <div className="min-h-screen bg-hero" dir={isRTL ? "rtl" : "ltr"}>

    <div className="page-shell rounded-sm">
      <header className={cn("glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary to-accent px-3 py-2 text-primary-foreground md:flex-nowrap md:gap-4 md:rounded-full md:px-6 md:py-3", isRTL && "flex-row-reverse")}>

        {/* Logo and App Name */}
        <LocalizedNavLink to="/" className="flex items-center gap-2 shrink-0">
          <img src="/gauge-logo.webp" className="h-7 w-7 md:h-8 md:w-8 object-contain" alt="" aria-hidden="true" />
          <span className="text-lg font-bold md:text-xl">CalorieVision</span>
        </LocalizedNavLink>


        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium md:flex md:text-base">
          <LocalizedNavLink to="/" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
            {current.home}
          </LocalizedNavLink>
          <LocalizedNavLink to="/about" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
            {current.about}
          </LocalizedNavLink>
          <LocalizedNavLink to="/how-it-works" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
            {current.howItWorks}
          </LocalizedNavLink>
          <LocalizedNavLink to="/blog" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
            {current.blog}
          </LocalizedNavLink>
          <LocalizedNavLink to="/faq" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
            {current.faq}
          </LocalizedNavLink>
          <LocalizedNavLink to="/pricing" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
            {current.pricing}
          </LocalizedNavLink>
          <LocalizedNavLink to="/contact" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
            {current.contact}
          </LocalizedNavLink>
        </nav>

        <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-primary-foreground min-w-[44px] min-h-[44px]"
                aria-label={language === "fr" ? "Ouvrir le menu" : "Open menu"}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-[280px] bg-background">
              <nav className="flex flex-col gap-4 mt-8">
                <LocalizedNavLink to="/" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors">
                  {current.home}
                </LocalizedNavLink>
                <LocalizedNavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors">
                  {current.about}
                </LocalizedNavLink>
                <LocalizedNavLink to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors">
                  {current.howItWorks}
                </LocalizedNavLink>
                <LocalizedNavLink to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors">
                  {current.blog}
                </LocalizedNavLink>
                <LocalizedNavLink to="/faq" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors">
                  {current.faq}
                </LocalizedNavLink>
                <LocalizedNavLink to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors">
                  {current.pricing}
                </LocalizedNavLink>
                <LocalizedNavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors">
                  {current.contact}
                </LocalizedNavLink>
                {user && (
                  <LocalizedNavLink to="/notification-settings" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-lg font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    {language === "fr" ? "Notifications" : "Notifications"}
                  </LocalizedNavLink>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="inline-flex items-center gap-1.5 rounded-full px-3 md:px-4" aria-label={`Changer de langue (actuelle : ${languageCode})`}>
                <WavingFlag src={flagImages[language]} alt={`${languageCode} flag`} size="sm" />
                <span className="text-sm font-medium uppercase tracking-[0.16em]">{languageCode}</span>
                <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px] p-2 bg-background border border-border shadow-xl z-[9999]">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
                    language === lang ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <WavingFlag src={flagImages[lang]} alt={`${lang.toUpperCase()} flag`} size="md" />
                  <span className="text-base font-medium">{languageNames[lang]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* Notification Bell - separate flex child, pushed to far right on mobile */}
        <div className={cn("flex items-center shrink-0", isRTL ? "mr-auto" : "ml-auto md:ml-0")}>
          <NotificationDropdown />
        </div>
      </header>

      <main
        className={cn(
          "mt-6 flex-1 space-y-6 md:mt-10 md:space-y-8 lg:space-y-10 transition-all duration-300",
          isAnimating ? "animate-fade-in" : ""
        )}
      >
        {children}
      </main>

      <footer className={cn("mt-8 border-t border-primary/40 bg-gradient-to-r from-primary to-accent px-3 py-3 text-[11px] text-primary-foreground md:mt-12 md:px-6 md:py-4 md:text-xs lg:mt-16 lg:py-5 lg:text-sm", language === "ru" ? "rounded-2xl" : "rounded-2xl md:rounded-full", isRTL && "text-right")}>
        <div className={cn("flex w-full flex-wrap gap-y-2 text-[11px] md:text-xs lg:text-sm", language === "ru" ? "flex-col items-center text-center" : "items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className="flex items-center gap-2">
            <img src="/gauge-logo.webp" className="h-5 w-5 md:h-6 md:w-6 object-contain" alt="CalorieVision" />
            <p className="font-medium text-primary-foreground/90">
              © 2025 CalorieVision – All Rights Reserved.
            </p>
          </div>
          <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 md:gap-x-4", language === "ru" ? "justify-center" : "justify-end", isRTL && "flex-row-reverse")}>
            <LocalizedNavLink to="/contact" className="transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
              {current.contact}
            </LocalizedNavLink>
            <LocalizedNavLink to="/blog" className="transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
              {current.blog}
            </LocalizedNavLink>
            <LocalizedNavLink to="/privacy-policy" className="transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
              {language === "fr" ? "Politique de confidentialité" : language === "es" ? "Política de privacidad" : language === "pt" ? "Política de privacidade" : language === "zh" ? "隐私政策" : language === "ar" ? "سياسة الخصوصية" : language === "it" ? "Informativa sulla privacy" : language === "de" ? "Datenschutzrichtlinie" : language === "nl" ? "Privacybeleid" : language === "ru" ? "Политика конфиденциальности" : language === "ja" ? "プライバシーポリシー" : "Privacy Policy"}
            </LocalizedNavLink>
            <LocalizedNavLink to="/terms" className="transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
              {language === "fr" ? "Conditions d'utilisation" : language === "es" ? "Términos y condiciones" : language === "pt" ? "Termos e condições" : language === "zh" ? "使用条款" : language === "ar" ? "الشروط والأحكام" : language === "it" ? "Termini e condizioni" : language === "de" ? "Nutzungsbedingungen" : language === "nl" ? "Voorwaarden" : language === "ru" ? "Условия использования" : language === "ja" ? "利用規約" : "Terms"}
            </LocalizedNavLink>
            <LocalizedNavLink to="/disclaimer" className="transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
              {language === "fr" ? "Avertissement" : language === "es" ? "Aviso legal" : language === "pt" ? "Aviso de responsabilidade" : language === "zh" ? "免责声明" : language === "ar" ? "إخلاء المسؤولية" : language === "it" ? "Avvertenza" : language === "de" ? "Haftungsausschluss" : language === "nl" ? "Disclaimer" : language === "ru" ? "Отказ от ответственности" : language === "ja" ? "免責事項" : "Disclaimer"}
            </LocalizedNavLink>
            <LocalizedNavLink to="/cookie-policy" className="transition-colors hover:text-primary-foreground" activeClassName="text-primary-foreground">
              {language === "fr" ? "Politique de cookies" : language === "es" ? "Política de cookies" : language === "pt" ? "Política de cookies" : language === "zh" ? "Cookie 政策" : language === "ar" ? "سياسة الكوكيز" : language === "it" ? "Politica sui cookie" : language === "de" ? "Cookie-Richtlinie" : language === "nl" ? "Cookiebeleid" : language === "ru" ? "Политика cookies" : language === "ja" ? "Cookieポリシー" : "Cookie Policy"}
            </LocalizedNavLink>
            <button
              onClick={reopenCookieConsent}
              className="transition-colors hover:text-primary-foreground cursor-pointer"
            >
              {language === "fr" ? "Gérer les cookies" : language === "es" ? "Gestionar cookies" : language === "pt" ? "Gerir cookies" : language === "zh" ? "管理 Cookie" : language === "ar" ? "إدارة الكوكيز" : language === "it" ? "Gestisci cookie" : language === "de" ? "Cookies verwalten" : language === "nl" ? "Cookies beheren" : language === "ru" ? "Управление cookies" : language === "ja" ? "Cookieの管理" : "Manage Cookies"}
            </button>
          </div>
        </div>
      </footer>
    </div>

    {/* Cookie Consent Banner */}
    <CookieConsentBanner />

    {/* Install Prompt - shows once until app is installed */}
    <InstallPrompt />

    {/* Notification Permission Popup - shows after app usage */}
    <NotificationPermissionPopup />
  </div>;
};
export default MainLayout;
