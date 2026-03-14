import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, Image as ImageIcon, Sparkles, Workflow } from "lucide-react";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollAnimation } from "@/components/ScrollAnimation";

import HomeVideo from "@/components/HomeVideo";
import MediaShowcaseSection from "@/components/MediaShowcaseSection";

import howItWorks1 from "@/assets/how-it-works-1.jpg";
import howItWorks2 from "@/assets/how-it-works-2.jpg";
import gaugeImage from "@/assets/gauge-original.webp";

const Index = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash ?? "";
    const search = window.location.search ?? "";

    if (!hash && !search) return;

    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    if (hash) {
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      hashParams.forEach((value, key) => params.set(key, value));
    }

    const isAuthLink =
      params.get("type") === "recovery" ||
      params.has("access_token") ||
      params.has("refresh_token") ||
      params.has("code") ||
      params.has("error") ||
      params.has("error_code") ||
      params.has("error_description");

    if (isAuthLink) {
      navigate({ pathname: "/auth", search, hash }, { replace: true });
    }
  }, [navigate]);

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
    title: "CalorieVision - AI Meal Analysis From a Photo",
    description:
      "Understand your meals with AI-powered calorie and nutrition estimates from a simple photo. Educational, fast, and privacy-first.",
    path: "/",
  });
  const contentByLang = {
    en: {
      heroEyebrow: "AI Meal Analysis From a Photo - Instantly",
      heroTitle: "Understand your meal better with CalorieVision.",
      heroSubtitle:
        "Upload a simple picture of your plate and let CalorieVision estimate the foods present, portion sizes, and approximate calories. Fast, friendly, and fully educational - never medical.",
      heroUploadCta: "Upload photo",
      heroTakePhotoCta: "Take photo",
      heroEducational: "Educational insights only",
      heroPhotosNotStored: "Photos are not stored",
    },
    fr: {
      heroEyebrow: "Analyse de repas à partir d'une photo - Instantané",
      heroTitle: "Comprenez mieux votre repas avec CalorieVision.",
      heroSubtitle:
        "Téléchargez simplement une photo de votre assiette et laissez CalorieVision estimer les aliments présents, les portions et les calories approximatives. Rapide, accessible et purement éducatif - jamais médical.",
      heroUploadCta: "Télécharger une photo",
      heroTakePhotoCta: "Prendre une photo",
      heroEducational: "Informations éducatives uniquement",
      heroPhotosNotStored: "Les photos ne sont pas conservées",
    },
    es: {
      heroEyebrow: "Análisis de comidas desde una foto - Al instante",
      heroTitle: "Entiende mejor tu comida con CalorieVision.",
      heroSubtitle:
        "Sube una foto sencilla de tu plato y deja que CalorieVision estime los alimentos presentes, el tamaño de las porciones y las calorías aproximadas. Rápido, amigable y totalmente educativo, nunca médico.",
      heroUploadCta: "Subir foto",
      heroTakePhotoCta: "Tomar foto",
      heroEducational: "Información solo educativa",
      heroPhotosNotStored: "Las fotos no se guardan",
    },
    pt: {
      heroEyebrow: "Análise de refeições a partir de uma foto - Instantânea",
      heroTitle: "Perceba melhor a sua refeição com o CalorieVision.",
      heroSubtitle:
        "Carregue uma foto simples do seu prato e deixe o CalorieVision estimar os alimentos presentes, os tamanhos das porções e as calorias aproximadas. Rápido, acessível e apenas educativo — nunca médico.",
      heroUploadCta: "Carregar foto",
      heroTakePhotoCta: "Tirar foto",
      heroEducational: "Informações apenas educativas",
      heroPhotosNotStored: "As fotos não são guardadas",
    },
    zh: {
      heroEyebrow: "基于照片的即时膳食分析",
      heroTitle: "用 CalorieVision 更好地了解每一餐。",
      heroSubtitle:
        "上传一张清晰的餐盘照片，CalorieVision 会估算其中的食物、份量以及大致热量。快速、友好，仅用于学习参考，不构成任何医疗建议。",
      heroUploadCta: "上传照片",
      heroTakePhotoCta: "拍照",
      heroEducational: "仅供教育用途的洞见",
      heroPhotosNotStored: "照片不会被保存",
    },
    ar: {
      heroEyebrow: "تحليل وجبة بالذكاء الاصطناعي انطلاقًا من صورة – فورًا",
      heroTitle: "افهم وجبتك بشكل أفضل مع CalorieVision.",
      heroSubtitle:
        "التقط صورة واضحة لطبقك ودَع CalorieVision يقدّر الأطعمة الموجودة، أحجام الحصص، وعدد السعرات التقريبي. سريع، بسيط، وتعليمي فقط – وليس أبدًا أداة طبية.",
      heroUploadCta: "تحميل صورة",
      heroTakePhotoCta: "التقاط صورة",
      heroEducational: "معلومات تعليمية فقط",
      heroPhotosNotStored: "لا يتم تخزين الصور",
    },
    it: {
      heroEyebrow: "Analisi del pasto da una foto - Istantanea",
      heroTitle: "Comprendi meglio il tuo pasto con CalorieVision.",
      heroSubtitle:
        "Carica una semplice foto del tuo piatto e lascia che CalorieVision stimi gli alimenti presenti, le porzioni e le calorie approssimative. Veloce, accessibile e puramente educativo - mai medico.",
      heroUploadCta: "Carica foto",
      heroTakePhotoCta: "Scatta foto",
      heroEducational: "Solo informazioni educative",
      heroPhotosNotStored: "Le foto non vengono salvate",
    },
    de: {
      heroEyebrow: "KI-Mahlzeitanalyse aus einem Foto - Sofort",
      heroTitle: "Verstehen Sie Ihre Mahlzeit besser mit CalorieVision.",
      heroSubtitle:
        "Laden Sie ein einfaches Foto Ihres Tellers hoch und lassen Sie CalorieVision die vorhandenen Lebensmittel, Portionsgrößen und ungefähren Kalorien schätzen. Schnell, freundlich und rein bildungsorientiert - niemals medizinisch.",
      heroUploadCta: "Foto hochladen",
      heroTakePhotoCta: "Foto aufnehmen",
      heroEducational: "Nur Bildungsinformationen",
      heroPhotosNotStored: "Fotos werden nicht gespeichert",
    },
    nl: {
      heroEyebrow: "AI Maaltijdanalyse vanuit een foto - Direct",
      heroTitle: "Begrijp je maaltijd beter met CalorieVision.",
      heroSubtitle:
        "Upload een simpele foto van je bord en laat CalorieVision de aanwezige voedingsmiddelen, portiegroottes en geschatte calorieën inschatten. Snel, vriendelijk en puur educatief - nooit medisch.",
      heroUploadCta: "Foto uploaden",
      heroTakePhotoCta: "Foto maken",
      heroEducational: "Alleen educatieve inzichten",
      heroPhotosNotStored: "Foto's worden niet opgeslagen",
    },
    ru: {
      heroEyebrow: "ИИ-анализ приёма пищи по фото — мгновенно",
      heroTitle: "Лучше понимайте свою еду с CalorieVision.",
      heroSubtitle:
        "Загрузите фото блюда и позвольте CalorieVision оценить состав, размер порций и примерную калорийность. Быстро, удобно и только в образовательных целях — не медицинский инструмент.",
      heroUploadCta: "Загрузить фото",
      heroTakePhotoCta: "Сделать фото",
      heroEducational: "Только образовательная информация",
      heroPhotosNotStored: "Фото не сохраняются",
    },
    ja: {
      heroEyebrow: "AIによる食事の栄養分析 — 瞬時に",
      heroTitle: "CalorieVisionで食事をもっとよく理解しましょう。",
      heroSubtitle:
        "お皿の写真をアップロードするだけで、CalorieVisionが食品の種類、量、およびおおよそのカロリーを推定します。速く、使いやすく、あくまで教育目的です — 医療ツールではありません。",
      heroUploadCta: "写真をアップロード",
      heroTakePhotoCta: "写真を撮る",
      heroEducational: "教育目的の情報のみ",
      heroPhotosNotStored: "写真は保存されません",
    },
  } as const;
  const copy = contentByLang[language];

  const handleTakePhotoClick = () => {
    navigate(`/${language}/analyze?capture=1`);
  };

  const videoTitle: Record<string, string> = {
    en: "Count Your Meal Calories in 3 Seconds with AI",
    fr: "Comptez les Calories de Vos Repas en 3 Secondes avec l'IA",
    es: "Cuente las Calorías de Sus Comidas en 3 Segundos con IA",
    pt: "Conte as Calorias das Suas Refeições em 3 Segundos com IA",
    zh: "3秒内用AI计算您餐食的卡路里",
    ar: "احسب سعرات وجبتك في 3 ثوانٍ باستخدام الذكاء الاصطناعي",
    it: "Conta le Calorie dei Tuoi Pasti in 3 Secondi con l'IA",
    de: "Zählen Sie die Kalorien Ihrer Mahlzeiten in 3 Sekunden mit KI",
    nl: "Tel de calorieën van je maaltijd in 3 seconden met AI",
    ru: "Подсчитайте калории вашего блюда за 3 секунды с помощью ИИ",
    ja: "AIで3秒で食事のカロリーを計算する",
  };

  const videoDesc: Record<string, string> = {
    en: "Discover CalorieVision: the free app that analyzes your meals from a single photo. Our AI identifies each food item and instantly calculates calories, protein, carbs, and fat. No signup, no data storage, 100% private.",
    fr: "Découvrez CalorieVision : l'application gratuite qui analyse vos repas par simple photo. Notre intelligence artificielle identifie chaque aliment et calcule instantanément les calories, protéines, glucides et lipides. Sans inscription, sans stockage de données, 100% privé.",
    es: "Descubre CalorieVision: la aplicación gratuita que analiza tus comidas desde una sola foto. Nuestra IA identifica cada alimento y calcula instantáneamente calorías, proteínas, carbohidratos y grasas. Sin registro, sin almacenamiento de datos, 100% privado.",
    pt: "Descubra o CalorieVision: o aplicativo gratuito que analisa suas refeições a partir de uma única foto. Nossa IA identifica cada alimento e calcula instantaneamente calorias, proteínas, carboidratos e gorduras. Sem cadastro, sem armazenamento de dados, 100% privado.",
    zh: "探索 CalorieVision：免费应用，只需一张照片即可分析您的餐食。我们的AI识别每种食物并即时计算卡路里、蛋白质、碳水化合物和脂肪。无需注册，不存储数据，100%隐私。",
    ar: "اكتشف CalorieVision: التطبيق المجاني الذي يحلل وجباتك من صورة واحدة. يحدد ذكاؤنا الاصطناعي كل عنصر غذائي ويحسب فوراً السعرات الحرارية والبروتين والكربوهيدرات والدهون. بدون تسجيل، بدون تخزين بيانات، خصوصية 100%.",
    it: "Scopri CalorieVision: l'app gratuita che analizza i tuoi pasti da una sola foto. La nostra IA identifica ogni alimento e calcola istantaneamente calorie, proteine, carboidrati e grassi. Senza registrazione, senza archiviazione dati, 100% privato.",
    de: "Entdecken Sie CalorieVision: die kostenlose App, die Ihre Mahlzeiten aus einem einzigen Foto analysiert. Unsere KI identifiziert jede Zutat und berechnet sofort Kalorien, Protein, Kohlenhydrate und Fett. Keine Anmeldung, keine Datenspeicherung, 100% privat.",
    nl: "Ontdek CalorieVision: de gratis app die je maaltijden analyseert vanuit één foto. Onze AI identificeert elk voedingsmiddel en berekent direct calorieën, eiwitten, koolhydraten en vetten. Geen registratie, geen gegevensopslag, 100% privé.",
    ru: "Откройте для себя CalorieVision: бесплатное приложение для анализа блюд по одной фотографии. Наш ИИ распознаёт каждый продукт и мгновенно рассчитывает калории, белки, углеводы и жиры. Без регистрации, без хранения данных, 100% конфиденциально.",
    ja: "CalorieVisionをご紹介：一枚の写真から食事を分析する無料アプリです。AIが各食品を識別し、カロリー・タンパク質・炭水化物・脂質を瞬時に計算します。登録不要、データ保存なし、100%プライバシー保護。",
  };

  return <>
      {/* Media Showcase Section - Between Header and Hero */}
      <MediaShowcaseSection />

      {/* Gauge Visualization Section */}
      <ScrollAnimation animation="fade-up" duration={600}>
        <section className="section-card text-center">
          <h2 className="text-2xl font-semibold md:text-3xl mb-3">
            {t(
              "Visual Nutrition Analysis at a Glance",
              "Analyse nutritionnelle visuelle en un coup d'œil",
              "Análisis visual de nutrición de un vistazo",
              "Análise visual de nutrição de relance",
              "一目了然的视觉营养分析",
              "تحليل التغذية البصري في لمحة",
              "Analisi nutrizionale visiva in un colpo d'occhio",
              "Visuelle Ernährungsanalyse auf einen Blick",
              "Visuele voedingsanalyse in één oogopslag",
              "Визуальный анализ питания с первого взгляда",
              "一目でわかる視覚的栄養分析",
            )}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground md:text-base max-w-2xl mx-auto">
            {t(
              "CalorieVision instantly analyzes your meals and visualizes calories and macronutrients in a clear, intuitive way. From a single photo, understand the balance between proteins, carbohydrates, and fats to make smarter nutrition decisions.",
              "CalorieVision analyse instantanément vos repas et visualise les calories et macronutriments de façon claire et intuitive. À partir d'une seule photo, comprenez l'équilibre entre protéines, glucides et lipides.",
              "CalorieVision analiza instantáneamente tus comidas y visualiza calorías y macronutrientes de forma clara e intuitiva. Desde una sola foto, entiende el equilibrio entre proteínas, carbohidratos y grasas.",
              "CalorieVision analisa instantaneamente as suas refeições e visualiza calorias e macronutrientes de forma clara e intuitiva. A partir de uma única foto, entenda o equilíbrio entre proteínas, carboidratos e gorduras.",
              "CalorieVision即时分析您的餐食，以清晰直观的方式呈现卡路里和宏量营养素。从一张照片中了解蛋白质、碳水化合物和脂肪之间的平衡。",
              "يحلل CalorieVision وجباتك فوراً ويُظهر السعرات الحرارية والعناصر الغذائية الكبرى بطريقة واضحة وبديهية. من صورة واحدة، افهم التوازن بين البروتينات والكربوهيدرات والدهون.",
              "CalorieVision analizza istantaneamente i tuoi pasti e visualizza calorie e macronutrienti in modo chiaro e intuitivo. Da una singola foto, capisci l'equilibrio tra proteine, carboidrati e grassi.",
              "CalorieVision analysiert Ihre Mahlzeiten sofort und visualisiert Kalorien und Makronährstoffe auf klare, intuitive Weise. Verstehen Sie aus einem einzigen Foto die Balance zwischen Proteinen, Kohlenhydraten und Fetten.",
              "CalorieVision analyseert uw maaltijden direct en visualiseert calorieën en macronutriënten op een duidelijke, intuïtieve manier. Begrijp vanuit één foto de balans tussen eiwitten, koolhydraten en vetten.",
              "CalorieVision мгновенно анализирует ваши блюда и наглядно отображает калории и макроэлементы. По одному фото поймите баланс между белками, углеводами и жирами.",
              "CalorieVisionは食事を瞬時に分析し、カロリーと主要栄養素を明確で直感的な方法で視覚化します。1枚の写真から、タンパク質・炭水化物・脂質のバランスを把握できます。",
            )}
          </p>
          <div className="flex justify-center">
            <div className="rounded-2xl bg-white p-5 shadow-sm inline-block">
              <img
                src={gaugeImage}
                alt={t("Nutrition gauge chart", "Jauge nutritionnelle", "Medidor de nutrición", "Medidor de nutrição", "营养仪表盘", "مقياس التغذية", "Indicatore nutrizionale", "Ernährungsanzeige", "Voedingsmeter", "Датчик питания", "栄養ゲージ")}
                className="max-w-[240px] md:max-w-[320px] w-full"
              />
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Main Hero Section with H1 */}
      <ScrollAnimation animation="fade-up" duration={700}>
      <section className="section-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 hidden h-80 w-80 rounded-full bg-gradient-to-b from-primary/40 via-accent/40 to-transparent opacity-70 blur-3xl md:block" aria-hidden="true" />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
          <div className="space-y-5 md:space-y-6">
            <p className="eyebrow">{copy.heroEyebrow}</p>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {copy.heroTitle}
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              {copy.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto min-h-[44px]" asChild>
                <LocalizedNavLink to="/analyze">{copy.heroUploadCta}</LocalizedNavLink>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 min-h-[44px]" onClick={handleTakePhotoClick}>
                <Camera className="h-4 w-4" aria-hidden="true" />
                {copy.heroTakePhotoCta}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground md:text-sm">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />
                {copy.heroEducational}
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" aria-hidden="true" />
                {copy.heroPhotosNotStored}
              </span>
            </div>
          </div>

          <Card className="glass-panel relative mt-2 border-none bg-card/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                </span>
              {t(
                  "Quick glance meal snapshot",
                  "Aperçu rapide d'un repas",
                  "Vista rápida de una comida",
                  "Visão rápida de uma refeição",
                  "餐食分析预览",
                  "نظرة سريعة على الوجبة",
                  "Anteprima rapida del pasto",
                  "Schneller Mahlzeitenüberblick",
                  "Snelle maaltijdweergave",
                  "Быстрый обзор блюда",
                  "食事の概要プレビュー",
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  "This is a preview of what a CalorieVision analysis card could look like. AI meal analysis is now powered by Lovable AI.",
                  "Voici un aperçu de ce à quoi peut ressembler une carte d'analyse CalorieVision. L'analyse de repas par IA est désormais propulsée par Lovable AI.",
                  "Este es un ejemplo de cómo podría verse una tarjeta de análisis de CalorieVision. El análisis de comidas con IA ahora funciona gracias a Lovable AI.",
                  "Este é um exemplo de como pode ser um cartão de análise do CalorieVision. A análise de refeições com IA é agora alimentada pelo Lovable AI.",
                  "这是一个 CalorieVision 分析卡片的示例展示。餐食分析由 Lovable AI 提供支持。",
                  "هذه معاينة لما يمكن أن تبدو عليه بطاقة تحليل CalorieVision. تحليل الوجبات بالذكاء الاصطناعي مدعوم الآن بـ Lovable AI.",
                  "Questa è un'anteprima di come potrebbe apparire una scheda di analisi CalorieVision. L'analisi dei pasti con IA è ora alimentata da Lovable AI.",
                  "Dies ist eine Vorschau, wie eine CalorieVision-Analysekarte aussehen könnte. Die KI-Mahlzeitanalyse wird jetzt von Lovable AI unterstützt.",
                  "Dit is een voorbeeld van hoe een CalorieVision analysekaart eruit zou kunnen zien. AI-maaltijdanalyse wordt nu aangedreven door Lovable AI.",
                  "Это пример того, как может выглядеть карточка анализа CalorieVision. ИИ-анализ блюд теперь работает на базе Lovable AI.",
                  "これはCalorieVisionの分析カードのプレビューです。AI食事分析はLovable AIによって提供されています。",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-secondary px-3 py-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {t(
                      "Estimated total",
                      "Total estimé",
                      "Total estimado",
                      "Total estimado",
                      "预估总量",
                      "الإجمالي المُقدَّر",
                      "Totale stimato",
                      "Geschätzter Gesamtwert",
                      "Geschat totaal",
                      "Примерный итог",
                      "推定合計",
                    )}
                  </p>
                  <p className="text-lg font-semibold">~620 kcal</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>
                    {t(
                      "Balanced plate",
                      "Assiette équilibrée",
                      "Plato equilibrado",
                      "Prato equilibrado",
                      "均衡餐盘",
                      "طبق متوازن",
                      "Piatto equilibrato",
                      "Ausgewogener Teller",
                      "Uitgebalanceerd bord",
                      "Сбалансированная тарелка",
                      "バランスの良いプレート",
                    )}
                  </p>
                  <p>
                  {t(
                      "Example meal only",
                      "Exemple de repas uniquement",
                      "Solo comida de ejemplo",
                      "Apenas refeição de exemplo",
                      "仅为示例餐食",
                      "مثال على وجبة فقط",
                      "Solo pasto di esempio",
                      "Nur Beispielmahlzeit",
                      "Alleen voorbeeldmaaltijd",
                      "Только пример блюда",
                      "例示の食事のみ",
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t(
                      "Grilled chicken",
                      "Poulet grillé",
                      "Pollo a la parrilla",
                      "Frango grelhado",
                      "烤鸡肉",
                      "دجاج مشوي",
                      "Pollo alla griglia",
                      "Gegrilltes Hähnchen",
                      "Gegrilde kip",
                      "Куриное филе на гриле",
                      "グリルチキン",
                    )}
                  </span>
                  <span className="font-medium">~220 kcal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t(
                      "Rice",
                      "Riz",
                      "Arroz",
                      "Arroz",
                      "米饭",
                      "أرز",
                      "Riso",
                      "Reis",
                      "Rijst",
                      "Рис",
                      "ご飯",
                    )}
                  </span>
                  <span className="font-medium">~260 kcal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t(
                      "Mixed vegetables",
                      "Légumes variés",
                      "Verduras mixtas",
                      "Legumes mistos",
                      "混合蔬菜",
                      "خضروات مشكّلة",
                      "Verdure miste",
                      "Gemischtes Gemüse",
                      "Gemengde groenten",
                      "Смешанные овощи",
                      "ミックス野菜",
                    )}
                  </span>
                  <span className="font-medium">~80 kcal</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                  {t(
                      "Light sauce & extras",
                      "Sauce légère et accompagnements",
                      "Salsa ligera y extras",
                      "Molho leve e extras",
                      "清淡酱汁及配料",
                      "صلصة خفيفة وإضافات",
                      "Salsa leggera e extra",
                      "Leichte Sauce & Extras",
                      "Lichte saus & extra's",
                      "Лёгкий соус и дополнения",
                      "軽いソースとトッピング",
                    )}
                  </span>
                  <span>~60 kcal</span>
                </div>
              </div>
              <div className="rounded-2xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  {t(
                    "Friendly tip",
                    "Conseil bienveillant",
                    "Consejo amistoso",
                    "Dica amigável",
                    "温馨提示",
                    "نصيحة ودّية",
                    "Consiglio amichevole",
                    "Freundlicher Tipp",
                    "Vriendelijke tip",
                    "Полезный совет",
                    "ヒント",
                  )}
                </p>
                <p>
                  {t(
                    "Add a little more colourful vegetables or salad to boost fibre and micronutrients. No judgement, just gentle guidance.",
                    "Ajoutez un peu plus de légumes colorés ou de salade pour augmenter les fibres et les micronutriments. Aucun jugement, seulement des suggestions bienveillantes.",
                    "Añade algunas verduras de colores o ensalada para aumentar la fibra y los micronutrientes. Sin juicios, solo orientación amable.",
                    "Adicione um pouco mais de legumes coloridos ou salada para aumentar as fibras e os micronutrientes. Sem julgamentos, apenas orientações gentis.",
                    "可以适当多加一些颜色丰富的蔬菜或沙拉，以增加膳食纤维和微量营养素。不是评判，只是温和的建议。",
                    "أضِف المزيد من الخضروات الملوّنة أو السلطة لتعزيز الألياف والفيتامينات. لا أحكام، فقط إرشادات لطيفة.",
                    "Aggiungi un po' più di verdure colorate o insalata per aumentare fibre e micronutrienti. Nessun giudizio, solo guida gentile.",
                    "Fügen Sie etwas mehr buntes Gemüse oder Salat hinzu, um Ballaststoffe und Mikronährstoffe zu steigern. Keine Bewertung, nur sanfte Anleitung.",
                    "Voeg wat meer kleurrijke groenten of salade toe voor meer vezels en micronutriënten. Geen oordeel, alleen vriendelijk advies.",
                    "Добавьте больше разноцветных овощей или салата — это поможет увеличить количество клетчатки и микронутриентов. Никаких оценок, только мягкие подсказки.",
                    "食物繊維やミネラルを増やすために、色とりどりの野菜やサラダを少し追加してみましょう。判断ではなく、やさしいアドバイスです。",
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      </ScrollAnimation>

      {/* Demo Video Section */}
      <ScrollAnimation animation="fade-up" delay={100} duration={700}>
      <section className="section-card relative overflow-hidden" aria-label="Demo Video">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {videoTitle[language] || videoTitle.en}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              {videoDesc[language] || videoDesc.en}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <HomeVideo
              fallbackText={t(
                "Your browser does not support the video. Please update your browser or try another device.",
                "Votre navigateur ne prend pas en charge la vidéo. Veuillez mettre à jour votre navigateur ou essayer un autre appareil.",
                "Su navegador no soporta el video. Por favor actualice su navegador o pruebe otro dispositivo.",
                "Seu navegador não suporta o vídeo. Por favor, atualize seu navegador ou tente outro dispositivo.",
                "您的浏览器不支持该视频。请更新浏览器或尝试其他设备。",
                "متصفحك لا يدعم الفيديو. يرجى تحديث المتصفح أو تجربة جهاز آخر.",
                "Il tuo browser non supporta il video. Aggiorna il browser o prova un altro dispositivo.",
                "Ihr Browser unterstützt das Video nicht. Bitte aktualisieren Sie Ihren Browser oder versuchen Sie ein anderes Gerät.",
                "Je browser ondersteunt de video niet. Update je browser of probeer een ander apparaat.",
                "Ваш браузер не поддерживает видео. Обновите браузер или попробуйте другое устройство.",
                "お使いのブラウザは動画をサポートしていません。ブラウザを更新するか、別のデバイスをお試しください。",
              )}
            />
          </div>
        </div>
      </section>
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" delay={150} duration={700}>
      <section aria-labelledby="what-is-calorievision" className="section-grid">
        <section className="section-card" aria-label="What is CalorieVision?">
          <p className="eyebrow">
            {t(
              "About the tool",
              "À propos de l'outil",
              "Sobre la herramienta",
              "Sobre a ferramenta",
              "关于本工具",
              "حول الأداة",
              "Informazioni sullo strumento",
              "Über das Werkzeug",
              "Over de tool",
              "Об инструменте",
              "ツールについて",
            )}
          </p>
          <h2 id="what-is-calorievision" className="mb-3 text-2xl font-semibold md:text-3xl">
            {t(
              "What is CalorieVision?",
              "Qu'est-ce que CalorieVision ?",
              "¿Qué es CalorieVision?",
              "O que é o CalorieVision?",
              "什么是 CalorieVision？",
              "ما هو CalorieVision؟",
              "Cos'è CalorieVision?",
              "Was ist CalorieVision?",
              "Wat is CalorieVision?",
              "Что такое CalorieVision?",
              "CalorieVisionとは？",
            )}
          </h2>
          <p className="mb-3 text-sm text-muted-foreground md:text-base">
            {t(
              "CalorieVision is an educational AI tool designed to help you understand your meals more clearly – no scales, no manual logging, and no complicated nutrition trackers.",
              "CalorieVision est un outil d'IA éducatif conçu pour vous aider à mieux comprendre vos repas – sans balance, sans saisie manuelle et sans suivi nutritionnel compliqué.",
              "CalorieVision es una herramienta de IA educativa pensada para ayudarte a entender mejor tus comidas, sin básculas, sin registros manuales y sin complicados contadores de calorías.",
              "O CalorieVision é uma ferramenta de IA educativa criada para o ajudar a compreender melhor as suas refeições – sem balanças, sem registos manuais e sem aplicações de nutrição complicadas.",
              "CalorieVision 是一款教育型 AI 工具，旨在帮助你更直观地了解每一餐——不需要食物秤、不需要手动记录，也不需要复杂的营养追踪应用。",
              "CalorieVision أداة تعليمية تعمل بالذكاء الاصطناعي لمساعدتك على فهم وجباتك بوضوح – بدون موازين، بدون تسجيل يدوي، وبدون تطبيقات تغذية معقّدة.",
              "CalorieVision è uno strumento educativo basato su IA progettato per aiutarti a capire meglio i tuoi pasti – senza bilance, senza registrazione manuale e senza complicati tracker nutrizionali.",
              "CalorieVision ist ein KI-Bildungswerkzeug, das Ihnen hilft, Ihre Mahlzeiten besser zu verstehen – ohne Waagen, ohne manuelles Aufzeichnen und ohne komplizierte Ernährungstracker.",
              "CalorieVision is een educatieve AI-tool ontworpen om je te helpen je maaltijden beter te begrijpen – geen weegschalen, geen handmatig loggen en geen ingewikkelde voedingstrackers.",
              "CalorieVision — образовательный ИИ-инструмент, помогающий лучше понять состав своих блюд — без весов, ручного ввода и сложных трекеров питания.",
              "CalorieVisionは、食事をより明確に理解するための教育的なAIツールです。秤も手動記録も複雑な栄養トラッカーも不要です。",
            )}
          </p>
          <p className="mb-3 text-sm text-muted-foreground md:text-base">
            {t(
              "Simply upload a photo of your plate and our vision technology works behind the scenes to estimate which foods are present, how much of each is on your plate, and roughly how many calories your meal might contain.",
              "Vous envoyez simplement une photo de votre assiette et notre technologie de vision travaille en coulisses pour estimer les aliments présents, leur quantité approximative et le nombre de calories que votre repas pourrait contenir.",
              "Solo tienes que subir una foto de tu plato y nuestra tecnología de visión trabaja en segundo plano para estimar qué alimentos hay, cuánta cantidad aproximadamente y cuántas calorías podría tener tu comida.",
              "Basta carregar uma fotografia do seu prato e a nossa tecnologia de visão trabalha em segundo plano para estimar que alimentos estão presentes, em que quantidade aproximada e quantas calorias a sua refeição poderá conter.",
              "你只需上传一张餐盘照片，我们的视觉技术会在后台估算盘中有哪些食物、各自的大致分量，以及这顿饭大约含有多少卡路里。",
              "ما عليك سوى رفع صورة لطبقك، وستعمل تقنيتنا البصرية في الخلفية لتقدير الأطعمة الموجودة وكمياتها التقريبية وعدد السعرات الحرارية المحتملة.",
              "Carica semplicemente una foto del tuo piatto e la nostra tecnologia di visione lavora in background per stimare quali alimenti sono presenti, quanto di ciascuno c'è nel piatto e approssimativamente quante calorie potrebbe contenere il tuo pasto.",
              "Laden Sie einfach ein Foto Ihres Tellers hoch und unsere Bilderkennungstechnologie arbeitet im Hintergrund, um zu schätzen, welche Lebensmittel vorhanden sind, wie viel von jedem auf Ihrem Teller ist und ungefähr wie viele Kalorien Ihre Mahlzeit enthalten könnte.",
              "Upload simpelweg een foto van je bord en onze vision-technologie werkt op de achtergrond om te schatten welke voedingsmiddelen aanwezig zijn, hoeveel van elk op je bord ligt en ongeveer hoeveel calorieën je maaltijd zou kunnen bevatten.",
              "Просто загрузите фото тарелки, и наша технология компьютерного зрения в фоновом режиме определит, какие продукты на ней, их примерное количество и приблизительную калорийность блюда.",
              "お皿の写真をアップロードするだけで、ビジョン技術がバックグラウンドで食品の種類・量・おおよそのカロリーを推定します。",
            )}
          </p>
          <p className="mb-3 text-sm text-muted-foreground md:text-base">
            {t(
              "Our goal is not to judge your eating habits or tell you what you should or shouldn't eat. Instead, CalorieVision gives you simple, accessible information so you can build your own awareness and make more mindful decisions over time.",
              "Notre objectif n'est pas de juger vos habitudes alimentaires ni de vous dire ce que vous devriez ou ne devriez pas manger. CalorieVision vous fournit plutôt des informations simples et accessibles pour vous aider à développer votre propre conscience alimentaire et à prendre des décisions plus éclairées au fil du temps.",
              "Nuestro objetivo no es juzgar tus hábitos alimentarios ni decirte lo que deberías o no deberías comer. CalorieVision te ofrece información sencilla y accesible para que puedas aumentar tu consciencia y tomar decisiones más conscientes con el tiempo.",
              "O nosso objetivo não é julgar os seus hábitos alimentares nem dizer-lhe o que deve ou não deve comer. O CalorieVision oferece-lhe informações simples e acessíveis para que possa desenvolver a sua própria consciência e tomar decisões mais conscientes ao longo do tempo.",
              "我们的目标不是评判你的饮食习惯，也不是告诉你应该或不应该吃什么。CalorieVision 只是提供简单、易懂的信息，帮助你逐步提高觉察，在长期中做出更有意识的选择。",
              "هدفنا ليس الحكم على عاداتك الغذائية أو إخبارك بما يجب أن تأكله. بل يمنحك CalorieVision معلومات بسيطة وسهلة الفهم لتبني وعيك الخاص واتخاذ قرارات أكثر وعيًا بمرور الوقت.",
              "Il nostro obiettivo non è giudicare le tue abitudini alimentari o dirti cosa dovresti o non dovresti mangiare. CalorieVision ti fornisce informazioni semplici e accessibili per sviluppare la tua consapevolezza e prendere decisioni più consapevoli nel tempo.",
              "Unser Ziel ist es nicht, Ihre Essgewohnheiten zu beurteilen oder Ihnen zu sagen, was Sie essen sollten oder nicht. CalorieVision gibt Ihnen stattdessen einfache, zugängliche Informationen, damit Sie Ihr eigenes Bewusstsein aufbauen und mit der Zeit bewusstere Entscheidungen treffen können.",
              "Ons doel is niet om je eetgewoonten te beoordelen of je te vertellen wat je wel of niet zou moeten eten. In plaats daarvan geeft CalorieVision je eenvoudige, toegankelijke informatie zodat je je eigen bewustzijn kunt opbouwen en in de loop van de tijd meer bewuste beslissingen kunt nemen.",
              "Наша цель — не оценивать ваши пищевые привычки и не указывать, что есть, а что нет. CalorieVision предоставляет простую, доступную информацию, чтобы вы могли развивать осознанность и со временем делать более взвешенные выборы.",
              "私たちの目標は、あなたの食習慣を評価したり、何を食べるべきかを指示したりすることではありません。CalorieVisionは、シンプルでわかりやすい情報を提供し、あなた自身の意識を高め、より賢明な選択ができるようにサポートします。",
            )}
          </p>
          <p className="text-sm text-muted-foreground md:text-base">
            {t(
              "This platform is not a medical device and does not replace professional nutrition advice. All outputs are approximations intended purely for learning and reflection.",
              "Cette plateforme n'est pas un dispositif médical et ne remplace pas les conseils d'un professionnel de la nutrition. Tous les résultats sont des approximations destinées uniquement à l'apprentissage et à la réflexion.",
              "Esta plataforma no es un dispositivo médico y no sustituye el consejo de un profesional de la nutrición. Todos los resultados son aproximaciones pensadas únicamente para aprender y reflexionar.",
              "Esta plataforma não é um dispositivo médico e não substitui o aconselhamento de um profissional de nutrição. Todos os resultados são aproximados e destinam-se apenas à aprendizagem e reflexão.",
              "本平台不是医疗设备，也不能替代专业营养建议。所有结果都是近似估计，仅用于学习和自我反思。",
              "هذه المنصة ليست جهازًا طبيًا ولا تحلّ محل استشارة خبير تغذية. جميع النتائج تقديرات تقريبية مُعدّة للتعلم والتأمل فقط.",
              "Questa piattaforma non è un dispositivo medico e non sostituisce i consigli di un professionista della nutrizione. Tutti i risultati sono approssimazioni destinate esclusivamente all'apprendimento e alla riflessione.",
              "Diese Plattform ist kein medizinisches Gerät und ersetzt keine professionelle Ernährungsberatung. Alle Ergebnisse sind Näherungswerte, die ausschließlich zum Lernen und Nachdenken bestimmt sind.",
              "Dit platform is geen medisch hulpmiddel en vervangt geen professioneel voedingsadvies. Alle resultaten zijn schattingen die uitsluitend bedoeld zijn voor leren en reflectie.",
              "Эта платформа не является медицинским устройством и не заменяет профессиональную консультацию диетолога. Все результаты являются приблизительными и предназначены исключительно для обучения и самоанализа.",
              "このプラットフォームは医療機器ではなく、専門的な栄養アドバイスの代替にはなりません。すべての結果はおおよその推定値であり、学習と振り返りのみを目的としています。",
            )}
          </p>
        </section>

        <section className="section-card" aria-label="Why use CalorieVision?">
          <p className="eyebrow">
            {t(
              "Why it matters",
              "Pourquoi c'est important",
              "Por qué importa",
              "Por que é importante",
              "为什么这很重要",
              "لماذا هذا مهم",
              "Perché è importante",
              "Warum es wichtig ist",
              "Waarom het belangrijk is",
              "Почему это важно",
              "なぜ重要なのか",
            )}
          </p>
          <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
            {t(
              "Why use CalorieVision?",
              "Pourquoi utiliser CalorieVision ?",
              "¿Por qué usar CalorieVision?",
              "Por que usar o CalorieVision?",
              "为什么要使用 CalorieVision？",
              "لماذا تستخدم CalorieVision؟",
              "Perché usare CalorieVision?",
              "Warum CalorieVision verwenden?",
              "Waarom CalorieVision gebruiken?",
              "Зачем использовать CalorieVision?",
              "なぜCalorieVisionを使うのか？",
            )}
          </h2>
          <ul className="space-y-2 text-sm md:text-base">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "Fast and easy.",
                    "Rapide et simple.",
                    "Rápido y sencillo.",
                    "Rápido e simples.",
                    "快捷又简单。",
                    "سريع وسهل.",
                    "Veloce e semplice.",
                    "Schnell und einfach.",
                    "Snel en gemakkelijk.",
                    "Быстро и просто.",
                    "速くて簡単。",
                  )}
                </span>{" "}
                {t(
                  "Snap a quick photo and get an instant, human-readable breakdown of your meal.",
                  "Prenez une photo rapide et obtenez immédiatement une analyse claire et compréhensible de votre repas.",
                  "Haz una foto rápida y obtén al instante un desglose claro y fácil de entender de tu comida.",
                  "Tire uma fotografia rápida e obtenha de imediato uma análise clara e fácil de entender da sua refeição.",
                  "只需快速拍一张照片，就能立即看到一份清晰易懂的餐食解析。",
                  "التقط صورة سريعة واحصل فورًا على تحليل واضح ومفهوم لوجبتك.",
                  "Scatta una foto veloce e ottieni subito un'analisi chiara e comprensibile del tuo pasto.",
                  "Machen Sie ein schnelles Foto und erhalten Sie sofort eine klare, verständliche Aufschlüsselung Ihrer Mahlzeit.",
                  "Maak snel een foto en krijg direct een duidelijke, leesbare uitsplitsing van je maaltijd.",
                  "Сделайте снимок и мгновенно получите понятную разбивку состава вашего блюда.",
                  "さっと写真を撮るだけで、食事の内容が一目でわかる分析が即座に得られます。",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Workflow className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "AI-powered.",
                    "Propulsé par l'IA.",
                    "Impulsado por IA.",
                    "Com tecnologia de IA.",
                    "由人工智能驱动。",
                    "مدعوم بالذكاء الاصطناعي.",
                    "Basato su IA.",
                    "KI-gestützt.",
                    "Aangedreven door AI.",
                    "На базе ИИ.",
                    "AI搭載。",
                  )}
                </span>{" "}
                {t(
                  "Behind the scenes, CalorieVision uses modern image-recognition models to detect foods and estimate portions.",
                  "En coulisses, CalorieVision utilise des modèles modernes de reconnaissance d'images pour détecter les aliments et estimer les portions.",
                  "Entre bastidores, CalorieVision utiliza modelos modernos de reconocimiento de imágenes para detectar alimentos y estimar raciones.",
                  "Nos bastidores, o CalorieVision utiliza modelos modernos de reconhecimento de imagem para detetar alimentos e estimar porções.",
                  "在后台，CalorieVision 使用现代图像识别模型来识别食物并估算分量。",
                  "في الخلفية، يستخدم CalorieVision نماذج حديثة للتعرّف على الصور لاكتشاف الأطعمة وتقدير الحصص.",
                  "Dietro le quinte, CalorieVision utilizza moderni modelli di riconoscimento immagini per rilevare gli alimenti e stimare le porzioni.",
                  "Im Hintergrund verwendet CalorieVision moderne Bilderkennungsmodelle, um Lebensmittel zu erkennen und Portionen zu schätzen.",
                  "Achter de schermen gebruikt CalorieVision moderne beeldherkenningsmodellen om voedsel te detecteren en porties te schatten.",
                  "За кулисами CalorieVision использует современные модели распознавания изображений для обнаружения продуктов и оценки порций.",
                  "CalorieVisionはバックグラウンドで最新の画像認識モデルを使用して食品を検出し、量を推定します。",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "Educational, not clinical.",
                    "Éducatif, pas clinique.",
                    "Educativo, no clínico.",
                    "Educativo, não clínico.",
                    "侧重学习，而非临床用途。",
                    "تعليمي، وليس طبيًا.",
                    "Educativo, non clinico.",
                    "Lehrreich, nicht klinisch.",
                    "Educatief, niet klinisch.",
                    "Образовательный, не медицинский.",
                    "教育的であり、臨床的ではない。",
                  )}
                </span>{" "}
                {t(
                  "Insights are general and non-medical, meant to help you learn, not diagnose or prescribe.",
                  "Les informations sont générales et non médicales, destinées à vous aider à apprendre, pas à diagnostiquer ni à prescrire.",
                  "Las indicaciones son generales y no médicas; están pensadas para ayudarte a aprender, no para diagnosticar ni prescribir.",
                  "As informações são gerais e não médicas – servem para o ajudar a aprender, não para diagnosticar ou prescrever.",
                  "给出的只是一般性、非医疗性的提示，目的是帮助你学习，而不是用于诊断或开具处方。",
                  "المعلومات عامة وغير طبية، هدفها مساعدتك على التعلّم لا التشخيص أو وصف العلاج.",
                  "Le informazioni sono generali e non mediche, pensate per aiutarti a imparare, non per diagnosticare o prescrivere.",
                  "Die Erkenntnisse sind allgemein und nicht medizinisch, gedacht um Ihnen beim Lernen zu helfen, nicht um zu diagnostizieren oder zu verschreiben.",
                  "Inzichten zijn algemeen en niet-medisch, bedoeld om je te helpen leren, niet om te diagnosticeren of voor te schrijven.",
                  "Рекомендации носят общий и немедицинский характер — они помогают учиться, а не ставить диагноз или назначать лечение.",
                  "アドバイスは一般的で非医療的なものであり、学習を目的としています。診断や処方を意図したものではありません。",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "Helpful nutrition tips.",
                    "Conseils nutritionnels utiles.",
                    "Consejos nutricionales útiles.",
                    "Dicas de nutrição úteis.",
                    "实用的营养小贴士。",
                    "نصائح تغذية مفيدة.",
                    "Consigli nutrizionali utili.",
                    "Hilfreiche Ernährungstipps.",
                    "Handige voedingstips.",
                    "Полезные советы по питанию.",
                    "役立つ栄養のヒント。",
                  )}
                </span>{" "}
                {t(
                  "Receive friendly ideas like adding more vegetables or balancing carbs with protein.",
                  "Recevez des idées bienveillantes comme ajouter plus de légumes ou équilibrer glucides et protéines.",
                  "Recibe sugerencias amables, como añadir más verduras o equilibrar hidratos y proteínas.",
                  "Receba sugestões amigáveis, como adicionar mais legumes ou equilibrar hidratos de carbono com proteína.",
                  "你会收到一些友好的建议，比如多加点蔬菜，或让碳水和蛋白质更均衡。",
                  "احصل على اقتراحات ودّية مثل إضافة المزيد من الخضروات أو تحقيق توازن بين الكربوهيدرات والبروتين.",
                  "Ricevi suggerimenti amichevoli come aggiungere più verdure o bilanciare carboidrati e proteine.",
                  "Erhalten Sie freundliche Vorschläge wie mehr Gemüse hinzuzufügen oder Kohlenhydrate mit Eiweiß auszugleichen.",
                  "Ontvang vriendelijke ideeën zoals meer groenten toevoegen of koolhydraten balanceren met eiwitten.",
                  "Получайте дружеские советы — например, добавить больше овощей или сбалансировать углеводы с белком.",
                  "野菜を増やしたり、炭水化物とタンパク質のバランスを取るなど、親切なアドバイスを受け取れます。",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "Private and respectful.",
                    "Privé et respectueux.",
                    "Privado y respetuoso.",
                    "Privado e respeitoso.",
                    "重视隐私与尊重。",
                    "خاص ومحترم.",
                    "Privato e rispettoso.",
                    "Privat und respektvoll.",
                    "Privé en respectvol.",
                    "Конфиденциально и уважительно.",
                    "プライベートで敬意ある。",
                  )}
                </span>{" "}
                {t(
                  "Photos are not stored and are not used to train models – your meal is your business.",
                  "Les photos ne sont pas conservées et ne sont pas utilisées pour entraîner des modèles – votre repas vous appartient.",
                  "Las fotos no se guardan ni se utilizan para entrenar modelos: tu comida es solo tuya.",
                  "As fotografias não são guardadas nem utilizadas para treinar modelos – a sua refeição é assunto seu.",
                  "照片不会被保存，也不会用于训练模型——你的餐食只属于你自己。",
                  "لا يتم تخزين الصور ولا تُستخدم لتدريب النماذج – وجبتك شأنك الخاص.",
                  "Le foto non vengono salvate e non vengono usate per addestrare modelli – il tuo pasto sono affari tuoi.",
                  "Fotos werden nicht gespeichert und nicht zum Trainieren von Modellen verwendet – Ihre Mahlzeit ist Ihre Privatsache.",
                  "Foto's worden niet opgeslagen en niet gebruikt om modellen te trainen – je maaltijd is jouw zaak.",
                  "Фотографии не хранятся и не используются для обучения моделей — ваше блюдо остаётся вашим личным делом.",
                  "写真は保存されず、モデルのトレーニングにも使用されません。あなたの食事はあなただけのものです。",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "100% free to use.",
                    "100 % gratuit à utiliser.",
                    "100 % gratuito de usar.",
                    "100 % gratuito para utilizar.",
                    "完全免费使用。",
                    "مجاني 100%.",
                    "100% gratuito.",
                    "100% kostenlos.",
                    "100% gratis te gebruiken.",
                    "100% бесплатно.",
                    "100%無料で使用可能。",
                  )}
                </span>{" "}
                {t(
                  "Explore your meals as often as you like without subscriptions or paywalls.",
                  "Explorez vos repas aussi souvent que vous le souhaitez, sans abonnement ni mur payant.",
                  "Explora tus comidas tantas veces como quieras, sin suscripciones ni muros de pago.",
                  "Explore as suas refeições sempre que quiser, sem subscrições nem paywalls.",
                  "你可以随时多次分析自己的餐食，无需订阅，也没有任何付费墙。",
                  "استكشف وجباتك بقدر ما تشاء دون اشتراكات أو قيود مدفوعة.",
                  "Esplora i tuoi pasti tutte le volte che vuoi senza abbonamenti o paywall.",
                  "Analysieren Sie Ihre Mahlzeiten so oft Sie möchten ohne Abonnements oder Bezahlschranken.",
                  "Ontdek je maaltijden zo vaak als je wilt zonder abonnementen of betaalmuren.",
                  "Анализируйте блюда сколько угодно раз без подписок и платных барьеров.",
                  "サブスクリプションや有料コンテンツなしで、好きなだけ食事を分析できます。",
                )}
              </span>
            </li>
          </ul>
        </section>
      </section>
      </ScrollAnimation>

      {/* How it Works Visual Section */}
      <ScrollAnimation animation="fade-up" delay={200} duration={700}>
      <section className="section-card">
        <div className="mb-6">
          <p className="eyebrow">
            {t(
              "See it in action",
              "Voyez-le en action",
              "Vea cómo funciona",
              "Veja em ação",
              "看看如何运作",
              "شاهده أثناء العمل",
              "Guardalo in azione",
              "Sehen Sie es in Aktion",
              "Bekijk het in actie",
              "Смотрите в действии",
              "実際に動作を見る",
            )}
          </p>
          <h2 className="text-2xl font-semibold md:text-3xl">
            {t(
              "How CalorieVision Works",
              "Comment fonctionne CalorieVision",
              "Cómo funciona CalorieVision",
              "Como funciona o CalorieVision",
              "CalorieVision 如何运作",
              "كيف يعمل CalorieVision",
              "Come funziona CalorieVision",
              "So funktioniert CalorieVision",
              "Hoe CalorieVision werkt",
              "Как работает CalorieVision",
              "CalorieVisionの仕組み",
            )}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl overflow-hidden bg-secondary/40 p-4">
            <img
              src={howItWorks1}
              alt={t(
                "Taking a photo of a meal with a smartphone",
                "Prise de photo d'un repas avec un smartphone",
                "Tomando una foto de una comida con un smartphone",
                "Tirando uma foto de uma refeição com um smartphone",
                "用智能手机拍摄餐食照片",
                "التقاط صورة لوجبة بالهاتف الذكي",
                "Scattare una foto di un pasto con lo smartphone",
                "Ein Foto einer Mahlzeit mit dem Smartphone aufnehmen",
                "Een foto maken van een maaltijd met een smartphone",
                "Фотографирование еды на смартфон",
                "スマートフォンで食事の写真を撮る",
              )}
              className="w-full h-48 md:h-64 object-cover rounded-xl mb-4"
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
            />
            <h3 className="font-semibold text-lg mb-2">
              {t(
                "1. Capture Your Meal",
                "1. Capturez votre repas",
                "1. Capture su comida",
                "1. Capture sua refeição",
                "1. 拍摄您的餐食",
                "1. التقط صورة وجبتك",
                "1. Cattura il tuo pasto",
                "1. Fotografieren Sie Ihre Mahlzeit",
                "1. Leg je maaltijd vast",
                "1. Сфотографируйте блюдо",
                "1. 食事を撮影する",
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Simply take a photo of your plate with your smartphone. Make sure the lighting is good and all foods are visible.",
                "Prenez simplement une photo de votre assiette avec votre smartphone. Assurez-vous que l'éclairage est bon et que tous les aliments sont visibles.",
                "Simplemente tome una foto de su plato con su smartphone. Asegúrese de que la iluminación sea buena y todos los alimentos sean visibles.",
                "Basta tirar uma foto do seu prato com o smartphone. Certifique-se de que a iluminação é boa e todos os alimentos são visíveis.",
                "只需用智能手机拍摄您的餐盘照片。确保光线良好，所有食物都清晰可见。",
                "ما عليك سوى التقاط صورة لطبقك بهاتفك الذكي. تأكد من أن الإضاءة جيدة وأن جميع الأطعمة مرئية.",
                "Scatta semplicemente una foto del tuo piatto con lo smartphone. Assicurati che l'illuminazione sia buona e che tutti gli alimenti siano visibili.",
                "Machen Sie einfach ein Foto Ihres Tellers mit Ihrem Smartphone. Achten Sie auf gute Beleuchtung und dass alle Lebensmittel sichtbar sind.",
                "Maak gewoon een foto van je bord met je smartphone. Zorg voor goede verlichting en dat alle voedingsmiddelen zichtbaar zijn.",
                "Просто сфотографируйте тарелку на смартфон. Убедитесь, что освещение хорошее и все продукты видны.",
                "スマートフォンでお皿の写真を撮るだけです。照明が良く、すべての食品が見えるようにしてください。",
              )}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden bg-secondary/40 p-4">
            <img
              src={howItWorks2}
              alt={t(
                "Nutrition analysis dashboard showing calories and macros",
                "Tableau de bord d'analyse nutritionnelle affichant les calories et les macros",
                "Panel de análisis nutricional mostrando calorías y macros",
                "Painel de análise nutricional mostrando calorias e macros",
                "显示卡路里和宏量营养素的营养分析仪表板",
                "لوحة تحليل التغذية تعرض السعرات الحرارية والماكروز",
                "Dashboard di analisi nutrizionale che mostra calorie e macro",
                "Ernährungsanalyse-Dashboard mit Kalorien und Makronährstoffen",
                "Voedingsanalyse dashboard met calorieën en macro's",
                "Панель анализа питания с калориями и макронутриентами",
                "カロリーとマクロ栄養素を示す栄養分析ダッシュボード",
              )}
              className="w-full h-48 md:h-64 object-cover rounded-xl mb-4"
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
            />
            <h3 className="font-semibold text-lg mb-2">
              {t(
                "2. Get Instant Analysis",
                "2. Obtenez une analyse instantanée",
                "2. Obtenga análisis instantáneo",
                "2. Obtenha análise instantânea",
                "2. 获取即时分析",
                "2. احصل على تحليل فوري",
                "2. Ottieni un'analisi istantanea",
                "2. Erhalten Sie sofortige Analyse",
                "2. Ontvang directe analyse",
                "2. Получите мгновенный анализ",
                "2. 即座に分析を取得する",
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Our AI analyzes your meal and provides a detailed breakdown of calories, proteins, carbs, and fats for each food item.",
                "Notre IA analyse votre repas et fournit une répartition détaillée des calories, protéines, glucides et lipides pour chaque aliment.",
                "Nuestra IA analiza su comida y proporciona un desglose detallado de calorías, proteínas, carbohidratos y grasas para cada alimento.",
                "Nossa IA analisa sua refeição e fornece uma análise detalhada de calorias, proteínas, carboidratos e gorduras para cada alimento.",
                "我们的 AI 分析您的餐食，并为每种食物提供卡路里、蛋白质、碳水化合物和脂肪的详细分解。",
                "يحلل الذكاء الاصطناعي لدينا وجبتك ويقدم تفصيلاً للسعرات الحرارية والبروتينات والكربوهيدرات والدهون لكل عنصر غذائي.",
                "La nostra IA analizza il tuo pasto e fornisce una ripartizione dettagliata di calorie, proteine, carboidrati e grassi per ogni alimento.",
                "Unsere KI analysiert Ihre Mahlzeit und liefert eine detaillierte Aufschlüsselung von Kalorien, Proteinen, Kohlenhydraten und Fetten für jedes Lebensmittel.",
                "Onze AI analyseert je maaltijd en geeft een gedetailleerde uitsplitsing van calorieën, eiwitten, koolhydraten en vetten voor elk voedingsmiddel.",
                "Наш ИИ анализирует блюдо и предоставляет подробную разбивку калорий, белков, углеводов и жиров по каждому продукту.",
                "AIが食事を分析し、各食品のカロリー・タンパク質・炭水化物・脂質の詳細な内訳を提供します。",
              )}
            </p>
          </div>
        </div>
      </section>
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" delay={250} duration={700}>
      <section id="home-how-it-works" aria-labelledby="home-how-it-works-heading" className="section-card">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">
              {t(
                "From photo to insight",
                "De la photo à l'analyse",
                "De la foto a la información",
                "Da foto a insight",
                "从照片到洞察",
                "من الصورة إلى المعلومة",
                "Dalla foto all'analisi",
                "Vom Foto zur Erkenntnis",
                "Van foto naar inzicht",
                "От фото к пониманию",
                "写真から洞察へ",
              )}
            </p>
            <h2 id="home-how-it-works-heading" className="text-2xl font-semibold md:text-3xl">
              {t(
                "How it works in four simple steps",
                "Comment ça marche en quatre étapes simples",
                "Cómo funciona en cuatro pasos sencillos",
                "Como funciona em quatro passos simples",
                "四个简单步骤了解其工作方式",
                "كيف تعمل الخدمة في أربع خطوات بسيطة",
                "Come funziona in quattro semplici passaggi",
                "So funktioniert es in vier einfachen Schritten",
                "Hoe het werkt in vier eenvoudige stappen",
                "Как это работает в четырёх простых шагах",
                "4つの簡単なステップでの仕組み",
              )}
            </h2>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden shrink-0 md:inline-flex">
            <LocalizedNavLink to="/how-it-works" className="text-border bg-primary">
              {t(
                "Deep dive",
                "Voir en détail",
                "Ver en detalle",
                "Ver em detalhe",
                "详细了解",
                "استكشاف متعمّق",
                "Approfondisci",
                "Mehr erfahren",
                "Meer weten",
                "Подробнее",
                "詳しく見る",
              )}
            </LocalizedNavLink>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4 md:gap-6">
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 1 – Upload your meal photo",
                "Étape 1 – Téléchargez la photo de votre repas",
                "Paso 1 – Sube la foto de tu comida",
                "Passo 1 – Carregue a foto da sua refeição",
                "步骤一：上传餐食照片",
                "الخطوة 1 – ارفع صورة وجبتك",
                "Passo 1 – Carica la foto del tuo pasto",
                "Schritt 1 – Laden Sie Ihr Mahlzeitenfoto hoch",
                "Stap 1 – Upload je maaltijdfoto",
                "Шаг 1 – Загрузите фото блюда",
                "ステップ1 – 食事の写真をアップロード",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "Take a clear picture of your meal or upload one from your device. The clearer the image, the better the estimate.",
                "Prenez une photo claire de votre repas ou importez-en une depuis votre appareil. Plus l'image est nette, plus l'estimation sera fiable.",
                "Haz una foto nítida de tu comida o súbela desde tu dispositivo. Cuanto más clara sea la imagen, más fiable será la estimación.",
                "Tire uma fotografia nítida da sua refeição ou carregue uma a partir do seu dispositivo. Quanto mais clara for a imagem, mais fiável será a estimativa.",
                "拍一张清晰的餐食照片或从设备中上传一张。图片越清晰，估算结果就越可靠。",
                "التقط صورة واضحة لوجبتك أو ارفعها من جهازك. كلما كانت الصورة أوضح، كان التقدير أدق.",
                "Scatta una foto nitida del tuo pasto o caricane una dal tuo dispositivo. Più l'immagine è chiara, migliore sarà la stima.",
                "Machen Sie ein klares Foto Ihrer Mahlzeit oder laden Sie eines von Ihrem Gerät hoch. Je klarer das Bild, desto besser die Schätzung.",
                "Maak een duidelijke foto van je maaltijd of upload er een vanaf je apparaat. Hoe helderder de afbeelding, hoe beter de schatting.",
                "Сделайте чёткий снимок блюда или загрузите фото с устройства. Чем чётче изображение, тем точнее оценка.",
                "食事の鮮明な写真を撮るか、デバイスからアップロードしてください。画像が鮮明であるほど、推定精度が向上します。",
              )}
            </p>
          </article>
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 2 – AI food detection",
                "Étape 2 – Détection des aliments par IA",
                "Paso 2 – Detección de alimentos con IA",
                "Passo 2 – Detecção de alimentos com IA",
                "步骤二：AI 食物识别",
                "الخطوة 2 – اكتشاف الطعام بالذكاء الاصطناعي",
                "Passo 2 – Rilevamento alimenti con IA",
                "Schritt 2 – KI-Lebensmittelerkennung",
                "Stap 2 – AI-voedseldetectie",
                "Шаг 2 – Распознавание продуктов ИИ",
                "ステップ2 – AIによる食品検出",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "Our AI looks at shapes, colours, and textures to identify what's on your plate using vision technology.",
                "Notre IA analyse les formes, les couleurs et les textures pour identifier ce qui se trouve dans votre assiette grâce à la vision par ordinateur.",
                "Nuestra IA analiza formas, colores y texturas para identificar qué hay en tu plato usando tecnología de visión.",
                "A nossa IA analisa formas, cores e texturas para identificar o que está no seu prato utilizando tecnologia de visão.",
                "我们的 AI 会通过分析形状、颜色和纹理，识别餐盘中的食物。",
                "يحلّل الذكاء الاصطناعي الأشكال والألوان والقوام لتحديد ما في طبقك باستخدام تقنية الرؤية.",
                "La nostra IA analizza forme, colori e texture per identificare cosa c'è nel tuo piatto usando la tecnologia visiva.",
                "Unsere KI analysiert Formen, Farben und Texturen, um mithilfe von Bilderkennungstechnologie zu identifizieren, was auf Ihrem Teller ist.",
                "Onze AI bekijkt vormen, kleuren en texturen om te identificeren wat er op je bord ligt met behulp van visietechnologie.",
                "Наш ИИ анализирует формы, цвета и текстуры, чтобы определить, что находится на тарелке, используя технологию компьютерного зрения.",
                "AIは形状・色・食感を分析し、ビジョン技術でお皿の上の食品を識別します。",
              )}
            </p>
          </article>
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 3 – Calorie estimation",
                "Étape 3 – Estimation des calories",
                "Paso 3 – Estimación de calorías",
                "Passo 3 – Estimativa de calorias",
                "步骤三：热量估算",
                "الخطوة 3 – تقدير السعرات",
                "Passo 3 – Stima delle calorie",
                "Schritt 3 – Kalorienschätzung",
                "Stap 3 – Calorieënschatting",
                "Шаг 3 – Оценка калорийности",
                "ステップ3 – カロリー推定",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "CalorieVision uses nutrition reference data to estimate calories for each item and the total meal.",
                "CalorieVision utilise des tables de référence nutritionnelle pour estimer les calories de chaque aliment et du repas total.",
                "CalorieVision utiliza tablas de referencia nutricional para estimar las calorías de cada alimento y de la comida completa.",
                "O CalorieVision utiliza tabelas de referência nutricional para estimar as calorias de cada alimento e da refeição completa.",
                "CalorieVision 使用营养参考数据来估算每种食物以及整顿餐的大致热量。",
                "يستخدم CalorieVision بيانات غذائية مرجعية لتقدير السعرات الحرارية لكل عنصر وللوجبة ككل.",
                "CalorieVision utilizza dati nutrizionali di riferimento per stimare le calorie di ogni alimento e del pasto totale.",
                "CalorieVision verwendet Ernährungsreferenzdaten, um Kalorien für jedes Element und die gesamte Mahlzeit zu schätzen.",
                "CalorieVision gebruikt voedingsreferentiegegevens om calorieën te schatten voor elk item en de totale maaltijd.",
                "CalorieVision использует справочные данные по питательности для оценки калорий каждого продукта и всего блюда.",
                "CalorieVisionは栄養参照データを使用して、各食品と食事全体のカロリーを推定します。",
              )}
            </p>
          </article>
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 4 – Simple nutrition tips",
                "Étape 4 – Conseils nutritionnels simples",
                "Paso 4 – Consejos de nutrición sencillos",
                "Passo 4 – Dicas de nutrição simples",
                "步骤四：简单的营养建议",
                "الخطوة 4 – نصائح تغذية بسيطة",
                "Passo 4 – Consigli nutrizionali semplici",
                "Schritt 4 – Einfache Ernährungstipps",
                "Stap 4 – Eenvoudige voedingstips",
                "Шаг 4 – Простые советы по питанию",
                "ステップ4 – シンプルな栄養アドバイス",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "You see friendly, non-medical suggestions to help you build more balanced plates over time.",
                "Vous recevez des suggestions bienveillantes, non médicales, pour vous aider à composer des assiettes plus équilibrées au fil du temps.",
                "Recibes sugerencias amables y no médicas que te ayudan a construir platos más equilibrados con el tiempo.",
                "Recebe sugestões amigáveis, não médicas, para o ajudar a montar pratos mais equilibrados ao longo do tempo.",
                "你会看到一些友好、非医疗性的建议，帮助你在日常中逐渐打造更均衡的餐盘。",
                "ستتلقّى اقتراحات ودّية وغير طبية لمساعدتك على بناء أطباق أكثر توازنًا بمرور الوقت.",
                "Vedrai suggerimenti amichevoli e non medici per aiutarti a costruire piatti più equilibrati nel tempo.",
                "Sie erhalten freundliche, nicht-medizinische Vorschläge, die Ihnen helfen, im Laufe der Zeit ausgewogenere Mahlzeiten zusammenzustellen.",
                "Je ziet vriendelijke, niet-medische suggesties om je te helpen na verloop van tijd evenwichtigere borden samen te stellen.",
                "Вы получаете дружеские, немедицинские рекомендации, которые помогают со временем составлять более сбалансированное меню.",
                "時間をかけてよりバランスの取れた食事を作るための、親切で非医療的なアドバイスが表示されます。",
              )}
            </p>
          </article>
        </div>
      </section>

      <section id="home-faq" aria-labelledby="home-faq-heading" className="section-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">
              {t(
                "Frequently asked questions",
                "Questions fréquentes",
                "Preguntas frecuentes",
                "Perguntas frequentes",
                "常见问题",
                "الأسئلة الشائعة",
                "Domande frequenti",
                "Häufig gestellte Fragen",
                "Veelgestelde vragen",
                "Часто задаваемые вопросы",
                "よくある質問",
              )}
            </p>
            <h2 id="home-faq-heading" className="text-2xl font-semibold md:text-3xl">
              {t(
                "Still have questions?",
                "Vous avez encore des questions ?",
                "¿Todavía tienes dudas?",
                "Ainda tem dúvidas?",
                "还有疑问吗？",
                "لديك المزيد من الأسئلة؟",
                "Hai ancora domande?",
                "Haben Sie noch Fragen?",
                "Heeft u nog vragen?",
                "Остались вопросы?",
                "まだ質問がありますか？",
              )}
            </h2>
          </div>
          <Button variant="outline" size="lg" asChild>
            <LocalizedNavLink to="/faq" className="bg-primary text-secondary">
              {t(
                "View full FAQ",
                "Consulter la FAQ complète",
                "Ver la FAQ completa",
                "Ver FAQ completa",
                "查看完整常见问题",
                "عرض الأسئلة الشائعة الكاملة",
                "Vedi FAQ completa",
                "Vollständige FAQ anzeigen",
                "Bekijk volledige FAQ",
                "Полный список вопросов",
                "完全なFAQを見る",
              )}
            </LocalizedNavLink>
          </Button>
        </div>
      </section>
      </ScrollAnimation>

    </>;
};
export default Index;
