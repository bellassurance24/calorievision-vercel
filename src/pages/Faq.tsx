import { useMemo } from "react";
import { usePageMetadata, useStructuredData } from "@/hooks/usePageMetadata";
import { useLanguage } from "@/contexts/LanguageContext";


interface FaqItem {
  q: string;
  a: string;
}

const Faq = () => {
  const { language } = useLanguage();

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

  const faqs: FaqItem[] =
    language === "nl"
      ? [
          {
            q: "Is CalorieVision nauwkeurig?",
            a: "CalorieVision geeft geschatte resultaten op basis van AI-beeldanalyse en voedingsreferentiegegevens. Het is geen medisch nauwkeurig hulpmiddel en mag niet als exacte meting worden beschouwd.",
          },
          {
            q: "Bewaren jullie mijn foto's?",
            a: "Nee. Uw foto's worden niet opgeslagen, gedeeld of gebruikt voor training. Ze worden alleen verwerkt om een analyse te genereren en daarna verwijderd.",
          },
          {
            q: "Is dit een medisch hulpmiddel?",
            a: "Nee. CalorieVision is een educatief hulpmiddel en vervangt geen arts, diëtist of voedingsdeskundige.",
          },
          {
            q: "Welke AI-technologie gebruiken jullie?",
            a: "We gebruiken moderne beeldherkenningsmodellen die voedsel op een foto kunnen detecteren en geschatte hoeveelheden kunnen inschatten.",
          },
          {
            q: "Is het gratis?",
            a: "Ja. CalorieVision is volledig gratis voor gebruikers.",
          },
          {
            q: "Kan ik het dagelijks gebruiken?",
            a: "Absoluut. De app is ontworpen voor herhaald, dagelijks educatief gebruik.",
          },
          {
            q: "Volgt CalorieVision mij?",
            a: "Wij respecteren uw privacy. Er worden geen persoonlijke gegevens verzameld zonder uw toestemming.",
          },
          {
            q: "Werkt het met onscherpe foto's?",
            a: "Onscherpe of donkere foto's bemoeilijken de analyse. Voor de beste resultaten gebruikt u heldere afbeeldingen met goede verlichting.",
          },
          {
            q: "Hoe nauwkeurig zijn de calorieën?",
            a: "Calorieschattingen zijn gebaseerd op standaard voedingstabellen en visuele detectie. Ze zijn bij benadering en weerspiegelen mogelijk niet exact uw maaltijd.",
          },
          {
            q: "Kan ik elke maaltijd uploaden?",
            a: "Ja, zolang het eten zichtbaar is in de afbeelding en voldoet aan onze gebruiksvoorwaarden.",
          },
          {
            q: "Zijn mijn gegevens veilig?",
            a: "Ja. Alle communicatie met CalorieVision is versleuteld via HTTPS.",
          },
          {
            q: "Kan ik op de tips vertrouwen?",
            a: "Tips zijn algemeen en niet medisch. Ze vervangen geen professioneel advies.",
          },
          {
            q: "Is het voor gewichtsverlies?",
            a: "Niet specifiek. CalorieVision is ontworpen voor leren, bewustwording en begrip van maaltijden in plaats van het voorschrijven van afvalplannen.",
          },
          {
            q: "Kunnen kinderen CalorieVision gebruiken?",
            a: "Ja, onder passend toezicht van een ouder of voogd.",
          },
          {
            q: "Detecteert het ook drankjes?",
            a: "CalorieVision kan drankjes detecteren als ze zichtbaar zijn op de foto, maar de resultaten zijn betrouwbaarder voor duidelijk zichtbaar voedsel.",
          },
        ]
      : language === "fr"
      ? [
          {
            q: "CalorieVision est-il précis ?",
            a: "CalorieVision fournit des résultats approximatifs basés sur l'analyse d'images par IA et des données de référence nutritionnelles. Ce n'est pas un outil médical précis et il ne doit pas être considéré comme une mesure exacte.",
          },
          {
            q: "Conservez-vous mes photos ?",
            a: "Non. Vos photos ne sont ni enregistrées, ni partagées, ni utilisées pour l'entraînement de modèles. Elles sont uniquement traitées pour générer une analyse, puis supprimées.",
          },
          {
            q: "Est-ce un outil médical ?",
            a: "Non. CalorieVision est un outil éducatif et ne remplace pas un médecin, un diététicien ou un nutritionniste.",
          },
          {
            q: "Quelle technologie d'IA utilisez-vous ?",
            a: "Nous utilisons des modèles modernes de reconnaissance d'images capables de détecter les aliments sur une photo et d'estimer des quantités approximatives.",
          },
          {
            q: "Est-ce gratuit ?",
            a: "Oui. CalorieVision est entièrement gratuit pour les utilisateurs.",
          },
          {
            q: "Puis-je l'utiliser tous les jours ?",
            a: "Absolument. L'application est conçue pour un usage éducatif régulier, au quotidien.",
          },
          {
            q: "CalorieVision me suit-il ou me trace-t-il ?",
            a: "Nous respectons votre vie privée. Aucune donnée personnelle n'est collectée sans votre consentement.",
          },
          {
            q: "L'outil fonctionne-t-il avec des photos floues ?",
            a: "Les photos floues ou sombres rendent l'analyse plus difficile. Pour de meilleurs résultats, utilisez des images claires avec une bonne luminosité.",
          },
          {
            q: "Quelle est la précision des calories ?",
            a: "Les estimations de calories sont basées sur des tables nutritionnelles standard et la détection visuelle. Elles sont approximatives et peuvent ne pas refléter exactement votre repas.",
          },
          {
            q: "Puis-je télécharger n'importe quel repas ?",
            a: "Oui, tant que les aliments sont visibles sur l'image et que vous respectez nos conditions d'utilisation.",
          },
          {
            q: "Mes données sont-elles en sécurité ?",
            a: "Oui. Toutes les communications avec CalorieVision sont chiffrées via HTTPS.",
          },
          {
            q: "Puis-je me fier aux conseils ?",
            a: "Les conseils sont généraux et non médicaux. Ils ne remplacent pas l'avis d'un professionnel de santé.",
          },
          {
            q: "Est-ce un outil de perte de poids ?",
            a: "Pas spécifiquement. CalorieVision est conçu pour l'apprentissage, la prise de conscience et la compréhension des repas plutôt que pour prescrire des plans de perte de poids.",
          },
          {
            q: "Les enfants peuvent-ils utiliser CalorieVision ?",
            a: "Oui, sous la supervision adaptée d'un parent ou d'un tuteur.",
          },
          {
            q: "L'outil détecte-t-il les boissons ?",
            a: "CalorieVision peut parfois détecter les boissons si elles sont visibles sur la photo, mais les résultats sont généralement plus fiables pour les aliments clairement visibles.",
          },
        ]
      : language === "es"
      ? [
          {
            q: "¿Es preciso CalorieVision?",
            a: "CalorieVision ofrece resultados aproximados basados en el análisis de imágenes con IA y datos de referencia nutricionales. No es una herramienta médica precisa y no debe tomarse como una medición exacta.",
          },
          {
            q: "¿Guardáis mis fotos?",
            a: "No. Tus fotos no se guardan, no se comparten ni se utilizan para entrenar modelos. Solo se procesan para generar un análisis y luego se eliminan.",
          },
          {
            q: "¿Es una herramienta médica?",
            a: "No. CalorieVision es una herramienta educativa y no sustituye a un médico, dietista o nutricionista.",
          },
          {
            q: "¿Qué tecnología de IA utilizáis?",
            a: "Utilizamos modelos modernos de reconocimiento de imágenes capaces de detectar alimentos en una foto y estimar cantidades aproximadas.",
          },
          {
            q: "¿Es gratis?",
            a: "Sí. CalorieVision es completamente gratuito para los usuarios.",
          },
          {
            q: "¿Puedo usarlo todos los días?",
            a: "Por supuesto. La aplicación está pensada para un uso educativo diario y repetido.",
          },
          {
            q: "¿CalorieVision me rastrea?",
            a: "Respetamos tu privacidad. No se recopilan datos personales sin tu consentimiento.",
          },
          {
            q: "¿Funciona con fotos borrosas?",
            a: "Las fotos borrosas u oscuras dificultan el análisis. Para obtener mejores resultados, utiliza imágenes claras y bien iluminadas.",
          },
          {
            q: "¿Qué tan exactas son las calorías?",
            a: "Las estimaciones de calorías se basan en tablas nutricionales estándar y en la detección visual. Son aproximadas y pueden no reflejar exactamente tu comida.",
          },
          {
            q: "¿Puedo subir cualquier comida?",
            a: "Sí, siempre que la comida sea visible en la imagen y respetes nuestros términos de uso.",
          },
          {
            q: "¿Están seguros mis datos?",
            a: "Sí. Toda la comunicación con CalorieVision está cifrada mediante HTTPS.",
          },
          {
            q: "¿Puedo fiarme de los consejos?",
            a: "Los consejos son generales y no médicos. No sustituyen el consejo de un profesional de la salud.",
          },
          {
            q: "¿Es para perder peso?",
            a: "No específicamente. CalorieVision está diseñado para el aprendizaje, la toma de conciencia y la comprensión de las comidas, más que para prescribir planes de adelgazamiento.",
          },
          {
            q: "¿Pueden usar CalorieVision los niños?",
            a: "Sí, bajo la supervisión adecuada de un padre o tutor.",
          },
          {
            q: "¿Detecta también las bebidas?",
            a: "CalorieVision puede detectar bebidas si son visibles en la foto, pero los resultados suelen ser más fiables para los alimentos claramente visibles.",
          },
        ]
      : language === "pt"
      ? [
          {
            q: "O CalorieVision é preciso?",
            a: "O CalorieVision fornece resultados aproximados com base na análise de imagens por IA e em dados de referência nutricional. Não é uma ferramenta médica precisa e não deve ser usado como medição exata.",
          },
          {
            q: "Guardam as minhas fotos?",
            a: "Não. As suas fotos não são guardadas, partilhadas nem usadas para treinar modelos. São apenas processadas para gerar uma análise e depois descartadas.",
          },
          {
            q: "É uma ferramenta médica?",
            a: "Não. O CalorieVision é uma ferramenta educativa e não substitui um médico, nutricionista ou outro profissional de saúde.",
          },
          {
            q: "Que tecnologia de IA utilizam?",
            a: "Utilizamos modelos modernos de reconhecimento de imagens capazes de detetar alimentos numa fotografia e estimar quantidades aproximadas.",
          },
          {
            q: "É gratuito?",
            a: "Sim. O CalorieVision é totalmente gratuito para os utilizadores.",
          },
          {
            q: "Posso utilizá-lo todos os dias?",
            a: "Claro. A aplicação foi pensada para um uso educativo frequente, no dia a dia.",
          },
          {
            q: "O CalorieVision rastreia-me?",
            a: "Respeitamos a sua privacidade. Nenhum dado pessoal é recolhido sem o seu consentimento.",
          },
          {
            q: "Funciona com fotos desfocadas?",
            a: "Fotos desfocadas ou escuras tornam a análise mais difícil. Para melhores resultados, utilize imagens nítidas e bem iluminadas.",
          },
          {
            q: "Quão exatas são as calorias?",
            a: "As estimativas de calorias baseiam-se em tabelas nutricionais padrão e na deteção visual. São aproximadas e podem não refletir exatamente a sua refeição.",
          },
          {
            q: "Posso carregar qualquer refeição?",
            a: "Sim, desde que os alimentos sejam visíveis na imagem e que respeite os nossos termos de utilização.",
          },
          {
            q: "Os meus dados estão seguros?",
            a: "Sim. Toda a comunicação com o CalorieVision é encriptada através de HTTPS.",
          },
          {
            q: "Posso confiar nos conselhos?",
            a: "As sugestões são gerais e não médicas. Não substituem o aconselhamento de un profissional de saúde.",
          },
          {
            q: "É uma ferramenta para emagrecer?",
            a: "Não especificamente. O CalorieVision foi concebido para apoiar o aprendizado, a consciência e a compreensão das refeições, mais do que para prescrever planos de perda de peso.",
          },
          {
            q: "As crianças podem usar o CalorieVision?",
            a: "Sim, com a supervisão adequada de um dos pais ou de um tutor.",
          },
          {
            q: "A ferramenta deteta bebidas?",
            a: "O CalorieVision pode, por vezes, detetar bebidas se estiverem visíveis na foto, mas os resultados são geralmente mais fiáveis para alimentos claramente visíveis.",
          },
        ]
      : language === "zh"
      ? [
          {
            q: "CalorieVision准确吗？",
            a: "CalorieVision根据AI图像分析和营养参考数据提供大致结果。它不是精确的医疗工具，不应被视为精确测量。",
          },
          {
            q: "你们会保存我的照片吗？",
            a: "不会。您的照片不会被保存、分享或用于训练。它们仅用于生成分析，之后会被删除。",
          },
          {
            q: "这是医疗工具吗？",
            a: "不是。CalorieVision是一款教育工具，不能替代医生、营养师或营养专家。",
          },
          {
            q: "你们使用什么AI技术？",
            a: "我们使用现代图像识别模型，能够检测照片中的食物并估计大致数量。",
          },
          {
            q: "这是免费的吗？",
            a: "是的。CalorieVision对用户完全免费。",
          },
          {
            q: "我可以每天使用吗？",
            a: "当然可以。该应用程序旨在用于日常重复的教育用途。",
          },
          {
            q: "CalorieVision会追踪我吗？",
            a: "我们尊重您的隐私。未经您的同意，不会收集任何个人数据。",
          },
          {
            q: "模糊的照片可以使用吗？",
            a: "模糊或黑暗的照片会使分析更加困难。为获得最佳效果，请使用光线充足的清晰图像。",
          },
          {
            q: "卡路里估算有多准确？",
            a: "卡路里估算基于标准营养表和视觉检测。它们是近似值，可能无法准确反映您的实际餐食。",
          },
          {
            q: "我可以上传任何餐食吗？",
            a: "可以，只要食物在图片中可见并符合我们的使用条款。",
          },
          {
            q: "我的数据安全吗？",
            a: "是的。与CalorieVision的所有通信都通过HTTPS加密。",
          },
          {
            q: "我可以信赖这些建议吗？",
            a: "建议是一般性的，非医疗性质。它们不能替代专业建议。",
          },
          {
            q: "这是用于减肥的吗？",
            a: "不完全是。CalorieVision旨在帮助学习、提高意识和理解餐食，而不是制定减肥计划。",
          },
          {
            q: "儿童可以使用CalorieVision吗？",
            a: "可以，在父母或监护人的适当监督下使用。",
          },
          {
            q: "它能检测饮料吗？",
            a: "如果饮料在照片中可见，CalorieVision可能会检测到它们，但对于清晰可见的食物，结果更可靠。",
          },
        ]
      : language === "ar"
      ? [
          {
            q: "هل CalorieVision دقيق؟",
            a: "يوفّر CalorieVision نتائج تقريبية تعتمد على تحليل الصور بالذكاء الاصطناعي وعلى جداول مرجعية غذائية. لذلك فهو ليس أداة طبية دقيقة ولا يجب اعتباره قياسًا نهائيًا.",
          },
          {
            q: "هل تحتفظون بصوري؟",
            a: "لا. لا نقوم بحفظ صورك أو مشاركتها أو استخدامها لتدريب النماذج. تُستخدم الصور فقط لإجراء التحليل ثم يتم التخلص منها.",
          },
          {
            q: "هل هذه أداة طبية؟",
            a: "لا. CalorieVision أداة تعليمية ولا يحل محل الطبيب أو أخصائي التغذية أو أي مختص صحي آخر.",
          },
          {
            q: "ما هي تقنية الذكاء الاصطناعي المستخدمة؟",
            a: "نستخدم نماذج حديثة للتعرّف على الصور قادرة على اكتشاف الأطعمة في الصورة وتقدير الكميات بشكل تقريبي.",
          },
          {
            q: "هل الخدمة مجانية؟",
            a: "نعم، CalorieVision مجاني تمامًا للمستخدمين.",
          },
          {
            q: "هل يمكنني استخدامه يوميًا؟",
            a: "بالتأكيد. تم تصميم التطبيق للاستخدام المتكرر اليومي لأغراض الوعي والتعلّم.",
          },
          {
            q: "هل يتتبعني CalorieVision؟",
            a: "نحترم خصوصيتك. لا يتم جمع أي بيانات شخصية بدون موافقتك.",
          },
          {
            q: "هل يعمل مع الصور الضبابية أو المظلمة؟",
            a: "الصور غير الواضحة أو ذات الإضاءة الضعيفة تجعل التحليل أصعب. للحصول على أفضل النتائج، استخدم صورًا واضحة ذات إضاءة جيدة.",
          },
          {
            q: "ما مدى دقة تقدير السعرات؟",
            a: "تستند تقديرات السعرات إلى جداول غذائية قياسية وعلى ما يمكن ملاحظته بصريًا. هذه التقديرات تقريبية وقد لا تعكس وجبتك بدقة تامة.",
          },
          {
            q: "هل يمكنني رفع أي نوع من الوجبات؟",
            a: "نعم، طالما أن الطعام ظاهر بوضوح في الصورة ومع مراعاة شروط الاستخدام الخاصة بنا.",
          },
          {
            q: "هل بياناتي آمنة؟",
            a: "نعم. جميع الاتصالات مع CalorieVision مشفرة عبر بروتوكول HTTPS.",
          },
          {
            q: "هل يمكنني الاعتماد على النصائح؟",
            a: "النصائح عامة وغير طبية، ولا يمكن أن تحل محل استشارة مختص صحي مؤهل.",
          },
          {
            q: "هل هو مخصص لإنقاص الوزن؟",
            a: "ليس بشكل مباشر. CalorieVision مصمم لدعم التعلم وزيادة الوعي وفهم الوجبات، وليس لوضع خطط حمية علاجية.",
          },
          {
            q: "هل يمكن للأطفال استخدام CalorieVision؟",
            a: "نعم، لكن مع إشراف مناسب من الوالدين أو ولي الأمر.",
          },
          {
            q: "هل يكتشف التطبيق المشروبات أيضًا؟",
            a: "يمكن أن يكتشف CalorieVision بعض المشروبات إذا ظهرت بوضوح في الصورة، لكن النتائج غالبًا ما تكون أدق مع الأطعمة الواضحة.",
          },
        ]
      : language === "it"
      ? [
          {
            q: "CalorieVision è preciso?",
            a: "CalorieVision fornisce risultati approssimativi basati sull'analisi delle immagini tramite IA e su dati nutrizionali di riferimento. Non è uno strumento medico preciso e non deve essere considerato come una misurazione esatta.",
          },
          {
            q: "Conservate le mie foto?",
            a: "No. Le tue foto non vengono salvate, condivise né utilizzate per l'addestramento di modelli. Vengono elaborate solo per generare un'analisi e poi eliminate.",
          },
          {
            q: "È uno strumento medico?",
            a: "No. CalorieVision è uno strumento educativo e non sostituisce un medico, un dietologo o un nutrizionista.",
          },
          {
            q: "Quale tecnologia IA utilizzate?",
            a: "Utilizziamo modelli moderni di riconoscimento delle immagini in grado di rilevare gli alimenti in una foto e stimare quantità approssimative.",
          },
          {
            q: "È gratuito?",
            a: "Sì. CalorieVision è completamente gratuito per gli utenti.",
          },
          {
            q: "Posso usarlo tutti i giorni?",
            a: "Assolutamente. L'applicazione è progettata per un uso educativo quotidiano e ripetuto.",
          },
          {
            q: "CalorieVision mi traccia?",
            a: "Rispettiamo la tua privacy. Nessun dato personale viene raccolto senza il tuo consenso.",
          },
          {
            q: "Funziona con foto sfocate?",
            a: "Le foto sfocate o scure rendono l'analisi più difficile. Per risultati migliori, utilizza immagini nitide e ben illuminate.",
          },
          {
            q: "Quanto sono accurate le calorie?",
            a: "Le stime delle calorie si basano su tabelle nutrizionali standard e sul rilevamento visivo. Sono approssimative e potrebbero non riflettere esattamente il tuo pasto.",
          },
          {
            q: "Posso caricare qualsiasi pasto?",
            a: "Sì, purché il cibo sia visibile nell'immagine e tu rispetti i nostri termini di utilizzo.",
          },
          {
            q: "I miei dati sono al sicuro?",
            a: "Sì. Tutte le comunicazioni con CalorieVision sono crittografate tramite HTTPS.",
          },
          {
            q: "Posso fidarmi dei consigli?",
            a: "I consigli sono generali e non medici. Non sostituiscono il parere di un professionista sanitario.",
          },
          {
            q: "È per perdere peso?",
            a: "Non specificamente. CalorieVision è progettato per l'apprendimento, la consapevolezza e la comprensione dei pasti, piuttosto che per prescrivere piani di dimagrimento.",
          },
          {
            q: "I bambini possono usare CalorieVision?",
            a: "Sì, sotto la supervisione appropriata di un genitore o tutore.",
          },
          {
            q: "Rileva anche le bevande?",
            a: "CalorieVision può rilevare le bevande se sono visibili nella foto, ma i risultati sono generalmente più affidabili per gli alimenti chiaramente visibili.",
          },
        ]
      : language === "ru"
      ? [
          {
            q: "CalorieVision точный?",
            a: "CalorieVision предоставляет приблизительные результаты на основе ИИ-анализа изображений и справочных данных о питании. Это не медицинский инструмент и не следует воспринимать его как точное измерение.",
          },
          {
            q: "Вы сохраняете мои фото?",
            a: "Нет. Ваши фотографии не сохраняются, не передаются и не используются для обучения. Они обрабатываются только для генерации анализа и затем удаляются.",
          },
          {
            q: "Это медицинский инструмент?",
            a: "Нет. CalorieVision — это образовательный инструмент и не заменяет врача, диетолога или нутрициолога.",
          },
          {
            q: "Какие технологии ИИ вы используете?",
            a: "Мы используем современные модели распознавания изображений, способные определять продукты на фото и оценивать примерные количества.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. CalorieVision полностью бесплатен для пользователей.",
          },
          {
            q: "Можно использовать каждый день?",
            a: "Конечно. Приложение создано для ежедневного образовательного использования.",
          },
          {
            q: "CalorieVision отслеживает меня?",
            a: "Мы уважаем вашу конфиденциальность. Личные данные не собираются без вашего согласия.",
          },
          {
            q: "Работает ли с размытыми фото?",
            a: "Размытые или тёмные фотографии усложняют анализ. Для лучших результатов используйте чёткие снимки при хорошем освещении.",
          },
          {
            q: "Насколько точен подсчёт калорий?",
            a: "Оценки калорий основаны на стандартных таблицах питания и визуальном распознавании. Они приблизительны и могут не отражать точный состав вашего блюда.",
          },
          {
            q: "Можно загружать любое блюдо?",
            a: "Да, если еда видна на снимке и соответствует нашим условиям использования.",
          },
          {
            q: "Мои данные в безопасности?",
            a: "Да. Все соединения с CalorieVision защищены шифрованием HTTPS.",
          },
          {
            q: "Можно доверять советам?",
            a: "Советы носят общий, а не медицинский характер и не заменяют профессиональную консультацию.",
          },
          {
            q: "Это для похудения?",
            a: "Не специально. CalorieVision предназначен для обучения, повышения осведомлённости и понимания состава блюд, а не для составления диет.",
          },
          {
            q: "Могут ли дети использовать CalorieVision?",
            a: "Да, под надлежащим надзором родителя или опекуна.",
          },
          {
            q: "Определяет ли он напитки?",
            a: "CalorieVision может распознать напитки, если они видны на фото, однако результаты надёжнее для чётко видимых продуктов питания.",
          },
        ]
      : language === "ja"
      ? [
          {
            q: "CalorieVisionは正確ですか？",
            a: "CalorieVisionはAI画像解析と栄養参照データに基づいた概算結果を提供します。医療的な精度はなく、正確な測定値として扱うべきではありません。",
          },
          {
            q: "写真は保存されますか？",
            a: "いいえ。写真は保存・共有・学習目的への使用は行いません。分析結果を生成するためのみに処理され、その後削除されます。",
          },
          {
            q: "医療ツールですか？",
            a: "いいえ。CalorieVisionは教育ツールであり、医師・栄養士・管理栄養士の代わりにはなりません。",
          },
          {
            q: "どんなAI技術を使っていますか？",
            a: "写真から食品を検出し、おおよその量を推定できる最新の画像認識モデルを使用しています。",
          },
          {
            q: "無料ですか？",
            a: "はい。CalorieVisionはユーザーに対して完全無料です。",
          },
          {
            q: "毎日使えますか？",
            a: "もちろんです。アプリは日常的な教育目的での繰り返し利用を想定して設計されています。",
          },
          {
            q: "CalorieVisionに追跡されますか？",
            a: "プライバシーを尊重します。同意なしに個人データを収集することはありません。",
          },
          {
            q: "ぼやけた写真でも使えますか？",
            a: "ぼやけた・暗い写真では分析が難しくなります。最良の結果を得るには、明るい照明下での鮮明な画像をご使用ください。",
          },
          {
            q: "カロリーはどれくらい正確ですか？",
            a: "カロリーの推定は、標準的な栄養データベースと視覚的な検出に基づいています。概算であり、実際の食事を正確に反映しない場合があります。",
          },
          {
            q: "どんな食事でもアップロードできますか？",
            a: "はい。食べ物が画像内に見えており、利用規約に準拠している場合に限ります。",
          },
          {
            q: "データは安全ですか？",
            a: "はい。CalorieVisionとのすべての通信はHTTPSで暗号化されています。",
          },
          {
            q: "アドバイスは信頼できますか？",
            a: "アドバイスは一般的なものであり、医療的なものではありません。専門家の意見の代わりにはなりません。",
          },
          {
            q: "ダイエット目的ですか？",
            a: "必ずしもそうではありません。CalorieVisionは減量計画の処方ではなく、食事の学習・意識向上・理解を目的として設計されています。",
          },
          {
            q: "子どもも使えますか？",
            a: "はい。保護者の適切な監督のもとであれば使用できます。",
          },
          {
            q: "飲み物も検出できますか？",
            a: "写真に飲み物が写っていれば検出できますが、明確に見える食品の方が精度が高い傾向があります。",
          },
        ]
      : language === "de"
      ? [
          {
            q: "Ist CalorieVision genau?",
            a: "CalorieVision liefert ungefähre Ergebnisse basierend auf KI-Bildanalyse und Ernährungsreferenzdaten. Es ist kein medizinisch präzises Werkzeug und sollte nicht als exakte Messung behandelt werden.",
          },
          {
            q: "Speichern Sie meine Fotos?",
            a: "Nein. Ihre Fotos werden nicht gespeichert, geteilt oder zum Training von Modellen verwendet. Sie werden nur zur Analyse verarbeitet und dann verworfen.",
          },
          {
            q: "Ist dies ein medizinisches Werkzeug?",
            a: "Nein. CalorieVision ist ein Bildungswerkzeug und ersetzt keinen Arzt, Ernährungsberater oder Diätassistenten.",
          },
          {
            q: "Welche KI-Technologie verwenden Sie?",
            a: "Wir verwenden moderne Bilderkennungsmodelle, die Lebensmittel auf einem Foto erkennen und ungefähre Mengen schätzen können.",
          },
          {
            q: "Ist es kostenlos?",
            a: "Ja. CalorieVision ist für Benutzer völlig kostenlos.",
          },
          {
            q: "Kann ich es täglich nutzen?",
            a: "Absolut. Die App ist für den wiederholten, täglichen Bildungsgebrauch konzipiert.",
          },
          {
            q: "Verfolgt mich CalorieVision?",
            a: "Wir respektieren Ihre Privatsphäre. Es werden keine persönlichen Daten ohne Ihre Zustimmung erfasst.",
          },
          {
            q: "Funktioniert es mit unscharfen Fotos?",
            a: "Unscharfe oder dunkle Fotos erschweren die Analyse. Für die besten Ergebnisse verwenden Sie klare Bilder mit guter Beleuchtung.",
          },
          {
            q: "Wie genau sind die Kalorien?",
            a: "Kalorienschätzungen basieren auf Standard-Ernährungstabellen und visueller Erkennung. Sie sind ungefähr und spiegeln möglicherweise nicht genau Ihre Mahlzeit wider.",
          },
          {
            q: "Kann ich jede Mahlzeit hochladen?",
            a: "Ja, solange das Essen im Bild sichtbar ist und unseren Nutzungsbedingungen entspricht.",
          },
          {
            q: "Sind meine Daten sicher?",
            a: "Ja. Die gesamte Kommunikation mit CalorieVision ist über HTTPS verschlüsselt.",
          },
          {
            q: "Kann ich mich auf die Tipps verlassen?",
            a: "Die Tipps sind allgemein und nicht medizinisch. Sie ersetzen keine professionelle Beratung.",
          },
          {
            q: "Ist es zum Abnehmen?",
            a: "Nicht speziell. CalorieVision ist für das Lernen, die Bewusstseinsbildung und das Verstehen von Mahlzeiten konzipiert, nicht für die Verschreibung von Abnehmplänen.",
          },
          {
            q: "Können Kinder CalorieVision nutzen?",
            a: "Ja, unter angemessener Aufsicht eines Elternteils oder Erziehungsberechtigten.",
          },
          {
            q: "Erkennt es auch Getränke?",
            a: "CalorieVision kann Getränke erkennen, wenn sie im Foto sichtbar sind, aber die Ergebnisse sind zuverlässiger für deutlich sichtbare Lebensmittel.",
          },
        ]
      : [
          {
            q: "Is CalorieVision accurate?",
            a: "CalorieVision provides approximate results based on AI image analysis and nutrition reference data. It is not medically precise and should not be treated as an exact measurement.",
          },
          {
            q: "Do you store my photos?",
            a: "No. Your photos are not saved, shared, or used for training. They are processed only to generate an analysis and then discarded.",
          },
          {
            q: "Is this a medical tool?",
            a: "No. CalorieVision is an educational tool and does not replace a doctor, dietitian, or nutritionist.",
          },
          {
            q: "What AI technology do you use?",
            a: "We use modern image-recognition models capable of detecting foods in a photo and estimating approximate quantities.",
          },
          {
            q: "Is this free?",
            a: "Yes. CalorieVision is completely free for users.",
          },
          {
            q: "Can I use it every day?",
            a: "Absolutely. The app is designed for repeated, everyday educational use.",
          },
          {
            q: "Does CalorieVision track me?",
            a: "We respect your privacy. No personal data is collected without your consent.",
          },
          {
            q: "Will it work with blurry photos?",
            a: "Blurry or dark photos make analysis harder. For the best results, use clear images with good lighting.",
          },
          {
            q: "How accurate are the calories?",
            a: "Calorie estimates are based on standard nutrition tables and visual detection. They are approximate and may not reflect your exact meal.",
          },
          {
            q: "Can I upload any meal?",
            a: "Yes, as long as the food is visible in the image and complies with our terms of use.",
          },
          {
            q: "Is my data safe?",
            a: "Yes. All communication with CalorieVision is encrypted via HTTPS.",
          },
          {
            q: "Can I rely on the advice?",
            a: "Tips are general and non-medical. They are not a substitute for professional advice.",
          },
          {
            q: "Is it for weight loss?",
            a: "Not specifically. CalorieVision is designed for learning, awareness, and understanding meals rather than prescribing weight-loss plans.",
          },
          {
            q: "Can children use CalorieVision?",
            a: "Yes, under appropriate supervision from a parent or guardian.",
          },
          {
            q: "Does it detect drinks?",
            a: "CalorieVision may detect drinks if they are visible in the photo, but results are more reliable for clearly visible foods.",
          },
        ];

  usePageMetadata({
    title: t(
      "CalorieVision FAQ – Common Questions Answered",
      "FAQ CalorieVision – Questions fréquentes",
      "Preguntas frecuentes de CalorieVision",
      "FAQ CalorieVision – Perguntas frequentes",
      "CalorieVision 常见问题解答",
      "الأسئلة الشائعة حول CalorieVision – إجابات واضحة",
      "FAQ CalorieVision – Domande frequenti",
      "CalorieVision FAQ – Häufig gestellte Fragen",
      "CalorieVision FAQ – Veelgestelde vragen",
      "CalorieVision FAQ – Ответы на частые вопросы",
      "CalorieVision よくある質問",
    ),
    description: t(
      "Get answers about accuracy, privacy, AI technology, and how to use CalorieVision safely and effectively.",
      "Obtenez des réponses sur la précision, la confidentialité, la technologie d'IA et la manière d'utiliser CalorieVision de façon sûre et efficace.",
      "Obtén respuestas sobre precisión, privacidad, tecnología de IA y cómo usar CalorieVision de forma segura y eficaz.",
      "Encontre respostas sobre precisão, privacidade, tecnologia de IA e como utilizar o CalorieVision de forma segura e eficaz.",
      "获取有关准确性、隐私、AI技术以及如何安全有效地使用CalorieVision的答案。",
      "اكتشف إجابات حول الدقة، الخصوصية، تقنية الذكاء الاصطناعي، وكيفية استخدام CalorieVision بطريقة آمنة وفعّالة.",
      "Trova risposte su precisione, privacy, tecnologia IA e come utilizzare CalorieVision in modo sicuro ed efficace.",
      "Erhalten Sie Antworten zu Genauigkeit, Datenschutz, KI-Technologie und wie Sie CalorieVision sicher und effektiv nutzen.",
      "Krijg antwoorden over nauwkeurigheid, privacy, AI-technologie en hoe u CalorieVision veilig en effectief kunt gebruiken.",
      "Точность, конфиденциальность, ИИ-технологии и безопасное использование CalorieVision — всё здесь.",
      "精度・プライバシー・AI技術・安全な使い方についての回答をまとめました。",
    ),
    path: "/faq",
  });

  // FAQ Schema structured data for SEO
  const faqSchema = useMemo(() => ({
    "@type": "FAQPage",
    "mainEntity": faqs.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  }), [faqs]);

  useStructuredData(faqSchema);

  return (
    <section className="section-card">
      <p className="eyebrow">
        {t("Support", "Support", "Soporte", "Suporte", "支持", "الدعم والمساعدة", "Supporto", "Support", "Ondersteuning", "Поддержка", "サポート")}
      </p>
      <h1 className="mb-3 text-3xl font-semibold md:text-4xl">
        {t(
          "Frequently Asked Questions",
          "Foire aux questions",
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
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground md:text-base">
        {t(
          "Find quick answers about how CalorieVision works, what to expect from the AI, and how we protect your privacy.",
          "Trouvez des réponses rapides sur le fonctionnement de CalorieVision, ce qu'il faut attendre de l'IA et la manière dont nous protégeons votre vie privée.",
          "Encuentra respuestas rápidas sobre cómo funciona CalorieVision, qué puedes esperar de la IA y cómo protegemos tu privacidad.",
          "Encontre respostas rápidas sobre como o CalorieVision funciona, o que esperar da IA e como protegemos a sua privacidade.",
          "快速了解CalorieVision的工作原理、AI的功能以及我们如何保护您的隐私。",
          "احصل على إجابات سريعة حول كيفية عمل CalorieVision، وما يمكنك توقعه من الذكاء الاصطناعي، وكيف نحمي خصوصيتك.",
          "Trova risposte rapide su come funziona CalorieVision, cosa aspettarti dall'IA e come proteggiamo la tua privacy.",
          "Finden Sie schnelle Antworten darüber, wie CalorieVision funktioniert, was Sie von der KI erwarten können und wie wir Ihre Privatsphäre schützen.",
          "Vind snelle antwoorden over hoe CalorieVision werkt, wat u van de AI kunt verwachten en hoe wij uw privacy beschermen.",
          "Быстрые ответы о том, как работает CalorieVision, чего ожидать от ИИ и как мы защищаем вашу конфиденциальность.",
          "CalorieVisionの仕組み、AIへの期待、そしてプライバシーの保護について素早く回答を確認できます。",
        )}
      </p>

      <dl className="space-y-4 md:space-y-5">
        {faqs.map((item) => (
          <div key={item.q} className="rounded-2xl bg-secondary/60 p-4">
            <dt className="text-sm font-semibold md:text-base">{item.q}</dt>
            <dd className="mt-1 text-sm text-muted-foreground md:text-base">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default Faq;
