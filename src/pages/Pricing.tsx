import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { ScrollAnimation } from "@/components/ScrollAnimation";

const Pricing = () => {
  const { language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

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

  usePageMetadata({
    title: t(
      "CalorieVision Pricing – Free & Pro Plans",
      "Tarifs CalorieVision – Plans Gratuit et Pro",
      "Precios de CalorieVision – Planes Gratuito y Pro",
      "Preços CalorieVision – Planos Gratuito e Pro",
      "CalorieVision 定价 – 免费和专业版",
      "أسعار CalorieVision – الخطط المجانية والاحترافية",
      "Prezzi CalorieVision – Piani Gratuito e Pro",
      "CalorieVision Preise – Kostenlos & Pro",
      "CalorieVision Prijzen – Gratis & Pro",
      "Цены CalorieVision – Бесплатный и Pro-планы",
      "CalorieVision 料金 – 無料・プロプラン",
    ),
    description: t(
      "Start for free with 3 daily scans or upgrade to Pro for unlimited access, personalized tracking, and no ads.",
      "Commencez gratuitement avec 3 analyses par jour ou passez à Pro pour un accès illimité.",
      "Empieza gratis con 3 análisis diarios o pasa a Pro para acceso ilimitado y sin anuncios.",
      "Comece gratuitamente com 3 análises diárias ou atualize para Pro com acesso ilimitado.",
      "免费使用每日3次扫描，或升级Pro获得无限访问、个性化追踪和无广告体验。",
      "ابدأ مجاناً بـ 3 عمليات مسح يومية أو قم بالترقية إلى Pro للوصول غير المحدود.",
      "Inizia gratuitamente con 3 scansioni giornaliere o passa a Pro per accesso illimitato.",
      "Starten Sie kostenlos mit 3 täglichen Scans oder wechseln Sie zu Pro für unbegrenzten Zugang.",
      "Begin gratis met 3 dagelijkse scans of upgrade naar Pro voor onbeperkte toegang.",
      "Начните бесплатно с 3 сканирований в день или перейдите на Pro для неограниченного доступа.",
      "1日3回の無料スキャンから始めるか、プロプランで無制限アクセスにアップグレード。",
    ),
    path: "/pricing",
  });

  const proMonthlyPrice = 4.49;
  const proYearlyPrice = 2.99;

  const starterFeatures = [
    t("3 AI scans per day", "3 analyses IA par jour", "3 análisis IA por día", "3 análises IA por dia", "每天3次AI扫描", "3 عمليات مسح ذكاء اصطناعي يومياً", "3 scansioni IA al giorno", "3 KI-Scans pro Tag", "3 AI-scans per dag", "3 ИИ-сканирования в день", "1日3回AIスキャン"),
    t("Full blog access", "Accès complet au blog", "Acceso completo al blog", "Acesso completo ao blog", "完整博客访问", "وصول كامل للمدونة", "Accesso completo al blog", "Vollständiger Blog-Zugang", "Volledige blogtoegang", "Полный доступ к блогу", "ブログへのフルアクセス"),
    t("Basic BMI tools", "Outils IMC de base", "Herramientas básicas de IMC", "Ferramentas básicas de IMC", "基础BMI工具", "أدوات مؤشر كتلة الجسم الأساسية", "Strumenti BMI di base", "Grundlegende BMI-Tools", "Basis BMI-tools", "Базовые инструменты ИМТ", "基本BMIツール"),
  ];

  const proFeatures = [
    t("Unlimited AI scans", "Analyses IA illimitées", "Análisis IA ilimitados", "Análises IA ilimitadas", "无限AI扫描", "عمليات مسح ذكاء اصطناعي غير محدودة", "Scansioni IA illimitate", "Unbegrenzte KI-Scans", "Onbeperkte AI-scans", "Неограниченные ИИ-сканирования", "無制限AIスキャン"),
    t("Personalized tracking", "Suivi personnalisé", "Seguimiento personalizado", "Rastreamento personalizado", "个性化追踪", "تتبع شخصي", "Monitoraggio personalizzato", "Personalisiertes Tracking", "Gepersonaliseerde tracking", "Персональное отслеживание", "パーソナライズされた追跡"),
    t("Weekly nutrition reports", "Rapports nutritionnels hebdomadaires", "Informes nutricionales semanales", "Relatórios nutricionais semanais", "每周营养报告", "تقارير غذائية أسبوعية", "Rapporti nutrizionali settimanali", "Wöchentliche Ernährungsberichte", "Wekelijkse voedingsrapporten", "Еженедельные отчёты о питании", "週次栄養レポート"),
    t("No ads", "Sans publicités", "Sin anuncios", "Sem anúncios", "无广告", "بدون إعلانات", "Nessuna pubblicità", "Keine Werbung", "Geen advertenties", "Без рекламы", "広告なし"),
    t("Priority support", "Support prioritaire", "Soporte prioritario", "Suporte prioritário", "优先支持", "دعم ذو أولوية", "Supporto prioritario", "Prioritärer Support", "Prioritaire ondersteuning", "Приоритетная поддержка", "優先サポート"),
  ];

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
          "Start for free. Upgrade when you're ready. No hidden fees.",
          "Commencez gratuitement. Mettez à niveau quand vous êtes prêt. Pas de frais cachés.",
          "Empieza gratis. Actualiza cuando estés listo. Sin cargos ocultos.",
          "Comece gratuitamente. Atualize quando estiver pronto. Sem taxas ocultas.",
          "免费开始。准备好后升级。无隐藏费用。",
          "ابدأ مجاناً. قم بالترقية عندما تكون مستعداً. لا رسوم خفية.",
          "Inizia gratuitamente. Aggiorna quando sei pronto. Nessuna tariffa nascosta.",
          "Starten Sie kostenlos. Upgraden Sie, wenn Sie bereit sind. Keine versteckten Gebühren.",
          "Begin gratis. Upgrade wanneer u klaar bent. Geen verborgen kosten.",
          "Начните бесплатно. Обновитесь, когда будете готовы. Без скрытых платежей.",
          "無料でスタート。準備ができたらアップグレード。隠れた料金なし。",
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
            {t("Save 33%", "Économisez 33%", "Ahorra 33%", "Poupe 33%", "节省33%", "وفّر 33%", "Risparmia 33%", "33% sparen", "Bespaar 33%", "Сэкономьте 33%", "33%お得")}
          </span>
        </span>
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">

        {/* Starter plan */}
        <ScrollAnimation animation="fade-up" duration={600}>
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-5 h-full">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("Starter", "Débutant", "Iniciante", "Iniciante", "入门版", "المبتدئ", "Base", "Starter", "Starter", "Начальный", "スターター")}
              </p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="mb-1 text-sm text-muted-foreground">
                  / {t("month", "mois", "mes", "mês", "月", "شهر", "mese", "Monat", "maand", "мес.", "月")}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
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
                )}
              </p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <LocalizedNavLink to="/analyze">
                {t("Get started free", "Commencer gratuitement", "Empezar gratis", "Começar grátis", "免费开始", "ابدأ مجاناً", "Inizia gratis", "Kostenlos starten", "Gratis beginnen", "Начать бесплатно", "無料で始める")}
              </LocalizedNavLink>
            </Button>
            <ul className="flex flex-col gap-3 text-sm mt-auto">
              {starterFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollAnimation>

        {/* Pro plan */}
        <ScrollAnimation animation="fade-up" duration={700}>
          <div className="relative rounded-2xl border-2 border-primary bg-card p-6 flex flex-col gap-5 shadow-lg h-full">
            {/* Most Popular badge */}
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-md whitespace-nowrap">
              {t("Most Popular", "Le plus populaire", "Más popular", "Mais popular", "最受欢迎", "الأكثر شعبية", "Più popolare", "Am beliebtesten", "Meest populair", "Самый популярный", "最人気")}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pro</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-bold">
                  ${billingCycle === "monthly" ? proMonthlyPrice.toFixed(2) : proYearlyPrice.toFixed(2)}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  / {t("month", "mois", "mes", "mês", "月", "شهر", "mese", "Monat", "maand", "мес.", "月")}
                </span>
              </div>
              {billingCycle === "yearly" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    `Billed $${(proYearlyPrice * 12).toFixed(2)} / year`,
                    `Facturé $${(proYearlyPrice * 12).toFixed(2)} / an`,
                    `Facturado $${(proYearlyPrice * 12).toFixed(2)} / año`,
                    `Cobrado $${(proYearlyPrice * 12).toFixed(2)} / ano`,
                    `每年收费 $${(proYearlyPrice * 12).toFixed(2)}`,
                    `يُدفع $${(proYearlyPrice * 12).toFixed(2)} / سنة`,
                    `Fatturato $${(proYearlyPrice * 12).toFixed(2)} / anno`,
                    `${(proYearlyPrice * 12).toFixed(2)} $ / Jahr abgerechnet`,
                    `Jaarlijks gefactureerd $${(proYearlyPrice * 12).toFixed(2)}`,
                    `Списывается $${(proYearlyPrice * 12).toFixed(2)} / год`,
                    `年間 $${(proYearlyPrice * 12).toFixed(2)} で請求`,
                  )}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "For serious nutrition tracking.",
                  "Pour un suivi nutritionnel sérieux.",
                  "Para un seguimiento nutricional serio.",
                  "Para rastreamento nutricional sério.",
                  "用于严肃的营养追踪。",
                  "لتتبع التغذية الجاد.",
                  "Per un monitoraggio nutrizionale serio.",
                  "Für ernsthaftes Ernährungstracking.",
                  "Voor serieuze voedingsregistratie.",
                  "Для серьёзного отслеживания питания.",
                  "本格的な栄養管理のために。",
                )}
              </p>
            </div>
            <Button variant="hero" className="w-full" asChild>
              <LocalizedNavLink to="/analyze">
                {t("Start Pro", "Commencer Pro", "Empezar Pro", "Começar Pro", "开始Pro", "ابدأ Pro", "Inizia Pro", "Pro starten", "Start Pro", "Начать Pro", "Proを始める")}
              </LocalizedNavLink>
            </Button>
            <ul className="flex flex-col gap-3 text-sm mt-auto">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollAnimation>

      </div>

      {/* Fine print */}
      <p className="mt-10 text-center text-xs text-muted-foreground max-w-xl mx-auto">
        {t(
          "All plans include educational AI meal analysis. CalorieVision is not a medical tool.",
          "Tous les plans incluent l'analyse de repas IA éducative. CalorieVision n'est pas un outil médical.",
          "Todos los planes incluyen análisis de comidas IA educativo. CalorieVision no es una herramienta médica.",
          "Todos os planos incluem análise de refeições IA educacional. CalorieVision não é uma ferramenta médica.",
          "所有计划均包含教育性AI餐食分析。CalorieVision不是医疗工具。",
          "تشمل جميع الخطط تحليل الوجبات بالذكاء الاصطناعي التعليمي. CalorieVision ليست أداة طبية.",
          "Tutti i piani includono l'analisi dei pasti IA educativa. CalorieVision non è uno strumento medico.",
          "Alle Pläne beinhalten die pädagogische KI-Mahlzeitanalyse. CalorieVision ist kein medizinisches Werkzeug.",
          "Alle plannen bevatten educatieve AI-maaltijdanalyse. CalorieVision is geen medisch hulpmiddel.",
          "Все планы включают образовательный ИИ-анализ блюд. CalorieVision не является медицинским инструментом.",
          "すべてのプランに教育的AI食事分析が含まれます。CalorieVisionは医療ツールではありません。",
        )}
      </p>
    </section>
  );
};

export default Pricing;
