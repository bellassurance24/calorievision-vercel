import { useState, useEffect, useCallback } from "react";
import { Camera, Upload, Scan, Utensils, Sparkles, Lock, UserX, Shield, Smartphone, Monitor, ArrowRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface SubtitleStep {
  startTime: number;
  endTime: number;
  text: Record<string, string>;
  icon: React.ReactNode;
  visual: string;
}

const DemoAnimation = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const subtitleSteps: SubtitleStep[] = [
    {
      startTime: 0,
      endTime: 3,
      text: {
        en: "What's really in your meal?",
        fr: "Qu'y a-t-il vraiment dans votre repas ?",
        es: "¿Qué contiene realmente tu comida?",
        pt: "O que há realmente na sua refeição?",
        zh: "你的餐食里到底有什么？",
        ar: "ماذا يوجد حقًا في وجبتك؟",
        it: "Cosa c'è davvero nel tuo pasto?",
        de: "Was steckt wirklich in Ihrer Mahlzeit?",
      },
      icon: <Camera className="h-12 w-12" />,
      visual: "photo",
    },
    {
      startTime: 3,
      endTime: 6,
      text: {
        en: "Upload a photo.",
        fr: "Téléchargez une photo.",
        es: "Sube una foto.",
        pt: "Carregue uma foto.",
        zh: "上传一张照片。",
        ar: "قم بتحميل صورة.",
        it: "Carica una foto.",
        de: "Laden Sie ein Foto hoch.",
      },
      icon: <Upload className="h-12 w-12" />,
      visual: "upload",
    },
    {
      startTime: 6,
      endTime: 10,
      text: {
        en: "AI detects visible foods.",
        fr: "L'IA détecte les aliments visibles.",
        es: "La IA detecta los alimentos visibles.",
        pt: "A IA deteta os alimentos visíveis.",
        zh: "AI 识别可见食物。",
        ar: "الذكاء الاصطناعي يكتشف الأطعمة المرئية.",
        it: "L'IA rileva gli alimenti visibili.",
        de: "KI erkennt sichtbare Lebensmittel.",
      },
      icon: <Scan className="h-12 w-12" />,
      visual: "detect",
    },
    {
      startTime: 10,
      endTime: 14,
      text: {
        en: "Estimated calories — instantly.",
        fr: "Calories estimées — instantanément.",
        es: "Calorías estimadas — al instante.",
        pt: "Calorias estimadas — instantaneamente.",
        zh: "即时估算卡路里。",
        ar: "السعرات الحرارية المقدرة — فورًا.",
        it: "Calorie stimate — istantaneamente.",
        de: "Geschätzte Kalorien — sofort.",
      },
      icon: <Utensils className="h-12 w-12" />,
      visual: "calories",
    },
    {
      startTime: 14,
      endTime: 18,
      text: {
        en: "Simple, educational nutrition tips.",
        fr: "Conseils nutritionnels simples et éducatifs.",
        es: "Consejos nutricionales simples y educativos.",
        pt: "Dicas nutricionais simples e educativas.",
        zh: "简单的教育性营养建议。",
        ar: "نصائح غذائية بسيطة وتعليمية.",
        it: "Consigli nutrizionali semplici ed educativi.",
        de: "Einfache, lehrreiche Ernährungstipps.",
      },
      icon: <Sparkles className="h-12 w-12" />,
      visual: "tips",
    },
    {
      startTime: 18,
      endTime: 22,
      text: {
        en: "No account needed. Photos not stored.",
        fr: "Aucun compte requis. Photos non stockées.",
        es: "Sin cuenta necesaria. Las fotos no se guardan.",
        pt: "Sem conta necessária. Fotos não são guardadas.",
        zh: "无需注册账户。照片不会被保存。",
        ar: "لا حاجة لحساب. الصور لا تُخزَّن.",
        it: "Nessun account necessario. Le foto non vengono salvate.",
        de: "Kein Konto nötig. Fotos werden nicht gespeichert.",
      },
      icon: <div className="flex gap-2"><Lock className="h-8 w-8" /><UserX className="h-8 w-8" /><Shield className="h-8 w-8" /></div>,
      visual: "privacy",
    },
    {
      startTime: 22,
      endTime: 26,
      text: {
        en: "Fast. Simple. Educational.",
        fr: "Rapide. Simple. Éducatif.",
        es: "Rápido. Simple. Educativo.",
        pt: "Rápido. Simples. Educativo.",
        zh: "快速。简单。教育性。",
        ar: "سريع. بسيط. تعليمي.",
        it: "Veloce. Semplice. Educativo.",
        de: "Schnell. Einfach. Lehrreich.",
      },
      icon: <div className="flex gap-2"><Smartphone className="h-8 w-8" /><Monitor className="h-8 w-8" /></div>,
      visual: "devices",
    },
    {
      startTime: 26,
      endTime: 30,
      text: {
        en: "Analyze a Meal Now",
        fr: "Analysez un repas maintenant",
        es: "Analiza una comida ahora",
        pt: "Analise uma refeição agora",
        zh: "立即分析一餐",
        ar: "حلّل وجبة الآن",
        it: "Analizza un pasto ora",
        de: "Jetzt eine Mahlzeit analysieren",
      },
      icon: <ArrowRight className="h-12 w-12" />,
      visual: "cta",
    },
  ];

  const disclaimerText: Record<string, string> = {
    en: "Educational estimates only. Not medical advice.",
    fr: "Estimations éducatives uniquement. Pas un avis médical.",
    es: "Solo estimaciones educativas. No es asesoramiento médico.",
    pt: "Apenas estimativas educativas. Não é aconselhamento médico.",
    zh: "仅供教育性参考。非医疗建议。",
    ar: "تقديرات تعليمية فقط. ليست نصيحة طبية.",
    it: "Solo stime educative. Non un consiglio medico.",
    de: "Nur Bildungsschätzungen. Keine medizinische Beratung.",
  };

  const playButtonText: Record<string, string> = {
    en: "Watch Demo",
    fr: "Voir la démo",
    es: "Ver demostración",
    pt: "Ver demonstração",
    zh: "观看演示",
    ar: "شاهد العرض",
    it: "Guarda la demo",
    de: "Demo ansehen",
  };

  const getCurrentStep = useCallback(() => {
    for (let i = 0; i < subtitleSteps.length; i++) {
      if (currentTime >= subtitleSteps[i].startTime && currentTime < subtitleSteps[i].endTime) {
        return i;
      }
    }
    return subtitleSteps.length - 1;
  }, [currentTime]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= 30) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    setCurrentStep(getCurrentStep());
  }, [currentTime, getCurrentStep]);

  const handlePlay = () => {
    if (currentTime >= 30) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleCtaClick = () => {
    navigate("/analyze");
  };

  const step = subtitleSteps[currentStep];
  const progress = (currentTime / 30) * 100;

  // Visual elements for each step
  const renderVisual = () => {
    const baseClasses = "transition-all duration-500 ease-out";
    
    switch (step.visual) {
      case "photo":
        return (
          <div className={`${baseClasses} relative`}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center shadow-xl border border-border/50">
              <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 dark:from-green-900/30 dark:via-yellow-900/20 dark:to-orange-900/30 flex items-center justify-center">
                <Utensils className="h-16 w-16 text-primary/60" />
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse">
                <Camera className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        );
      
      case "upload":
        return (
          <div className={`${baseClasses} relative`}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 flex flex-col items-center justify-center gap-3">
              <Upload className="h-12 w-12 text-primary animate-bounce" />
              <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        );
      
      case "detect":
        return (
          <div className={`${baseClasses} relative`}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-card border border-border shadow-xl p-4">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
              <div className="relative space-y-3 pt-4">
                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">🍗 Chicken</span>
                </div>
                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium">🍚 Rice</span>
                </div>
                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">🥕 Vegetables</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "calories":
        return (
          <div className={`${baseClasses} relative`}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-card border border-border shadow-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <span>🍗 Chicken</span>
                <span className="font-semibold text-primary">220 kcal</span>
              </div>
              <div className="flex justify-between items-center text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <span>🍚 Rice</span>
                <span className="font-semibold text-primary">260 kcal</span>
              </div>
              <div className="flex justify-between items-center text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <span>🥕 Vegetables</span>
                <span className="font-semibold text-primary">80 kcal</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">~560 kcal</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "tips":
        return (
          <div className={`${baseClasses} relative`}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/30 shadow-xl p-4 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-2 animate-fade-in">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">{language === 'fr' ? 'Conseil' : 'Tip'}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {language === 'fr' 
                  ? 'Ajoutez plus de légumes colorés pour plus de fibres !'
                  : 'Add more colorful vegetables for extra fiber!'}
              </p>
              <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 rounded-full">🥗</span>
                <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 rounded-full">🥕</span>
                <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 rounded-full">🍅</span>
              </div>
            </div>
          </div>
        );
      
      case "privacy":
        return (
          <div className={`${baseClasses} relative`}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <Lock className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <UserX className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Shield className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center px-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  {language === 'fr' ? 'Vie privée respectée' : 'Privacy First'}
                </p>
              </div>
            </div>
          </div>
        );
      
      case "devices":
        return (
          <div className={`${baseClasses} relative`}>
            <div className="flex items-end gap-4 justify-center">
              <div className="w-16 h-28 md:w-20 md:h-36 rounded-xl bg-card border-2 border-border shadow-xl flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <div className="w-32 h-24 md:w-44 md:h-32 rounded-xl bg-card border-2 border-border shadow-xl flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Monitor className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
        );
      
      case "cta":
        return (
          <div className={`${baseClasses} relative`}>
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6 animate-pulse shadow-xl"
              onClick={handleCtaClick}
            >
              {step.text[language] || step.text.en}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-card via-card to-muted/50 border border-border shadow-2xl overflow-hidden">
      {/* Main Demo Area */}
      <div className="relative min-h-[400px] md:min-h-[450px] flex flex-col items-center justify-center p-6 md:p-8">
        {/* Play Button Overlay (when not playing) */}
        {!isPlaying && currentTime === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm z-10">
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform"
              onClick={handlePlay}
            >
              <Play className="mr-2 h-6 w-6" />
              {playButtonText[language] || playButtonText.en}
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">30s</p>
          </div>
        )}

        {/* Visual Content */}
        <div className="flex-1 flex items-center justify-center w-full">
          {renderVisual()}
        </div>

        {/* Subtitle Area */}
        <div className="w-full mt-6">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-h-[60px] flex items-center justify-center">
            <p className="text-lg md:text-xl font-medium text-foreground transition-all duration-300">
              {step.text[language] || step.text.en}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-3 text-[10px] text-muted-foreground/70 text-center">
          {disclaimerText[language] || disclaimerText.en}
        </p>
      </div>

      {/* Progress Bar & Controls */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handlePlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-right">
            {Math.floor(currentTime)}s
          </span>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {subtitleSteps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentStep 
                  ? 'bg-primary w-4' 
                  : index < currentStep 
                    ? 'bg-primary/50' 
                    : 'bg-muted-foreground/30'
              }`}
              onClick={() => {
                setCurrentTime(subtitleSteps[index].startTime);
                setCurrentStep(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoAnimation;
