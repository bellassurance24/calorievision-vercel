import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { ScrollAnimation } from "@/components/ScrollAnimation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";

const Pricing = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null); // plan id being processed
  const [verifying, setVerifying] = useState(false);

  const t = (en: string, fr: string, es: string, pt?: string, zh?: string, ar?: string, it?: string, de?: string, nl?: string, ru?: string, ja?: string) => {
    if (language === "fr") return fr;
    if (language === "es") return es;
    if (language === "pt") return pt ?? en;
    if (language === "zh") return zh ?? en;
    if (language === "ar") return ar ?? en;
    if (language === "it") return it ?? en;
    if (language === "de") return de ?? en;
    if (language === "nl") return nl ?? en;
    if (language === "ru") return ru ?? en;
    if (language === "ja") return ja ?? en;
    return en;
  };

  // ── Stripe success redirect handler ────────────────────────────────────────
  // When Stripe redirects to /pricing?checkout=success&session_id=cs_...,
  // we call verify-checkout-session to write the subscription row immediately.
  // This is the primary activation path — webhooks are only a backup.
  useEffect(() => {
    const checkout  = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");

    // Allow guests (no user?.id) — the Edge Function resolves identity from Stripe email
    if (checkout !== "success" || !sessionId || verifying) return;

    setVerifying(true);

    supabase.functions
      .invoke("verify-checkout-session", {
        body: {
          sessionId,
          // Pass userId only if already logged in; otherwise the function will
          // find-or-create the account from the Stripe customer email.
          userId: user?.id ?? null,
          origin: window.location.origin,
        },
      })
      .then(({ data, error }) => {
        if (error || !data?.success) {
          console.error("[Pricing] verify-checkout-session error:", error ?? data);
          toast({
            title: t(
              "Activation issue",
              "Problème d'activation",
              "Problema de activación",
              "Problema de ativação",
              "激活问题",
              "مشكلة في التفعيل",
              "Problema di attivazione",
              "Aktivierungsproblem",
              "Activeringsprobleem",
              "Ошибка активации",
              "アクティベーションエラー",
            ),
            description: t(
              "Your payment was received but we couldn't activate your plan automatically. Please contact support@calorievision.online.",
              "Votre paiement a été reçu mais nous n'avons pas pu activer votre plan. Contactez support@calorievision.online.",
              "Tu pago fue recibido pero no pudimos activar tu plan. Contacta support@calorievision.online.",
              "Seu pagamento foi recebido, mas não conseguimos ativar seu plano. Contate support@calorievision.online.",
              "您的付款已收到，但我们无法自动激活您的计划。请联系 support@calorievision.online。",
              "تم استلام دفعتك لكن تعذّر تفعيل خطتك. تواصل مع support@calorievision.online.",
              "Il pagamento è stato ricevuto ma non siamo riusciti ad attivare il piano. Contatta support@calorievision.online.",
              "Ihre Zahlung wurde empfangen, aber wir konnten Ihren Plan nicht aktivieren. Bitte kontaktieren Sie support@calorievision.online.",
              "Uw betaling is ontvangen maar we konden uw plan niet activeren. Neem contact op via support@calorievision.online.",
              "Платёж получен, но мы не смогли активировать план. Напишите на support@calorievision.online.",
              "お支払いは完了しましたが、プランをアクティベートできませんでした。support@calorievision.online にお問い合わせください。",
            ),
            variant: "destructive",
          });
          // Still clean the URL
          navigate(window.location.pathname, { replace: true });
          return;
        }

        const plan      = (data.plan as string) ?? "pro";
        const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

        // ── If the function returned a magic link → auto-login the user ──
        // (only happens for guests who weren't logged in before payment)
        if (data.magicLink) {
          toast({
            title: t(
              `🎉 ${planLabel} plan activated!`,
              `🎉 Plan ${planLabel} activé !`,
              `🎉 ¡Plan ${planLabel} activado!`,
              `🎉 Plano ${planLabel} ativado!`,
              `🎉 ${planLabel} 计划已激活！`,
              `🎉 تم تفعيل خطة ${planLabel}!`,
              `🎉 Piano ${planLabel} attivato!`,
              `🎉 ${planLabel}-Plan aktiviert!`,
              `🎉 ${planLabel}-plan geactiveerd!`,
              `🎉 План ${planLabel} активирован!`,
              `🎉 ${planLabel}プランが有効になりました！`,
            ),
            description: t(
              "Signing you in automatically…",
              "Connexion automatique en cours…",
              "Iniciando sesión automáticamente…",
              "Fazendo login automaticamente…",
              "正在自动登录…",
              "جارٍ تسجيل الدخول تلقائياً…",
              "Accesso automatico in corso…",
              "Automatische Anmeldung läuft…",
              "Automatisch inloggen…",
              "Выполняется автоматический вход…",
              "自動ログイン中…",
            ),
          });
          // Navigate to magic link → Supabase logs the user in → redirects to /analyze
          window.location.href = data.magicLink;
          return;
        }

        // ── Already logged in user ──────────────────────────────────────────
        toast({
          title: t(
            `🎉 ${planLabel} plan activated!`,
            `🎉 Plan ${planLabel} activé !`,
            `🎉 ¡Plan ${planLabel} activado!`,
            `🎉 Plano ${planLabel} ativado!`,
            `🎉 ${planLabel} 计划已激活！`,
            `🎉 تم تفعيل خطة ${planLabel}!`,
            `🎉 Piano ${planLabel} attivato!`,
            `🎉 ${planLabel}-Plan aktiviert!`,
            `🎉 ${planLabel}-plan geactiveerd!`,
            `🎉 План ${planLabel} активирован!`,
            `🎉 ${planLabel}プランが有効になりました！`,
          ),
          description: t(
            "Welcome! Your subscription is now active. Happy scanning!",
            "Bienvenue ! Votre abonnement est maintenant actif. Bonne analyse !",
            "¡Bienvenido! Tu suscripción ya está activa. ¡Disfruta!",
            "Bem-vindo! Sua assinatura já está ativa. Bom uso!",
            "欢迎！您的订阅现已激活，开始扫描吧！",
            "مرحباً! اشتراكك أصبح نشطاً. استمتع بالمسح!",
            "Benvenuto! Il tuo abbonamento è ora attivo. Buona scansione!",
            "Willkommen! Ihr Abonnement ist jetzt aktiv. Viel Spaß beim Scannen!",
            "Welkom! Uw abonnement is nu actief. Veel scan-plezier!",
            "Добро пожаловать! Ваша подписка активна. Удачных сканирований!",
            "ようこそ！サブスクリプションが有効になりました。スキャンをお楽しみください！",
          ),
        });
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Purchase', { currency: 'USD', value: 0 });
        }
        navigate(window.location.pathname, { replace: true });
      })
      .finally(() => setVerifying(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // intentionally omit user?.id — run when URL params change

  usePageMetadata({
    title: t(
      "CalorieVision Pricing – Starter, Pro & Ultimate",
      "Tarifs CalorieVision – Starter, Pro et Ultimate",
      "Precios de CalorieVision – Starter, Pro y Ultimate",
      "Preços CalorieVision – Starter, Pro e Ultimate",
      "CalorieVision 定价 – Starter、Pro 和 Ultimate",
      "أسعار CalorieVision – Starter وPro وUltimate",
      "Prezzi CalorieVision – Starter, Pro e Ultimate",
      "CalorieVision Preise – Starter, Pro & Ultimate",
      "CalorieVision Prijzen – Starter, Pro & Ultimate",
      "Цены CalorieVision – Starter, Pro и Ultimate",
      "CalorieVision 料金 – Starter・Pro・Ultimate",
    ),
    description: t(
      "Choose the plan that fits your nutrition goals. Free Starter, Pro with 1,000 scans/month, or Ultimate with unlimited access.",
      "Choisissez le plan adapté à vos objectifs. Starter gratuit, Pro avec 1 000 analyses/mois ou Ultimate illimité.",
      "Elige el plan que se adapte a tus objetivos. Starter gratis, Pro con 1.000 análisis/mes o Ultimate ilimitado.",
      "Escolha o plano adequado. Starter grátis, Pro com 1.000 análises/mês ou Ultimate ilimitado.",
      "选择适合您营养目标的计划。免费Starter、每月1,000次扫描的Pro或无限Ultimate。",
      "اختر الخطة التي تناسب أهدافك. Starter مجاني أو Pro بـ 1,000 مسح/شهر أو Ultimate غير محدود.",
      "Scegli il piano adatto ai tuoi obiettivi. Starter gratuito, Pro con 1.000 scansioni/mese o Ultimate illimitato.",
      "Wählen Sie den passenden Plan. Kostenloser Starter, Pro mit 1.000 Scans/Monat oder Ultimate unbegrenzt.",
      "Kies het plan dat past bij uw doelen. Gratis Starter, Pro met 1.000 scans/maand of onbeperkte Ultimate.",
      "Выберите подходящий план. Бесплатный Starter, Pro с 1 000 сканированиями/мес. или безлимитный Ultimate.",
      "目標に合ったプランを選択。無料Starter、月1,000回スキャンのPro、または無制限のUltimate。",
    ),
    path: "/pricing",
  });

  // ── Price ID map (Vite env vars — set in Vercel project settings) ──────────
  // NOTE: These are NOT secrets — Stripe price IDs are public catalog identifiers.
  // Add VITE_STRIPE_PRICE_* to your Vercel project → Settings → Environment Variables.
  const PRICE_IDS = {
    pro: {
      monthly:  import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY  as string | undefined,
      yearly:   import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY   as string | undefined,
    },
    ultimate: {
      monthly:  import.meta.env.VITE_STRIPE_PRICE_ULTIMATE_MONTHLY as string | undefined,
      yearly:   import.meta.env.VITE_STRIPE_PRICE_ULTIMATE_YEARLY  as string | undefined,
    },
  } as const;

  // ── Stripe Checkout handler ─────────────────────────────────────────────────
  const handleCheckout = async (planId: "pro" | "ultimate", cycle: "monthly" | "yearly") => {
    if (checkoutLoading) return;

    // Single getSession() call. autoRefreshToken=true on the client keeps the
    // token fresh automatically — never call refreshSession() manually here
    // (causes lock conflicts and 429 rate-limit loops on the token endpoint).
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      navigate("/auth?returnTo=/pricing");
      return;
    }

    const priceId = planId === "pro"
      ? (cycle === "yearly" ? PRICE_IDS.pro.yearly   : PRICE_IDS.pro.monthly)
      : (cycle === "yearly" ? PRICE_IDS.ultimate.yearly : PRICE_IDS.ultimate.monthly);

    if (!priceId) {
      toast({
        title: t("Configuration error", "Erreur de configuration", "Error de configuración", "Erro de configuração", "配置错误", "خطأ في الإعداد", "Errore di configurazione", "Konfigurationsfehler", "Configuratiefout", "Ошибка конфигурации", "設定エラー"),
        description: "Stripe price ID is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setCheckoutLoading(planId);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { planType: planId, billingCycle: cycle, priceId, origin: window.location.origin, locale: language },
      });

      if (error || !data?.url) {
        const httpStatus = (error as any)?.context?.status as number | undefined;
        // We only reach this block after getSession() already returned a valid token.
        // A 401 here means the edge function rejected a server-side validated token.
        // Do NOT redirect to /auth: that creates an infinite loop.
        // Show a toast so the user stays on the page.
        toast({
          title: t("Payment error", "Erreur de paiement", "Error de pago", "Erro no pagamento", "支付错误", "خطأ في الدفع", "Errore pagamento", "Zahlungsfehler", "Betalingsfout", "Ошибка оплаты", "決済エラー"),
          description: httpStatus === 401
            ? t("⚠️ Checkout service error — please try again.", "⚠️ Erreur du service de paiement — veuillez réessayer.", "⚠️ Error en el servicio de pago — inténtelo de nuevo.", "⚠️ Erro no serviço de pagamento — tente novamente.", "⚠️ 结账服务错误，请重试。", "⚠️ خطأ في خدمة الدفع — أعد المحاولة.", "⚠️ Errore servizio pagamento — riprova.", "⚠️ Zahlungsdienst-Fehler — bitte erneut versuchen.", "⚠️ Betaalfout — probeer opnieuw.", "⚠️ Ошибка сервиса — повторите попытку.", "⚠️ 決済サービスエラー — 再試行してください。")
            : (error as any)?.message ?? t("Checkout failed. Please try again.", "Échec du paiement. Veuillez réessayer.", "Error en el pago. Inténtelo de nuevo.", "Falha no pagamento. Tente novamente.", "结账失败，请重试。", "فشل الدفع. يرجى المحاولة مجدداً.", "Pagamento fallito. Riprova.", "Zahlung fehlgeschlagen. Bitte erneut versuchen.", "Betaling mislukt. Probeer het opnieuw.", "Ошибка оплаты. Повторите попытку.", "決済に失敗しました。もう一度お試しください。"),
          variant: "destructive",
        });
        return;
      }

      // Facebook Pixel: track checkout initiation
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
          value: planId === 'pro' ? 5.99 : 12.99,
          currency: 'USD',
        });
      }

      window.location.href = data.url;
    } catch (e: any) {
      toast({
        title: t("Unexpected error", "Erreur inattendue", "Error inesperado", "Erro inesperado", "意外错误", "خطأ غير متوقع", "Errore imprevisto", "Unerwarteter Fehler", "Onverwachte fout", "Непредвиденная ошибка", "予期しないエラー"),
        description: e?.message ?? "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const plans = [
    {
      id: "starter",
      name: t("Starter", "Starter", "Starter", "Starter", "入门版", "Starter", "Starter", "Starter", "Starter", "Starter", "スターター"),
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: t(
        "Perfect for occasional use.",
        "Parfait pour une utilisation occasionnelle.",
        "Perfecto para uso ocasional.",
        "Perfeito para uso ocasional.",
        "适合偶尔使用。",
        "مثالي للاستخدام العرضي.",
        "Perfetto per l'uso occasionale.",
        "Perfekt für gelegentliche Nutzung.",
        "Perfect voor occasioneel gebruik.",
        "Идеально для периодического использования.",
        "たまに使う方に最適。",
      ),
      cta: t("Get started free", "Commencer gratuitement", "Empezar gratis", "Começar grátis", "免费开始", "ابدأ مجاناً", "Inizia gratis", "Kostenlos starten", "Gratis beginnen", "Начать бесплатно", "無料で始める"),
      ctaVariant: "outline" as const,
      popular: false,
      features: [
        { text: t("2 AI scans per day", "2 analyses IA par jour", "2 análisis IA por día", "2 análises IA por dia", "每天2次AI扫描", "2 عمليات مسح ذكاء اصطناعي يومياً", "2 scansioni IA al giorno", "2 KI-Scans pro Tag", "2 AI-scans per dag", "2 ИИ-сканирования в день", "1日2回AIスキャン"), included: true },
        { text: t("Basic nutritional breakdown (calories, protein, carbs, fat)", "Analyse nutritionnelle de base (calories, protéines, glucides, lipides)", "Desglose nutricional básico (calorías, proteínas, carbohidratos, grasas)", "Análise nutricional básica (calorias, proteínas, carboidratos, gorduras)", "基本营养分析（卡路里、蛋白质、碳水化合物、脂肪）", "تحليل غذائي أساسي (سعرات حرارية، بروتين، كربوهيدرات، دهون)", "Analisi nutrizionale di base (calorie, proteine, carboidrati, grassi)", "Grundlegende Nährwertanalyse (Kalorien, Protein, Kohlenhydrate, Fett)", "Basis voedingsanalyse (calorieën, eiwitten, koolhydraten, vetten)", "Базовый анализ питания (калории, белки, углеводы, жиры)", "基本栄養分析（カロリー、タンパク質、炭水化物、脂質）"), included: true },
        { text: t("Full blog access", "Accès complet au blog", "Acceso completo al blog", "Acesso completo ao blog", "完整博客访问", "وصول كامل للمدونة", "Accesso completo al blog", "Vollständiger Blog-Zugang", "Volledige blogtoegang", "Полный доступ к блогу", "ブログへのフルアクセス"), included: true },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 5.99,
      yearlyPrice: 4.99,
      description: t(
        "For consistent nutrition tracking.",
        "Pour un suivi nutritionnel régulier.",
        "Para un seguimiento nutricional constante.",
        "Para rastreamento nutricional constante.",
        "用于持续的营养追踪。",
        "لتتبع التغذية المنتظم.",
        "Per un monitoraggio nutrizionale costante.",
        "Für konsequentes Ernährungstracking.",
        "Voor consistent voedingsregistratie.",
        "Для регулярного отслеживания питания.",
        "継続的な栄養管理に。",
      ),
      cta: t("Start Pro", "Commencer Pro", "Empezar Pro", "Começar Pro", "开始Pro", "ابدأ Pro", "Inizia Pro", "Pro starten", "Start Pro", "Начать Pro", "Proを始める"),
      ctaVariant: "hero" as const,
      popular: true,
      features: [
        { text: t("1,000 AI scans per month", "1 000 analyses IA par mois", "1.000 análisis IA por mes", "1.000 análises IA por mês", "每月1,000次AI扫描", "1,000 عملية مسح ذكاء اصطناعي شهرياً", "1.000 scansioni IA al mese", "1.000 KI-Scans pro Monat", "1.000 AI-scans per maand", "1 000 ИИ-сканирований в месяц", "月1,000回AIスキャン"), included: true },
        { text: t("Ad-free experience", "Expérience sans publicité", "Experiencia sin anuncios", "Experiência sem anúncios", "无广告体验", "تجربة بدون إعلانات", "Esperienza senza pubblicità", "Werbefreie Erfahrung", "Advertentievrije ervaring", "Опыт без рекламы", "広告なし体験"), included: true },
        { text: t("Detailed nutritional breakdown", "Analyse nutritionnelle détaillée", "Desglose nutricional detallado", "Análise nutricional detalhada", "详细营养分析", "تحليل غذائي مفصّل", "Analisi nutrizionale dettagliata", "Detaillierte Nährwertanalyse", "Gedetailleerde voedingsanalyse", "Подробный анализ питания", "詳細な栄養分析"), included: true },
        { text: t("Priority email support (support@calorievision.online)", "Support email prioritaire (support@calorievision.online)", "Soporte prioritario por email (support@calorievision.online)", "Suporte prioritário por email (support@calorievision.online)", "优先邮件支持 (support@calorievision.online)", "دعم بريد إلكتروني ذو أولوية (support@calorievision.online)", "Supporto email prioritario (support@calorievision.online)", "Prioritärer E-Mail-Support (support@calorievision.online)", "Prioritaire e-mailondersteuning (support@calorievision.online)", "Приоритетная поддержка по email (support@calorievision.online)", "優先メールサポート (support@calorievision.online)"), included: true },
      ],
    },
    {
      id: "ultimate",
      name: "Ultimate",
      monthlyPrice: 12.99,
      yearlyPrice: 9.99,
      description: t(
        "For serious nutrition enthusiasts.",
        "Pour les passionnés de nutrition sérieux.",
        "Para los entusiastas serios de la nutrición.",
        "Para entusiastas sérios de nutrição.",
        "适合营养爱好者。",
        "لعشاق التغذية الجادين.",
        "Per i veri appassionati di nutrizione.",
        "Für ernsthafte Ernährungsbegeisterte.",
        "Voor serieuze voedingsliefhebbers.",
        "Для серьёзных ценителей питания.",
        "本格的な栄養愛好家のために。",
      ),
      cta: t("Start Ultimate", "Commencer Ultimate", "Empezar Ultimate", "Começar Ultimate", "开始Ultimate", "ابدأ Ultimate", "Inizia Ultimate", "Ultimate starten", "Start Ultimate", "Начать Ultimate", "Ultimateを始める"),
      ctaVariant: "outline" as const,
      popular: false,
      features: [
        { text: t("5,000 AI scans per month", "5 000 analyses IA par mois", "5.000 análisis IA por mes", "5.000 análises IA por mês", "每月5,000次AI扫描", "5,000 عملية مسح ذكاء اصطناعي شهرياً", "5.000 scansioni IA al mese", "5.000 KI-Scans pro Monat", "5.000 AI-scans per maand", "5 000 ИИ-сканирований в месяц", "月5,000回AIスキャン"), included: true },
        { text: t("Ad-free experience", "Expérience sans publicité", "Experiencia sin anuncios", "Experiência sem anúncios", "无广告体验", "تجربة بدون إعلانات", "Esperienza senza pubblicità", "Werbefreie Erfahrung", "Advertentievrije ervaring", "Опыт без рекламы", "広告なし体験"), included: true },
        { text: t("Detailed nutritional breakdown", "Analyse nutritionnelle détaillée", "Desglose nutricional detallado", "Análise nutricional detalhada", "详细营养分析", "تحليل غذائي مفصّل", "Analisi nutrizionale dettagliata", "Detaillierte Nährwertanalyse", "Gedetailleerde voedingsanalyse", "Подробный анализ питания", "詳細な栄養分析"), included: true },
        { text: t("Priority email support (support@calorievision.online)", "Support email prioritaire (support@calorievision.online)", "Soporte prioritario por email (support@calorievision.online)", "Suporte prioritário por email (support@calorievision.online)", "优先邮件支持 (support@calorievision.online)", "دعم بريد إلكتروني ذو أولوية (support@calorievision.online)", "Supporto email prioritario (support@calorievision.online)", "Prioritärer E-Mail-Support (support@calorievision.online)", "Prioritaire e-mailondersteuning (support@calorievision.online)", "Приоритетная поддержка по email (support@calorievision.online)", "優先メールサポート (support@calorievision.online)"), included: true },
      ],
    },
  ];

  const mostPopularLabel = t("Most Popular", "Le plus populaire", "Más popular", "Mais popular", "最受欢迎", "الأكثر شعبية", "Più popolare", "Am beliebtesten", "Meest populair", "Самый популярный", "最人気");
  const monthLabel = t("month", "mois", "mes", "mês", "月", "شهر", "mese", "Monat", "maand", "мес.", "月");
  const freeLabel = t("Free", "Gratuit", "Gratis", "Grátis", "免费", "مجاناً", "Gratuito", "Kostenlos", "Gratis", "Бесплатно", "無料");
  const billedYearlyLabel = t("billed yearly", "facturé annuellement", "facturado anualmente", "faturado anualmente", "按年计费", "يُدفع سنوياً", "fatturato annualmente", "jährlich abgerechnet", "jaarlijks gefactureerd", "оплата ежегодно", "年払い");

  return (
    <section className="section-card">
      <p className="eyebrow">
        {t("Pricing", "Tarifs", "Precios", "Preços", "定价", "الأسعار", "Prezzi", "Preise", "Prijzen", "Цены", "料金")}
      </p>
      <h1 className="mb-3 text-3xl font-semibold md:text-4xl">
        {t(
          "Simple, transparent pricing",
          "Tarification simple et transparente",
          "Precios simples y transparentes",
          "Preços simples e transparentes",
          "简单透明的定价",
          "أسعار بسيطة وشفافة",
          "Prezzi semplici e trasparenti",
          "Einfache, transparente Preise",
          "Eenvoudige, transparante prijzen",
          "Простые и прозрачные цены",
          "シンプルで透明な料金体系",
        )}
      </h1>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground md:text-base">
        {t(
          "Start for free. Upgrade anytime. No hidden fees.",
          "Commencez gratuitement. Mettez à niveau à tout moment. Pas de frais cachés.",
          "Empieza gratis. Actualiza en cualquier momento. Sin cargos ocultos.",
          "Comece gratuitamente. Atualize a qualquer momento. Sem taxas ocultas.",
          "免费开始。随时升级。无隐藏费用。",
          "ابدأ مجاناً. قم بالترقية في أي وقت. لا رسوم خفية.",
          "Inizia gratuitamente. Aggiorna in qualsiasi momento. Nessuna tariffa nascosta.",
          "Starten Sie kostenlos. Jederzeit upgraden. Keine versteckten Gebühren.",
          "Begin gratis. Upgrade op elk moment. Geen verborgen kosten.",
          "Начните бесплатно. Обновляйтесь в любое время. Без скрытых платежей.",
          "無料でスタート。いつでもアップグレード。隠れた料金なし。",
        )}
      </p>

      {/* Billing toggle */}
      <div className="mb-10 flex items-center justify-center gap-4">
        <span className={`text-sm font-medium transition-colors ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
          {t("Monthly", "Mensuel", "Mensual", "Mensal", "每月", "شهري", "Mensile", "Monatlich", "Maandelijks", "Ежемесячно", "月払い")}
        </span>
        <button
          onClick={() => setBillingCycle(c => c === "monthly" ? "yearly" : "monthly")}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${billingCycle === "yearly" ? "bg-primary" : "bg-muted"}`}
          aria-label={t("Toggle billing cycle", "Changer la période de facturation", "Cambiar ciclo de facturación", "Alterar ciclo de faturamento", "切换计费周期", "تبديل دورة الفوترة", "Cambia il ciclo di fatturazione", "Abrechnungszeitraum wechseln", "Factuurcyclus wijzigen", "Переключить цикл оплаты", "請求サイクルを切り替え")}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-medium transition-colors ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
          {t("Yearly", "Annuel", "Anual", "Anual", "每年", "سنوي", "Annuale", "Jährlich", "Jaarlijks", "Ежегодно", "年払い")}
          <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            {t("Save up to 25%", "Économisez jusqu'à 25%", "Ahorra hasta 25%", "Poupe até 25%", "最多节省25%", "وفّر حتى 25%", "Risparmia fino al 25%", "Bis zu 25% sparen", "Bespaar tot 25%", "Сэкономьте до 25%", "最大25%お得")}
          </span>
        </span>
      </div>

      {/* 3-column plans grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <ScrollAnimation key={plan.id} animation="fade-up" duration={500 + idx * 100}>
            <div className={`relative rounded-2xl border p-6 flex flex-col gap-5 h-full transition-shadow ${
              plan.popular
                ? "border-2 border-primary shadow-xl bg-card"
                : "border-border bg-card shadow-sm hover:shadow-md"
            }`}>

              {/* Most Popular badge */}
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-md whitespace-nowrap">
                  {mostPopularLabel}
                </span>
              )}

              {/* Plan header */}
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${plan.popular ? "text-primary" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>
                <div className="mt-2 flex items-end gap-1">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-4xl font-bold">{freeLabel}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">
                        ${billingCycle === "monthly" ? plan.monthlyPrice.toFixed(2) : plan.yearlyPrice.toFixed(2)}
                      </span>
                      <span className="mb-1 text-sm text-muted-foreground">/ {monthLabel}</span>
                    </>
                  )}
                </div>
                {plan.monthlyPrice > 0 && billingCycle === "yearly" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    ${(plan.yearlyPrice * 12).toFixed(2)} {billedYearlyLabel}
                  </p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* CTA */}
              {plan.id === "starter" ? (
                <Button variant={plan.ctaVariant} className="w-full" asChild>
                  <LocalizedNavLink to="/analyze">{plan.cta}</LocalizedNavLink>
                </Button>
              ) : (
                <Button
                  variant={plan.ctaVariant}
                  className="w-full gap-2"
                  onClick={() => handleCheckout(plan.id as "pro" | "ultimate", billingCycle)}
                  disabled={checkoutLoading === plan.id}
                >
                  {checkoutLoading === plan.id && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {plan.cta}
                </Button>
              )}

              {/* Feature list */}
              <ul className="flex flex-col gap-2.5 text-sm mt-auto">
                {plan.features.map((feature) => (
                  <li key={feature.text} className={`flex items-start gap-2 ${feature.included ? "" : "opacity-40"}`}>
                    {feature.included
                      ? <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                      : <X className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
                    }
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollAnimation>
        ))}
      </div>

      {/* Fine print */}
      <p className="mt-10 text-center text-xs text-muted-foreground max-w-xl mx-auto">
        * {t(
          "Unlimited scans are subject to fair use policy. CalorieVision is an educational tool, not a medical device.",
          "Les analyses illimitées sont soumises à une politique d'usage équitable. CalorieVision est un outil éducatif, pas un appareil médical.",
          "Los análisis ilimitados están sujetos a la política de uso justo. CalorieVision es una herramienta educativa, no un dispositivo médico.",
          "As análises ilimitadas estão sujeitas à política de uso justo. CalorieVision é uma ferramenta educacional, não um dispositivo médico.",
          "无限扫描受公平使用政策约束。CalorieVision是教育工具，不是医疗设备。",
          "عمليات المسح غير المحدودة خاضعة لسياسة الاستخدام العادل. CalorieVision أداة تعليمية وليست جهازاً طبياً.",
          "Le scansioni illimitate sono soggette alla politica di utilizzo equo. CalorieVision è uno strumento educativo, non un dispositivo medico.",
          "Unbegrenzte Scans unterliegen der Fair-Use-Richtlinie. CalorieVision ist ein Bildungswerkzeug, kein Medizinprodukt.",
          "Onbeperkte scans zijn onderworpen aan het eerlijk gebruiksbeleid. CalorieVision is een educatief hulpmiddel, geen medisch apparaat.",
          "Неограниченные сканирования подпадают под политику честного использования. CalorieVision — образовательный инструмент, а не медицинское устройство.",
          "無制限スキャンはフェアユースポリシーに従います。CalorieVisionは教育ツールであり、医療機器ではありません。",
        )}
      </p>
    </section>
  );
};

export default Pricing;
