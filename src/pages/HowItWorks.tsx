import { useMemo } from "react";
import { CheckCircle2, Image as ImageIcon, Info } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageMetadata, useStructuredData } from "@/hooks/usePageMetadata";
import { useLanguage } from "@/contexts/LanguageContext";


const HowItWorks = () => {
  const { language } = useLanguage();

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

  usePageMetadata({
    title: t(
      "How CalorieVision Works – Step-by-Step AI Meal Analysis",
      "Comment fonctionne CalorieVision – Analyse de repas par IA étape par étape",
      "Cómo funciona CalorieVision – Análisis de comidas con IA paso a paso",
      "Como funciona o CalorieVision – Análise de refeições com IA passo a passo",
      "CalorieVision 工作原理 – AI 餐食分析步骤详解",
      "كيف يعمل CalorieVision – تحليل وجبة خطوة بخطوة بالذكاء الاصطناعي",
      "Come funziona CalorieVision – Analisi dei pasti con IA passo dopo passo",
      "So funktioniert CalorieVision – Schritt-für-Schritt KI-Mahlzeitanalyse",
      "Hoe CalorieVision werkt – Stapsgewijze AI-maaltijdanalyse",
    ),
    description: t(
      "Learn how CalorieVision uses AI vision, portion estimates, and nutrition references to give educational calorie insights.",
      "Découvrez comment CalorieVision utilise la vision par IA, l'estimation des portions et des références nutritionnelles pour fournir des estimations de calories à but éducatif.",
      "Descubre cómo CalorieVision utiliza visión por IA, estimación de porciones y referencias nutricionales para ofrecer estimaciones de calorías con fines educativos.",
      "Saiba como o CalorieVision utiliza visão por IA, estimativas de porções e referências nutricionais para fornecer estimativas educativas de calorias.",
      "了解 CalorieVision 如何使用 AI 视觉、份量估算和营养参考数据提供教育性的卡路里分析。",
      "تعرّف على كيفية استخدام CalorieVision لرؤية بالذكاء الاصطناعي وتقدير الحصص والبيانات المرجعية الغذائية لتقديم رؤى تعليمية حول السعرات.",
      "Scopri come CalorieVision utilizza la visione IA, le stime delle porzioni e i riferimenti nutrizionali per fornire informazioni educative sulle calorie.",
      "Erfahren Sie, wie CalorieVision KI-Vision, Portionsschätzungen und Ernährungsreferenzen nutzt, um lehrreiche Kalorieneinblicke zu geben.",
      "Ontdek hoe CalorieVision AI-visie, portie-schattingen en voedingsreferenties gebruikt om educatieve calorie-inzichten te geven.",
    ),
    path: "/how-it-works",
  });

  // HowTo Schema structured data for SEO
  const howToSchema = useMemo(() => ({
    "@type": "HowTo",
    "name": t(
      "How to Analyze Your Meal with CalorieVision",
      "Comment analyser votre repas avec CalorieVision",
      "Cómo analizar tu comida con CalorieVision",
      "Como analisar sua refeição com CalorieVision",
      "如何使用 CalorieVision 分析您的餐食",
      "كيفية تحليل وجبتك باستخدام CalorieVision",
      "Come analizzare il tuo pasto con CalorieVision",
      "Wie Sie Ihre Mahlzeit mit CalorieVision analysieren",
      "Hoe je je maaltijd analyseert met CalorieVision",
    ),
    "description": t(
      "Learn how to use CalorieVision to get AI-powered calorie and nutrition estimates from a photo of your meal.",
      "Apprenez à utiliser CalorieVision pour obtenir des estimations de calories et de nutrition basées sur l'IA à partir d'une photo de votre repas.",
      "Aprende a usar CalorieVision para obtener estimaciones de calorías y nutrición con IA a partir de una foto de tu comida.",
      "Aprenda a usar CalorieVision para obter estimativas de calorias e nutrição com IA a partir de uma foto da sua refeição.",
      "了解如何使用 CalorieVision 从餐食照片获取 AI 驱动的卡路里和营养估算。",
      "تعرّف على كيفية استخدام CalorieVision للحصول على تقديرات السعرات الحرارية والتغذية بالذكاء الاصطناعي من صورة وجبتك.",
      "Scopri come usare CalorieVision per ottenere stime di calorie e nutrizione basate sull'IA da una foto del tuo pasto.",
      "Erfahren Sie, wie Sie CalorieVision verwenden, um KI-gestützte Kalorien- und Nährwertschätzungen aus einem Foto Ihrer Mahlzeit zu erhalten.",
      "Leer hoe je CalorieVision gebruikt om AI-gestuurde calorie- en voedingsschattingen te krijgen van een foto van je maaltijd.",
    ),
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Upload your meal photo",
        "text": "Take or upload a clear photo of your meal. The clearer the image, the better the results.",
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "AI vision analysis",
        "text": "The AI analyzes the image to detect foods by examining shapes, textures, and colors.",
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Portion size estimation",
        "text": "CalorieVision estimates approximate portion sizes in grams based on typical serving sizes.",
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Calorie calculation",
        "text": "The system uses nutrition reference tables to calculate approximate calories for each food item.",
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "View your results",
        "text": "Review the educational breakdown of calories, protein, carbs, and fat for your meal.",
      },
    ],
    "totalTime": "PT1M",
  }), [language]);

  useStructuredData(howToSchema);

  return (
    <section className="section-card">
      <p className="eyebrow">
        {t(
          "Behind the scenes",
          "Dans les coulisses",
          "Entre bastidores",
          "Por detrás dos bastidores",
          "幕后揭秘",
          "ما يحدث في الخلفية",
          "Dietro le quinte",
          "Hinter den Kulissen",
          "Achter de schermen",
        )}
      </p>
      <h1 className="mb-3 text-3xl font-semibold md:text-4xl">
        {t(
          "How CalorieVision Works",
          "Comment fonctionne CalorieVision",
          "Cómo funciona CalorieVision",
          "Como funciona o CalorieVision",
          "CalorieVision 工作原理",
          "كيف يعمل CalorieVision",
          "Come funziona CalorieVision",
          "So funktioniert CalorieVision",
          "Hoe CalorieVision werkt",
        )}
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground md:text-base">
        {t(
          "CalorieVision uses advanced artificial intelligence to help you understand your meals in a simple, accessible way. Here is how your meal analysis could happen behind the scenes – clearly explained, step by step.",
          "CalorieVision utilise une intelligence artificielle avancée pour vous aider à mieux comprendre vos repas de manière simple et accessible. Voici comment l'analyse de votre repas peut se dérouler en coulisses – expliquée clairement, étape par étape.",
          "CalorieVision utiliza inteligencia artificial avanzada para ayudarte a comprender mejor tus comidas de forma sencilla y accesible. Así es como puede desarrollarse el análisis de tu comida entre bastidores, explicado claramente paso a paso.",
          "O CalorieVision utiliza inteligência artificial avançada para o ajudar a compreender melhor as suas refeições de forma simples e acessível. Eis como pode decorrer a análise da sua refeição por detrás dos bastidores – explicada de forma clara, passo a passo.",
          "CalorieVision 使用先进的人工智能帮助您以简单易懂的方式了解您的餐食。以下是餐食分析在幕后的工作原理 – 逐步清晰解释。",
          "يستخدم CalorieVision تقنيات ذكاء اصطناعي متقدمة لمساعدتك على فهم وجباتك بطريقة بسيطة وسهلة. فيما يلي شرح مبسّط لكيفية إجراء تحليل الوجبة خلف الكواليس – خطوة بخطوة.",
          "CalorieVision utilizza un'intelligenza artificiale avanzata per aiutarti a comprendere i tuoi pasti in modo semplice e accessibile. Ecco come avviene l'analisi del tuo pasto dietro le quinte, spiegato chiaramente passo dopo passo.",
          "CalorieVision verwendet fortschrittliche künstliche Intelligenz, um Ihnen zu helfen, Ihre Mahlzeiten auf einfache und zugängliche Weise zu verstehen. So könnte Ihre Mahlzeitanalyse hinter den Kulissen ablaufen – klar erklärt, Schritt für Schritt.",
          "CalorieVision gebruikt geavanceerde kunstmatige intelligentie om je te helpen je maaltijden op een eenvoudige, toegankelijke manier te begrijpen. Hier is hoe je maaltijdanalyse achter de schermen zou kunnen verlopen – duidelijk uitgelegd, stap voor stap.",
        )}
      </p>

      <div className="space-y-5 md:space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start gap-3 pb-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg">
                {t(
                  "Step 1 – Your meal photo",
                  "Étape 1 – Votre photo de repas",
                  "Paso 1 – La foto de tu comida",
                  "Passo 1 – A foto da sua refeição",
                  "步骤 1 – 您的餐食照片",
                  "الخطوة 1 – صورة وجبتك",
                  "Passo 1 – La foto del tuo pasto",
                  "Schritt 1 – Ihr Mahlzeitenfoto",
                  "Stap 1 – Je maaltijdfoto",
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  "You upload a clear photo of your meal. The clearer the image, the better the results. Photos are only processed to understand the contents – they are not stored.",
                  "Vous téléchargez une photo claire de votre repas. Plus l'image est nette, meilleurs sont les résultats. Les photos sont uniquement traitées pour comprendre le contenu – elles ne sont pas conservées.",
                  "Subes una foto clara de tu comida. Cuanto más nítida sea la imagen, mejores serán los resultados. Las fotos solo se procesan para entender el contenido; no se almacenan.",
                  "Você carrega uma foto nítida da sua refeição. Quanto mais clara for a imagem, melhores serão os resultados. As fotos são apenas processadas para compreender o conteúdo – não são guardadas.",
                  "您上传一张清晰的餐食照片。图片越清晰，结果越好。照片仅用于理解内容 – 不会被存储。",
                  "ترفع صورة واضحة لوجبتك. كلما كانت الصورة أوضح، كانت النتيجة أفضل. تُستخدم الصور فقط لفهم ما يظهر في الطبق ولا يتم تخزينها.",
                  "Carichi una foto nitida del tuo pasto. Più l'immagine è chiara, migliori saranno i risultati. Le foto vengono elaborate solo per comprendere il contenuto e non vengono memorizzate.",
                  "Sie laden ein klares Foto Ihrer Mahlzeit hoch. Je klarer das Bild, desto besser die Ergebnisse. Fotos werden nur verarbeitet, um den Inhalt zu verstehen – sie werden nicht gespeichert.",
                  "Je uploadt een duidelijke foto van je maaltijd. Hoe helderder het beeld, hoe beter de resultaten. Foto's worden alleen verwerkt om de inhoud te begrijpen – ze worden niet opgeslagen.",
                )}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              {t(
                "Step 2 – AI vision analysis",
                "Étape 2 – Analyse visuelle par IA",
                "Paso 2 – Análisis de visión con IA",
                "Passo 2 – Análise de visão com IA",
                "步骤 2 – AI 视觉分析",
                "الخطوة 2 – تحليل بصري بالذكاء الاصطناعي",
                "Passo 2 – Analisi visiva con IA",
                "Schritt 2 – KI-Bildanalyse",
                "Stap 2 – AI-beeldanalyse",
              )}
            </CardTitle>
            <CardDescription>
              {t(
                "The image is sent securely to an AI vision model that detects foods in the picture by analysing shapes, textures, and colours.",
                "L'image est envoyée de manière sécurisée à un modèle de vision par IA qui détecte les aliments présents en analysant les formes, les textures et les couleurs.",
                "La imagen se envía de forma segura a un modelo de visión con IA que detecta los alimentos de la foto analizando formas, texturas y colores.",
                "A imagem é enviada de forma segura para um modelo de visão com IA que deteta os alimentos na fotografia analisando formas, texturas e cores.",
                "图片安全发送到 AI 视觉模型，通过分析形状、纹理和颜色检测图片中的食物。",
                "تُرسل الصورة بشكل آمن إلى نموذج رؤية بالذكاء الاصطناعي يقوم باكتشاف الأطعمة في الصورة من خلال تحليل الأشكال والألوان والملمس.",
                "L'immagine viene inviata in modo sicuro a un modello di visione IA che rileva gli alimenti nella foto analizzando forme, texture e colori.",
                "Das Bild wird sicher an ein KI-Bilderkennungsmodell gesendet, das Lebensmittel im Bild durch Analyse von Formen, Texturen und Farben erkennt.",
                "De afbeelding wordt veilig verzonden naar een AI-visiemodel dat voedingsmiddelen in de foto detecteert door vormen, texturen en kleuren te analyseren.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("Chicken", "Poulet", "Pollo", "Frango", "鸡肉", "دجاج", "Pollo", "Hähnchen", "Kip")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("Rice", "Riz", "Arroz", "Arroz", "米饭", "أرز", "Riso", "Reis", "Rijst")}
              </li>
            </ul>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("Vegetables", "Légumes", "Verduras", "Legumes", "蔬菜", "خضار", "Verdure", "Gemüse", "Groenten")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                {t(
                  "Sauces or dressings",
                  "Sauces ou assaisonnements",
                  "Salsas o aderezos",
                  "Molhos ou temperos",
                  "酱料或调料",
                  "صلصات أو تتبيلات",
                  "Salse o condimenti",
                  "Saucen oder Dressings",
                  "Sauzen of dressings",
                )}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">
              {t(
                "Step 3 – Portion size estimation",
                "Étape 3 – Estimation des portions",
                "Paso 3 – Estimación del tamaño de las porciones",
                "Passo 3 – Estimativa do tamanho das porções",
                "步骤 3 – 份量估算",
                "الخطوة 3 – تقدير حجم الحصة",
                "Passo 3 – Stima delle porzioni",
                "Schritt 3 – Portionsgrößenschätzung",
                "Stap 3 – Portiegrootte-schatting",
              )}
            </CardTitle>
            <CardDescription>
              {t(
                "CalorieVision estimates approximate portion sizes in grams based on how much space each food takes up on the plate and typical serving sizes.",
                "CalorieVision estime la taille approximative des portions en grammes en fonction de l'espace occupé par chaque aliment dans l'assiette et des portions habituelles.",
                "CalorieVision estima el tamaño aproximado de las porciones en gramos según el espacio que ocupa cada alimento en el plato y las raciones habituales.",
                "O CalorieVision estima tamanhos aproximados de porção em gramas com base no espaço que cada alimento ocupa no prato e em porções de referência típicas.",
                "CalorieVision 根据每种食物在盘子中占据的空间和典型的份量大小，以克为单位估算大致的份量。",
                "يقوم CalorieVision بتقدير حجم الحصة بالجرام اعتمادًا على المساحة التي يشغلها كل نوع من الطعام في الطبق، مقارنة بحصص مرجعية شائعة.",
                "CalorieVision stima le dimensioni approssimative delle porzioni in grammi in base allo spazio che ogni alimento occupa nel piatto e alle porzioni tipiche.",
                "CalorieVision schätzt ungefähre Portionsgrößen in Gramm basierend darauf, wie viel Platz jedes Lebensmittel auf dem Teller einnimmt und typische Portionsgrößen.",
                "CalorieVision schat geschatte portiegroottes in gram op basis van hoeveel ruimte elk voedingsmiddel inneemt op het bord en typische portiegrootten.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t("Example", "Exemple", "Ejemplo", "Exemplo", "示例", "مثال", "Esempio", "Beispiel", "Voorbeeld")}
              </p>
              <p>{t("Chicken: ~120 g", "Poulet : ~120 g", "Pollo: ~120 g", "Frango: ~120 g", "鸡肉：约120克", "دجاج: ~120 غ", "Pollo: ~120 g", "Hähnchen: ~120 g", "Kip: ~120 g")}</p>
              <p>{t("Rice: ~150 g", "Riz : ~150 g", "Arroz: ~150 g", "Arroz: ~150 g", "米饭：约150克", "أرز: ~150 غ", "Riso: ~150 g", "Reis: ~150 g", "Rijst: ~150 g")}</p>
              <p>
                {t(
                  "Vegetables: ~80 g",
                  "Légumes : ~80 g",
                  "Verduras: ~80 g",
                  "Legumes: ~80 g",
                  "蔬菜：约80克",
                  "خضار: ~80 غ",
                  "Verdure: ~80 g",
                  "Gemüse: ~80 g",
                  "Groenten: ~80 g",
                )}
              </p>
            </div>
            <p>
              {t(
                "These values are estimates only and depend heavily on the quality of the photo and the actual portion sizes on your plate.",
                "Ces valeurs sont uniquement des estimations et dépendent fortement de la qualité de la photo et de la taille réelle des portions dans votre assiette.",
                "Estos valores son solo estimaciones y dependen en gran medida de la calidad de la foto y del tamaño real de las porciones en tu plato.",
                "Estes valores são apenas estimativas e dependem bastante da qualidade da fotografia e do tamanho real das porções no seu prato.",
                "这些数值仅为估算值，很大程度上取决于照片质量和盘中的实际份量大小。",
                "هذه القيم تقريبية فقط وتعتمد بدرجة كبيرة على جودة الصورة وحجم الحصص الفعلي في طبقك.",
                "Questi valori sono solo stime e dipendono molto dalla qualità della foto e dalle dimensioni effettive delle porzioni nel tuo piatto.",
                "Diese Werte sind nur Schätzungen und hängen stark von der Qualität des Fotos und den tatsächlichen Portionsgrößen auf Ihrem Teller ab.",
                "Deze waarden zijn slechts schattingen en zijn sterk afhankelijk van de kwaliteit van de foto en de werkelijke portiegroottes op je bord.",
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">
              {t(
                "Step 4 – Calorie calculation",
                "Étape 4 – Calcul des calories",
                "Paso 4 – Cálculo de calorías",
                "Passo 4 – Cálculo de calorias",
                "步骤 4 – 卡路里计算",
                "الخطوة 4 – حساب السعرات الحرارية",
                "Passo 4 – Calcolo delle calorie",
                "Schritt 4 – Kalorienberechnung",
                "Stap 4 – Calorieberekening",
              )}
            </CardTitle>
            <CardDescription>
              {t(
                "The system uses nutrition reference tables to calculate approximate calories for each food item and your meal as a whole.",
                "Le système utilise des tables de référence nutritionnelle pour calculer les calories approximatives de chaque aliment et de votre repas dans son ensemble.",
                "El sistema utiliza tablas de referencia nutricional para calcular las calorías aproximadas de cada alimento y de tu comida en su conjunto.",
                "O sistema utiliza tabelas de referência nutricional para calcular as calorias aproximadas de cada alimento e da refeição como um todo.",
                "系统使用营养参考表计算每种食物和整餐的大致卡路里。",
                "يستخدم النظام جداول غذائية مرجعية لحساب السعرات الحرارية التقريبية لكل مكوّن، وللوجبة ككل.",
                "Il sistema utilizza tabelle nutrizionali di riferimento per calcolare le calorie approssimative per ogni alimento e per il pasto nel suo complesso.",
                "Das System verwendet Ernährungsreferenztabellen, um ungefähre Kalorien für jedes Lebensmittel und Ihre Mahlzeit insgesamt zu berechnen.",
                "Het systeem gebruikt voedingsreferentietabellen om geschatte calorieën te berekenen voor elk voedingsmiddel en je maaltijd als geheel.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-1">
              <p>{t("Chicken: ~220 kcal", "Poulet : ~220 kcal", "Pollo: ~220 kcal", "Frango: ~220 kcal", "鸡肉：约220千卡", "دجاج: ~220 سعرة", "Pollo: ~220 kcal", "Hähnchen: ~220 kcal", "Kip: ~220 kcal")}</p>
              <p>{t("Rice: ~260 kcal", "Riz : ~260 kcal", "Arroz: ~260 kcal", "Arroz: ~260 kcal", "米饭：约260千卡", "أرز: ~260 سعرة", "Riso: ~260 kcal", "Reis: ~260 kcal", "Rijst: ~260 kcal")}</p>
              <p>
                {t(
                  "Vegetables: ~80 kcal",
                  "Légumes : ~80 kcal",
                  "Verduras: ~80 kcal",
                  "Legumes: ~80 kcal",
                  "蔬菜：约80千卡",
                  "خضار: ~80 سعرة",
                  "Verdure: ~80 kcal",
                  "Gemüse: ~80 kcal",
                  "Groenten: ~80 kcal",
                )}
              </p>
              <p>
                {t(
                  "Light sauce: ~60 kcal",
                  "Sauce légère : ~60 kcal",
                  "Salsa ligera: ~60 kcal",
                  "Molho leve: ~60 kcal",
                  "清淡酱料：约60千卡",
                  "صلصة خفيفة: ~60 سعرة",
                  "Salsa leggera: ~60 kcal",
                  "Leichte Sauce: ~60 kcal",
                  "Lichte saus: ~60 kcal",
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/70 p-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t(
                  "Estimated total",
                  "Total estimé",
                  "Total estimado",
                  "Total estimado",
                  "估算总计",
                  "الإجمالي التقديري",
                  "Totale stimato",
                  "Geschätzter Gesamtwert",
                  "Geschat totaal",
                )}
              </p>
              <p className="text-lg font-semibold text-foreground">~620 kcal</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Numbers are for illustration only.",
                  "Les chiffres sont donnés à titre d'exemple uniquement.",
                  "Las cifras son solo a modo de ejemplo.",
                  "Os valores são apenas ilustrativos.",
                  "数字仅供参考。",
                  "الأرقام هنا لغرض التوضيح فقط.",
                  "I numeri sono solo a scopo illustrativo.",
                  "Die Zahlen dienen nur zur Veranschaulichung.",
                  "Getallen zijn alleen ter illustratie.",
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">
              {t(
                "Step 5 – Simple nutrition tips",
                "Étape 5 – Conseils nutritionnels simples",
                "Paso 5 – Consejos de nutrición sencillos",
                "Passo 5 – Dicas simples de nutrição",
                "步骤 5 – 简单营养建议",
                "الخطوة 5 – نصائح غذائية بسيطة",
                "Passo 5 – Semplici consigli nutrizionali",
                "Schritt 5 – Einfache Ernährungstipps",
                "Stap 5 – Eenvoudige voedingstips",
              )}
            </CardTitle>
            <CardDescription>
              {t(
                "Alongside the numbers, you receive general, non-medical suggestions to help you build balanced meals over time.",
                "En plus des chiffres, vous recevez des suggestions générales et non médicales pour vous aider à construire des repas plus équilibrés au fil du temps.",
                "Además de las cifras, recibes sugerencias generales y no médicas para ayudarte a construir comidas más equilibradas con el tiempo.",
                "Para além dos números, recebe sugestões gerais e não médicas para o ajudar a construir refeições mais equilibradas ao longo do tempo.",
                "除了数字外，您还会收到一般性的非医疗建议，帮助您逐步建立均衡的饮食。",
                "إلى جانب الأرقام، تحصل على اقتراحات عامة وغير طبية تساعدك على بناء وجبات أكثر توازنًا مع مرور الوقت.",
                "Oltre ai numeri, ricevi suggerimenti generali e non medici per aiutarti a costruire pasti più equilibrati nel tempo.",
                "Neben den Zahlen erhalten Sie allgemeine, nicht-medizinische Vorschläge, die Ihnen helfen, im Laufe der Zeit ausgewogene Mahlzeiten zusammenzustellen.",
                "Naast de cijfers ontvang je algemene, niet-medische suggesties om je te helpen evenwichtige maaltijden samen te stellen.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="font-medium text-foreground">
                {t(
                  "Add more vegetables",
                  "Ajoutez plus de légumes",
                  "Añade más verduras",
                  "Adicione mais legumes",
                  "多吃蔬菜",
                  "أضِف مزيدًا من الخضار",
                  "Aggiungi più verdure",
                  "Mehr Gemüse hinzufügen",
                  "Voeg meer groenten toe",
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Increase colourful vegetables for fibre and micronutrients.",
                  "Augmentez la part de légumes colorés pour les fibres et les micronutriments.",
                  "Aumenta las verduras de colores para obtener más fibra y micronutrientes.",
                  "Aumente a quantidade de legumes coloridos para obter mais fibra e micronutrientes.",
                  "多吃色彩丰富的蔬菜以获取纤维和微量营养素。",
                  "إضافة خضار ملوّنة أكثر تساعد على زيادة الألياف والفيتامينات والمعادن المفيدة.",
                  "Aumenta le verdure colorate per fibre e micronutrienti.",
                  "Erhöhen Sie den Anteil bunter Gemüsesorten für Ballaststoffe und Mikronährstoffe.",
                  "Verhoog kleurrijke groenten voor vezels en micronutriënten.",
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="font-medium text-foreground">
                {t(
                  "Balance carbs & protein",
                  "Équilibrez glucides et protéines",
                  "Equilibra hidratos y proteínas",
                  "Equilibre hidratos de carbono e proteína",
                  "平衡碳水化合物和蛋白质",
                  "وازن بين الكربوهيدرات والبروتين",
                  "Bilancia carboidrati e proteine",
                  "Kohlenhydrate & Eiweiß ausgleichen",
                  "Balanceer koolhydraten & eiwitten",
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Pair starches with protein to support fullness and energy.",
                  "Associez les féculents à une source de protéines pour favoriser la satiété et l'énergie.",
                  "Combina los hidratos de carbono con proteínas para favorecer la saciedad y la energía.",
                  "Combine alimentos ricos em hidratos de carbono com fontes de proteína para favorecer a saciedade e a energia.",
                  "将淀粉类食物与蛋白质搭配，以保持饱腹感和能量。",
                  "حاول أن تجمع بين النشويات ومصدر جيد للبروتين لدعم الشبع والطاقة على مدار اليوم.",
                  "Abbina gli amidi alle proteine per favorire sazietà ed energia.",
                  "Kombinieren Sie Stärke mit Eiweiß für Sättigung und Energie.",
                  "Combineer zetmeel met eiwit voor verzadiging en energie.",
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="font-medium text-foreground">
                {t(
                  "Watch sugary drinks",
                  "Attention aux boissons sucrées",
                  "Cuidado con las bebidas azucaradas",
                  "Atenção às bebidas açucaradas",
                  "注意含糖饮料",
                  "انتبه للمشروبات المحلّاة",
                  "Attenzione alle bevande zuccherate",
                  "Auf zuckerhaltige Getränke achten",
                  "Let op suikerhoudende dranken",
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Consider water or unsweetened options if you are aiming to reduce added sugar.",
                  "Privilégiez l'eau ou des boissons non sucrées si vous souhaitez réduire les sucres ajoutés.",
                  "Considera el agua o bebidas sin azúcar si quieres reducir los azúcares añadidos.",
                  "Considere água ou bebidas sem açúcar se pretende reduzir o consumo de açúcar adicionado.",
                  "如果您想减少添加糖，可以选择水或无糖饮料。",
                  "إذا كنت تحاول تقليل السكريات المضافة، فكر في استبدال المشروبات المحلّاة بالماء أو بمشروبات غير محلاة.",
                  "Considera acqua o opzioni senza zucchero se vuoi ridurre gli zuccheri aggiunti.",
                  "Wählen Sie Wasser oder ungesüßte Optionen, wenn Sie Zuckerzusatz reduzieren möchten.",
                  "Overweeg water of ongezoete opties als je toegevoegde suiker wilt verminderen.",
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/60">
          <CardHeader className="flex flex-row items-start gap-3 pb-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg">
                {t(
                  "Important notes",
                  "Points importants",
                  "Notas importantes",
                  "Notas importantes",
                  "重要说明",
                  "ملاحظات مهمة",
                  "Note importanti",
                  "Wichtige Hinweise",
                  "Belangrijke opmerkingen",
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  "CalorieVision is an educational tool, not a medical device or nutrition prescription.",
                  "CalorieVision est un outil éducatif, pas un dispositif médical ni une prescription nutritionnelle.",
                  "CalorieVision es una herramienta educativa, no un dispositivo médico ni una prescripción nutricional.",
                  "O CalorieVision é uma ferramenta educativa, não um dispositivo médico nem uma prescrição nutricional.",
                  "CalorieVision 是一款教育工具，不是医疗设备或营养处方。",
                  "CalorieVision أداة تعليمية وليست جهازًا طبيًا أو خطة غذائية علاجية.",
                  "CalorieVision è uno strumento educativo, non un dispositivo medico né una prescrizione nutrizionale.",
                  "CalorieVision ist ein Bildungswerkzeug, kein medizinisches Gerät oder Ernährungsrezept.",
                  "CalorieVision is een educatieve tool, geen medisch apparaat of voedingsvoorschrift.",
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <ul className="space-y-1">
              <li>
                {t(
                  "Results are estimates, not exact measurements.",
                  "Les résultats sont des estimations, pas des mesures exactes.",
                  "Los resultados son estimaciones, no mediciones exactas.",
                  "Os resultados são estimativas, não medições exatas.",
                  "结果是估算值，不是精确测量。",
                  "النتائج عبارة عن تقديرات تقريبية وليست قياسات دقيقة.",
                  "I risultati sono stime, non misurazioni esatte.",
                  "Die Ergebnisse sind Schätzungen, keine exakten Messungen.",
                  "Resultaten zijn schattingen, geen exacte metingen.",
                )}
              </li>
              <li>
                {t(
                  "Image quality, lighting, and food variety all affect accuracy.",
                  "La qualité de l'image, l'éclairage et la variété des aliments influencent la précision.",
                  "La calidad de la imagen, la iluminación y la variedad de alimentos influyen en la precisión.",
                  "A qualidade da imagem, a iluminação e a variedade de alimentos influenciam a precisão.",
                  "图像质量、光线和食物种类都会影响准确性。",
                  "جودة الصورة والإضاءة وتنوّع الأطعمة عوامل تؤثر جميعها في مستوى الدقة.",
                  "La qualità dell'immagine, l'illuminazione e la varietà degli alimenti influenzano la precisione.",
                  "Bildqualität, Beleuchtung und Lebensmittelvielfalt beeinflussen die Genauigkeit.",
                  "Beeldkwaliteit, verlichting en voedselvariëteit beïnvloeden allemaal de nauwkeurigheid.",
                )}
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                {t(
                  "Always consider professional advice for health-related questions.",
                  "Fiez-vous toujours à l'avis d'un professionnel pour les questions liées à la santé.",
                  "Acude siempre al consejo de un profesional para cuestiones relacionadas con la salud.",
                  "Recorra sempre ao conselho de um profissional para questões relacionadas com a saúde.",
                  "健康相关问题请务必咨询专业人士。",
                  "استشر دائمًا مختصًا صحيًا لأي تساؤلات متعلقة بصحتك.",
                  "Consulta sempre un professionista per questioni relative alla salute.",
                  "Ziehen Sie bei gesundheitsbezogenen Fragen immer professionellen Rat hinzu.",
                  "Raadpleeg altijd professioneel advies voor gezondheidsgerelateerde vragen.",
                )}
              </li>
              <li>
                {t(
                  "Do not use CalorieVision as a sole basis for medical or dietary decisions.",
                  "N'utilisez pas CalorieVision comme seule base pour des décisions médicales ou alimentaires.",
                  "No utilices CalorieVision como única base para decisiones médicas o dietéticas.",
                  "Não utilize o CalorieVision como única base para decisões médicas ou dietéticas.",
                  "不要仅依赖 CalorieVision 做出医疗或饮食决定。",
                  "لا تستخدم CalorieVision كأساس وحيد لقرارات طبية أو غذائية.",
                  "Non utilizzare CalorieVision come unica base per decisioni mediche o dietetiche.",
                  "Verwenden Sie CalorieVision nicht als alleinige Grundlage für medizinische oder Ernährungsentscheidungen.",
                  "Gebruik CalorieVision niet als enige basis voor medische of dieetbeslissingen.",
                )}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HowItWorks;