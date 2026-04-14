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
import UGCHeroVideo from "@/components/UGCHeroVideo";
import MediaShowcaseSection from "@/components/MediaShowcaseSection";

import howItWorks1 from "@/assets/how-it-works-1.jpg";
import howItWorks2 from "@/assets/how-it-works-2.jpg";
import CalorieGauge from "@/components/CalorieGauge";

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
      heroEyebrow: "Analyse de repas أ  partir d'une photo - Instantanأ©",
      heroTitle: "Comprenez mieux votre repas avec CalorieVision.",
      heroSubtitle:
        "Tأ©lأ©chargez simplement une photo de votre assiette et laissez CalorieVision estimer les aliments prأ©sents, les portions et les calories approximatives. Rapide, accessible et purement أ©ducatif - jamais mأ©dical.",
      heroUploadCta: "Tأ©lأ©charger une photo",
      heroTakePhotoCta: "Prendre une photo",
      heroEducational: "Informations أ©ducatives uniquement",
      heroPhotosNotStored: "Les photos ne sont pas conservأ©es",
    },
    es: {
      heroEyebrow: "Anأ،lisis de comidas desde una foto - Al instante",
      heroTitle: "Entiende mejor tu comida con CalorieVision.",
      heroSubtitle:
        "Sube una foto sencilla de tu plato y deja que CalorieVision estime los alimentos presentes, el tamaأ±o de las porciones y las calorأ­as aproximadas. Rأ،pido, amigable y totalmente educativo, nunca mأ©dico.",
      heroUploadCta: "Subir foto",
      heroTakePhotoCta: "Tomar foto",
      heroEducational: "Informaciأ³n solo educativa",
      heroPhotosNotStored: "Las fotos no se guardan",
    },
    pt: {
      heroEyebrow: "Anأ،lise de refeiأ§أµes a partir de uma foto - Instantأ¢nea",
      heroTitle: "Perceba melhor a sua refeiأ§أ£o com o CalorieVision.",
      heroSubtitle:
        "Carregue uma foto simples do seu prato e deixe o CalorieVision estimar os alimentos presentes, os tamanhos das porأ§أµes e as calorias aproximadas. Rأ،pido, acessأ­vel e apenas educativo â€” nunca mأ©dico.",
      heroUploadCta: "Carregar foto",
      heroTakePhotoCta: "Tirar foto",
      heroEducational: "Informaأ§أµes apenas educativas",
      heroPhotosNotStored: "As fotos nأ£o sأ£o guardadas",
    },
    zh: {
      heroEyebrow: "هں؛ن؛ژç…§ç‰‡çڑ„هچ³و—¶è†³é£ںهˆ†و‍گ",
      heroTitle: "ç”¨ CalorieVision و›´ه¥½هœ°ن؛†è§£و¯ڈن¸€é¤گم€‚",
      heroSubtitle:
        "ن¸ٹن¼ ن¸€ه¼ و¸…و™°çڑ„é¤گç›کç…§ç‰‡ï¼ŒCalorieVision ن¼ڑن¼°ç®—ه…¶ن¸­çڑ„é£ںç‰©م€پن»½é‡ڈن»¥هڈٹه¤§è‡´çƒ­é‡ڈم€‚ه؟«é€ںم€پهڈ‹ه¥½ï¼Œن»…ç”¨ن؛ژه­¦ن¹ هڈ‚è€ƒï¼Œن¸چو‍„وˆگن»»ن½•هŒ»ç–—ه»؛è®®م€‚",
      heroUploadCta: "ن¸ٹن¼ ç…§ç‰‡",
      heroTakePhotoCta: "و‹چç…§",
      heroEducational: "ن»…ن¾›و•™è‚²ç”¨é€”çڑ„و´‍è§پ",
      heroPhotosNotStored: "ç…§ç‰‡ن¸چن¼ڑè¢«ن؟‌ه­ک",
    },
    ar: {
      heroEyebrow: "طھط­ظ„ظٹظ„ ظˆط¬ط¨ط© ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ط§ظ†ط·ظ„ط§ظ‚ظ‹ط§ ظ…ظ† طµظˆط±ط© â€“ ظپظˆط±ظ‹ط§",
      heroTitle: "ط§ظپظ‡ظ… ظˆط¬ط¨طھظƒ ط¨ط´ظƒظ„ ط£ظپط¶ظ„ ظ…ط¹ CalorieVision.",
      heroSubtitle:
        "ط§ظ„طھظ‚ط· طµظˆط±ط© ظˆط§ط¶ط­ط© ظ„ط·ط¨ظ‚ظƒ ظˆط¯ظژط¹ CalorieVision ظٹظ‚ط¯ظ‘ط± ط§ظ„ط£ط·ط¹ظ…ط© ط§ظ„ظ…ظˆط¬ظˆط¯ط©طŒ ط£ط­ط¬ط§ظ… ط§ظ„ط­طµطµطŒ ظˆط¹ط¯ط¯ ط§ظ„ط³ط¹ط±ط§طھ ط§ظ„طھظ‚ط±ظٹط¨ظٹ. ط³ط±ظٹط¹طŒ ط¨ط³ظٹط·طŒ ظˆطھط¹ظ„ظٹظ…ظٹ ظپظ‚ط· â€“ ظˆظ„ظٹط³ ط£ط¨ط¯ظ‹ط§ ط£ط¯ط§ط© ط·ط¨ظٹط©.",
      heroUploadCta: "طھط­ظ…ظٹظ„ طµظˆط±ط©",
      heroTakePhotoCta: "ط§ظ„طھظ‚ط§ط· طµظˆط±ط©",
      heroEducational: "ظ…ط¹ظ„ظˆظ…ط§طھ طھط¹ظ„ظٹظ…ظٹط© ظپظ‚ط·",
      heroPhotosNotStored: "ظ„ط§ ظٹطھظ… طھط®ط²ظٹظ† ط§ظ„طµظˆط±",
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
        "Laden Sie ein einfaches Foto Ihres Tellers hoch und lassen Sie CalorieVision die vorhandenen Lebensmittel, Portionsgrأ¶أںen und ungefأ¤hren Kalorien schأ¤tzen. Schnell, freundlich und rein bildungsorientiert - niemals medizinisch.",
      heroUploadCta: "Foto hochladen",
      heroTakePhotoCta: "Foto aufnehmen",
      heroEducational: "Nur Bildungsinformationen",
      heroPhotosNotStored: "Fotos werden nicht gespeichert",
    },
    nl: {
      heroEyebrow: "AI Maaltijdanalyse vanuit een foto - Direct",
      heroTitle: "Begrijp je maaltijd beter met CalorieVision.",
      heroSubtitle:
        "Upload een simpele foto van je bord en laat CalorieVision de aanwezige voedingsmiddelen, portiegroottes en geschatte calorieأ«n inschatten. Snel, vriendelijk en puur educatief - nooit medisch.",
      heroUploadCta: "Foto uploaden",
      heroTakePhotoCta: "Foto maken",
      heroEducational: "Alleen educatieve inzichten",
      heroPhotosNotStored: "Foto's worden niet opgeslagen",
    },
    ru: {
      heroEyebrow: "ذکذک-ذ°ذ½ذ°ذ»ذ¸ذ· ذ؟ر€ذ¸ر‘ذ¼ذ° ذ؟ذ¸ر‰ذ¸ ذ؟ذ¾ ر„ذ¾ر‚ذ¾ â€” ذ¼ذ³ذ½ذ¾ذ²ذµذ½ذ½ذ¾",
      heroTitle: "ذ›رƒر‡رˆذµ ذ؟ذ¾ذ½ذ¸ذ¼ذ°ذ¹ر‚ذµ رپذ²ذ¾رژ ذµذ´رƒ رپ CalorieVision.",
      heroSubtitle:
        "ذ—ذ°ذ³ر€رƒذ·ذ¸ر‚ذµ ر„ذ¾ر‚ذ¾ ذ±ذ»رژذ´ذ° ذ¸ ذ؟ذ¾ذ·ذ²ذ¾ذ»رŒر‚ذµ CalorieVision ذ¾ر†ذµذ½ذ¸ر‚رŒ رپذ¾رپر‚ذ°ذ², ر€ذ°ذ·ذ¼ذµر€ ذ؟ذ¾ر€ر†ذ¸ذ¹ ذ¸ ذ؟ر€ذ¸ذ¼ذµر€ذ½رƒرژ ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¹ذ½ذ¾رپر‚رŒ. ذ‘ر‹رپر‚ر€ذ¾, رƒذ´ذ¾ذ±ذ½ذ¾ ذ¸ ر‚ذ¾ذ»رŒذ؛ذ¾ ذ² ذ¾ذ±ر€ذ°ذ·ذ¾ذ²ذ°ر‚ذµذ»رŒذ½ر‹ر… ر†ذµذ»رڈر… â€” ذ½ذµ ذ¼ذµذ´ذ¸ر†ذ¸ذ½رپذ؛ذ¸ذ¹ ذ¸ذ½رپر‚ر€رƒذ¼ذµذ½ر‚.",
      heroUploadCta: "ذ—ذ°ذ³ر€رƒذ·ذ¸ر‚رŒ ر„ذ¾ر‚ذ¾",
      heroTakePhotoCta: "ذ،ذ´ذµذ»ذ°ر‚رŒ ر„ذ¾ر‚ذ¾",
      heroEducational: "ذ¢ذ¾ذ»رŒذ؛ذ¾ ذ¾ذ±ر€ذ°ذ·ذ¾ذ²ذ°ر‚ذµذ»رŒذ½ذ°رڈ ذ¸ذ½ر„ذ¾ر€ذ¼ذ°ر†ذ¸رڈ",
      heroPhotosNotStored: "ذ¤ذ¾ر‚ذ¾ ذ½ذµ رپذ¾ر…ر€ذ°ذ½رڈرژر‚رپرڈ",
    },
    ja: {
      heroEyebrow: "AIمپ«م‚ˆم‚‹é£ںن؛‹مپ®و „é¤ٹهˆ†و‍گ â€” ç‍¬و™‚مپ«",
      heroTitle: "CalorieVisionمپ§é£ںن؛‹م‚’م‚‚مپ£مپ¨م‚ˆمپڈçگ†è§£مپ—مپ¾مپ—م‚‡مپ†م€‚",
      heroSubtitle:
        "مپٹçڑ؟مپ®ه†™çœںم‚’م‚¢مƒƒمƒ—مƒ­مƒ¼مƒ‰مپ™م‚‹مپ مپ‘مپ§م€پCalorieVisionمپŒé£ںه“پمپ®ç¨®é،‍م€پé‡ڈم€پمپٹم‚ˆمپ³مپٹمپٹم‚ˆمپ‌مپ®م‚«مƒ­مƒھمƒ¼م‚’وژ¨ه®ڑمپ—مپ¾مپ™م€‚é€ںمپڈم€پن½؟مپ„م‚„مپ™مپڈم€پمپ‚مپڈمپ¾مپ§و•™è‚²ç›®çڑ„مپ§مپ™ â€” هŒ»ç™‚مƒ„مƒ¼مƒ«مپ§مپ¯مپ‚م‚ٹمپ¾مپ›م‚“م€‚",
      heroUploadCta: "ه†™çœںم‚’م‚¢مƒƒمƒ—مƒ­مƒ¼مƒ‰",
      heroTakePhotoCta: "ه†™çœںم‚’و’®م‚‹",
      heroEducational: "و•™è‚²ç›®çڑ„مپ®وƒ…ه ±مپ®مپ؟",
      heroPhotosNotStored: "ه†™çœںمپ¯ن؟‌ه­کمپ•م‚Œمپ¾مپ›م‚“",
    },
  } as const;
  const copy = contentByLang[language];

  const handleTakePhotoClick = () => {
    navigate(`/${language}/analyze?capture=1`);
  };

  const videoTitle: Record<string, string> = {
    en: "Count Your Meal Calories in 3 Seconds with AI",
    fr: "Comptez les Calories de Vos Repas en 3 Secondes avec l'IA",
    es: "Cuente las Calorأ­as de Sus Comidas en 3 Segundos con IA",
    pt: "Conte as Calorias das Suas Refeiأ§أµes em 3 Segundos com IA",
    zh: "3ç§’ه†…ç”¨AIè®،ç®—و‚¨é¤گé£ںçڑ„هچ،è·¯é‡Œ",
    ar: "ط§ط­ط³ط¨ ط³ط¹ط±ط§طھ ظˆط¬ط¨طھظƒ ظپظٹ 3 ط«ظˆط§ظ†ظچ ط¨ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ",
    it: "Conta le Calorie dei Tuoi Pasti in 3 Secondi con l'IA",
    de: "Zأ¤hlen Sie die Kalorien Ihrer Mahlzeiten in 3 Sekunden mit KI",
    nl: "Tel de calorieأ«n van je maaltijd in 3 seconden met AI",
    ru: "ذںذ¾ذ´رپر‡ذ¸ر‚ذ°ذ¹ر‚ذµ ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¸ ذ²ذ°رˆذµذ³ذ¾ ذ±ذ»رژذ´ذ° ذ·ذ° 3 رپذµذ؛رƒذ½ذ´ر‹ رپ ذ؟ذ¾ذ¼ذ¾ر‰رŒرژ ذکذک",
    ja: "AIمپ§3ç§’مپ§é£ںن؛‹مپ®م‚«مƒ­مƒھمƒ¼م‚’è¨ˆç®—مپ™م‚‹",
  };

  const videoDesc: Record<string, string> = {
    en: "Discover CalorieVision: the free app that analyzes your meals from a single photo. Our AI identifies each food item and instantly calculates calories, protein, carbs, and fat. No signup, no data storage, 100% private.",
    fr: "Dأ©couvrez CalorieVision : l'application gratuite qui analyse vos repas par simple photo. Notre intelligence artificielle identifie chaque aliment et calcule instantanأ©ment les calories, protأ©ines, glucides et lipides. Sans inscription, sans stockage de donnأ©es, 100% privأ©.",
    es: "Descubre CalorieVision: la aplicaciأ³n gratuita que analiza tus comidas desde una sola foto. Nuestra IA identifica cada alimento y calcula instantأ،neamente calorأ­as, proteأ­nas, carbohidratos y grasas. Sin registro, sin almacenamiento de datos, 100% privado.",
    pt: "Descubra o CalorieVision: o aplicativo gratuito que analisa suas refeiأ§أµes a partir de uma أ؛nica foto. Nossa IA identifica cada alimento e calcula instantaneamente calorias, proteأ­nas, carboidratos e gorduras. Sem cadastro, sem armazenamento de dados, 100% privado.",
    zh: "وژ¢ç´¢ CalorieVisionï¼ڑه…چè´¹ه؛”ç”¨ï¼Œهڈھéœ€ن¸€ه¼ ç…§ç‰‡هچ³هڈ¯هˆ†و‍گو‚¨çڑ„é¤گé£ںم€‚وˆ‘ن»¬çڑ„AIè¯†هˆ«و¯ڈç§چé£ںç‰©ه¹¶هچ³و—¶è®،ç®—هچ،è·¯é‡Œم€پè›‹ç™½è´¨م€پç¢³و°´هŒ–هگˆç‰©ه’Œè„‚è‚ھم€‚و— éœ€و³¨ه†Œï¼Œن¸چه­که‚¨و•°وچ®ï¼Œ100%éڑگç§پم€‚",
    ar: "ط§ظƒطھط´ظپ CalorieVision: ط§ظ„طھط·ط¨ظٹظ‚ ط§ظ„ظ…ط¬ط§ظ†ظٹ ط§ظ„ط°ظٹ ظٹط­ظ„ظ„ ظˆط¬ط¨ط§طھظƒ ظ…ظ† طµظˆط±ط© ظˆط§ط­ط¯ط©. ظٹط­ط¯ط¯ ط°ظƒط§ط¤ظ†ط§ ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ظƒظ„ ط¹ظ†طµط± ط؛ط°ط§ط¦ظٹ ظˆظٹط­ط³ط¨ ظپظˆط±ط§ظ‹ ط§ظ„ط³ط¹ط±ط§طھ ط§ظ„ط­ط±ط§ط±ظٹط© ظˆط§ظ„ط¨ط±ظˆطھظٹظ† ظˆط§ظ„ظƒط±ط¨ظˆظ‡ظٹط¯ط±ط§طھ ظˆط§ظ„ط¯ظ‡ظˆظ†. ط¨ط¯ظˆظ† طھط³ط¬ظٹظ„طŒ ط¨ط¯ظˆظ† طھط®ط²ظٹظ† ط¨ظٹط§ظ†ط§طھطŒ ط®طµظˆطµظٹط© 100%.",
    it: "Scopri CalorieVision: l'app gratuita che analizza i tuoi pasti da una sola foto. La nostra IA identifica ogni alimento e calcola istantaneamente calorie, proteine, carboidrati e grassi. Senza registrazione, senza archiviazione dati, 100% privato.",
    de: "Entdecken Sie CalorieVision: die kostenlose App, die Ihre Mahlzeiten aus einem einzigen Foto analysiert. Unsere KI identifiziert jede Zutat und berechnet sofort Kalorien, Protein, Kohlenhydrate und Fett. Keine Anmeldung, keine Datenspeicherung, 100% privat.",
    nl: "Ontdek CalorieVision: de gratis app die je maaltijden analyseert vanuit أ©أ©n foto. Onze AI identificeert elk voedingsmiddel en berekent direct calorieأ«n, eiwitten, koolhydraten en vetten. Geen registratie, geen gegevensopslag, 100% privأ©.",
    ru: "ذ‍ر‚ذ؛ر€ذ¾ذ¹ر‚ذµ ذ´ذ»رڈ رپذµذ±رڈ CalorieVision: ذ±ذµرپذ؟ذ»ذ°ر‚ذ½ذ¾ذµ ذ؟ر€ذ¸ذ»ذ¾ذ¶ذµذ½ذ¸ذµ ذ´ذ»رڈ ذ°ذ½ذ°ذ»ذ¸ذ·ذ° ذ±ذ»رژذ´ ذ؟ذ¾ ذ¾ذ´ذ½ذ¾ذ¹ ر„ذ¾ر‚ذ¾ذ³ر€ذ°ر„ذ¸ذ¸. ذ‌ذ°رˆ ذکذک ر€ذ°رپذ؟ذ¾ذ·ذ½ذ°ر‘ر‚ ذ؛ذ°ذ¶ذ´ر‹ذ¹ ذ؟ر€ذ¾ذ´رƒذ؛ر‚ ذ¸ ذ¼ذ³ذ½ذ¾ذ²ذµذ½ذ½ذ¾ ر€ذ°رپرپر‡ذ¸ر‚ر‹ذ²ذ°ذµر‚ ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¸, ذ±ذµذ»ذ؛ذ¸, رƒذ³ذ»ذµذ²ذ¾ذ´ر‹ ذ¸ ذ¶ذ¸ر€ر‹. ذ‘ذµذ· ر€ذµذ³ذ¸رپر‚ر€ذ°ر†ذ¸ذ¸, ذ±ذµذ· ر…ر€ذ°ذ½ذµذ½ذ¸رڈ ذ´ذ°ذ½ذ½ر‹ر…, 100% ذ؛ذ¾ذ½ر„ذ¸ذ´ذµذ½ر†ذ¸ذ°ذ»رŒذ½ذ¾.",
    ja: "CalorieVisionم‚’مپ”ç´¹ن»‹ï¼ڑن¸€و‍ڑمپ®ه†™çœںمپ‹م‚‰é£ںن؛‹م‚’هˆ†و‍گمپ™م‚‹ç„،و–™م‚¢مƒ—مƒھمپ§مپ™م€‚AIمپŒهگ„é£ںه“پم‚’è­کهˆ¥مپ—م€پم‚«مƒ­مƒھمƒ¼مƒ»م‚؟مƒ³مƒ‘م‚¯è³ھمƒ»ç‚­و°´هŒ–ç‰©مƒ»è„‚è³ھم‚’ç‍¬و™‚مپ«è¨ˆç®—مپ—مپ¾مپ™م€‚ç™»éŒ²ن¸چè¦پم€پمƒ‡مƒ¼م‚؟ن؟‌ه­کمپھمپ—م€پ100%مƒ—مƒ©م‚¤مƒگم‚·مƒ¼ن؟‌è­·م€‚",
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
              "Analyse nutritionnelle visuelle en un coup d'إ“il",
              "Anأ،lisis visual de nutriciأ³n de un vistazo",
              "Anأ،lise visual de nutriأ§أ£o de relance",
              "ن¸€ç›®ن؛†ç„¶çڑ„è§†è§‰èگ¥ه…»هˆ†و‍گ",
              "طھط­ظ„ظٹظ„ ط§ظ„طھط؛ط°ظٹط© ط§ظ„ط¨طµط±ظٹ ظپظٹ ظ„ظ…ط­ط©",
              "Analisi nutrizionale visiva in un colpo d'occhio",
              "Visuelle Ernأ¤hrungsanalyse auf einen Blick",
              "Visuele voedingsanalyse in أ©أ©n oogopslag",
              "ذ’ذ¸ذ·رƒذ°ذ»رŒذ½ر‹ذ¹ ذ°ذ½ذ°ذ»ذ¸ذ· ذ؟ذ¸ر‚ذ°ذ½ذ¸رڈ رپ ذ؟ذµر€ذ²ذ¾ذ³ذ¾ ذ²ذ·ذ³ذ»رڈذ´ذ°",
              "ن¸€ç›®مپ§م‚ڈمپ‹م‚‹è¦–è¦ڑçڑ„و „é¤ٹهˆ†و‍گ",
            )}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground md:text-base max-w-2xl mx-auto">
            {t(
              "CalorieVision instantly analyzes your meals and visualizes calories and macronutrients in a clear, intuitive way. From a single photo, understand the balance between proteins, carbohydrates, and fats to make smarter nutrition decisions.",
              "CalorieVision analyse instantanأ©ment vos repas et visualise les calories et macronutriments de faأ§on claire et intuitive. أ€ partir d'une seule photo, comprenez l'أ©quilibre entre protأ©ines, glucides et lipides.",
              "CalorieVision analiza instantأ،neamente tus comidas y visualiza calorأ­as y macronutrientes de forma clara e intuitiva. Desde una sola foto, entiende el equilibrio entre proteأ­nas, carbohidratos y grasas.",
              "CalorieVision analisa instantaneamente as suas refeiأ§أµes e visualiza calorias e macronutrientes de forma clara e intuitiva. A partir de uma أ؛nica foto, entenda o equilأ­brio entre proteأ­nas, carboidratos e gorduras.",
              "CalorieVisionهچ³و—¶هˆ†و‍گو‚¨çڑ„é¤گé£ںï¼Œن»¥و¸…و™°ç›´è§‚çڑ„و–¹ه¼ڈه‘ˆçژ°هچ،è·¯é‡Œه’Œه®ڈé‡ڈèگ¥ه…»ç´ م€‚ن»ژن¸€ه¼ ç…§ç‰‡ن¸­ن؛†è§£è›‹ç™½è´¨م€پç¢³و°´هŒ–هگˆç‰©ه’Œè„‚è‚ھن¹‹é—´çڑ„ه¹³è،،م€‚",
              "ظٹط­ظ„ظ„ CalorieVision ظˆط¬ط¨ط§طھظƒ ظپظˆط±ط§ظ‹ ظˆظٹظڈط¸ظ‡ط± ط§ظ„ط³ط¹ط±ط§طھ ط§ظ„ط­ط±ط§ط±ظٹط© ظˆط§ظ„ط¹ظ†ط§طµط± ط§ظ„ط؛ط°ط§ط¦ظٹط© ط§ظ„ظƒط¨ط±ظ‰ ط¨ط·ط±ظٹظ‚ط© ظˆط§ط¶ط­ط© ظˆط¨ط¯ظٹظ‡ظٹط©. ظ…ظ† طµظˆط±ط© ظˆط§ط­ط¯ط©طŒ ط§ظپظ‡ظ… ط§ظ„طھظˆط§ط²ظ† ط¨ظٹظ† ط§ظ„ط¨ط±ظˆطھظٹظ†ط§طھ ظˆط§ظ„ظƒط±ط¨ظˆظ‡ظٹط¯ط±ط§طھ ظˆط§ظ„ط¯ظ‡ظˆظ†.",
              "CalorieVision analizza istantaneamente i tuoi pasti e visualizza calorie e macronutrienti in modo chiaro e intuitivo. Da una singola foto, capisci l'equilibrio tra proteine, carboidrati e grassi.",
              "CalorieVision analysiert Ihre Mahlzeiten sofort und visualisiert Kalorien und Makronأ¤hrstoffe auf klare, intuitive Weise. Verstehen Sie aus einem einzigen Foto die Balance zwischen Proteinen, Kohlenhydraten und Fetten.",
              "CalorieVision analyseert uw maaltijden direct en visualiseert calorieأ«n en macronutriأ«nten op een duidelijke, intuأ¯tieve manier. Begrijp vanuit أ©أ©n foto de balans tussen eiwitten, koolhydraten en vetten.",
              "CalorieVision ذ¼ذ³ذ½ذ¾ذ²ذµذ½ذ½ذ¾ ذ°ذ½ذ°ذ»ذ¸ذ·ذ¸ر€رƒذµر‚ ذ²ذ°رˆذ¸ ذ±ذ»رژذ´ذ° ذ¸ ذ½ذ°ذ³ذ»رڈذ´ذ½ذ¾ ذ¾ر‚ذ¾ذ±ر€ذ°ذ¶ذ°ذµر‚ ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¸ ذ¸ ذ¼ذ°ذ؛ر€ذ¾رچذ»ذµذ¼ذµذ½ر‚ر‹. ذںذ¾ ذ¾ذ´ذ½ذ¾ذ¼رƒ ر„ذ¾ر‚ذ¾ ذ؟ذ¾ذ¹ذ¼ذ¸ر‚ذµ ذ±ذ°ذ»ذ°ذ½رپ ذ¼ذµذ¶ذ´رƒ ذ±ذµذ»ذ؛ذ°ذ¼ذ¸, رƒذ³ذ»ذµذ²ذ¾ذ´ذ°ذ¼ذ¸ ذ¸ ذ¶ذ¸ر€ذ°ذ¼ذ¸.",
              "CalorieVisionمپ¯é£ںن؛‹م‚’ç‍¬و™‚مپ«هˆ†و‍گمپ—م€پم‚«مƒ­مƒھمƒ¼مپ¨ن¸»è¦پو „é¤ٹç´ م‚’وکژç¢؛مپ§ç›´و„ںçڑ„مپھو–¹و³•مپ§è¦–è¦ڑهŒ–مپ—مپ¾مپ™م€‚1و‍ڑمپ®ه†™çœںمپ‹م‚‰م€پم‚؟مƒ³مƒ‘م‚¯è³ھمƒ»ç‚­و°´هŒ–ç‰©مƒ»è„‚è³ھمپ®مƒگمƒ©مƒ³م‚¹م‚’وٹٹوڈ،مپ§مپچمپ¾مپ™م€‚",
            )}
          </p>
          <div className="flex justify-center">
            <CalorieGauge value={266} max={1000} />
          </div>
        </section>
      </ScrollAnimation>

      {/* Main Hero Section with H1 */}
      <ScrollAnimation animation="fade-up" duration={700}>
      <section className="section-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 hidden h-80 w-80 rounded-full bg-gradient-to-b from-primary/40 via-accent/40 to-transparent opacity-70 blur-3xl md:block" aria-hidden="true" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-center">
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

          <div className="flex items-center justify-center">
            <CalorieGauge value={266} max={1000} />
          </div>
        </div>
      </section>
      </ScrollAnimation>

      {/* AI UGC Spokesperson Video â€” autoplays muted when visible */}
      <ScrollAnimation animation="fade-up" delay={50} duration={700}>
      <section className="section-card relative overflow-hidden" aria-label="AI Spokesperson Video">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t(
                "See How CalorieVision Works",
                "Dأ©couvrez comment fonctionne CalorieVision",
                "Vea cأ³mo funciona CalorieVision",
                "Veja como o CalorieVision funciona",
                "ن؛†è§£ CalorieVision ه¦‚ن½•è؟گن½œ",
                "ط´ط§ظ‡ط¯ ظƒظٹظپ ظٹط¹ظ…ظ„ CalorieVision",
                "Scopri come funziona CalorieVision",
                "Erfahren Sie, wie CalorieVision funktioniert",
                "Ontdek hoe CalorieVision werkt",
                "ذ£ذ·ذ½ذ°ذ¹ر‚ذµ, ذ؛ذ°ذ؛ ر€ذ°ذ±ذ¾ر‚ذ°ذµر‚ CalorieVision",
                "CalorieVisionمپ®ن½؟مپ„و–¹م‚’مپ”è¦§مپڈمپ مپ•مپ„",
              )}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              {t(
                "Watch our quick overview to see AI-powered meal analysis in action.",
                "Regardez notre aperأ§u rapide pour voir l'analyse de repas par IA en action.",
                "Mire nuestro breve resumen para ver el anأ،lisis de comidas con IA en acciأ³n.",
                "Assista ao nosso resumo rأ،pido para ver a anأ،lise de refeiأ§أµes com IA em aأ§أ£o.",
                "è§‚çœ‹وˆ‘ن»¬çڑ„ه؟«é€ںو¦‚è§ˆï¼Œن؛†è§£AIé©±هٹ¨çڑ„é¤گé£ںهˆ†و‍گم€‚",
                "ط´ط§ظ‡ط¯ ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط³ط±ظٹط¹ط© ظ„طھط±ظ‰ طھط­ظ„ظٹظ„ ط§ظ„ظˆط¬ط¨ط§طھ ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ط£ط«ظ†ط§ط، ط§ظ„ط¹ظ…ظ„.",
                "Guarda la nostra rapida panoramica per vedere l'analisi dei pasti con IA in azione.",
                "Sehen Sie sich unsere kurze أœbersicht an, um die KI-gestأ¼tzte Mahlzeitanalyse in Aktion zu erleben.",
                "Bekijk ons korte overzicht om AI-gestuurde maaltijdanalyse in actie te zien.",
                "ذںذ¾رپذ¼ذ¾ر‚ر€ذ¸ر‚ذµ ذ½ذ°رˆ ذ؛ر€ذ°ر‚ذ؛ذ¸ذ¹ ذ¾ذ±ذ·ذ¾ر€, ر‡ر‚ذ¾ذ±ر‹ رƒذ²ذ¸ذ´ذµر‚رŒ ذ°ذ½ذ°ذ»ذ¸ذ· ذ±ذ»رژذ´ رپ ذ؟ذ¾ذ¼ذ¾ر‰رŒرژ ذکذک ذ² ذ´ذµذ¹رپر‚ذ²ذ¸ذ¸.",
                "AIمپ«م‚ˆم‚‹é£ںن؛‹هˆ†و‍گمپ®و§که­گم‚’çں­مپ„ه‹•ç”»مپ§مپ”è¦§مپڈمپ مپ•مپ„م€‚",
              )}
            </p>
          </div>
          <UGCHeroVideo
            ctaText={t(
              "Try It Free â€” Upload a Photo Now",
              "Essayez gratuitement â€” Tأ©lأ©chargez une photo",
              "Pruأ©belo gratis â€” Suba una foto ahora",
              "Experimente grأ،tis â€” Envie uma foto agora",
              "ه…چè´¹è¯•ç”¨ â€” ç«‹هچ³ن¸ٹن¼ ç…§ç‰‡",
              "ط¬ط±ظ‘ط¨ظ‡ ظ…ط¬ط§ظ†ظ‹ط§ â€” ط§ط±ظپط¹ طµظˆط±ط© ط§ظ„ط¢ظ†",
              "Provalo gratis â€” Carica una foto ora",
              "Kostenlos testen â€” Laden Sie jetzt ein Foto hoch",
              "Probeer het gratis â€” Upload nu een foto",
              "ذںذ¾ذ؟ر€ذ¾ذ±رƒذ¹ر‚ذµ ذ±ذµرپذ؟ذ»ذ°ر‚ذ½ذ¾ â€” ذ—ذ°ذ³ر€رƒذ·ذ¸ر‚ذµ ر„ذ¾ر‚ذ¾ رپذµذ¹ر‡ذ°رپ",
              "ç„،و–™مپ§è©¦مپ™ â€” ن»ٹمپ™مپگه†™çœںم‚’م‚¢مƒƒمƒ—مƒ­مƒ¼مƒ‰",
            )}
            onCtaClick={() => navigate("/app")}
          />
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
                "Votre navigateur ne prend pas en charge la vidأ©o. Veuillez mettre أ  jour votre navigateur ou essayer un autre appareil.",
                "Su navegador no soporta el video. Por favor actualice su navegador o pruebe otro dispositivo.",
                "Seu navegador nأ£o suporta o vأ­deo. Por favor, atualize seu navegador ou tente outro dispositivo.",
                "و‚¨çڑ„وµڈè§ˆه™¨ن¸چو”¯وŒپè¯¥è§†é¢‘م€‚è¯·و›´و–°وµڈè§ˆه™¨وˆ–ه°‌è¯•ه…¶ن»–è®¾ه¤‡م€‚",
                "ظ…طھطµظپط­ظƒ ظ„ط§ ظٹط¯ط¹ظ… ط§ظ„ظپظٹط¯ظٹظˆ. ظٹط±ط¬ظ‰ طھط­ط¯ظٹط« ط§ظ„ظ…طھطµظپط­ ط£ظˆ طھط¬ط±ط¨ط© ط¬ظ‡ط§ط² ط¢ط®ط±.",
                "Il tuo browser non supporta il video. Aggiorna il browser o prova un altro dispositivo.",
                "Ihr Browser unterstأ¼tzt das Video nicht. Bitte aktualisieren Sie Ihren Browser oder versuchen Sie ein anderes Gerأ¤t.",
                "Je browser ondersteunt de video niet. Update je browser of probeer een ander apparaat.",
                "ذ’ذ°رˆ ذ±ر€ذ°رƒذ·ذµر€ ذ½ذµ ذ؟ذ¾ذ´ذ´ذµر€ذ¶ذ¸ذ²ذ°ذµر‚ ذ²ذ¸ذ´ذµذ¾. ذ‍ذ±ذ½ذ¾ذ²ذ¸ر‚ذµ ذ±ر€ذ°رƒذ·ذµر€ ذ¸ذ»ذ¸ ذ؟ذ¾ذ؟ر€ذ¾ذ±رƒذ¹ر‚ذµ ذ´ر€رƒذ³ذ¾ذµ رƒرپر‚ر€ذ¾ذ¹رپر‚ذ²ذ¾.",
                "مپٹن½؟مپ„مپ®مƒ–مƒ©م‚¦م‚¶مپ¯ه‹•ç”»م‚’م‚µمƒ‌مƒ¼مƒˆمپ—مپ¦مپ„مپ¾مپ›م‚“م€‚مƒ–مƒ©م‚¦م‚¶م‚’و›´و–°مپ™م‚‹مپ‹م€پهˆ¥مپ®مƒ‡مƒگم‚¤م‚¹م‚’مپٹè©¦مپ—مپڈمپ مپ•مپ„م€‚",
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
              "أ€ propos de l'outil",
              "Sobre la herramienta",
              "Sobre a ferramenta",
              "ه…³ن؛ژوœ¬ه·¥ه…·",
              "ط­ظˆظ„ ط§ظ„ط£ط¯ط§ط©",
              "Informazioni sullo strumento",
              "أœber das Werkzeug",
              "Over de tool",
              "ذ‍ذ± ذ¸ذ½رپر‚ر€رƒذ¼ذµذ½ر‚ذµ",
              "مƒ„مƒ¼مƒ«مپ«مپ¤مپ„مپ¦",
            )}
          </p>
          <h2 id="what-is-calorievision" className="mb-3 text-2xl font-semibold md:text-3xl">
            {t(
              "What is CalorieVision?",
              "Qu'est-ce que CalorieVision ?",
              "آ؟Quأ© es CalorieVision?",
              "O que أ© o CalorieVision?",
              "ن»€ن¹ˆوک¯ CalorieVisionï¼ں",
              "ظ…ط§ ظ‡ظˆ CalorieVisionطں",
              "Cos'أ¨ CalorieVision?",
              "Was ist CalorieVision?",
              "Wat is CalorieVision?",
              "ذ§ر‚ذ¾ ر‚ذ°ذ؛ذ¾ذµ CalorieVision?",
              "CalorieVisionمپ¨مپ¯ï¼ں",
            )}
          </h2>
          <p className="mb-3 text-sm text-muted-foreground md:text-base">
            {t(
              "CalorieVision is an educational AI tool designed to help you understand your meals more clearly â€“ no scales, no manual logging, and no complicated nutrition trackers.",
              "CalorieVision est un outil d'IA أ©ducatif conأ§u pour vous aider أ  mieux comprendre vos repas â€“ sans balance, sans saisie manuelle et sans suivi nutritionnel compliquأ©.",
              "CalorieVision es una herramienta de IA educativa pensada para ayudarte a entender mejor tus comidas, sin bأ،sculas, sin registros manuales y sin complicados contadores de calorأ­as.",
              "O CalorieVision أ© uma ferramenta de IA educativa criada para o ajudar a compreender melhor as suas refeiأ§أµes â€“ sem balanأ§as, sem registos manuais e sem aplicaأ§أµes de nutriأ§أ£o complicadas.",
              "CalorieVision وک¯ن¸€و¬¾و•™è‚²ه‍‹ AI ه·¥ه…·ï¼Œو—¨هœ¨ه¸®هٹ©ن½ و›´ç›´è§‚هœ°ن؛†è§£و¯ڈن¸€é¤گâ€”â€”ن¸چéœ€è¦پé£ںç‰©ç§¤م€پن¸چéœ€è¦پو‰‹هٹ¨è®°ه½•ï¼Œن¹ںن¸چéœ€è¦په¤چو‌‚çڑ„èگ¥ه…»è؟½è¸ھه؛”ç”¨م€‚",
              "CalorieVision ط£ط¯ط§ط© طھط¹ظ„ظٹظ…ظٹط© طھط¹ظ…ظ„ ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ظ„ظ…ط³ط§ط¹ط¯طھظƒ ط¹ظ„ظ‰ ظپظ‡ظ… ظˆط¬ط¨ط§طھظƒ ط¨ظˆط¶ظˆط­ â€“ ط¨ط¯ظˆظ† ظ…ظˆط§ط²ظٹظ†طŒ ط¨ط¯ظˆظ† طھط³ط¬ظٹظ„ ظٹط¯ظˆظٹطŒ ظˆط¨ط¯ظˆظ† طھط·ط¨ظٹظ‚ط§طھ طھط؛ط°ظٹط© ظ…ط¹ظ‚ظ‘ط¯ط©.",
              "CalorieVision أ¨ uno strumento educativo basato su IA progettato per aiutarti a capire meglio i tuoi pasti â€“ senza bilance, senza registrazione manuale e senza complicati tracker nutrizionali.",
              "CalorieVision ist ein KI-Bildungswerkzeug, das Ihnen hilft, Ihre Mahlzeiten besser zu verstehen â€“ ohne Waagen, ohne manuelles Aufzeichnen und ohne komplizierte Ernأ¤hrungstracker.",
              "CalorieVision is een educatieve AI-tool ontworpen om je te helpen je maaltijden beter te begrijpen â€“ geen weegschalen, geen handmatig loggen en geen ingewikkelde voedingstrackers.",
              "CalorieVision â€” ذ¾ذ±ر€ذ°ذ·ذ¾ذ²ذ°ر‚ذµذ»رŒذ½ر‹ذ¹ ذکذک-ذ¸ذ½رپر‚ر€رƒذ¼ذµذ½ر‚, ذ؟ذ¾ذ¼ذ¾ذ³ذ°رژر‰ذ¸ذ¹ ذ»رƒر‡رˆذµ ذ؟ذ¾ذ½رڈر‚رŒ رپذ¾رپر‚ذ°ذ² رپذ²ذ¾ذ¸ر… ذ±ذ»رژذ´ â€” ذ±ذµذ· ذ²ذµرپذ¾ذ², ر€رƒر‡ذ½ذ¾ذ³ذ¾ ذ²ذ²ذ¾ذ´ذ° ذ¸ رپذ»ذ¾ذ¶ذ½ر‹ر… ر‚ر€ذµذ؛ذµر€ذ¾ذ² ذ؟ذ¸ر‚ذ°ذ½ذ¸رڈ.",
              "CalorieVisionمپ¯م€پé£ںن؛‹م‚’م‚ˆم‚ٹوکژç¢؛مپ«çگ†è§£مپ™م‚‹مپںم‚پمپ®و•™è‚²çڑ„مپھAIمƒ„مƒ¼مƒ«مپ§مپ™م€‚ç§¤م‚‚و‰‹ه‹•è¨کéŒ²م‚‚è¤‡é›‘مپھو „é¤ٹمƒˆمƒ©مƒƒم‚«مƒ¼م‚‚ن¸چè¦پمپ§مپ™م€‚",
            )}
          </p>
          <p className="mb-3 text-sm text-muted-foreground md:text-base">
            {t(
              "Simply upload a photo of your plate and our vision technology works behind the scenes to estimate which foods are present, how much of each is on your plate, and roughly how many calories your meal might contain.",
              "Vous envoyez simplement une photo de votre assiette et notre technologie de vision travaille en coulisses pour estimer les aliments prأ©sents, leur quantitأ© approximative et le nombre de calories que votre repas pourrait contenir.",
              "Solo tienes que subir una foto de tu plato y nuestra tecnologأ­a de visiأ³n trabaja en segundo plano para estimar quأ© alimentos hay, cuأ،nta cantidad aproximadamente y cuأ،ntas calorأ­as podrأ­a tener tu comida.",
              "Basta carregar uma fotografia do seu prato e a nossa tecnologia de visأ£o trabalha em segundo plano para estimar que alimentos estأ£o presentes, em que quantidade aproximada e quantas calorias a sua refeiأ§أ£o poderأ، conter.",
              "ن½ هڈھéœ€ن¸ٹن¼ ن¸€ه¼ é¤گç›کç…§ç‰‡ï¼Œوˆ‘ن»¬çڑ„è§†è§‰وٹ€وœ¯ن¼ڑهœ¨هگژهڈ°ن¼°ç®—ç›کن¸­وœ‰ه“ھن؛›é£ںç‰©م€پهگ„è‡ھçڑ„ه¤§è‡´هˆ†é‡ڈï¼Œن»¥هڈٹè؟™é،؟é¥­ه¤§ç؛¦هگ«وœ‰ه¤ڑه°‘هچ،è·¯é‡Œم€‚",
              "ظ…ط§ ط¹ظ„ظٹظƒ ط³ظˆظ‰ ط±ظپط¹ طµظˆط±ط© ظ„ط·ط¨ظ‚ظƒطŒ ظˆط³طھط¹ظ…ظ„ طھظ‚ظ†ظٹطھظ†ط§ ط§ظ„ط¨طµط±ظٹط© ظپظٹ ط§ظ„ط®ظ„ظپظٹط© ظ„طھظ‚ط¯ظٹط± ط§ظ„ط£ط·ط¹ظ…ط© ط§ظ„ظ…ظˆط¬ظˆط¯ط© ظˆظƒظ…ظٹط§طھظ‡ط§ ط§ظ„طھظ‚ط±ظٹط¨ظٹط© ظˆط¹ط¯ط¯ ط§ظ„ط³ط¹ط±ط§طھ ط§ظ„ط­ط±ط§ط±ظٹط© ط§ظ„ظ…ط­طھظ…ظ„ط©.",
              "Carica semplicemente una foto del tuo piatto e la nostra tecnologia di visione lavora in background per stimare quali alimenti sono presenti, quanto di ciascuno c'أ¨ nel piatto e approssimativamente quante calorie potrebbe contenere il tuo pasto.",
              "Laden Sie einfach ein Foto Ihres Tellers hoch und unsere Bilderkennungstechnologie arbeitet im Hintergrund, um zu schأ¤tzen, welche Lebensmittel vorhanden sind, wie viel von jedem auf Ihrem Teller ist und ungefأ¤hr wie viele Kalorien Ihre Mahlzeit enthalten kأ¶nnte.",
              "Upload simpelweg een foto van je bord en onze vision-technologie werkt op de achtergrond om te schatten welke voedingsmiddelen aanwezig zijn, hoeveel van elk op je bord ligt en ongeveer hoeveel calorieأ«n je maaltijd zou kunnen bevatten.",
              "ذںر€ذ¾رپر‚ذ¾ ذ·ذ°ذ³ر€رƒذ·ذ¸ر‚ذµ ر„ذ¾ر‚ذ¾ ر‚ذ°ر€ذµذ»ذ؛ذ¸, ذ¸ ذ½ذ°رˆذ° ر‚ذµر…ذ½ذ¾ذ»ذ¾ذ³ذ¸رڈ ذ؛ذ¾ذ¼ذ؟رŒرژر‚ذµر€ذ½ذ¾ذ³ذ¾ ذ·ر€ذµذ½ذ¸رڈ ذ² ر„ذ¾ذ½ذ¾ذ²ذ¾ذ¼ ر€ذµذ¶ذ¸ذ¼ذµ ذ¾ذ؟ر€ذµذ´ذµذ»ذ¸ر‚, ذ؛ذ°ذ؛ذ¸ذµ ذ؟ر€ذ¾ذ´رƒذ؛ر‚ر‹ ذ½ذ° ذ½ذµذ¹, ذ¸ر… ذ؟ر€ذ¸ذ¼ذµر€ذ½ذ¾ذµ ذ؛ذ¾ذ»ذ¸ر‡ذµرپر‚ذ²ذ¾ ذ¸ ذ؟ر€ذ¸ذ±ذ»ذ¸ذ·ذ¸ر‚ذµذ»رŒذ½رƒرژ ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¹ذ½ذ¾رپر‚رŒ ذ±ذ»رژذ´ذ°.",
              "مپٹçڑ؟مپ®ه†™çœںم‚’م‚¢مƒƒمƒ—مƒ­مƒ¼مƒ‰مپ™م‚‹مپ مپ‘مپ§م€پمƒ“م‚¸مƒ§مƒ³وٹ€è،“مپŒمƒگمƒƒم‚¯م‚°مƒ©م‚¦مƒ³مƒ‰مپ§é£ںه“پمپ®ç¨®é،‍مƒ»é‡ڈمƒ»مپٹمپٹم‚ˆمپ‌مپ®م‚«مƒ­مƒھمƒ¼م‚’وژ¨ه®ڑمپ—مپ¾مپ™م€‚",
            )}
          </p>
          <p className="mb-3 text-sm text-muted-foreground md:text-base">
            {t(
              "Our goal is not to judge your eating habits or tell you what you should or shouldn't eat. Instead, CalorieVision gives you simple, accessible information so you can build your own awareness and make more mindful decisions over time.",
              "Notre objectif n'est pas de juger vos habitudes alimentaires ni de vous dire ce que vous devriez ou ne devriez pas manger. CalorieVision vous fournit plutأ´t des informations simples et accessibles pour vous aider أ  dأ©velopper votre propre conscience alimentaire et أ  prendre des dأ©cisions plus أ©clairأ©es au fil du temps.",
              "Nuestro objetivo no es juzgar tus hأ،bitos alimentarios ni decirte lo que deberأ­as o no deberأ­as comer. CalorieVision te ofrece informaciأ³n sencilla y accesible para que puedas aumentar tu consciencia y tomar decisiones mأ،s conscientes con el tiempo.",
              "O nosso objetivo nأ£o أ© julgar os seus hأ،bitos alimentares nem dizer-lhe o que deve ou nأ£o deve comer. O CalorieVision oferece-lhe informaأ§أµes simples e acessأ­veis para que possa desenvolver a sua prأ³pria consciأھncia e tomar decisأµes mais conscientes ao longo do tempo.",
              "وˆ‘ن»¬çڑ„ç›®و ‡ن¸چوک¯è¯„هˆ¤ن½ çڑ„é¥®é£ںن¹ وƒ¯ï¼Œن¹ںن¸چوک¯ه‘ٹè¯‰ن½ ه؛”è¯¥وˆ–ن¸چه؛”è¯¥هگƒن»€ن¹ˆم€‚CalorieVision هڈھوک¯وڈگن¾›ç®€هچ•م€پوک“و‡‚çڑ„ن؟،وپ¯ï¼Œه¸®هٹ©ن½ é€گو­¥وڈگé«کè§‰ه¯ںï¼Œهœ¨é•؟وœںن¸­هپڑه‡؛و›´وœ‰و„ڈè¯†çڑ„é€‰و‹©م€‚",
              "ظ‡ط¯ظپظ†ط§ ظ„ظٹط³ ط§ظ„ط­ظƒظ… ط¹ظ„ظ‰ ط¹ط§ط¯ط§طھظƒ ط§ظ„ط؛ط°ط§ط¦ظٹط© ط£ظˆ ط¥ط®ط¨ط§ط±ظƒ ط¨ظ…ط§ ظٹط¬ط¨ ط£ظ† طھط£ظƒظ„ظ‡. ط¨ظ„ ظٹظ…ظ†ط­ظƒ CalorieVision ظ…ط¹ظ„ظˆظ…ط§طھ ط¨ط³ظٹط·ط© ظˆط³ظ‡ظ„ط© ط§ظ„ظپظ‡ظ… ظ„طھط¨ظ†ظٹ ظˆط¹ظٹظƒ ط§ظ„ط®ط§طµ ظˆط§طھط®ط§ط° ظ‚ط±ط§ط±ط§طھ ط£ظƒط«ط± ظˆط¹ظٹظ‹ط§ ط¨ظ…ط±ظˆط± ط§ظ„ظˆظ‚طھ.",
              "Il nostro obiettivo non أ¨ giudicare le tue abitudini alimentari o dirti cosa dovresti o non dovresti mangiare. CalorieVision ti fornisce informazioni semplici e accessibili per sviluppare la tua consapevolezza e prendere decisioni piأ¹ consapevoli nel tempo.",
              "Unser Ziel ist es nicht, Ihre Essgewohnheiten zu beurteilen oder Ihnen zu sagen, was Sie essen sollten oder nicht. CalorieVision gibt Ihnen stattdessen einfache, zugأ¤ngliche Informationen, damit Sie Ihr eigenes Bewusstsein aufbauen und mit der Zeit bewusstere Entscheidungen treffen kأ¶nnen.",
              "Ons doel is niet om je eetgewoonten te beoordelen of je te vertellen wat je wel of niet zou moeten eten. In plaats daarvan geeft CalorieVision je eenvoudige, toegankelijke informatie zodat je je eigen bewustzijn kunt opbouwen en in de loop van de tijd meer bewuste beslissingen kunt nemen.",
              "ذ‌ذ°رˆذ° ر†ذµذ»رŒ â€” ذ½ذµ ذ¾ر†ذµذ½ذ¸ذ²ذ°ر‚رŒ ذ²ذ°رˆذ¸ ذ؟ذ¸ر‰ذµذ²ر‹ذµ ذ؟ر€ذ¸ذ²ر‹ر‡ذ؛ذ¸ ذ¸ ذ½ذµ رƒذ؛ذ°ذ·ر‹ذ²ذ°ر‚رŒ, ر‡ر‚ذ¾ ذµرپر‚رŒ, ذ° ر‡ر‚ذ¾ ذ½ذµر‚. CalorieVision ذ؟ر€ذµذ´ذ¾رپر‚ذ°ذ²ذ»رڈذµر‚ ذ؟ر€ذ¾رپر‚رƒرژ, ذ´ذ¾رپر‚رƒذ؟ذ½رƒرژ ذ¸ذ½ر„ذ¾ر€ذ¼ذ°ر†ذ¸رژ, ر‡ر‚ذ¾ذ±ر‹ ذ²ر‹ ذ¼ذ¾ذ³ذ»ذ¸ ر€ذ°ذ·ذ²ذ¸ذ²ذ°ر‚رŒ ذ¾رپذ¾ذ·ذ½ذ°ذ½ذ½ذ¾رپر‚رŒ ذ¸ رپذ¾ ذ²ر€ذµذ¼ذµذ½ذµذ¼ ذ´ذµذ»ذ°ر‚رŒ ذ±ذ¾ذ»ذµذµ ذ²ذ·ذ²ذµرˆذµذ½ذ½ر‹ذµ ذ²ر‹ذ±ذ¾ر€ر‹.",
              "ç§پمپںمپ،مپ®ç›®و¨™مپ¯م€پمپ‚مپھمپںمپ®é£ںç؟’و…£م‚’è©•ن¾،مپ—مپںم‚ٹم€پن½•م‚’é£ںمپ¹م‚‹مپ¹مپچمپ‹م‚’وŒ‡ç¤؛مپ—مپںم‚ٹمپ™م‚‹مپ“مپ¨مپ§مپ¯مپ‚م‚ٹمپ¾مپ›م‚“م€‚CalorieVisionمپ¯م€پم‚·مƒ³مƒ—مƒ«مپ§م‚ڈمپ‹م‚ٹم‚„مپ™مپ„وƒ…ه ±م‚’وڈگن¾›مپ—م€پمپ‚مپھمپںè‡ھè؛«مپ®و„ڈè­کم‚’é«کم‚پم€پم‚ˆم‚ٹè³¢وکژمپھéپ¸وٹ‍مپŒمپ§مپچم‚‹م‚ˆمپ†مپ«م‚µمƒ‌مƒ¼مƒˆمپ—مپ¾مپ™م€‚",
            )}
          </p>
          <p className="text-sm text-muted-foreground md:text-base">
            {t(
              "This platform is not a medical device and does not replace professional nutrition advice. All outputs are approximations intended purely for learning and reflection.",
              "Cette plateforme n'est pas un dispositif mأ©dical et ne remplace pas les conseils d'un professionnel de la nutrition. Tous les rأ©sultats sont des approximations destinأ©es uniquement أ  l'apprentissage et أ  la rأ©flexion.",
              "Esta plataforma no es un dispositivo mأ©dico y no sustituye el consejo de un profesional de la nutriciأ³n. Todos los resultados son aproximaciones pensadas أ؛nicamente para aprender y reflexionar.",
              "Esta plataforma nأ£o أ© um dispositivo mأ©dico e nأ£o substitui o aconselhamento de um profissional de nutriأ§أ£o. Todos os resultados sأ£o aproximados e destinam-se apenas أ  aprendizagem e reflexأ£o.",
              "وœ¬ه¹³هڈ°ن¸چوک¯هŒ»ç–—è®¾ه¤‡ï¼Œن¹ںن¸چèƒ½و›؟ن»£ن¸“ن¸ڑèگ¥ه…»ه»؛è®®م€‚و‰€وœ‰ç»“و‍œéƒ½وک¯è؟‘ن¼¼ن¼°è®،ï¼Œن»…ç”¨ن؛ژه­¦ن¹ ه’Œè‡ھوˆ‘هڈچو€‌م€‚",
              "ظ‡ط°ظ‡ ط§ظ„ظ…ظ†طµط© ظ„ظٹط³طھ ط¬ظ‡ط§ط²ظ‹ط§ ط·ط¨ظٹظ‹ط§ ظˆظ„ط§ طھط­ظ„ظ‘ ظ…ط­ظ„ ط§ط³طھط´ط§ط±ط© ط®ط¨ظٹط± طھط؛ط°ظٹط©. ط¬ظ…ظٹط¹ ط§ظ„ظ†طھط§ط¦ط¬ طھظ‚ط¯ظٹط±ط§طھ طھظ‚ط±ظٹط¨ظٹط© ظ…ظڈط¹ط¯ظ‘ط© ظ„ظ„طھط¹ظ„ظ… ظˆط§ظ„طھط£ظ…ظ„ ظپظ‚ط·.",
              "Questa piattaforma non أ¨ un dispositivo medico e non sostituisce i consigli di un professionista della nutrizione. Tutti i risultati sono approssimazioni destinate esclusivamente all'apprendimento e alla riflessione.",
              "Diese Plattform ist kein medizinisches Gerأ¤t und ersetzt keine professionelle Ernأ¤hrungsberatung. Alle Ergebnisse sind Nأ¤herungswerte, die ausschlieأںlich zum Lernen und Nachdenken bestimmt sind.",
              "Dit platform is geen medisch hulpmiddel en vervangt geen professioneel voedingsadvies. Alle resultaten zijn schattingen die uitsluitend bedoeld zijn voor leren en reflectie.",
              "ذ­ر‚ذ° ذ؟ذ»ذ°ر‚ر„ذ¾ر€ذ¼ذ° ذ½ذµ رڈذ²ذ»رڈذµر‚رپرڈ ذ¼ذµذ´ذ¸ر†ذ¸ذ½رپذ؛ذ¸ذ¼ رƒرپر‚ر€ذ¾ذ¹رپر‚ذ²ذ¾ذ¼ ذ¸ ذ½ذµ ذ·ذ°ذ¼ذµذ½رڈذµر‚ ذ؟ر€ذ¾ر„ذµرپرپذ¸ذ¾ذ½ذ°ذ»رŒذ½رƒرژ ذ؛ذ¾ذ½رپرƒذ»رŒر‚ذ°ر†ذ¸رژ ذ´ذ¸ذµر‚ذ¾ذ»ذ¾ذ³ذ°. ذ’رپذµ ر€ذµذ·رƒذ»رŒر‚ذ°ر‚ر‹ رڈذ²ذ»رڈرژر‚رپرڈ ذ؟ر€ذ¸ذ±ذ»ذ¸ذ·ذ¸ر‚ذµذ»رŒذ½ر‹ذ¼ذ¸ ذ¸ ذ؟ر€ذµذ´ذ½ذ°ذ·ذ½ذ°ر‡ذµذ½ر‹ ذ¸رپذ؛ذ»رژر‡ذ¸ر‚ذµذ»رŒذ½ذ¾ ذ´ذ»رڈ ذ¾ذ±رƒر‡ذµذ½ذ¸رڈ ذ¸ رپذ°ذ¼ذ¾ذ°ذ½ذ°ذ»ذ¸ذ·ذ°.",
              "مپ“مپ®مƒ—مƒ©مƒƒمƒˆمƒ•م‚©مƒ¼مƒ مپ¯هŒ»ç™‚و©ںه™¨مپ§مپ¯مپھمپڈم€په°‚é–€çڑ„مپھو „é¤ٹم‚¢مƒ‰مƒگم‚¤م‚¹مپ®ن»£و›؟مپ«مپ¯مپھم‚ٹمپ¾مپ›م‚“م€‚مپ™مپ¹مپ¦مپ®çµگو‍œمپ¯مپٹمپٹم‚ˆمپ‌مپ®وژ¨ه®ڑه€¤مپ§مپ‚م‚ٹم€په­¦ç؟’مپ¨وŒ¯م‚ٹè؟”م‚ٹمپ®مپ؟م‚’ç›®çڑ„مپ¨مپ—مپ¦مپ„مپ¾مپ™م€‚",
            )}
          </p>
        </section>

        <section className="section-card" aria-label="Why use CalorieVision?">
          <p className="eyebrow">
            {t(
              "Why it matters",
              "Pourquoi c'est important",
              "Por quأ© importa",
              "Por que أ© importante",
              "ن¸؛ن»€ن¹ˆè؟™ه¾ˆé‡چè¦پ",
              "ظ„ظ…ط§ط°ط§ ظ‡ط°ط§ ظ…ظ‡ظ…",
              "Perchأ© أ¨ importante",
              "Warum es wichtig ist",
              "Waarom het belangrijk is",
              "ذںذ¾ر‡ذµذ¼رƒ رچر‚ذ¾ ذ²ذ°ذ¶ذ½ذ¾",
              "مپھمپœé‡چè¦پمپھمپ®مپ‹",
            )}
          </p>
          <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
            {t(
              "Why use CalorieVision?",
              "Pourquoi utiliser CalorieVision ?",
              "آ؟Por quأ© usar CalorieVision?",
              "Por que usar o CalorieVision?",
              "ن¸؛ن»€ن¹ˆè¦پن½؟ç”¨ CalorieVisionï¼ں",
              "ظ„ظ…ط§ط°ط§ طھط³طھط®ط¯ظ… CalorieVisionطں",
              "Perchأ© usare CalorieVision?",
              "Warum CalorieVision verwenden?",
              "Waarom CalorieVision gebruiken?",
              "ذ—ذ°ر‡ذµذ¼ ذ¸رپذ؟ذ¾ذ»رŒذ·ذ¾ذ²ذ°ر‚رŒ CalorieVision?",
              "مپھمپœCalorieVisionم‚’ن½؟مپ†مپ®مپ‹ï¼ں",
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
                    "Rأ،pido y sencillo.",
                    "Rأ،pido e simples.",
                    "ه؟«وچ·هڈˆç®€هچ•م€‚",
                    "ط³ط±ظٹط¹ ظˆط³ظ‡ظ„.",
                    "Veloce e semplice.",
                    "Schnell und einfach.",
                    "Snel en gemakkelijk.",
                    "ذ‘ر‹رپر‚ر€ذ¾ ذ¸ ذ؟ر€ذ¾رپر‚ذ¾.",
                    "é€ںمپڈمپ¦ç°،هچکم€‚",
                  )}
                </span>{" "}
                {t(
                  "Snap a quick photo and get an instant, human-readable breakdown of your meal.",
                  "Prenez une photo rapide et obtenez immأ©diatement une analyse claire et comprأ©hensible de votre repas.",
                  "Haz una foto rأ،pida y obtأ©n al instante un desglose claro y fأ،cil de entender de tu comida.",
                  "Tire uma fotografia rأ،pida e obtenha de imediato uma anأ،lise clara e fأ،cil de entender da sua refeiأ§أ£o.",
                  "هڈھéœ€ه؟«é€ںو‹چن¸€ه¼ ç…§ç‰‡ï¼Œه°±èƒ½ç«‹هچ³çœ‹هˆ°ن¸€ن»½و¸…و™°وک“و‡‚çڑ„é¤گé£ںè§£و‍گم€‚",
                  "ط§ظ„طھظ‚ط· طµظˆط±ط© ط³ط±ظٹط¹ط© ظˆط§ط­طµظ„ ظپظˆط±ظ‹ط§ ط¹ظ„ظ‰ طھط­ظ„ظٹظ„ ظˆط§ط¶ط­ ظˆظ…ظپظ‡ظˆظ… ظ„ظˆط¬ط¨طھظƒ.",
                  "Scatta una foto veloce e ottieni subito un'analisi chiara e comprensibile del tuo pasto.",
                  "Machen Sie ein schnelles Foto und erhalten Sie sofort eine klare, verstأ¤ndliche Aufschlأ¼sselung Ihrer Mahlzeit.",
                  "Maak snel een foto en krijg direct een duidelijke, leesbare uitsplitsing van je maaltijd.",
                  "ذ،ذ´ذµذ»ذ°ذ¹ر‚ذµ رپذ½ذ¸ذ¼ذ¾ذ؛ ذ¸ ذ¼ذ³ذ½ذ¾ذ²ذµذ½ذ½ذ¾ ذ؟ذ¾ذ»رƒر‡ذ¸ر‚ذµ ذ؟ذ¾ذ½رڈر‚ذ½رƒرژ ر€ذ°ذ·ذ±ذ¸ذ²ذ؛رƒ رپذ¾رپر‚ذ°ذ²ذ° ذ²ذ°رˆذµذ³ذ¾ ذ±ذ»رژذ´ذ°.",
                  "مپ•مپ£مپ¨ه†™çœںم‚’و’®م‚‹مپ مپ‘مپ§م€پé£ںن؛‹مپ®ه†…ه®¹مپŒن¸€ç›®مپ§م‚ڈمپ‹م‚‹هˆ†و‍گمپŒهچ³ه؛§مپ«ه¾—م‚‰م‚Œمپ¾مپ™م€‚",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Workflow className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "AI-powered.",
                    "Propulsأ© par l'IA.",
                    "Impulsado por IA.",
                    "Com tecnologia de IA.",
                    "ç”±ن؛؛ه·¥و™؛èƒ½é©±هٹ¨م€‚",
                    "ظ…ط¯ط¹ظˆظ… ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ.",
                    "Basato su IA.",
                    "KI-gestأ¼tzt.",
                    "Aangedreven door AI.",
                    "ذ‌ذ° ذ±ذ°ذ·ذµ ذکذک.",
                    "AIوگ­è¼‰م€‚",
                  )}
                </span>{" "}
                {t(
                  "Behind the scenes, CalorieVision uses modern image-recognition models to detect foods and estimate portions.",
                  "En coulisses, CalorieVision utilise des modأ¨les modernes de reconnaissance d'images pour dأ©tecter les aliments et estimer les portions.",
                  "Entre bastidores, CalorieVision utiliza modelos modernos de reconocimiento de imأ،genes para detectar alimentos y estimar raciones.",
                  "Nos bastidores, o CalorieVision utiliza modelos modernos de reconhecimento de imagem para detetar alimentos e estimar porأ§أµes.",
                  "هœ¨هگژهڈ°ï¼ŒCalorieVision ن½؟ç”¨çژ°ن»£ه›¾هƒڈè¯†هˆ«و¨،ه‍‹و‌¥è¯†هˆ«é£ںç‰©ه¹¶ن¼°ç®—هˆ†é‡ڈم€‚",
                  "ظپظٹ ط§ظ„ط®ظ„ظپظٹط©طŒ ظٹط³طھط®ط¯ظ… CalorieVision ظ†ظ…ط§ط°ط¬ ط­ط¯ظٹط«ط© ظ„ظ„طھط¹ط±ظ‘ظپ ط¹ظ„ظ‰ ط§ظ„طµظˆط± ظ„ط§ظƒطھط´ط§ظپ ط§ظ„ط£ط·ط¹ظ…ط© ظˆطھظ‚ط¯ظٹط± ط§ظ„ط­طµطµ.",
                  "Dietro le quinte, CalorieVision utilizza moderni modelli di riconoscimento immagini per rilevare gli alimenti e stimare le porzioni.",
                  "Im Hintergrund verwendet CalorieVision moderne Bilderkennungsmodelle, um Lebensmittel zu erkennen und Portionen zu schأ¤tzen.",
                  "Achter de schermen gebruikt CalorieVision moderne beeldherkenningsmodellen om voedsel te detecteren en porties te schatten.",
                  "ذ—ذ° ذ؛رƒذ»ذ¸رپذ°ذ¼ذ¸ CalorieVision ذ¸رپذ؟ذ¾ذ»رŒذ·رƒذµر‚ رپذ¾ذ²ر€ذµذ¼ذµذ½ذ½ر‹ذµ ذ¼ذ¾ذ´ذµذ»ذ¸ ر€ذ°رپذ؟ذ¾ذ·ذ½ذ°ذ²ذ°ذ½ذ¸رڈ ذ¸ذ·ذ¾ذ±ر€ذ°ذ¶ذµذ½ذ¸ذ¹ ذ´ذ»رڈ ذ¾ذ±ذ½ذ°ر€رƒذ¶ذµذ½ذ¸رڈ ذ؟ر€ذ¾ذ´رƒذ؛ر‚ذ¾ذ² ذ¸ ذ¾ر†ذµذ½ذ؛ذ¸ ذ؟ذ¾ر€ر†ذ¸ذ¹.",
                  "CalorieVisionمپ¯مƒگمƒƒم‚¯م‚°مƒ©م‚¦مƒ³مƒ‰مپ§وœ€و–°مپ®ç”»هƒڈèھچè­کمƒ¢مƒ‡مƒ«م‚’ن½؟ç”¨مپ—مپ¦é£ںه“پم‚’و¤œه‡؛مپ—م€پé‡ڈم‚’وژ¨ه®ڑمپ—مپ¾مپ™م€‚",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "Educational, not clinical.",
                    "أ‰ducatif, pas clinique.",
                    "Educativo, no clأ­nico.",
                    "Educativo, nأ£o clأ­nico.",
                    "ن¾§é‡چه­¦ن¹ ï¼Œè€Œé‌‍ن¸´ه؛ٹç”¨é€”م€‚",
                    "طھط¹ظ„ظٹظ…ظٹطŒ ظˆظ„ظٹط³ ط·ط¨ظٹظ‹ط§.",
                    "Educativo, non clinico.",
                    "Lehrreich, nicht klinisch.",
                    "Educatief, niet klinisch.",
                    "ذ‍ذ±ر€ذ°ذ·ذ¾ذ²ذ°ر‚ذµذ»رŒذ½ر‹ذ¹, ذ½ذµ ذ¼ذµذ´ذ¸ر†ذ¸ذ½رپذ؛ذ¸ذ¹.",
                    "و•™è‚²çڑ„مپ§مپ‚م‚ٹم€پè‡¨ه؛ٹçڑ„مپ§مپ¯مپھمپ„م€‚",
                  )}
                </span>{" "}
                {t(
                  "Insights are general and non-medical, meant to help you learn, not diagnose or prescribe.",
                  "Les informations sont gأ©nأ©rales et non mأ©dicales, destinأ©es أ  vous aider أ  apprendre, pas أ  diagnostiquer ni أ  prescrire.",
                  "Las indicaciones son generales y no mأ©dicas; estأ،n pensadas para ayudarte a aprender, no para diagnosticar ni prescribir.",
                  "As informaأ§أµes sأ£o gerais e nأ£o mأ©dicas â€“ servem para o ajudar a aprender, nأ£o para diagnosticar ou prescrever.",
                  "ç»™ه‡؛çڑ„هڈھوک¯ن¸€èˆ¬و€§م€پé‌‍هŒ»ç–—و€§çڑ„وڈگç¤؛ï¼Œç›®çڑ„وک¯ه¸®هٹ©ن½ ه­¦ن¹ ï¼Œè€Œن¸چوک¯ç”¨ن؛ژè¯ٹو–­وˆ–ه¼€ه…·ه¤„و–¹م€‚",
                  "ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط¹ط§ظ…ط© ظˆط؛ظٹط± ط·ط¨ظٹط©طŒ ظ‡ط¯ظپظ‡ط§ ظ…ط³ط§ط¹ط¯طھظƒ ط¹ظ„ظ‰ ط§ظ„طھط¹ظ„ظ‘ظ… ظ„ط§ ط§ظ„طھط´ط®ظٹطµ ط£ظˆ ظˆطµظپ ط§ظ„ط¹ظ„ط§ط¬.",
                  "Le informazioni sono generali e non mediche, pensate per aiutarti a imparare, non per diagnosticare o prescrivere.",
                  "Die Erkenntnisse sind allgemein und nicht medizinisch, gedacht um Ihnen beim Lernen zu helfen, nicht um zu diagnostizieren oder zu verschreiben.",
                  "Inzichten zijn algemeen en niet-medisch, bedoeld om je te helpen leren, niet om te diagnosticeren of voor te schrijven.",
                  "ذ ذµذ؛ذ¾ذ¼ذµذ½ذ´ذ°ر†ذ¸ذ¸ ذ½ذ¾رپرڈر‚ ذ¾ذ±ر‰ذ¸ذ¹ ذ¸ ذ½ذµذ¼ذµذ´ذ¸ر†ذ¸ذ½رپذ؛ذ¸ذ¹ ر…ذ°ر€ذ°ذ؛ر‚ذµر€ â€” ذ¾ذ½ذ¸ ذ؟ذ¾ذ¼ذ¾ذ³ذ°رژر‚ رƒر‡ذ¸ر‚رŒرپرڈ, ذ° ذ½ذµ رپر‚ذ°ذ²ذ¸ر‚رŒ ذ´ذ¸ذ°ذ³ذ½ذ¾ذ· ذ¸ذ»ذ¸ ذ½ذ°ذ·ذ½ذ°ر‡ذ°ر‚رŒ ذ»ذµر‡ذµذ½ذ¸ذµ.",
                  "م‚¢مƒ‰مƒگم‚¤م‚¹مپ¯ن¸€èˆ¬çڑ„مپ§é‌‍هŒ»ç™‚çڑ„مپھم‚‚مپ®مپ§مپ‚م‚ٹم€په­¦ç؟’م‚’ç›®çڑ„مپ¨مپ—مپ¦مپ„مپ¾مپ™م€‚è¨؛و–­م‚„ه‡¦و–¹م‚’و„ڈه›³مپ—مپںم‚‚مپ®مپ§مپ¯مپ‚م‚ٹمپ¾مپ›م‚“م€‚",
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
                    "Consejos nutricionales أ؛tiles.",
                    "Dicas de nutriأ§أ£o أ؛teis.",
                    "ه®‍ç”¨çڑ„èگ¥ه…»ه°ڈè´´ه£«م€‚",
                    "ظ†طµط§ط¦ط­ طھط؛ط°ظٹط© ظ…ظپظٹط¯ط©.",
                    "Consigli nutrizionali utili.",
                    "Hilfreiche Ernأ¤hrungstipps.",
                    "Handige voedingstips.",
                    "ذںذ¾ذ»ذµذ·ذ½ر‹ذµ رپذ¾ذ²ذµر‚ر‹ ذ؟ذ¾ ذ؟ذ¸ر‚ذ°ذ½ذ¸رژ.",
                    "ه½¹ç«‹مپ¤و „é¤ٹمپ®مƒ’مƒ³مƒˆم€‚",
                  )}
                </span>{" "}
                {t(
                  "Receive friendly ideas like adding more vegetables or balancing carbs with protein.",
                  "Recevez des idأ©es bienveillantes comme ajouter plus de lأ©gumes ou أ©quilibrer glucides et protأ©ines.",
                  "Recibe sugerencias amables, como aأ±adir mأ،s verduras o equilibrar hidratos y proteأ­nas.",
                  "Receba sugestأµes amigأ،veis, como adicionar mais legumes ou equilibrar hidratos de carbono com proteأ­na.",
                  "ن½ ن¼ڑو”¶هˆ°ن¸€ن؛›هڈ‹ه¥½çڑ„ه»؛è®®ï¼Œو¯”ه¦‚ه¤ڑهٹ ç‚¹è”¬èڈœï¼Œوˆ–è®©ç¢³و°´ه’Œè›‹ç™½è´¨و›´ه‌‡è،،م€‚",
                  "ط§ط­طµظ„ ط¹ظ„ظ‰ ط§ظ‚طھط±ط§ط­ط§طھ ظˆط¯ظ‘ظٹط© ظ…ط«ظ„ ط¥ط¶ط§ظپط© ط§ظ„ظ…ط²ظٹط¯ ظ…ظ† ط§ظ„ط®ط¶ط±ظˆط§طھ ط£ظˆ طھط­ظ‚ظٹظ‚ طھظˆط§ط²ظ† ط¨ظٹظ† ط§ظ„ظƒط±ط¨ظˆظ‡ظٹط¯ط±ط§طھ ظˆط§ظ„ط¨ط±ظˆطھظٹظ†.",
                  "Ricevi suggerimenti amichevoli come aggiungere piأ¹ verdure o bilanciare carboidrati e proteine.",
                  "Erhalten Sie freundliche Vorschlأ¤ge wie mehr Gemأ¼se hinzuzufأ¼gen oder Kohlenhydrate mit Eiweiأں auszugleichen.",
                  "Ontvang vriendelijke ideeأ«n zoals meer groenten toevoegen of koolhydraten balanceren met eiwitten.",
                  "ذںذ¾ذ»رƒر‡ذ°ذ¹ر‚ذµ ذ´ر€رƒذ¶ذµرپذ؛ذ¸ذµ رپذ¾ذ²ذµر‚ر‹ â€” ذ½ذ°ذ؟ر€ذ¸ذ¼ذµر€, ذ´ذ¾ذ±ذ°ذ²ذ¸ر‚رŒ ذ±ذ¾ذ»رŒرˆذµ ذ¾ذ²ذ¾ر‰ذµذ¹ ذ¸ذ»ذ¸ رپذ±ذ°ذ»ذ°ذ½رپذ¸ر€ذ¾ذ²ذ°ر‚رŒ رƒذ³ذ»ذµذ²ذ¾ذ´ر‹ رپ ذ±ذµذ»ذ؛ذ¾ذ¼.",
                  "é‡ژèڈœم‚’ه¢—م‚„مپ—مپںم‚ٹم€پç‚­و°´هŒ–ç‰©مپ¨م‚؟مƒ³مƒ‘م‚¯è³ھمپ®مƒگمƒ©مƒ³م‚¹م‚’هڈ–م‚‹مپھمپ©م€پè¦ھهˆ‡مپھم‚¢مƒ‰مƒگم‚¤م‚¹م‚’هڈ—مپ‘هڈ–م‚Œمپ¾مپ™م€‚",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "Private and respectful.",
                    "Privأ© et respectueux.",
                    "Privado y respetuoso.",
                    "Privado e respeitoso.",
                    "é‡چè§†éڑگç§پن¸ژه°ٹé‡چم€‚",
                    "ط®ط§طµ ظˆظ…ط­طھط±ظ….",
                    "Privato e rispettoso.",
                    "Privat und respektvoll.",
                    "Privأ© en respectvol.",
                    "ذڑذ¾ذ½ر„ذ¸ذ´ذµذ½ر†ذ¸ذ°ذ»رŒذ½ذ¾ ذ¸ رƒذ²ذ°ذ¶ذ¸ر‚ذµذ»رŒذ½ذ¾.",
                    "مƒ—مƒ©م‚¤مƒ™مƒ¼مƒˆمپ§و•¬و„ڈمپ‚م‚‹م€‚",
                  )}
                </span>{" "}
                {t(
                  "Photos are not stored and are not used to train models â€“ your meal is your business.",
                  "Les photos ne sont pas conservأ©es et ne sont pas utilisأ©es pour entraأ®ner des modأ¨les â€“ votre repas vous appartient.",
                  "Las fotos no se guardan ni se utilizan para entrenar modelos: tu comida es solo tuya.",
                  "As fotografias nأ£o sأ£o guardadas nem utilizadas para treinar modelos â€“ a sua refeiأ§أ£o أ© assunto seu.",
                  "ç…§ç‰‡ن¸چن¼ڑè¢«ن؟‌ه­کï¼Œن¹ںن¸چن¼ڑç”¨ن؛ژè®­ç»ƒو¨،ه‍‹â€”â€”ن½ çڑ„é¤گé£ںهڈھه±‍ن؛ژن½ è‡ھه·±م€‚",
                  "ظ„ط§ ظٹطھظ… طھط®ط²ظٹظ† ط§ظ„طµظˆط± ظˆظ„ط§ طھظڈط³طھط®ط¯ظ… ظ„طھط¯ط±ظٹط¨ ط§ظ„ظ†ظ…ط§ط°ط¬ â€“ ظˆط¬ط¨طھظƒ ط´ط£ظ†ظƒ ط§ظ„ط®ط§طµ.",
                  "Le foto non vengono salvate e non vengono usate per addestrare modelli â€“ il tuo pasto sono affari tuoi.",
                  "Fotos werden nicht gespeichert und nicht zum Trainieren von Modellen verwendet â€“ Ihre Mahlzeit ist Ihre Privatsache.",
                  "Foto's worden niet opgeslagen en niet gebruikt om modellen te trainen â€“ je maaltijd is jouw zaak.",
                  "ذ¤ذ¾ر‚ذ¾ذ³ر€ذ°ر„ذ¸ذ¸ ذ½ذµ ر…ر€ذ°ذ½رڈر‚رپرڈ ذ¸ ذ½ذµ ذ¸رپذ؟ذ¾ذ»رŒذ·رƒرژر‚رپرڈ ذ´ذ»رڈ ذ¾ذ±رƒر‡ذµذ½ذ¸رڈ ذ¼ذ¾ذ´ذµذ»ذµذ¹ â€” ذ²ذ°رˆذµ ذ±ذ»رژذ´ذ¾ ذ¾رپر‚ذ°ر‘ر‚رپرڈ ذ²ذ°رˆذ¸ذ¼ ذ»ذ¸ر‡ذ½ر‹ذ¼ ذ´ذµذ»ذ¾ذ¼.",
                  "ه†™çœںمپ¯ن؟‌ه­کمپ•م‚Œمپڑم€پمƒ¢مƒ‡مƒ«مپ®مƒˆمƒ¬مƒ¼مƒ‹مƒ³م‚°مپ«م‚‚ن½؟ç”¨مپ•م‚Œمپ¾مپ›م‚“م€‚مپ‚مپھمپںمپ®é£ںن؛‹مپ¯مپ‚مپھمپںمپ مپ‘مپ®م‚‚مپ®مپ§مپ™م€‚",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">
                  {t(
                    "100% free to use.",
                    "100 % gratuit أ  utiliser.",
                    "100 % gratuito de usar.",
                    "100 % gratuito para utilizar.",
                    "ه®Œه…¨ه…چè´¹ن½؟ç”¨م€‚",
                    "ظ…ط¬ط§ظ†ظٹ 100%.",
                    "100% gratuito.",
                    "100% kostenlos.",
                    "100% gratis te gebruiken.",
                    "100% ذ±ذµرپذ؟ذ»ذ°ر‚ذ½ذ¾.",
                    "100%ç„،و–™مپ§ن½؟ç”¨هڈ¯èƒ½م€‚",
                  )}
                </span>{" "}
                {t(
                  "Explore your meals as often as you like without subscriptions or paywalls.",
                  "Explorez vos repas aussi souvent que vous le souhaitez, sans abonnement ni mur payant.",
                  "Explora tus comidas tantas veces como quieras, sin suscripciones ni muros de pago.",
                  "Explore as suas refeiأ§أµes sempre que quiser, sem subscriأ§أµes nem paywalls.",
                  "ن½ هڈ¯ن»¥éڑڈو—¶ه¤ڑو¬،هˆ†و‍گè‡ھه·±çڑ„é¤گé£ںï¼Œو— éœ€è®¢éک…ï¼Œن¹ںو²،وœ‰ن»»ن½•ن»کè´¹ه¢™م€‚",
                  "ط§ط³طھظƒط´ظپ ظˆط¬ط¨ط§طھظƒ ط¨ظ‚ط¯ط± ظ…ط§ طھط´ط§ط، ط¯ظˆظ† ط§ط´طھط±ط§ظƒط§طھ ط£ظˆ ظ‚ظٹظˆط¯ ظ…ط¯ظپظˆط¹ط©.",
                  "Esplora i tuoi pasti tutte le volte che vuoi senza abbonamenti o paywall.",
                  "Analysieren Sie Ihre Mahlzeiten so oft Sie mأ¶chten ohne Abonnements oder Bezahlschranken.",
                  "Ontdek je maaltijden zo vaak als je wilt zonder abonnementen of betaalmuren.",
                  "ذگذ½ذ°ذ»ذ¸ذ·ذ¸ر€رƒذ¹ر‚ذµ ذ±ذ»رژذ´ذ° رپذ؛ذ¾ذ»رŒذ؛ذ¾ رƒذ³ذ¾ذ´ذ½ذ¾ ر€ذ°ذ· ذ±ذµذ· ذ؟ذ¾ذ´ذ؟ذ¸رپذ¾ذ؛ ذ¸ ذ؟ذ»ذ°ر‚ذ½ر‹ر… ذ±ذ°ر€رŒذµر€ذ¾ذ².",
                  "م‚µمƒ–م‚¹م‚¯مƒھمƒ—م‚·مƒ§مƒ³م‚„وœ‰و–™م‚³مƒ³مƒ†مƒ³مƒ„مپھمپ—مپ§م€په¥½مپچمپھمپ مپ‘é£ںن؛‹م‚’هˆ†و‍گمپ§مپچمپ¾مپ™م€‚",
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
              "Vea cأ³mo funciona",
              "Veja em aأ§أ£o",
              "çœ‹çœ‹ه¦‚ن½•è؟گن½œ",
              "ط´ط§ظ‡ط¯ظ‡ ط£ط«ظ†ط§ط، ط§ظ„ط¹ظ…ظ„",
              "Guardalo in azione",
              "Sehen Sie es in Aktion",
              "Bekijk het in actie",
              "ذ،ذ¼ذ¾ر‚ر€ذ¸ر‚ذµ ذ² ذ´ذµذ¹رپر‚ذ²ذ¸ذ¸",
              "ه®ںéڑ›مپ«ه‹•ن½œم‚’è¦‹م‚‹",
            )}
          </p>
          <h2 className="text-2xl font-semibold md:text-3xl">
            {t(
              "How CalorieVision Works",
              "Comment fonctionne CalorieVision",
              "Cأ³mo funciona CalorieVision",
              "Como funciona o CalorieVision",
              "CalorieVision ه¦‚ن½•è؟گن½œ",
              "ظƒظٹظپ ظٹط¹ظ…ظ„ CalorieVision",
              "Come funziona CalorieVision",
              "So funktioniert CalorieVision",
              "Hoe CalorieVision werkt",
              "ذڑذ°ذ؛ ر€ذ°ذ±ذ¾ر‚ذ°ذµر‚ CalorieVision",
              "CalorieVisionمپ®ن»•çµ„مپ؟",
            )}
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl overflow-hidden bg-secondary/40 p-4">
            <img
              src={howItWorks1}
              alt={t(
                "Taking a photo of a meal with a smartphone",
                "Prise de photo d'un repas avec un smartphone",
                "Tomando una foto de una comida con un smartphone",
                "Tirando uma foto de uma refeiأ§أ£o com um smartphone",
                "ç”¨و™؛èƒ½و‰‹وœ؛و‹چو‘„é¤گé£ںç…§ç‰‡",
                "ط§ظ„طھظ‚ط§ط· طµظˆط±ط© ظ„ظˆط¬ط¨ط© ط¨ط§ظ„ظ‡ط§طھظپ ط§ظ„ط°ظƒظٹ",
                "Scattare una foto di un pasto con lo smartphone",
                "Ein Foto einer Mahlzeit mit dem Smartphone aufnehmen",
                "Een foto maken van een maaltijd met een smartphone",
                "ذ¤ذ¾ر‚ذ¾ذ³ر€ذ°ر„ذ¸ر€ذ¾ذ²ذ°ذ½ذ¸ذµ ذµذ´ر‹ ذ½ذ° رپذ¼ذ°ر€ر‚ر„ذ¾ذ½",
                "م‚¹مƒ‍مƒ¼مƒˆمƒ•م‚©مƒ³مپ§é£ںن؛‹مپ®ه†™çœںم‚’و’®م‚‹",
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
                "1. Capture sua refeiأ§أ£o",
                "1. و‹چو‘„و‚¨çڑ„é¤گé£ں",
                "1. ط§ظ„طھظ‚ط· طµظˆط±ط© ظˆط¬ط¨طھظƒ",
                "1. Cattura il tuo pasto",
                "1. Fotografieren Sie Ihre Mahlzeit",
                "1. Leg je maaltijd vast",
                "1. ذ،ر„ذ¾ر‚ذ¾ذ³ر€ذ°ر„ذ¸ر€رƒذ¹ر‚ذµ ذ±ذ»رژذ´ذ¾",
                "1. é£ںن؛‹م‚’و’®ه½±مپ™م‚‹",
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Simply take a photo of your plate with your smartphone. Make sure the lighting is good and all foods are visible.",
                "Prenez simplement une photo de votre assiette avec votre smartphone. Assurez-vous que l'أ©clairage est bon et que tous les aliments sont visibles.",
                "Simplemente tome una foto de su plato con su smartphone. Asegأ؛rese de que la iluminaciأ³n sea buena y todos los alimentos sean visibles.",
                "Basta tirar uma foto do seu prato com o smartphone. Certifique-se de que a iluminaأ§أ£o أ© boa e todos os alimentos sأ£o visأ­veis.",
                "هڈھéœ€ç”¨و™؛èƒ½و‰‹وœ؛و‹چو‘„و‚¨çڑ„é¤گç›کç…§ç‰‡م€‚ç،®ن؟‌ه…‰ç؛؟è‰¯ه¥½ï¼Œو‰€وœ‰é£ںç‰©éƒ½و¸…و™°هڈ¯è§پم€‚",
                "ظ…ط§ ط¹ظ„ظٹظƒ ط³ظˆظ‰ ط§ظ„طھظ‚ط§ط· طµظˆط±ط© ظ„ط·ط¨ظ‚ظƒ ط¨ظ‡ط§طھظپظƒ ط§ظ„ط°ظƒظٹ. طھط£ظƒط¯ ظ…ظ† ط£ظ† ط§ظ„ط¥ط¶ط§ط،ط© ط¬ظٹط¯ط© ظˆط£ظ† ط¬ظ…ظٹط¹ ط§ظ„ط£ط·ط¹ظ…ط© ظ…ط±ط¦ظٹط©.",
                "Scatta semplicemente una foto del tuo piatto con lo smartphone. Assicurati che l'illuminazione sia buona e che tutti gli alimenti siano visibili.",
                "Machen Sie einfach ein Foto Ihres Tellers mit Ihrem Smartphone. Achten Sie auf gute Beleuchtung und dass alle Lebensmittel sichtbar sind.",
                "Maak gewoon een foto van je bord met je smartphone. Zorg voor goede verlichting en dat alle voedingsmiddelen zichtbaar zijn.",
                "ذںر€ذ¾رپر‚ذ¾ رپر„ذ¾ر‚ذ¾ذ³ر€ذ°ر„ذ¸ر€رƒذ¹ر‚ذµ ر‚ذ°ر€ذµذ»ذ؛رƒ ذ½ذ° رپذ¼ذ°ر€ر‚ر„ذ¾ذ½. ذ£ذ±ذµذ´ذ¸ر‚ذµرپرŒ, ر‡ر‚ذ¾ ذ¾رپذ²ذµر‰ذµذ½ذ¸ذµ ر…ذ¾ر€ذ¾رˆذµذµ ذ¸ ذ²رپذµ ذ؟ر€ذ¾ذ´رƒذ؛ر‚ر‹ ذ²ذ¸ذ´ذ½ر‹.",
                "م‚¹مƒ‍مƒ¼مƒˆمƒ•م‚©مƒ³مپ§مپٹçڑ؟مپ®ه†™çœںم‚’و’®م‚‹مپ مپ‘مپ§مپ™م€‚ç…§وکژمپŒè‰¯مپڈم€پمپ™مپ¹مپ¦مپ®é£ںه“پمپŒè¦‹مپˆم‚‹م‚ˆمپ†مپ«مپ—مپ¦مپڈمپ مپ•مپ„م€‚",
              )}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden bg-secondary/40 p-4">
            <img
              src={howItWorks2}
              alt={t(
                "Nutrition analysis dashboard showing calories and macros",
                "Tableau de bord d'analyse nutritionnelle affichant les calories et les macros",
                "Panel de anأ،lisis nutricional mostrando calorأ­as y macros",
                "Painel de anأ،lise nutricional mostrando calorias e macros",
                "وک¾ç¤؛هچ،è·¯é‡Œه’Œه®ڈé‡ڈèگ¥ه…»ç´ çڑ„èگ¥ه…»هˆ†و‍گن»ھè،¨و‌؟",
                "ظ„ظˆط­ط© طھط­ظ„ظٹظ„ ط§ظ„طھط؛ط°ظٹط© طھط¹ط±ط¶ ط§ظ„ط³ط¹ط±ط§طھ ط§ظ„ط­ط±ط§ط±ظٹط© ظˆط§ظ„ظ…ط§ظƒط±ظˆط²",
                "Dashboard di analisi nutrizionale che mostra calorie e macro",
                "Ernأ¤hrungsanalyse-Dashboard mit Kalorien und Makronأ¤hrstoffen",
                "Voedingsanalyse dashboard met calorieأ«n en macro's",
                "ذںذ°ذ½ذµذ»رŒ ذ°ذ½ذ°ذ»ذ¸ذ·ذ° ذ؟ذ¸ر‚ذ°ذ½ذ¸رڈ رپ ذ؛ذ°ذ»ذ¾ر€ذ¸رڈذ¼ذ¸ ذ¸ ذ¼ذ°ذ؛ر€ذ¾ذ½رƒر‚ر€ذ¸ذµذ½ر‚ذ°ذ¼ذ¸",
                "م‚«مƒ­مƒھمƒ¼مپ¨مƒ‍م‚¯مƒ­و „é¤ٹç´ م‚’ç¤؛مپ™و „é¤ٹهˆ†و‍گمƒ€مƒƒم‚·مƒ¥مƒœمƒ¼مƒ‰",
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
                "2. Obtenez une analyse instantanأ©e",
                "2. Obtenga anأ،lisis instantأ،neo",
                "2. Obtenha anأ،lise instantأ¢nea",
                "2. èژ·هڈ–هچ³و—¶هˆ†و‍گ",
                "2. ط§ط­طµظ„ ط¹ظ„ظ‰ طھط­ظ„ظٹظ„ ظپظˆط±ظٹ",
                "2. Ottieni un'analisi istantanea",
                "2. Erhalten Sie sofortige Analyse",
                "2. Ontvang directe analyse",
                "2. ذںذ¾ذ»رƒر‡ذ¸ر‚ذµ ذ¼ذ³ذ½ذ¾ذ²ذµذ½ذ½ر‹ذ¹ ذ°ذ½ذ°ذ»ذ¸ذ·",
                "2. هچ³ه؛§مپ«هˆ†و‍گم‚’هڈ–ه¾—مپ™م‚‹",
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Our AI analyzes your meal and provides a detailed breakdown of calories, proteins, carbs, and fats for each food item.",
                "Notre IA analyse votre repas et fournit une rأ©partition dأ©taillأ©e des calories, protأ©ines, glucides et lipides pour chaque aliment.",
                "Nuestra IA analiza su comida y proporciona un desglose detallado de calorأ­as, proteأ­nas, carbohidratos y grasas para cada alimento.",
                "Nossa IA analisa sua refeiأ§أ£o e fornece uma anأ،lise detalhada de calorias, proteأ­nas, carboidratos e gorduras para cada alimento.",
                "وˆ‘ن»¬çڑ„ AI هˆ†و‍گو‚¨çڑ„é¤گé£ںï¼Œه¹¶ن¸؛و¯ڈç§چé£ںç‰©وڈگن¾›هچ،è·¯é‡Œم€پè›‹ç™½è´¨م€پç¢³و°´هŒ–هگˆç‰©ه’Œè„‚è‚ھçڑ„è¯¦ç»†هˆ†è§£م€‚",
                "ظٹط­ظ„ظ„ ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ظ„ط¯ظٹظ†ط§ ظˆط¬ط¨طھظƒ ظˆظٹظ‚ط¯ظ… طھظپطµظٹظ„ط§ظ‹ ظ„ظ„ط³ط¹ط±ط§طھ ط§ظ„ط­ط±ط§ط±ظٹط© ظˆط§ظ„ط¨ط±ظˆطھظٹظ†ط§طھ ظˆط§ظ„ظƒط±ط¨ظˆظ‡ظٹط¯ط±ط§طھ ظˆط§ظ„ط¯ظ‡ظˆظ† ظ„ظƒظ„ ط¹ظ†طµط± ط؛ط°ط§ط¦ظٹ.",
                "La nostra IA analizza il tuo pasto e fornisce una ripartizione dettagliata di calorie, proteine, carboidrati e grassi per ogni alimento.",
                "Unsere KI analysiert Ihre Mahlzeit und liefert eine detaillierte Aufschlأ¼sselung von Kalorien, Proteinen, Kohlenhydraten und Fetten fأ¼r jedes Lebensmittel.",
                "Onze AI analyseert je maaltijd en geeft een gedetailleerde uitsplitsing van calorieأ«n, eiwitten, koolhydraten en vetten voor elk voedingsmiddel.",
                "ذ‌ذ°رˆ ذکذک ذ°ذ½ذ°ذ»ذ¸ذ·ذ¸ر€رƒذµر‚ ذ±ذ»رژذ´ذ¾ ذ¸ ذ؟ر€ذµذ´ذ¾رپر‚ذ°ذ²ذ»رڈذµر‚ ذ؟ذ¾ذ´ر€ذ¾ذ±ذ½رƒرژ ر€ذ°ذ·ذ±ذ¸ذ²ذ؛رƒ ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¹, ذ±ذµذ»ذ؛ذ¾ذ², رƒذ³ذ»ذµذ²ذ¾ذ´ذ¾ذ² ذ¸ ذ¶ذ¸ر€ذ¾ذ² ذ؟ذ¾ ذ؛ذ°ذ¶ذ´ذ¾ذ¼رƒ ذ؟ر€ذ¾ذ´رƒذ؛ر‚رƒ.",
                "AIمپŒé£ںن؛‹م‚’هˆ†و‍گمپ—م€پهگ„é£ںه“پمپ®م‚«مƒ­مƒھمƒ¼مƒ»م‚؟مƒ³مƒ‘م‚¯è³ھمƒ»ç‚­و°´هŒ–ç‰©مƒ»è„‚è³ھمپ®è©³ç´°مپھه†…è¨³م‚’وڈگن¾›مپ—مپ¾مپ™م€‚",
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
                "De la photo أ  l'analyse",
                "De la foto a la informaciأ³n",
                "Da foto a insight",
                "ن»ژç…§ç‰‡هˆ°و´‍ه¯ں",
                "ظ…ظ† ط§ظ„طµظˆط±ط© ط¥ظ„ظ‰ ط§ظ„ظ…ط¹ظ„ظˆظ…ط©",
                "Dalla foto all'analisi",
                "Vom Foto zur Erkenntnis",
                "Van foto naar inzicht",
                "ذ‍ر‚ ر„ذ¾ر‚ذ¾ ذ؛ ذ؟ذ¾ذ½ذ¸ذ¼ذ°ذ½ذ¸رژ",
                "ه†™çœںمپ‹م‚‰و´‍ه¯ںمپ¸",
              )}
            </p>
            <h2 id="home-how-it-works-heading" className="text-2xl font-semibold md:text-3xl">
              {t(
                "How it works in four simple steps",
                "Comment أ§a marche en quatre أ©tapes simples",
                "Cأ³mo funciona en cuatro pasos sencillos",
                "Como funciona em quatro passos simples",
                "ه››ن¸ھç®€هچ•و­¥éھ¤ن؛†è§£ه…¶ه·¥ن½œو–¹ه¼ڈ",
                "ظƒظٹظپ طھط¹ظ…ظ„ ط§ظ„ط®ط¯ظ…ط© ظپظٹ ط£ط±ط¨ط¹ ط®ط·ظˆط§طھ ط¨ط³ظٹط·ط©",
                "Come funziona in quattro semplici passaggi",
                "So funktioniert es in vier einfachen Schritten",
                "Hoe het werkt in vier eenvoudige stappen",
                "ذڑذ°ذ؛ رچر‚ذ¾ ر€ذ°ذ±ذ¾ر‚ذ°ذµر‚ ذ² ر‡ذµر‚ر‹ر€ر‘ر… ذ؟ر€ذ¾رپر‚ر‹ر… رˆذ°ذ³ذ°ر…",
                "4مپ¤مپ®ç°،هچکمپھم‚¹مƒ†مƒƒمƒ—مپ§مپ®ن»•çµ„مپ؟",
              )}
            </h2>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden shrink-0 md:inline-flex">
            <LocalizedNavLink to="/how-it-works" className="text-border bg-primary">
              {t(
                "Deep dive",
                "Voir en dأ©tail",
                "Ver en detalle",
                "Ver em detalhe",
                "è¯¦ç»†ن؛†è§£",
                "ط§ط³طھظƒط´ط§ظپ ظ…طھط¹ظ…ظ‘ظ‚",
                "Approfondisci",
                "Mehr erfahren",
                "Meer weten",
                "ذںذ¾ذ´ر€ذ¾ذ±ذ½ذµذµ",
                "è©³مپ—مپڈè¦‹م‚‹",
              )}
            </LocalizedNavLink>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-5 xl:gap-6">
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 1 â€“ Upload your meal photo",
                "أ‰tape 1 â€“ Tأ©lأ©chargez la photo de votre repas",
                "Paso 1 â€“ Sube la foto de tu comida",
                "Passo 1 â€“ Carregue a foto da sua refeiأ§أ£o",
                "و­¥éھ¤ن¸€ï¼ڑن¸ٹن¼ é¤گé£ںç…§ç‰‡",
                "ط§ظ„ط®ط·ظˆط© 1 â€“ ط§ط±ظپط¹ طµظˆط±ط© ظˆط¬ط¨طھظƒ",
                "Passo 1 â€“ Carica la foto del tuo pasto",
                "Schritt 1 â€“ Laden Sie Ihr Mahlzeitenfoto hoch",
                "Stap 1 â€“ Upload je maaltijdfoto",
                "ذ¨ذ°ذ³ 1 â€“ ذ—ذ°ذ³ر€رƒذ·ذ¸ر‚ذµ ر„ذ¾ر‚ذ¾ ذ±ذ»رژذ´ذ°",
                "م‚¹مƒ†مƒƒمƒ—1 â€“ é£ںن؛‹مپ®ه†™çœںم‚’م‚¢مƒƒمƒ—مƒ­مƒ¼مƒ‰",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "Take a clear picture of your meal or upload one from your device. The clearer the image, the better the estimate.",
                "Prenez une photo claire de votre repas ou importez-en une depuis votre appareil. Plus l'image est nette, plus l'estimation sera fiable.",
                "Haz una foto nأ­tida de tu comida o sأ؛bela desde tu dispositivo. Cuanto mأ،s clara sea la imagen, mأ،s fiable serأ، la estimaciأ³n.",
                "Tire uma fotografia nأ­tida da sua refeiأ§أ£o ou carregue uma a partir do seu dispositivo. Quanto mais clara for a imagem, mais fiأ،vel serأ، a estimativa.",
                "و‹چن¸€ه¼ و¸…و™°çڑ„é¤گé£ںç…§ç‰‡وˆ–ن»ژè®¾ه¤‡ن¸­ن¸ٹن¼ ن¸€ه¼ م€‚ه›¾ç‰‡è¶ٹو¸…و™°ï¼Œن¼°ç®—ç»“و‍œه°±è¶ٹهڈ¯é‌ م€‚",
                "ط§ظ„طھظ‚ط· طµظˆط±ط© ظˆط§ط¶ط­ط© ظ„ظˆط¬ط¨طھظƒ ط£ظˆ ط§ط±ظپط¹ظ‡ط§ ظ…ظ† ط¬ظ‡ط§ط²ظƒ. ظƒظ„ظ…ط§ ظƒط§ظ†طھ ط§ظ„طµظˆط±ط© ط£ظˆط¶ط­طŒ ظƒط§ظ† ط§ظ„طھظ‚ط¯ظٹط± ط£ط¯ظ‚.",
                "Scatta una foto nitida del tuo pasto o caricane una dal tuo dispositivo. Piأ¹ l'immagine أ¨ chiara, migliore sarأ  la stima.",
                "Machen Sie ein klares Foto Ihrer Mahlzeit oder laden Sie eines von Ihrem Gerأ¤t hoch. Je klarer das Bild, desto besser die Schأ¤tzung.",
                "Maak een duidelijke foto van je maaltijd of upload er een vanaf je apparaat. Hoe helderder de afbeelding, hoe beter de schatting.",
                "ذ،ذ´ذµذ»ذ°ذ¹ر‚ذµ ر‡ر‘ر‚ذ؛ذ¸ذ¹ رپذ½ذ¸ذ¼ذ¾ذ؛ ذ±ذ»رژذ´ذ° ذ¸ذ»ذ¸ ذ·ذ°ذ³ر€رƒذ·ذ¸ر‚ذµ ر„ذ¾ر‚ذ¾ رپ رƒرپر‚ر€ذ¾ذ¹رپر‚ذ²ذ°. ذ§ذµذ¼ ر‡ر‘ر‚ر‡ذµ ذ¸ذ·ذ¾ذ±ر€ذ°ذ¶ذµذ½ذ¸ذµ, ر‚ذµذ¼ ر‚ذ¾ر‡ذ½ذµذµ ذ¾ر†ذµذ½ذ؛ذ°.",
                "é£ںن؛‹مپ®é®®وکژمپھه†™çœںم‚’و’®م‚‹مپ‹م€پمƒ‡مƒگم‚¤م‚¹مپ‹م‚‰م‚¢مƒƒمƒ—مƒ­مƒ¼مƒ‰مپ—مپ¦مپڈمپ مپ•مپ„م€‚ç”»هƒڈمپŒé®®وکژمپ§مپ‚م‚‹مپ»مپ©م€پوژ¨ه®ڑç²¾ه؛¦مپŒهگ‘ن¸ٹمپ—مپ¾مپ™م€‚",
              )}
            </p>
          </article>
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 2 â€“ AI food detection",
                "أ‰tape 2 â€“ Dأ©tection des aliments par IA",
                "Paso 2 â€“ Detecciأ³n de alimentos con IA",
                "Passo 2 â€“ Detecأ§أ£o de alimentos com IA",
                "و­¥éھ¤ن؛Œï¼ڑAI é£ںç‰©è¯†هˆ«",
                "ط§ظ„ط®ط·ظˆط© 2 â€“ ط§ظƒطھط´ط§ظپ ط§ظ„ط·ط¹ط§ظ… ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ",
                "Passo 2 â€“ Rilevamento alimenti con IA",
                "Schritt 2 â€“ KI-Lebensmittelerkennung",
                "Stap 2 â€“ AI-voedseldetectie",
                "ذ¨ذ°ذ³ 2 â€“ ذ ذ°رپذ؟ذ¾ذ·ذ½ذ°ذ²ذ°ذ½ذ¸ذµ ذ؟ر€ذ¾ذ´رƒذ؛ر‚ذ¾ذ² ذکذک",
                "م‚¹مƒ†مƒƒمƒ—2 â€“ AIمپ«م‚ˆم‚‹é£ںه“پو¤œه‡؛",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "Our AI looks at shapes, colours, and textures to identify what's on your plate using vision technology.",
                "Notre IA analyse les formes, les couleurs et les textures pour identifier ce qui se trouve dans votre assiette grأ¢ce أ  la vision par ordinateur.",
                "Nuestra IA analiza formas, colores y texturas para identificar quأ© hay en tu plato usando tecnologأ­a de visiأ³n.",
                "A nossa IA analisa formas, cores e texturas para identificar o que estأ، no seu prato utilizando tecnologia de visأ£o.",
                "وˆ‘ن»¬çڑ„ AI ن¼ڑé€ڑè؟‡هˆ†و‍گه½¢çٹ¶م€پé¢œè‰²ه’Œç؛¹çگ†ï¼Œè¯†هˆ«é¤گç›کن¸­çڑ„é£ںç‰©م€‚",
                "ظٹط­ظ„ظ‘ظ„ ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ط§ظ„ط£ط´ظƒط§ظ„ ظˆط§ظ„ط£ظ„ظˆط§ظ† ظˆط§ظ„ظ‚ظˆط§ظ… ظ„طھط­ط¯ظٹط¯ ظ…ط§ ظپظٹ ط·ط¨ظ‚ظƒ ط¨ط§ط³طھط®ط¯ط§ظ… طھظ‚ظ†ظٹط© ط§ظ„ط±ط¤ظٹط©.",
                "La nostra IA analizza forme, colori e texture per identificare cosa c'أ¨ nel tuo piatto usando la tecnologia visiva.",
                "Unsere KI analysiert Formen, Farben und Texturen, um mithilfe von Bilderkennungstechnologie zu identifizieren, was auf Ihrem Teller ist.",
                "Onze AI bekijkt vormen, kleuren en texturen om te identificeren wat er op je bord ligt met behulp van visietechnologie.",
                "ذ‌ذ°رˆ ذکذک ذ°ذ½ذ°ذ»ذ¸ذ·ذ¸ر€رƒذµر‚ ر„ذ¾ر€ذ¼ر‹, ر†ذ²ذµر‚ذ° ذ¸ ر‚ذµذ؛رپر‚رƒر€ر‹, ر‡ر‚ذ¾ذ±ر‹ ذ¾ذ؟ر€ذµذ´ذµذ»ذ¸ر‚رŒ, ر‡ر‚ذ¾ ذ½ذ°ر…ذ¾ذ´ذ¸ر‚رپرڈ ذ½ذ° ر‚ذ°ر€ذµذ»ذ؛ذµ, ذ¸رپذ؟ذ¾ذ»رŒذ·رƒرڈ ر‚ذµر…ذ½ذ¾ذ»ذ¾ذ³ذ¸رژ ذ؛ذ¾ذ¼ذ؟رŒرژر‚ذµر€ذ½ذ¾ذ³ذ¾ ذ·ر€ذµذ½ذ¸رڈ.",
                "AIمپ¯ه½¢çٹ¶مƒ»è‰²مƒ»é£ںو„ںم‚’هˆ†و‍گمپ—م€پمƒ“م‚¸مƒ§مƒ³وٹ€è،“مپ§مپٹçڑ؟مپ®ن¸ٹمپ®é£ںه“پم‚’è­کهˆ¥مپ—مپ¾مپ™م€‚",
              )}
            </p>
          </article>
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 3 â€“ Calorie estimation",
                "أ‰tape 3 â€“ Estimation des calories",
                "Paso 3 â€“ Estimaciأ³n de calorأ­as",
                "Passo 3 â€“ Estimativa de calorias",
                "و­¥éھ¤ن¸‰ï¼ڑçƒ­é‡ڈن¼°ç®—",
                "ط§ظ„ط®ط·ظˆط© 3 â€“ طھظ‚ط¯ظٹط± ط§ظ„ط³ط¹ط±ط§طھ",
                "Passo 3 â€“ Stima delle calorie",
                "Schritt 3 â€“ Kalorienschأ¤tzung",
                "Stap 3 â€“ Calorieأ«nschatting",
                "ذ¨ذ°ذ³ 3 â€“ ذ‍ر†ذµذ½ذ؛ذ° ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¹ذ½ذ¾رپر‚ذ¸",
                "م‚¹مƒ†مƒƒمƒ—3 â€“ م‚«مƒ­مƒھمƒ¼وژ¨ه®ڑ",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "CalorieVision uses nutrition reference data to estimate calories for each item and the total meal.",
                "CalorieVision utilise des tables de rأ©fأ©rence nutritionnelle pour estimer les calories de chaque aliment et du repas total.",
                "CalorieVision utiliza tablas de referencia nutricional para estimar las calorأ­as de cada alimento y de la comida completa.",
                "O CalorieVision utiliza tabelas de referأھncia nutricional para estimar as calorias de cada alimento e da refeiأ§أ£o completa.",
                "CalorieVision ن½؟ç”¨èگ¥ه…»هڈ‚è€ƒو•°وچ®و‌¥ن¼°ç®—و¯ڈç§چé£ںç‰©ن»¥هڈٹو•´é،؟é¤گçڑ„ه¤§è‡´çƒ­é‡ڈم€‚",
                "ظٹط³طھط®ط¯ظ… CalorieVision ط¨ظٹط§ظ†ط§طھ ط؛ط°ط§ط¦ظٹط© ظ…ط±ط¬ط¹ظٹط© ظ„طھظ‚ط¯ظٹط± ط§ظ„ط³ط¹ط±ط§طھ ط§ظ„ط­ط±ط§ط±ظٹط© ظ„ظƒظ„ ط¹ظ†طµط± ظˆظ„ظ„ظˆط¬ط¨ط© ظƒظƒظ„.",
                "CalorieVision utilizza dati nutrizionali di riferimento per stimare le calorie di ogni alimento e del pasto totale.",
                "CalorieVision verwendet Ernأ¤hrungsreferenzdaten, um Kalorien fأ¼r jedes Element und die gesamte Mahlzeit zu schأ¤tzen.",
                "CalorieVision gebruikt voedingsreferentiegegevens om calorieأ«n te schatten voor elk item en de totale maaltijd.",
                "CalorieVision ذ¸رپذ؟ذ¾ذ»رŒذ·رƒذµر‚ رپذ؟ر€ذ°ذ²ذ¾ر‡ذ½ر‹ذµ ذ´ذ°ذ½ذ½ر‹ذµ ذ؟ذ¾ ذ؟ذ¸ر‚ذ°ر‚ذµذ»رŒذ½ذ¾رپر‚ذ¸ ذ´ذ»رڈ ذ¾ر†ذµذ½ذ؛ذ¸ ذ؛ذ°ذ»ذ¾ر€ذ¸ذ¹ ذ؛ذ°ذ¶ذ´ذ¾ذ³ذ¾ ذ؟ر€ذ¾ذ´رƒذ؛ر‚ذ° ذ¸ ذ²رپذµذ³ذ¾ ذ±ذ»رژذ´ذ°.",
                "CalorieVisionمپ¯و „é¤ٹهڈ‚ç…§مƒ‡مƒ¼م‚؟م‚’ن½؟ç”¨مپ—مپ¦م€پهگ„é£ںه“پمپ¨é£ںن؛‹ه…¨ن½“مپ®م‚«مƒ­مƒھمƒ¼م‚’وژ¨ه®ڑمپ—مپ¾مپ™م€‚",
              )}
            </p>
          </article>
          <article className="rounded-2xl bg-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold">
              {t(
                "Step 4 â€“ Simple nutrition tips",
                "أ‰tape 4 â€“ Conseils nutritionnels simples",
                "Paso 4 â€“ Consejos de nutriciأ³n sencillos",
                "Passo 4 â€“ Dicas de nutriأ§أ£o simples",
                "و­¥éھ¤ه››ï¼ڑç®€هچ•çڑ„èگ¥ه…»ه»؛è®®",
                "ط§ظ„ط®ط·ظˆط© 4 â€“ ظ†طµط§ط¦ط­ طھط؛ط°ظٹط© ط¨ط³ظٹط·ط©",
                "Passo 4 â€“ Consigli nutrizionali semplici",
                "Schritt 4 â€“ Einfache Ernأ¤hrungstipps",
                "Stap 4 â€“ Eenvoudige voedingstips",
                "ذ¨ذ°ذ³ 4 â€“ ذںر€ذ¾رپر‚ر‹ذµ رپذ¾ذ²ذµر‚ر‹ ذ؟ذ¾ ذ؟ذ¸ر‚ذ°ذ½ذ¸رژ",
                "م‚¹مƒ†مƒƒمƒ—4 â€“ م‚·مƒ³مƒ—مƒ«مپھو „é¤ٹم‚¢مƒ‰مƒگم‚¤م‚¹",
              )}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {t(
                "You see friendly, non-medical suggestions to help you build more balanced plates over time.",
                "Vous recevez des suggestions bienveillantes, non mأ©dicales, pour vous aider أ  composer des assiettes plus أ©quilibrأ©es au fil du temps.",
                "Recibes sugerencias amables y no mأ©dicas que te ayudan a construir platos mأ،s equilibrados con el tiempo.",
                "Recebe sugestأµes amigأ،veis, nأ£o mأ©dicas, para o ajudar a montar pratos mais equilibrados ao longo do tempo.",
                "ن½ ن¼ڑçœ‹هˆ°ن¸€ن؛›هڈ‹ه¥½م€پé‌‍هŒ»ç–—و€§çڑ„ه»؛è®®ï¼Œه¸®هٹ©ن½ هœ¨و—¥ه¸¸ن¸­é€گو¸گو‰“é€ و›´ه‌‡è،،çڑ„é¤گç›کم€‚",
                "ط³طھطھظ„ظ‚ظ‘ظ‰ ط§ظ‚طھط±ط§ط­ط§طھ ظˆط¯ظ‘ظٹط© ظˆط؛ظٹط± ط·ط¨ظٹط© ظ„ظ…ط³ط§ط¹ط¯طھظƒ ط¹ظ„ظ‰ ط¨ظ†ط§ط، ط£ط·ط¨ط§ظ‚ ط£ظƒط«ط± طھظˆط§ط²ظ†ظ‹ط§ ط¨ظ…ط±ظˆط± ط§ظ„ظˆظ‚طھ.",
                "Vedrai suggerimenti amichevoli e non medici per aiutarti a costruire piatti piأ¹ equilibrati nel tempo.",
                "Sie erhalten freundliche, nicht-medizinische Vorschlأ¤ge, die Ihnen helfen, im Laufe der Zeit ausgewogenere Mahlzeiten zusammenzustellen.",
                "Je ziet vriendelijke, niet-medische suggesties om je te helpen na verloop van tijd evenwichtigere borden samen te stellen.",
                "ذ’ر‹ ذ؟ذ¾ذ»رƒر‡ذ°ذµر‚ذµ ذ´ر€رƒذ¶ذµرپذ؛ذ¸ذµ, ذ½ذµذ¼ذµذ´ذ¸ر†ذ¸ذ½رپذ؛ذ¸ذµ ر€ذµذ؛ذ¾ذ¼ذµذ½ذ´ذ°ر†ذ¸ذ¸, ذ؛ذ¾ر‚ذ¾ر€ر‹ذµ ذ؟ذ¾ذ¼ذ¾ذ³ذ°رژر‚ رپذ¾ ذ²ر€ذµذ¼ذµذ½ذµذ¼ رپذ¾رپر‚ذ°ذ²ذ»رڈر‚رŒ ذ±ذ¾ذ»ذµذµ رپذ±ذ°ذ»ذ°ذ½رپذ¸ر€ذ¾ذ²ذ°ذ½ذ½ذ¾ذµ ذ¼ذµذ½رژ.",
                "و™‚é–“م‚’مپ‹مپ‘مپ¦م‚ˆم‚ٹمƒگمƒ©مƒ³م‚¹مپ®هڈ–م‚Œمپںé£ںن؛‹م‚’ن½œم‚‹مپںم‚پمپ®م€پè¦ھهˆ‡مپ§é‌‍هŒ»ç™‚çڑ„مپھم‚¢مƒ‰مƒگم‚¤م‚¹مپŒè،¨ç¤؛مپ•م‚Œمپ¾مپ™م€‚",
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
                "Questions frأ©quentes",
                "Preguntas frecuentes",
                "Perguntas frequentes",
                "ه¸¸è§پé—®é¢ک",
                "ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط´ط§ط¦ط¹ط©",
                "Domande frequenti",
                "Hأ¤ufig gestellte Fragen",
                "Veelgestelde vragen",
                "ذ§ذ°رپر‚ذ¾ ذ·ذ°ذ´ذ°ذ²ذ°ذµذ¼ر‹ذµ ذ²ذ¾ذ؟ر€ذ¾رپر‹",
                "م‚ˆمپڈمپ‚م‚‹è³ھه•ڈ",
              )}
            </p>
            <h2 id="home-faq-heading" className="text-2xl font-semibold md:text-3xl">
              {t(
                "Still have questions?",
                "Vous avez encore des questions ?",
                "آ؟Todavأ­a tienes dudas?",
                "Ainda tem dأ؛vidas?",
                "è؟کوœ‰ç–‘é—®هگ—ï¼ں",
                "ظ„ط¯ظٹظƒ ط§ظ„ظ…ط²ظٹط¯ ظ…ظ† ط§ظ„ط£ط³ط¦ظ„ط©طں",
                "Hai ancora domande?",
                "Haben Sie noch Fragen?",
                "Heeft u nog vragen?",
                "ذ‍رپر‚ذ°ذ»ذ¸رپرŒ ذ²ذ¾ذ؟ر€ذ¾رپر‹?",
                "مپ¾مپ è³ھه•ڈمپŒمپ‚م‚ٹمپ¾مپ™مپ‹ï¼ں",
              )}
            </h2>
          </div>
          <Button variant="outline" size="lg" asChild>
            <LocalizedNavLink to="/faq" className="bg-primary text-secondary">
              {t(
                "View full FAQ",
                "Consulter la FAQ complأ¨te",
                "Ver la FAQ completa",
                "Ver FAQ completa",
                "وں¥çœ‹ه®Œو•´ه¸¸è§پé—®é¢ک",
                "ط¹ط±ط¶ ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط´ط§ط¦ط¹ط© ط§ظ„ظƒط§ظ…ظ„ط©",
                "Vedi FAQ completa",
                "Vollstأ¤ndige FAQ anzeigen",
                "Bekijk volledige FAQ",
                "ذںذ¾ذ»ذ½ر‹ذ¹ رپذ؟ذ¸رپذ¾ذ؛ ذ²ذ¾ذ؟ر€ذ¾رپذ¾ذ²",
                "ه®Œه…¨مپھFAQم‚’è¦‹م‚‹",
              )}
            </LocalizedNavLink>
          </Button>
        </div>
      </section>
      </ScrollAnimation>

    </>;
};
export default Index;
