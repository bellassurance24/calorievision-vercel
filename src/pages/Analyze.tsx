import { FormEvent, useEffect, useRef, useState } from "react";
import { Lightbulb, UtensilsCrossed, X, AlertTriangle } from "lucide-react";
import { MealScannerLottie } from "@/components/MealScannerLottie";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams, useNavigate } from "react-router-dom";

import { translateFoodName, isEnglishFoodName } from "@/utils/foodTranslations";
import { supabase } from "@/integrations/supabase/client";
import { trackMealAnalysis } from "@/hooks/useAnalytics";
import { getDeviceInfo } from "@/hooks/useDeviceInfo";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { LimitReachedModal } from "@/components/LimitReachedModal";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

interface MealTotal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealAnalysis {
  status: string;
  food: FoodItem[];
  total: MealTotal;
}

// ── Guest scan counter (localStorage, no auth required) ─────────────────────
const GUEST_SCAN_KEY = "cv_guest_scans";
const GUEST_SCAN_LIMIT = 2;

function getGuestScansToday(): number {
  try {
    const raw = localStorage.getItem(GUEST_SCAN_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw) as { date: string; count: number };
    const today = new Date().toISOString().slice(0, 10);
    return date === today ? (count ?? 0) : 0;
  } catch {
    return 0;
  }
}

function incrementGuestScans(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = getGuestScansToday();
    localStorage.setItem(GUEST_SCAN_KEY, JSON.stringify({ date: today, count: existing + 1 }));
  } catch { /* ignore — localStorage may be unavailable */ }
}

const Analyze = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isAtLimit, plan, dailyScans, monthlyScans, dailyLimit, monthlyLimit, incrementLocalCount, refresh } = useSubscription();
  // Guest scan tracking — state-backed so guestAtLimit reacts after each scan
  const [guestScanCount, setGuestScanCount] = useState(() => getGuestScansToday());
  const guestAtLimit = !user && guestScanCount >= GUEST_SCAN_LIMIT;

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasTriggeredAutoCapture, setHasTriggeredAutoCapture] = useState(false);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(true);
  const [rawError, setRawError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = (en: string, fr: string, es: string, pt?: string, zh?: string, ar?: string, it?: string, de?: string, nl?: string) => {
    if (language === "fr") return fr;
    if (language === "es") return es;
    if (language === "pt") return pt ?? en;
    if (language === "zh") return zh ?? en;
    if (language === "ar") return ar ?? en;
    if (language === "it") return it ?? en;
    if (language === "de") return de ?? en;
    if (language === "nl") return nl ?? en;
    return en;
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const shouldCapture = searchParams.get("capture") === "1";

    if (shouldCapture && fileInputRef.current && !hasTriggeredAutoCapture) {
      setHasTriggeredAutoCapture(true);
      fileInputRef.current.click();
    }
  }, [searchParams, hasTriggeredAutoCapture]);

  usePageMetadata({
    title: t(
      "Analyze a Meal Photo - CalorieVision",
      "Analyser une photo de repas - CalorieVision",
      "Analizar una foto de comida - CalorieVision",
      "Analisar uma foto de refeição - CalorieVision",
      "分析餐食照片 - CalorieVision",
      "تحليل صورة وجبة - CalorieVision",
    ),
    description: t(
      "Upload a meal photo to CalorieVision and let AI estimate foods, calories per item, total calories, and friendly nutrition tips.",
      "Téléchargez une photo de repas dans CalorieVision et laissez l'IA estimer les aliments, les calories par élément, le total et quelques conseils nutritionnels bienveillants.",
      "Sube una foto de tu comida a CalorieVision y deja que la IA estime los alimentos, las calorías por elemento, el total y algunos consejos de nutrición amables.",
      "Carregue uma foto de refeição no CalorieVision e deixe a IA estimar os alimentos, as calorias por item, o total e algumas dicas de nutrição amigáveis.",
      "上传餐食照片到 CalorieVision，让 AI 估算食物、每项热量、总热量以及友好的营养提示。",
      "ارفع صورة وجبة إلى CalorieVision ودَع الذكاء الاصطناعي يقدّر الأطعمة والسعرات لكل عنصر والإجمالي ونصائح تغذية بسيطة.",
    ),
    path: "/analyze",
  });

  const contentByLang = {
    en: {
      eyebrow: "Live AI demo",
      title: "Analyze a meal photo",
      intro:
        "Upload a clear photo of your meal and CalorieVision will use AI to estimate visible foods, approximate calories, and macros. Results are educational only and based on what can be inferred from the image.",
      uploadTitle: "Upload your meal photo",
      uploadDescription: "Choose a bright, in-focus image where the full plate is visible for the best analysis quality.",
      mealPhotoLabel: "Meal photo",
      analyzeButton: "Upload a photo",
      analyzePhotoButton: "Analyze the photo",
      reminderTitle: "Reminder",
      reminderText:
        "CalorieVision is an educational tool only. Estimates are approximate and should not be treated as medical or dietary advice.",
      previewTitle: "Meal preview",
      previewDescription: "Check that your photo is clear before running an analysis.",
      previewPlaceholder: "Your meal photo preview will appear here.",
      analysisTitle: "AI analysis",
      analysisDescription: "See an approximate calorie and macro breakdown based on the visible foods.",
      emptyState: "Upload a meal photo and select \"Analyze meal\" to view AI-generated results here.",
      generating: "Generating your analysis...",
      totalLabel: "Total",
      protein: "Protein",
      carbs: "Carbs",
      fat: "Fat",
    },
    fr: {
      eyebrow: "Démo IA en direct",
      title: "Analyser une photo de repas",
      intro:
        "Téléchargez une photo claire de votre repas et CalorieVision utilisera l'IA pour estimer les aliments visibles, les calories approximatives et les macros. Les résultats sont uniquement éducatifs et basés sur ce que l'image permet d'observer.",
      uploadTitle: "Téléchargez la photo de votre repas",
      uploadDescription:
        "Choisissez une image nette et bien éclairée où l'assiette entière est visible pour une meilleure qualité d'analyse.",
      mealPhotoLabel: "Photo du repas",
      analyzeButton: "Télécharger une photo",
      analyzePhotoButton: "Analyser la photo",
      reminderTitle: "Rappel",
      reminderText:
        "CalorieVision est un outil éducatif uniquement. Les estimations sont approximatives et ne doivent pas être considérées comme des conseils médicaux ou diététiques.",
      previewTitle: "Aperçu du repas",
      previewDescription: "Vérifiez que la photo est claire avant de lancer l'analyse.",
      previewPlaceholder: "L'aperçu de votre repas apparaîtra ici.",
      analysisTitle: "Analyse IA",
      analysisDescription:
        "Découvrez une estimation des calories et des macros basées sur les aliments visibles.",
      emptyState:
        "Téléchargez une photo de repas puis sélectionnez \"Analyser le repas\" pour voir les résultats générés par l'IA ici.",
      generating: "Génération de votre analyse...",
      totalLabel: "Total",
      protein: "Protéines",
      carbs: "Glucides",
      fat: "Lipides",
    },
    es: {
      eyebrow: "Demostración de IA en vivo",
      title: "Analizar una foto de comida",
      intro:
        "Sube una foto clara de tu comida y CalorieVision utilizará IA para estimar los alimentos visibles, las calorías aproximadas y los macros. Los resultados son solo educativos y se basan en lo que puede verse en la imagen.",
      uploadTitle: "Sube la foto de tu comida",
      uploadDescription:
        "Elige una imagen bien iluminada y nítida donde se vea todo el plato para obtener el mejor análisis.",
      mealPhotoLabel: "Foto de la comida",
      analyzeButton: "Subir una foto",
      analyzePhotoButton: "Analizar la foto",
      reminderTitle: "Recordatorio",
      reminderText:
        "CalorieVision es solo una herramienta educativa. Las estimaciones son aproximadas y no deben tomarse como consejos médicos o dietéticos.",
      previewTitle: "Vista previa de la comida",
      previewDescription: "Comprueba que la foto sea clara antes de ejecutar el análisis.",
      previewPlaceholder: "La vista previa de tu comida aparecerá aquí.",
      analysisTitle: "Análisis con IA",
      analysisDescription:
        "Consulta una estimación de calorías y macros basados en los alimentos visibles.",
      emptyState:
        "Sube una foto de tu comida y selecciona \"Analizar comida\" para ver aquí los resultados generados por IA.",
      generating: "Generando tu análisis...",
      totalLabel: "Total",
      protein: "Proteínas",
      carbs: "Carbohidratos",
      fat: "Grasas",
    },
    pt: {
      eyebrow: "Demonstração de IA em tempo real",
      title: "Analisar uma foto de refeição",
      intro:
        "Carregue uma foto nítida da sua refeição e o CalorieVision irá usar IA para estimar os alimentos visíveis, as calorias aproximadas e os macros. Os resultados são apenas educativos e baseiam-se no que é possível ver na imagem.",
      uploadTitle: "Carregar a foto da refeição",
      uploadDescription:
        "Escolha uma imagem bem iluminada e focada onde o prato inteiro esteja visível para obter a melhor qualidade de análise.",
      mealPhotoLabel: "Foto da refeição",
      analyzeButton: "Carregar uma foto",
      analyzePhotoButton: "Analisar a foto",
      reminderTitle: "Lembrete",
      reminderText:
        "CalorieVision é apenas uma ferramenta educativa. As estimativas são aproximadas e não devem ser tratadas como aconselhamento médico ou nutricional.",
      previewTitle: "Pré-visualização da refeição",
      previewDescription: "Verifique se a sua foto está nítida antes de iniciar a análise.",
      previewPlaceholder: "A pré-visualização da sua refeição aparecerá aqui.",
      analysisTitle: "Análise com IA",
      analysisDescription:
        "Veja uma estimativa aproximada de calorias e macros com base nos alimentos visíveis.",
      emptyState:
        "Carregue uma foto da refeição e selecione \"Analisar refeição\" para ver aqui os resultados gerados por IA.",
      generating: "A gerar a sua análise...",
      totalLabel: "Total",
      protein: "Proteína",
      carbs: "Carboidratos",
      fat: "Gordura",
    },
    zh: {
      eyebrow: "实时 AI 演示",
      title: "分析一张餐食照片",
      intro:
        "上传一张清晰的餐食照片，CalorieVision 会使用 AI 估算可见食物、大致热量和宏量营养素。结果仅供学习参考，基于图片中能够看见的内容。",
      uploadTitle: "上传餐食照片",
      uploadDescription:
        "请选择一张光线充足、对焦清晰并且能看到整只餐盘的图片，以获得更好的分析效果。",
      mealPhotoLabel: "餐食照片",
      analyzeButton: "上传照片",
      analyzePhotoButton: "分析照片",
      reminderTitle: "温馨提示",
      reminderText:
        "CalorieVision 只是一个教育工具。所有估算值都为近似值，不应被视为医疗或饮食建议。",
      previewTitle: "餐食预览",
      previewDescription: "在开始分析前，先确认照片是否清晰。",
      previewPlaceholder: "你的餐食照片预览会显示在这里。",
      analysisTitle: "AI 分析结果",
      analysisDescription: "查看每个食物项和整餐的大致热量和宏量营养素分布。",
      emptyState:
        "上传一张餐食照片并点击「分析餐食」，在这里查看 AI 生成的结果。",
      generating: "正在生成分析结果…",
      totalLabel: "总计",
      protein: "蛋白质",
      carbs: "碳水化合物",
      fat: "脂肪",
    },
    ar: {
      eyebrow: "عرض حي للذكاء الاصطناعي",
      title: "حلّل صورة وجبة",
      intro:
        "ارفع صورة واضحة لوجبتك، وسيستخدم CalorieVision الذكاء الاصطناعي لتقدير الأطعمة الظاهرة، السعرات التقريبية، والماكروز. النتائج تعليمية فقط وتعتمد على ما يمكن استنتاجه من الصورة.",
      uploadTitle: "ارفع صورة وجبتك",
      uploadDescription:
        "اختر صورة جيدة الإضاءة وواضحة يظهر فيها الطبق بالكامل للحصول على أفضل جودة تحليل.",
      mealPhotoLabel: "صورة الوجبة",
      analyzeButton: "تحميل صورة",
      analyzePhotoButton: "تحليل الصورة",
      reminderTitle: "تذكير",
      reminderText:
        "CalorieVision أداة تعليمية فقط. التقديرات تقريبية ولا يجب اعتبارها نصيحة طبية أو غذائية.",
      previewTitle: "معاينة الوجبة",
      previewDescription: "تأكد من أن الصورة واضحة قبل بدء التحليل.",
      previewPlaceholder: "ستظهر معاينة صورة وجبتك هنا.",
      analysisTitle: "تحليل الذكاء الاصطناعي",
      analysisDescription:
        "اطّلع على توزيع تقريبي للسعرات والماكروز بناءً على الأطعمة الظاهرة.",
      emptyState:
        "ارفع صورة وجبة ثم اختر \"تحليل الوجبة\" لعرض النتائج التي يولدها الذكاء الاصطناعي هنا.",
      generating: "جاري إنشاء التحليل...",
      totalLabel: "الإجمالي",
      protein: "بروتين",
      carbs: "كربوهيدرات",
      fat: "دهون",
    },
    it: {
      eyebrow: "Demo IA in tempo reale",
      title: "Analizza una foto del pasto",
      intro:
        "Carica una foto nitida del tuo pasto e CalorieVision utilizzerà l'IA per stimare gli alimenti visibili, le calorie approssimative e i macro. I risultati sono solo a scopo educativo e si basano su ciò che è visibile nell'immagine.",
      uploadTitle: "Carica la foto del tuo pasto",
      uploadDescription:
        "Scegli un'immagine ben illuminata e a fuoco in cui sia visibile l'intero piatto per la migliore qualità di analisi.",
      mealPhotoLabel: "Foto del pasto",
      analyzeButton: "Carica una foto",
      analyzePhotoButton: "Analizza la foto",
      reminderTitle: "Promemoria",
      reminderText:
        "CalorieVision è solo uno strumento educativo. Le stime sono approssimative e non devono essere considerate consigli medici o dietetici.",
      previewTitle: "Anteprima del pasto",
      previewDescription: "Verifica che la foto sia nitida prima di avviare l'analisi.",
      previewPlaceholder: "L'anteprima della foto del tuo pasto apparirà qui.",
      analysisTitle: "Analisi IA",
      analysisDescription:
        "Visualizza una stima approssimativa di calorie e macro basata sugli alimenti visibili.",
      emptyState:
        "Carica una foto del pasto e seleziona \"Analizza pasto\" per visualizzare qui i risultati generati dall'IA.",
      generating: "Generazione dell'analisi in corso...",
      totalLabel: "Totale",
      protein: "Proteine",
      carbs: "Carboidrati",
      fat: "Grassi",
    },
    de: {
      eyebrow: "Live KI-Demo",
      title: "Analysieren Sie ein Mahlzeitenfoto",
      intro:
        "Laden Sie ein klares Foto Ihrer Mahlzeit hoch und CalorieVision verwendet KI, um sichtbare Lebensmittel, ungefähre Kalorien und Makros zu schätzen. Die Ergebnisse dienen nur zu Bildungszwecken und basieren auf dem, was im Bild erkennbar ist.",
      uploadTitle: "Laden Sie Ihr Mahlzeitenfoto hoch",
      uploadDescription:
        "Wählen Sie ein helles, scharfes Bild, auf dem der gesamte Teller sichtbar ist, für die beste Analysequalität.",
      mealPhotoLabel: "Mahlzeitenfoto",
      analyzeButton: "Foto hochladen",
      analyzePhotoButton: "Foto analysieren",
      reminderTitle: "Erinnerung",
      reminderText:
        "CalorieVision ist nur ein Bildungswerkzeug. Die Schätzungen sind ungefähr und sollten nicht als medizinische oder diätetische Beratung angesehen werden.",
      previewTitle: "Mahlzeitenvorschau",
      previewDescription: "Überprüfen Sie, ob Ihr Foto klar ist, bevor Sie die Analyse starten.",
      previewPlaceholder: "Die Vorschau Ihres Mahlzeitenfotos erscheint hier.",
      analysisTitle: "KI-Analyse",
      analysisDescription:
        "Sehen Sie eine ungefähre Aufschlüsselung von Kalorien und Makros basierend auf den sichtbaren Lebensmitteln.",
      emptyState:
        "Laden Sie ein Mahlzeitenfoto hoch und wählen Sie \"Mahlzeit analysieren\", um hier KI-generierte Ergebnisse zu sehen.",
      generating: "Ihre Analyse wird erstellt...",
      totalLabel: "Gesamt",
      protein: "Protein",
      carbs: "Kohlenhydrate",
      fat: "Fett",
    },
    nl: {
      eyebrow: "Live AI-demo",
      title: "Analyseer een maaltijdfoto",
      intro:
        "Upload een duidelijke foto van je maaltijd en CalorieVision gebruikt AI om zichtbare voedingsmiddelen, geschatte calorieën en macro's te schatten. Resultaten zijn alleen educatief en gebaseerd op wat in de afbeelding te zien is.",
      uploadTitle: "Upload je maaltijdfoto",
      uploadDescription:
        "Kies een helder, scherp beeld waar het hele bord zichtbaar is voor de beste analysekwaliteit.",
      mealPhotoLabel: "Maaltijdfoto",
      analyzeButton: "Upload een foto",
      analyzePhotoButton: "Analyseer de foto",
      reminderTitle: "Herinnering",
      reminderText:
        "CalorieVision is alleen een educatief hulpmiddel. Schattingen zijn bij benadering en mogen niet worden beschouwd als medisch of dieetadvies.",
      previewTitle: "Maaltijdvoorbeeld",
      previewDescription: "Controleer of je foto duidelijk is voordat je de analyse start.",
      previewPlaceholder: "Het voorbeeld van je maaltijdfoto verschijnt hier.",
      analysisTitle: "AI-analyse",
      analysisDescription:
        "Bekijk een geschatte calorie- en macro-uitsplitsing op basis van de zichtbare voedingsmiddelen.",
      emptyState:
        "Upload een maaltijdfoto en selecteer \"Analyseer maaltijd\" om hier door AI gegenereerde resultaten te zien.",
      generating: "Je analyse wordt gegenereerd...",
      totalLabel: "Totaal",
      protein: "Eiwit",
      carbs: "Koolhydraten",
      fat: "Vet",
    },
    ru: {
      eyebrow: "Демонстрация ИИ в реальном времени",
      title: "Анализ фото блюда",
      intro:
        "Загрузите чёткое фото вашей еды, и CalorieVision с помощью ИИ определит видимые продукты, приблизительные калории и макронутриенты. Результаты носят исключительно образовательный характер и основаны на том, что видно на изображении.",
      uploadTitle: "Загрузите фото блюда",
      uploadDescription:
        "Выберите яркое чёткое изображение, на котором видна вся тарелка, для наилучшего качества анализа.",
      mealPhotoLabel: "Фото блюда",
      analyzeButton: "Загрузить фото",
      analyzePhotoButton: "Анализировать фото",
      reminderTitle: "Напоминание",
      reminderText:
        "CalorieVision — только образовательный инструмент. Оценки приблизительны и не должны использоваться в качестве медицинской или диетологической консультации.",
      previewTitle: "Предпросмотр блюда",
      previewDescription: "Убедитесь, что фото чёткое, прежде чем запускать анализ.",
      previewPlaceholder: "Здесь появится предпросмотр вашего фото.",
      analysisTitle: "Анализ ИИ",
      analysisDescription:
        "Посмотрите приблизительную разбивку калорий и макронутриентов на основе видимых продуктов.",
      emptyState:
        "Загрузите фото блюда и выберите «Анализировать блюдо», чтобы увидеть результаты ИИ здесь.",
      generating: "Создание анализа...",
      totalLabel: "Итого",
      protein: "Белки",
      carbs: "Углеводы",
      fat: "Жиры",
    },
    ja: {
      eyebrow: "ライブAIデモ",
      title: "食事の写真を分析",
      intro:
        "食事の鮮明な写真をアップロードすると、CalorieVisionのAIが見える食品、おおよそのカロリー、マクロ栄養素を推定します。結果は教育目的のみであり、画像から判断できる内容に基づいています。",
      uploadTitle: "食事の写真をアップロード",
      uploadDescription:
        "皿全体が見える、明るくピントの合った画像を選ぶと、最高の分析品質が得られます。",
      mealPhotoLabel: "食事の写真",
      analyzeButton: "写真をアップロード",
      analyzePhotoButton: "写真を分析",
      reminderTitle: "注意事項",
      reminderText:
        "CalorieVisionは教育ツールです。推定値はおおよそのものであり、医療または食事アドバイスの代わりとして使用しないでください。",
      previewTitle: "食事のプレビュー",
      previewDescription: "分析を実行する前に写真が鮮明であることを確認してください。",
      previewPlaceholder: "食事の写真プレビューがここに表示されます。",
      analysisTitle: "AI分析",
      analysisDescription: "見える食品に基づいておおよそのカロリーとマクロの内訳を確認してください。",
      emptyState:
        "食事の写真をアップロードして「食事を分析」を選択すると、AIが生成した結果がここに表示されます。",
      generating: "分析を生成中...",
      totalLabel: "合計",
      protein: "タンパク質",
      carbs: "炭水化物",
      fat: "脂質",
    },
  } satisfies Record<string, {
    eyebrow: string; title: string; intro: string; uploadTitle: string;
    uploadDescription: string; mealPhotoLabel: string; analyzeButton: string;
    analyzePhotoButton: string; reminderTitle: string; reminderText: string;
    previewTitle: string; previewDescription: string; previewPlaceholder: string;
    analysisTitle: string; analysisDescription: string; emptyState: string;
    generating: string; totalLabel: string; protein: string; carbs: string; fat: string;
  }>;

  // Fallback to English so an unsupported future locale never crashes the page
  const copy = contentByLang[language as keyof typeof contentByLang] ?? contentByLang["en"];

  const handleFileChange = (event: FormEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const file = target.files?.[0];
    if (!file) return;

      if (!file.type.startsWith("image/")) {
      toast({
        title: t("Unsupported file type", "Type de fichier non pris en charge", "Tipo de archivo no compatible", "Tipo de ficheiro não suportado", "不支持的文件类型", "نوع ملف غير مدعوم"),
        description: t(
          "Please upload an image file (JPEG, PNG, HEIC, or similar).",
          "Veuillez télécharger un fichier image (JPEG, PNG, HEIC ou similaire).",
          "Sube un archivo de imagen (JPEG, PNG, HEIC u otro similar).",
          "Por favor, carregue um ficheiro de imagem (JPEG, PNG, HEIC ou similar).",
          "请上传图片文件（JPEG、PNG、HEIC 或类似格式）。",
          "يرجى رفع ملف صورة (JPEG أو PNG أو HEIC أو ما شابه).",
        ),
      });
      target.value = "";
      return;
    }

    const maxSizeMb = 25;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast({
        title: t("Image too large", "Image trop volumineuse", "Imagen demasiado grande", "Imagem muito grande", "图片过大", "الصورة كبيرة جدًا"),
        description: t(
          `Please upload an image smaller than ${maxSizeMb} MB.`,
          `Veuillez télécharger une image de moins de ${maxSizeMb} Mo.`,
          `Sube una imagen de menos de ${maxSizeMb} MB.`,
          `Por favor, carregue uma imagem com menos de ${maxSizeMb} MB.`,
          `请上传小于 ${maxSizeMb} MB 的图片。`,
          `يرجى رفع صورة أصغر من ${maxSizeMb} ميغابايت.`,
        ),
      });
      target.value = "";
      return;
    }

    // Store the file for FormData upload
    setImageFile(file);
    setFileName(file.name);
    setAnalysis(null);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleAnalyze = async () => {
    // ── Guest limit guard — 2 free scans before requiring an account ──────
    if (!user && guestAtLimit) {
      setShowLimitModal(true);
      return;
    }

    // ── Authenticated limit guard — DB-driven plan limits ─────────────────
    if (user && isAtLimit) {
      setShowLimitModal(true);
      return;
    }

    if (!imageFile) {
      toast({
        title: t("Add a meal photo first", "Ajoutez d'abord une photo de repas", "Añade primero una foto de comida", "Adicione uma foto de refeição primeiro", "请先添加餐食照片", "أضف صورة وجبة أولاً"),
        description: t(
          "Upload a clear photo of your meal before requesting an analysis.",
          "Téléchargez une photo claire de votre repas avant de lancer une analyse.",
          "Sube una foto clara de tu comida antes de pedir un análisis.",
          "Carregue uma foto clara da sua refeição antes de solicitar uma análise.",
          "请先上传一张清晰的餐食照片，然后再请求分析。",
          "ارفع صورة واضحة لوجبتك قبل طلب التحليل.",
        ),
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setRawError(null);

    try {
      // Build multipart/form-data payload for analyze-meal-proxy → n8n
      const deviceInfo = await getDeviceInfo();
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("language", language);
      if (deviceInfo.deviceType) formData.append("device_type", deviceInfo.deviceType);
      if (deviceInfo.browser) formData.append("browser", deviceInfo.browser);
      if (deviceInfo.deviceBrand) formData.append("device_brand", deviceInfo.deviceBrand);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey =
        (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
        (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
        "";
      const functionUrl = `${supabaseUrl}/functions/v1/analyze-meal-proxy`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: anonKey ? { Authorization: `Bearer ${anonKey}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(
          `[analyze-meal-proxy] HTTP ${response.status}\nURL: ${functionUrl}\nBody: ${errText}`,
        );
        // Always show the raw body in the debug panel
        setRawError(`HTTP ${response.status}\n\n${errText}`);
        let innerMsg = "";
        try { innerMsg = (JSON.parse(errText) as { error?: string }).error ?? ""; } catch { /* raw */ }

        // ── Daily limit enforcement from SQL trigger ───────────────────────
        // The server returns HTTP 400 with { error: "Daily limit reached" }
        // when the user has exhausted their scan quota. Show the upgrade
        // modal instead of the generic error toast.
        if (
          response.status === 400 &&
          innerMsg.toLowerCase().includes("limit reached")
        ) {
          setShowLimitModal(true);
          // `return` here skips the `catch` block (no generic toast) but the
          // `finally` block still runs, resetting isAnalyzing to false.
          return;
        }

        throw new Error(`HTTP ${response.status}${innerMsg ? `: ${innerMsg}` : ""}`);
      }

      let payload: { analysis?: { items?: unknown[]; totalCalories?: number; totalProtein?: number; totalCarbs?: number; totalFat?: number } };
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        console.error("[analyze-meal-proxy] Response was not valid JSON");
        throw new Error("Invalid response from analysis service");
      }

      // n8n flow should return { analysis: { items, totalCalories, ... } } in the expected format
      const aiAnalysis = payload.analysis ?? payload;

      const analysisResult: MealAnalysis = {
        status: "success",
        food: (aiAnalysis.items || []).map(
          (item: {
            name: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            confidence: number;
            notes?: string;
          }) => ({
            name: item.name,
            quantity: item.notes || "1 portion",
            calories: item.calories,
            protein: item.protein || 0,
            carbs: item.carbs || 0,
            fat: item.fat || 0,
            confidence: item.confidence || 0,
          }),
        ),
        total: {
          calories: aiAnalysis.totalCalories || 0,
          protein: aiAnalysis.totalProtein || 0,
          carbs: aiAnalysis.totalCarbs || 0,
          fat: aiAnalysis.totalFat || 0,
        },
      };

      if (!analysisResult.food?.length) {
        const debugPayload = JSON.stringify(payload, null, 2);
        setRawError(`Response received but no food items found.\n\nFull payload:\n${debugPayload}`);
        toast({
          title: t("No response", "Aucune réponse", "Sin respuesta", "Sem resposta", "无响应", "لا توجد استجابة"),
          description: t(
            "Analysis returned no food items. Check the debug panel below.",
            "L'analyse n'a retourné aucun aliment. Vérifiez le panneau de débogage ci-dessous.",
            "El análisis no devolvió alimentos. Revisa el panel de depuración.",
            "A análise não retornou alimentos. Veja o painel de depuração.",
            "分析未返回食物项目，请查看下方调试面板。",
            "لم يُرجع التحليل أي عناصر غذائية. راجع لوحة التصحيح.",
          ),
          variant: "destructive",
        });
        return;
      }

      setAnalysis(analysisResult);

      // ── Facebook Pixel: track successful scan ─────────────────────────────
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', { content_name: 'meal_scan' });
      }

      // ── Log usage scan ────────────────────────────────────────────────────
      if (user) {
        // Authenticated: write to DB, let SQL trigger enforce server-side limits
        await supabase.from("usage_logs").insert({ user_id: user.id }).then(
          ({ error }) => {
            if (!error) return;
            if (error.message?.toLowerCase().includes("limit reached")) {
              setShowLimitModal(true);
              refresh();
            } else {
              console.warn("[Analyze] usage_logs insert:", error.message);
            }
          }
        );
        incrementLocalCount(); // synchronous — isAtLimit updates before next click
        refresh();             // async DB reconciliation (catches other-device scans)
      } else {
        // Guest: track in localStorage and update state so guestAtLimit reacts
        incrementGuestScans();
        setGuestScanCount(getGuestScansToday());
      }

      // Track successful meal analysis
      trackMealAnalysis(true);
    } catch (err) {
      trackMealAnalysis(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[Analyze] meal-analysis error:", errMsg);
      // Populate debug panel if not already set by the !response.ok branch
      setRawError((prev) => prev ?? errMsg);
      toast({
        title: t("Analysis error", "Erreur d'analyse", "Error de análisis", "Erro de análise", "分析错误", "خطأ في التحليل"),
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasAnalysis = Boolean(analysis && analysis.food?.length);

  return (
    <>
    <section className="section-card">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 className="mb-3 text-3xl font-semibold md:text-4xl">{copy.title}</h1>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground md:text-base">{copy.intro}</p>

      {/* Warning Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            {t(
              "Estimation Only – Not Medical Advice",
              "Estimation uniquement – Pas un conseil médical",
              "Solo estimación – No es asesoramiento médico",
              "Apenas estimativa – Não é aconselhamento médico",
              "仅供估算 – 非医学建议",
              "تقدير فقط – ليس نصيحة طبية",
              "Solo stima – Non è un consiglio medico",
              "Nur Schätzung – Keine medizinische Beratung",
              "Alleen schatting – Geen medisch advies"
            )}
          </p>
          <p className="mt-1 text-amber-700 dark:text-amber-400/90">
            {t(
              "The nutritional information provided is an estimation only. Accuracy is not guaranteed. Results should not be used as a substitute for professional dietary or medical advice.",
              "Les informations nutritionnelles fournies sont uniquement des estimations. L'exactitude n'est pas garantie. Les résultats ne doivent pas remplacer un avis diététique ou médical professionnel.",
              "La información nutricional proporcionada es solo una estimación. No se garantiza la precisión. Los resultados no deben usarse como sustituto de asesoramiento dietético o médico profesional.",
              "As informações nutricionais fornecidas são apenas uma estimativa. A precisão não é garantida. Os resultados não devem substituir aconselhamento dietético ou médico profissional.",
              "提供的营养信息仅供估算，不保证准确性。结果不应替代专业的饮食或医学建议。",
              "المعلومات الغذائية المقدمة هي مجرد تقدير. الدقة غير مضمونة. لا ينبغي استخدام النتائج كبديل عن الاستشارة الغذائية أو الطبية المتخصصة.",
              "Le informazioni nutrizionali fornite sono solo una stima. L'accuratezza non è garantita. I risultati non devono essere usati come sostituto di consigli dietetici o medici professionali.",
              "Die bereitgestellten Nährwertangaben sind nur eine Schätzung. Genauigkeit wird nicht garantiert. Die Ergebnisse sollten nicht als Ersatz für professionelle Ernährungs- oder medizinische Beratung verwendet werden.",
              "De verstrekte voedingsinformatie is slechts een schatting. Nauwkeurigheid is niet gegarandeerd. Resultaten mogen niet worden gebruikt als vervanging voor professioneel dieet- of medisch advies."
            )}
            {" "}
            <LocalizedNavLink to="/disclaimer" className="font-medium underline hover:text-amber-900 dark:hover:text-amber-200">
              {t("Read full disclaimer", "Lire la clause complète", "Leer descargo completo", "Ler aviso completo", "阅读完整免责声明", "اقرأ إخلاء المسؤولية الكامل", "Leggi l'avviso completo", "Vollständigen Haftungsausschluss lesen", "Lees volledige disclaimer")}
            </LocalizedNavLink>
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <Card className="bg-secondary/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <UtensilsCrossed className="h-4 w-4 text-primary" aria-hidden="true" />
                {copy.uploadTitle}
              </CardTitle>
              <CardDescription>{copy.uploadDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="meal-photo"
                type="file"
                accept="image/*"
                capture="environment"
                onInput={handleFileChange}
                className="sr-only"
                ref={fileInputRef}
              />
              {fileName && (
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {t("Selected:", "Sélectionné :", "Seleccionado:", "Selecionado:", "已选择:", "المحدد:")}{" "}
                  <span className="font-medium text-foreground">{fileName}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                By analyzing, you confirm results are estimates only and not medical advice.
              </p>

              <Button
  type="button"
  variant="hero"
  size="lg"
  onClick={guestAtLimit ? () => navigate("/pricing") : (imageFile ? handleAnalyze : () => fileInputRef.current?.click())}
  disabled={isAnalyzing || !imageFile || guestAtLimit}
>
  {isAnalyzing ? (
    <span className="inline-flex items-center justify-center gap-1.5">
      <MealScannerLottie size={26} />
      {t("Analyzing meal...", "Analyse du repas...", "Analizando la comida...", "A analisar refeição...", "正在分析餐食...", "جاري تحليل الوجبة...")}
    </span>
  ) : guestAtLimit ? (
    t("Limit Reached — Sign In", "Limite atteinte — Connexion", "Límite alcanzado — Iniciar sesión", "Limite atingido — Entrar", "已达限制 — 请登录", "الدخول — الحد")
  ) : imageFile ? (
    copy.analyzePhotoButton
  ) : (
    copy.analyzeButton
  )}
</Button>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Photos are processed securely to generate an analysis and are not stored or used for training.",
                  "Les photos sont traitées de manière sécurisée pour générer l'analyse et ne sont ni stockées ni utilisées pour l'entraînement.",
                  "Las fotos se procesan de forma segura para generar el análisis y no se almacenan ni se utilizan para entrenamiento.",
                  "As fotos são processadas de forma segura para gerar a análise e não são armazenadas nem usadas para treino.",
                  "照片会被安全处理以生成分析结果，不会被存储或用于训练。",
                  "تتم معالجة الصور بأمان لإنشاء التحليل ولا يتم تخزينها أو استخدامها للتدريب.",
                )}
              </p>
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground md:text-sm">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
              {copy.reminderTitle}
            </p>
            <p className="mt-1">{copy.reminderText}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">{copy.previewTitle}</CardTitle>
              <CardDescription>{copy.previewDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                {imagePreviewUrl ? (
                  <>
                    <img
                      src={imagePreviewUrl}
                      alt={t(
                        "Uploaded meal ready for AI calorie analysis",
                        "Repas téléchargé prêt pour l'analyse des calories par IA",
                        "Comida subida lista para el análisis de calorías con IA",
                        "Refeição carregada pronta para análise de calorias com IA",
                        "上传的餐食已准备好进行 AI 热量分析",
                        "وجبة تم رفعها جاهزة لتحليل السعرات الحرارية بالذكاء الاصطناعي",
                      )}
                      className="h-full w-full object-cover"
                      decoding="async"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreviewUrl(null);
                        setImageFile(null);
                        setFileName(null);
                        setAnalysis(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-2 right-2 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={t("Remove image", "Supprimer l'image", "Eliminar imagen", "Remover imagem", "删除图片", "إزالة الصورة")}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground md:text-sm">
                    {copy.previewPlaceholder}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">{copy.analysisTitle}</CardTitle>
              <CardDescription>{copy.analysisDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {!hasAnalysis && !isAnalyzing && <p>{copy.emptyState}</p>}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <MealScannerLottie size={160} />
                  <p className="text-sm text-muted-foreground animate-pulse text-center">
                    {copy.generating}
                  </p>
                </div>
              )}

              {hasAnalysis && analysis && (
                <>
                  {/* Food items list */}
                  <div className="space-y-3">
                    {analysis.food.map((item, index) => {
                      // Translate food name if it appears to be in English and user language is different
                      const translatedName = language !== "en" && isEnglishFoodName(item.name)
                        ? translateFoodName(item.name, language)
                        : item.name;
                      
                      return (
                        <div key={`${item.name}-${index}`} className="rounded-xl bg-background/60 p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-medium text-foreground">{translatedName}</p>
                              <p className="text-xs text-muted-foreground">{item.quantity}</p>
                            </div>
                            <p className="font-semibold text-foreground whitespace-nowrap">
                              {Math.round(item.calories)} kcal
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="rounded-lg bg-primary/10 px-2 py-1 text-center">
                              <p className="text-muted-foreground">{copy.protein}</p>
                              <p className="font-medium text-foreground">{item.protein}g</p>
                            </div>
                            <div className="rounded-lg bg-accent/10 px-2 py-1 text-center">
                              <p className="text-muted-foreground">{copy.carbs}</p>
                              <p className="font-medium text-foreground">{item.carbs}g</p>
                            </div>
                            <div className="rounded-lg bg-secondary px-2 py-1 text-center">
                              <p className="text-muted-foreground">{copy.fat}</p>
                              <p className="font-medium text-foreground">{item.fat}g</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total summary */}
                  {analysis.total && (
                    <div className="rounded-2xl bg-primary/10 p-4 mt-4">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground mb-2">
                        {copy.totalLabel}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-2xl font-bold text-foreground">
                          {Math.round(analysis.total.calories)} kcal
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">{copy.protein}</p>
                          <p className="font-semibold text-foreground">{analysis.total.protein}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">{copy.carbs}</p>
                          <p className="font-semibold text-foreground">{analysis.total.carbs}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">{copy.fat}</p>
                          <p className="font-semibold text-foreground">{analysis.total.fat}g</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    {/* ── Raw error debug panel (only shown on error) ── */}
    {rawError && (
      <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-destructive">⚠ Debug — raw proxy response</p>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setRawError(null)}
            aria-label="Dismiss debug panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all text-muted-foreground leading-relaxed">
          {rawError}
        </pre>
      </div>
    )}

    {/* Scan limit modal */}
    <LimitReachedModal
      open={showLimitModal}
      onClose={() => setShowLimitModal(false)}
      plan={user ? plan : "starter"}
      dailyScans={user ? dailyScans : guestScanCount}
      monthlyScans={user ? monthlyScans : guestScanCount}
      dailyLimit={user ? dailyLimit : GUEST_SCAN_LIMIT}
      monthlyLimit={user ? monthlyLimit : GUEST_SCAN_LIMIT}
    />
    </>
  );
};

export default Analyze;
