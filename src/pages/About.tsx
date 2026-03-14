import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { language } = useLanguage();
  
  usePageMetadata({
    title: "About CalorieVision - Our Mission & Story",
    description: "Learn about CalorieVision's mission to make nutrition awareness simple and accessible through AI-powered food photo analysis."
  });

  // Translation helper - same pattern as HowItWorks, FAQ, Contact
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

  const handleSupportEmailClick = (e: any) => {
    // Some browsers/environments open `mailto:` in a blank tab (about:blank).
    // Force it to be handled in the current context.
    e.preventDefault();
    window.location.href = "mailto:support@calorievision.online";
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-4 text-foreground">
          {t(
            "About CalorieVision",
            "À propos de CalorieVision",
            "Acerca de CalorieVision",
            "Sobre o CalorieVision",
            "关于 CalorieVision",
            "حول CalorieVision",
            "Informazioni su CalorieVision",
            "Über CalorieVision",
            "Over CalorieVision"
          )}
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-8">
          <strong>
            {t(
              "Making nutrition awareness simple, accessible, and educational for everyone.",
              "Rendre la sensibilisation à la nutrition simple, accessible et éducative pour tous.",
              "Haciendo que la conciencia nutricional sea simple, accesible y educativa para todos.",
              "Tornando a consciência nutricional simples, acessível e educativa para todos.",
              "让每个人都能简单、便捷、有教育意义地了解营养。",
              "جعل الوعي الغذائي بسيطًا ومتاحًا وتعليميًا للجميع.",
              "Rendere la consapevolezza nutrizionale semplice, accessibile ed educativa per tutti.",
              "Ernährungsbewusstsein einfach, zugänglich und lehrreich für alle machen.",
              "Voedingsbewustzijn eenvoudig, toegankelijk en leerzaam maken voor iedereen."
            )}
          </strong>
        </p>

        <hr className="my-8 border-border" />

        {/* Our Mission */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Our Mission", "Notre Mission", "Nuestra Misión", "Nossa Missão", "我们的使命", "مهمتنا", "La Nostra Missione", "Unsere Mission", "Onze Missie")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "At CalorieVision, we believe that understanding what you eat shouldn't be complicated. Our mission is to make nutrition awareness accessible to everyone through the power of artificial intelligence, without the hassle of manual food logging or complicated tracking apps.",
            "Chez CalorieVision, nous croyons que comprendre ce que vous mangez ne devrait pas être compliqué. Notre mission est de rendre la sensibilisation à la nutrition accessible à tous grâce à l'intelligence artificielle, sans les tracas de la saisie manuelle ou des applications de suivi compliquées.",
            "En CalorieVision, creemos que entender lo que comes no debería ser complicado. Nuestra misión es hacer que la conciencia nutricional sea accesible para todos a través de la inteligencia artificial, sin la molestia del registro manual de alimentos o aplicaciones de seguimiento complicadas.",
            "Na CalorieVision, acreditamos que entender o que você come não deveria ser complicado. Nossa missão é tornar a consciência nutricional acessível a todos através da inteligência artificial, sem o incômodo do registro manual de alimentos ou aplicativos de rastreamento complicados.",
            "在 CalorieVision，我们相信了解您所吃的食物不应该是复杂的。我们的使命是通过人工智能的力量让每个人都能了解营养，而无需手动记录食物或使用复杂的追踪应用程序。",
            "في CalorieVision، نؤمن أن فهم ما تأكله لا ينبغي أن يكون معقدًا. مهمتنا هي جعل الوعي الغذائي متاحًا للجميع من خلال قوة الذكاء الاصطناعي، دون متاعب تسجيل الطعام يدويًا أو تطبيقات التتبع المعقدة.",
            "Noi di CalorieVision crediamo che capire cosa mangi non dovrebbe essere complicato. La nostra missione è rendere la consapevolezza nutrizionale accessibile a tutti attraverso l'intelligenza artificiale, senza il fastidio della registrazione manuale degli alimenti o delle app di tracciamento complicate.",
            "Bei CalorieVision glauben wir, dass das Verständnis dessen, was Sie essen, nicht kompliziert sein sollte. Unsere Mission ist es, das Ernährungsbewusstsein durch künstliche Intelligenz für alle zugänglich zu machen, ohne den Aufwand manueller Lebensmittelprotokollierung oder komplizierter Tracking-Apps.",
            "Bij CalorieVision geloven we dat begrijpen wat je eet niet ingewikkeld hoeft te zijn. Onze missie is om voedingsbewustzijn toegankelijk te maken voor iedereen door middel van kunstmatige intelligentie, zonder het gedoe van handmatige voedselregistratie of ingewikkelde tracking-apps."
          )}
        </p>
        <p className="text-muted-foreground mb-4">
          {t(
            "We're here to help you build a healthier relationship with food — not by judging what you eat, but by giving you the information to make your own informed choices.",
            "Nous sommes là pour vous aider à construire une relation plus saine avec la nourriture — non pas en jugeant ce que vous mangez, mais en vous donnant les informations pour faire vos propres choix éclairés.",
            "Estamos aquí para ayudarte a construir una relación más saludable con la comida — no juzgando lo que comes, sino dándote la información para tomar tus propias decisiones informadas.",
            "Estamos aqui para ajudá-lo a construir uma relação mais saudável com a comida — não julgando o que você come, mas fornecendo informações para que você faça suas próprias escolhas informadas.",
            "我们在这里帮助您与食物建立更健康的关系——不是评判您吃什么，而是为您提供信息，让您做出明智的选择。",
            "نحن هنا لمساعدتك في بناء علاقة أكثر صحة مع الطعام — ليس من خلال الحكم على ما تأكله، ولكن من خلال إعطائك المعلومات لاتخاذ خياراتك المستنيرة.",
            "Siamo qui per aiutarti a costruire un rapporto più sano con il cibo — non giudicando cosa mangi, ma dandoti le informazioni per fare le tue scelte consapevoli.",
            "Wir sind hier, um Ihnen zu helfen, eine gesündere Beziehung zum Essen aufzubauen — nicht indem wir beurteilen, was Sie essen, sondern indem wir Ihnen die Informationen geben, um Ihre eigenen fundierten Entscheidungen zu treffen.",
            "We zijn hier om je te helpen een gezondere relatie met eten op te bouwen — niet door te oordelen over wat je eet, maar door je de informatie te geven om je eigen geïnformeerde keuzes te maken."
          )}
        </p>

        <hr className="my-8 border-border" />

        {/* Our Story */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Our Story", "Notre Histoire", "Nuestra Historia", "Nossa História", "我们的故事", "قصتنا", "La Nostra Storia", "Unsere Geschichte", "Ons Verhaal")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "CalorieVision was born from a simple frustration: traditional calorie counting is tedious, time-consuming, and often inaccurate.",
            "CalorieVision est né d'une simple frustration : le comptage traditionnel des calories est fastidieux, chronophage et souvent imprécis.",
            "CalorieVision nació de una simple frustración: el conteo tradicional de calorías es tedioso, consume mucho tiempo y a menudo es inexacto.",
            "CalorieVision nasceu de uma simples frustração: a contagem tradicional de calorias é tediosa, demorada e frequentemente imprecisa.",
            "CalorieVision 源于一个简单的困扰：传统的卡路里计算既繁琐、耗时，而且经常不准确。",
            "ولدت CalorieVision من إحباط بسيط: حساب السعرات الحرارية التقليدي ممل ويستغرق وقتًا طويلاً وغالبًا ما يكون غير دقيق.",
            "CalorieVision è nato da una semplice frustrazione: il conteggio tradizionale delle calorie è noioso, richiede tempo e spesso è impreciso.",
            "CalorieVision entstand aus einer einfachen Frustration: Traditionelles Kalorienzählen ist mühsam, zeitaufwendig und oft ungenau.",
            "CalorieVision ontstond uit een simpele frustratie: traditioneel calorieën tellen is vervelend, tijdrovend en vaak onnauwkeurig."
          )}
        </p>
        <p className="text-muted-foreground mb-4">
          <em>
            {t(
              "What if you could just take a photo of your meal and instantly get a nutritional estimate?",
              "Et si vous pouviez simplement prendre une photo de votre repas et obtenir instantanément une estimation nutritionnelle ?",
              "¿Y si pudieras simplemente tomar una foto de tu comida y obtener instantáneamente una estimación nutricional?",
              "E se você pudesse simplesmente tirar uma foto da sua refeição e obter instantaneamente uma estimativa nutricional?",
              "如果您只需拍一张餐食照片就能立即获得营养估算呢？",
              "ماذا لو كان بإمكانك فقط التقاط صورة لوجبتك والحصول على تقدير غذائي فوري؟",
              "E se potessi semplicemente scattare una foto del tuo pasto e ottenere istantaneamente una stima nutrizionale?",
              "Was wäre, wenn Sie einfach ein Foto Ihrer Mahlzeit machen und sofort eine Nährwertschätzung erhalten könnten?",
              "Wat als je gewoon een foto van je maaltijd kon maken en direct een voedingsschatting kon krijgen?"
            )}
          </em>
        </p>
        <p className="text-muted-foreground mb-4">
          {t(
            "That question led us to build CalorieVision — an AI-powered tool that analyzes food photos and provides educational calorie estimates in seconds. No accounts, no complicated logging, no judgment. Just quick, simple nutritional awareness.",
            "Cette question nous a conduit à créer CalorieVision — un outil alimenté par l'IA qui analyse les photos de nourriture et fournit des estimations caloriques éducatives en quelques secondes. Pas de comptes, pas de journalisation compliquée, pas de jugement. Juste une sensibilisation nutritionnelle rapide et simple.",
            "Esa pregunta nos llevó a crear CalorieVision — una herramienta impulsada por IA que analiza fotos de comida y proporciona estimaciones calóricas educativas en segundos. Sin cuentas, sin registro complicado, sin juicios. Solo conciencia nutricional rápida y simple.",
            "Essa pergunta nos levou a criar CalorieVision — uma ferramenta alimentada por IA que analisa fotos de comida e fornece estimativas calóricas educativas em segundos. Sem contas, sem registro complicado, sem julgamentos. Apenas consciência nutricional rápida e simples.",
            "这个问题促使我们创建了 CalorieVision——一个由 AI 驱动的工具，可以分析食物照片并在几秒钟内提供教育性的卡路里估算。无需账户、无需复杂的记录、无需评判。只是快速、简单的营养意识。",
            "هذا السؤال قادنا لبناء CalorieVision — أداة مدعومة بالذكاء الاصطناعي تحلل صور الطعام وتوفر تقديرات السعرات الحرارية التعليمية في ثوانٍ. لا حسابات، لا تسجيل معقد، لا حكم. فقط وعي غذائي سريع وبسيط.",
            "Quella domanda ci ha portato a creare CalorieVision — uno strumento basato sull'IA che analizza le foto del cibo e fornisce stime caloriche educative in pochi secondi. Nessun account, nessuna registrazione complicata, nessun giudizio. Solo una consapevolezza nutrizionale rapida e semplice.",
            "Diese Frage führte uns dazu, CalorieVision zu entwickeln — ein KI-gestütztes Tool, das Lebensmittelfotos analysiert und in Sekunden lehrreiche Kalorienschätzungen liefert. Keine Konten, keine komplizierte Protokollierung, kein Urteil. Nur schnelles, einfaches Ernährungsbewusstsein.",
            "Die vraag bracht ons ertoe CalorieVision te bouwen — een door AI aangedreven tool die voedselfoto's analyseert en in seconden educatieve calorieënschattingen geeft. Geen accounts, geen ingewikkelde registratie, geen oordeel. Gewoon snel, eenvoudig voedingsbewustzijn."
          )}
        </p>

        <hr className="my-8 border-border" />

        {/* Who We Are */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Who We Are", "Qui Nous Sommes", "Quiénes Somos", "Quem Somos", "我们是谁", "من نحن", "Chi Siamo", "Wer Wir Sind", "Wie We Zijn")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "CalorieVision is developed and maintained by an independent digital project team passionate about health technology and artificial intelligence.",
            "CalorieVision est développé et maintenu par une équipe de projet numérique indépendante passionnée par la technologie de la santé et l'intelligence artificielle.",
            "CalorieVision es desarrollado y mantenido por un equipo de proyectos digitales independiente apasionado por la tecnología de la salud y la inteligencia artificial.",
            "CalorieVision é desenvolvido e mantido por uma equipe de projetos digitais independente apaixonada por tecnologia de saúde e inteligência artificial.",
            "CalorieVision 由一个热衷于健康技术和人工智能的独立数字项目团队开发和维护。",
            "يتم تطوير وصيانة CalorieVision بواسطة فريق مشروع رقمي مستقل متحمس لتكنولوجيا الصحة والذكاء الاصطناعي.",
            "CalorieVision è sviluppato e mantenuto da un team di progetto digitale indipendente appassionato di tecnologia sanitaria e intelligenza artificiale.",
            "CalorieVision wird von einem unabhängigen digitalen Projektteam entwickelt und gepflegt, das sich für Gesundheitstechnologie und künstliche Intelligenz begeistert.",
            "CalorieVision wordt ontwikkeld en onderhouden door een onafhankelijk digitaal projectteam dat gepassioneerd is door gezondheidstechnologie en kunstmatige intelligentie."
          )}
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
          {t("Meet Our Founder", "Rencontrez Notre Fondateur", "Conoce a Nuestro Fundador", "Conheça Nosso Fundador", "认识我们的创始人", "تعرف على مؤسسنا", "Incontra il Nostro Fondatore", "Lernen Sie Unseren Gründer Kennen", "Ontmoet Onze Oprichter")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t(
            "CalorieVision was founded by a team of technology enthusiasts and nutrition advocates who saw a gap in how people interact with food information. After years of struggling with complicated calorie tracking apps and inaccurate food databases, our founder envisioned a simpler solution: just take a photo and learn.",
            "CalorieVision a été fondé par une équipe de passionnés de technologie et de défenseurs de la nutrition qui ont vu un fossé dans la façon dont les gens interagissent avec les informations alimentaires. Après des années de lutte avec des applications de suivi des calories compliquées et des bases de données alimentaires imprécises, notre fondateur a imaginé une solution plus simple : prenez une photo et apprenez.",
            "CalorieVision fue fundado por un equipo de entusiastas de la tecnología y defensores de la nutrición que vieron una brecha en cómo las personas interactúan con la información alimentaria. Después de años de luchar con aplicaciones complicadas de seguimiento de calorías y bases de datos de alimentos inexactas, nuestro fundador imaginó una solución más simple: solo toma una foto y aprende.",
            "CalorieVision foi fundado por uma equipe de entusiastas de tecnologia e defensores da nutrição que viram uma lacuna em como as pessoas interagem com informações alimentares. Após anos lutando com aplicativos complicados de rastreamento de calorias e bancos de dados de alimentos imprecisos, nosso fundador imaginou uma solução mais simples: basta tirar uma foto e aprender.",
            "CalorieVision 由一群技术爱好者和营养倡导者创立，他们发现人们与食品信息互动的方式存在差距。在多年与复杂的卡路里追踪应用程序和不准确的食品数据库作斗争之后，我们的创始人设想了一个更简单的解决方案：只需拍照并学习。",
            "تأسست CalorieVision من قبل فريق من عشاق التكنولوجيا ومناصري التغذية الذين رأوا فجوة في كيفية تفاعل الناس مع معلومات الطعام. بعد سنوات من المعاناة مع تطبيقات تتبع السعرات الحرارية المعقدة وقواعد بيانات الطعام غير الدقيقة، تصور مؤسسنا حلاً أبسط: فقط التقط صورة وتعلم.",
            "CalorieVision è stato fondato da un team di appassionati di tecnologia e sostenitori della nutrizione che hanno visto una lacuna nel modo in cui le persone interagiscono con le informazioni alimentari. Dopo anni di lotta con app complicate per il conteggio delle calorie e database alimentari imprecisi, il nostro fondatore ha immaginato una soluzione più semplice: basta scattare una foto e imparare.",
            "CalorieVision wurde von einem Team von Technologie-Enthusiasten und Ernährungsbefürwortern gegründet, die eine Lücke in der Art und Weise sahen, wie Menschen mit Lebensmittelinformationen umgehen. Nach Jahren des Kampfes mit komplizierten Kalorienzähl-Apps und ungenauen Lebensmitteldatenbanken stellte sich unser Gründer eine einfachere Lösung vor: Einfach ein Foto machen und lernen.",
            "CalorieVision werd opgericht door een team van technologie-enthousiastelingen en voedingsadvocaten die een kloof zagen in hoe mensen omgaan met voedselinformatie. Na jaren van worstelen met ingewikkelde calorieëntelling-apps en onnauwkeurige voedseldatabases, bedacht onze oprichter een eenvoudigere oplossing: maak gewoon een foto en leer."
          )}
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
          {t("Our Core Values", "Nos Valeurs Fondamentales", "Nuestros Valores Fundamentales", "Nossos Valores Fundamentais", "我们的核心价值观", "قيمنا الأساسية", "I Nostri Valori Fondamentali", "Unsere Kernwerte", "Onze Kernwaarden")}
        </h3>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-1">
          <li><strong>{t("Tech Enthusiasts:", "Passionnés de Tech :", "Entusiastas de la Tecnología:", "Entusiastas de Tecnologia:", "技术爱好者：", "عشاق التكنولوجيا:", "Appassionati di Tecnologia:", "Tech-Enthusiasten:", "Tech Enthousiastelingen:")}</strong> {t("We love building tools that make life easier", "Nous adorons créer des outils qui simplifient la vie", "Nos encanta crear herramientas que facilitan la vida", "Adoramos criar ferramentas que facilitam a vida", "我们喜欢创建让生活更轻松的工具", "نحب بناء أدوات تجعل الحياة أسهل", "Amiamo creare strumenti che rendono la vita più facile", "Wir lieben es, Werkzeuge zu bauen, die das Leben erleichtern", "We houden van het bouwen van tools die het leven gemakkelijker maken")}</li>
          <li><strong>{t("Privacy Advocates:", "Défenseurs de la Vie Privée :", "Defensores de la Privacidad:", "Defensores da Privacidade:", "隐私倡导者：", "مناصرو الخصوصية:", "Sostenitori della Privacy:", "Datenschutz-Befürworter:", "Privacy Voorvechters:")}</strong> {t("We believe your data should stay yours", "Nous croyons que vos données doivent rester les vôtres", "Creemos que tus datos deben seguir siendo tuyos", "Acreditamos que seus dados devem permanecer seus", "我们相信您的数据应该属于您", "نؤمن أن بياناتك يجب أن تبقى ملكك", "Crediamo che i tuoi dati debbano rimanere tuoi", "Wir glauben, dass Ihre Daten Ihnen gehören sollten", "We geloven dat je gegevens van jou moeten blijven")}</li>
          <li><strong>{t("Health-Conscious:", "Soucieux de la Santé :", "Conscientes de la Salud:", "Conscientes da Saúde:", "健康意识：", "واعون صحياً:", "Attenti alla Salute:", "Gesundheitsbewusst:", "Gezondheidsbewust:")}</strong> {t("We care about making nutrition accessible", "Nous nous soucions de rendre la nutrition accessible", "Nos importa hacer la nutrición accesible", "Nos importamos em tornar a nutrição acessível", "我们关心让营养变得易于获取", "نهتم بجعل التغذية متاحة", "Ci preoccupiamo di rendere la nutrizione accessibile", "Wir sorgen dafür, dass Ernährung zugänglich ist", "We geven om het toegankelijk maken van voeding")}</li>
          <li><strong>{t("Global Team:", "Équipe Mondiale :", "Equipo Global:", "Equipe Global:", "全球团队：", "فريق عالمي:", "Team Globale:", "Globales Team:", "Globaal Team:")}</strong> {t("We serve users worldwide, across all devices", "Nous servons des utilisateurs dans le monde entier, sur tous les appareils", "Servimos a usuarios en todo el mundo, en todos los dispositivos", "Servimos usuários em todo o mundo, em todos os dispositivos", "我们为全球用户提供服务，支持所有设备", "نخدم المستخدمين في جميع أنحاء العالم، عبر جميع الأجهزة", "Serviamo utenti in tutto il mondo, su tutti i dispositivi", "Wir bedienen Benutzer weltweit, auf allen Geräten", "We bedienen gebruikers wereldwijd, op alle apparaten")}</li>
          <li><strong>{t("Continuous Learners:", "Apprenants Continus :", "Aprendices Continuos:", "Aprendizes Contínuos:", "持续学习者：", "متعلمون مستمرون:", "Apprendisti Continui:", "Kontinuierliche Lernende:", "Continue Leerlingen:")}</strong> {t("We stay updated with the latest in AI and nutrition research", "Nous restons à jour avec les dernières avancées en IA et en recherche nutritionnelle", "Nos mantenemos actualizados con lo último en investigación de IA y nutrición", "Mantemo-nos atualizados com as últimas pesquisas em IA e nutrição", "我们紧跟 AI 和营养研究的最新进展", "نبقى على اطلاع بأحدث أبحاث الذكاء الاصطناعي والتغذية", "Rimaniamo aggiornati con le ultime ricerche in IA e nutrizione", "Wir bleiben auf dem neuesten Stand der KI- und Ernährungsforschung", "We blijven op de hoogte van het laatste onderzoek in AI en voeding")}</li>
        </ul>

        <hr className="my-8 border-border" />

        {/* Our Expertise */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Our Expertise", "Notre Expertise", "Nuestra Experiencia", "Nossa Expertise", "我们的专业知识", "خبرتنا", "La Nostra Competenza", "Unsere Expertise", "Onze Expertise")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "Behind CalorieVision is a dedicated team with deep expertise in artificial intelligence, software development, and nutritional education.",
            "Derrière CalorieVision se trouve une équipe dévouée avec une expertise approfondie en intelligence artificielle, développement logiciel et éducation nutritionnelle.",
            "Detrás de CalorieVision hay un equipo dedicado con profunda experiencia en inteligencia artificial, desarrollo de software y educación nutricional.",
            "Por trás do CalorieVision está uma equipe dedicada com profunda expertise em inteligência artificial, desenvolvimento de software e educação nutricional.",
            "CalorieVision 背后是一支在人工智能、软件开发和营养教育方面具有深厚专业知识的专注团队。",
            "وراء CalorieVision فريق متخصص يتمتع بخبرة عميقة في الذكاء الاصطناعي وتطوير البرمجيات والتعليم الغذائي.",
            "Dietro CalorieVision c'è un team dedicato con profonda competenza in intelligenza artificiale, sviluppo software ed educazione nutrizionale.",
            "Hinter CalorieVision steht ein engagiertes Team mit tiefgreifender Expertise in künstlicher Intelligenz, Softwareentwicklung und Ernährungsbildung.",
            "Achter CalorieVision staat een toegewijd team met diepgaande expertise in kunstmatige intelligentie, softwareontwikkeling en voedingseducatie."
          )}
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left text-foreground">{t("Area", "Domaine", "Área", "Área", "领域", "المجال", "Area", "Bereich", "Gebied")}</th>
                <th className="border border-border px-4 py-2 text-left text-foreground">{t("Our Expertise", "Notre Expertise", "Nuestra Experiencia", "Nossa Expertise", "我们的专业知识", "خبرتنا", "La Nostra Competenza", "Unsere Expertise", "Onze Expertise")}</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr>
                <td className="border border-border px-4 py-2">🤖 <strong>{t("Artificial Intelligence", "Intelligence Artificielle", "Inteligencia Artificial", "Inteligência Artificial", "人工智能", "الذكاء الاصطناعي", "Intelligenza Artificiale", "Künstliche Intelligenz", "Kunstmatige Intelligentie")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Advanced image recognition and machine learning models trained on diverse food datasets", "Reconnaissance d'images avancée et modèles d'apprentissage automatique entraînés sur des ensembles de données alimentaires diversifiés", "Reconocimiento de imágenes avanzado y modelos de aprendizaje automático entrenados en diversos conjuntos de datos alimentarios", "Reconhecimento de imagem avançado e modelos de aprendizado de máquina treinados em diversos conjuntos de dados alimentares", "先进的图像识别和在多样化食品数据集上训练的机器学习模型", "التعرف المتقدم على الصور ونماذج التعلم الآلي المدربة على مجموعات بيانات غذائية متنوعة", "Riconoscimento avanzato delle immagini e modelli di machine learning addestrati su diversi dataset alimentari", "Fortschrittliche Bilderkennung und maschinelle Lernmodelle, die auf vielfältigen Lebensmitteldatensätzen trainiert wurden", "Geavanceerde beeldherkenning en machine learning-modellen getraind op diverse voedingsdatasets")}</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">💻 <strong>{t("Software Development", "Développement Logiciel", "Desarrollo de Software", "Desenvolvimento de Software", "软件开发", "تطوير البرمجيات", "Sviluppo Software", "Softwareentwicklung", "Softwareontwikkeling")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Modern web technologies ensuring fast, reliable, and secure user experiences", "Technologies web modernes assurant des expériences utilisateur rapides, fiables et sécurisées", "Tecnologías web modernas que garantizan experiencias de usuario rápidas, confiables y seguras", "Tecnologias web modernas garantindo experiências de usuário rápidas, confiáveis e seguras", "现代网络技术确保快速、可靠和安全的用户体验", "تقنيات الويب الحديثة التي تضمن تجارب مستخدم سريعة وموثوقة وآمنة", "Tecnologie web moderne che garantiscono esperienze utente veloci, affidabili e sicure", "Moderne Webtechnologien, die schnelle, zuverlässige und sichere Benutzererfahrungen gewährleisten", "Moderne webtechnologieën die snelle, betrouwbare en veilige gebruikerservaringen garanderen")}</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">📊 <strong>{t("Data Science", "Science des Données", "Ciencia de Datos", "Ciência de Dados", "数据科学", "علم البيانات", "Scienza dei Dati", "Datenwissenschaft", "Data Science")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Statistical analysis and continuous model improvement based on real-world usage", "Analyse statistique et amélioration continue des modèles basée sur l'utilisation réelle", "Análisis estadístico y mejora continua del modelo basada en el uso del mundo real", "Análise estatística e melhoria contínua do modelo com base no uso do mundo real", "基于真实使用情况的统计分析和持续模型改进", "التحليل الإحصائي والتحسين المستمر للنماذج بناءً على الاستخدام الفعلي", "Analisi statistica e miglioramento continuo del modello basato sull'uso reale", "Statistische Analyse und kontinuierliche Modellverbesserung basierend auf der realen Nutzung", "Statistische analyse en continue modelverbetering op basis van gebruik in de echte wereld")}</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">🥗 <strong>{t("Nutrition Knowledge", "Connaissances Nutritionnelles", "Conocimiento Nutricional", "Conhecimento Nutricional", "营养知识", "المعرفة الغذائية", "Conoscenza Nutrizionale", "Ernährungswissen", "Voedingskennis")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Collaboration with nutritional databases and research-backed information sources", "Collaboration avec des bases de données nutritionnelles et des sources d'information fondées sur la recherche", "Colaboración con bases de datos nutricionales y fuentes de información respaldadas por investigación", "Colaboração com bancos de dados nutricionais e fontes de informação baseadas em pesquisas", "与营养数据库和以研究为基础的信息来源合作", "التعاون مع قواعد البيانات الغذائية ومصادر المعلومات المدعومة بالأبحاث", "Collaborazione con database nutrizionali e fonti di informazione basate sulla ricerca", "Zusammenarbeit mit Nährwertdatenbanken und forschungsgestützten Informationsquellen", "Samenwerking met voedingsdatabases en op onderzoek gebaseerde informatiebronnen")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
          {t("Our Commitment to Accuracy", "Notre Engagement envers la Précision", "Nuestro Compromiso con la Precisión", "Nosso Compromisso com a Precisão", "我们对准确性的承诺", "التزامنا بالدقة", "Il Nostro Impegno per la Precisione", "Unser Engagement für Genauigkeit", "Onze Toewijding aan Nauwkeurigheid")}
        </h3>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-1">
          <li><strong>{t("Research-Based Approach:", "Approche Fondée sur la Recherche :", "Enfoque Basado en Investigación:", "Abordagem Baseada em Pesquisa:", "基于研究的方法：", "نهج قائم على البحث:", "Approccio Basato sulla Ricerca:", "Forschungsbasierter Ansatz:", "Onderzoeksgerichte Aanpak:")}</strong> {t("All nutritional information is sourced from reputable databases and scientific research", "Toutes les informations nutritionnelles proviennent de bases de données réputées et de recherches scientifiques", "Toda la información nutricional proviene de bases de datos acreditadas e investigación científica", "Todas as informações nutricionais são provenientes de bancos de dados confiáveis e pesquisas científicas", "所有营养信息均来自权威数据库和科学研究", "جميع المعلومات الغذائية مصدرها قواعد بيانات موثوقة وأبحاث علمية", "Tutte le informazioni nutrizionali provengono da database affidabili e ricerche scientifiche", "Alle Nährwertinformationen stammen aus seriösen Datenbanken und wissenschaftlicher Forschung", "Alle voedingsinformatie is afkomstig uit gerenommeerde databases en wetenschappelijk onderzoek")}</li>
          <li><strong>{t("Continuous Improvement:", "Amélioration Continue :", "Mejora Continua:", "Melhoria Contínua:", "持续改进：", "التحسين المستمر:", "Miglioramento Continuo:", "Kontinuierliche Verbesserung:", "Continue Verbetering:")}</strong> {t("Our AI models are regularly updated and refined based on user feedback and new data", "Nos modèles d'IA sont régulièrement mis à jour et affinés en fonction des commentaires des utilisateurs et des nouvelles données", "Nuestros modelos de IA se actualizan y refinan regularmente en función de los comentarios de los usuarios y nuevos datos", "Nossos modelos de IA são regularmente atualizados e refinados com base no feedback dos usuários e novos dados", "我们的 AI 模型根据用户反馈和新数据定期更新和优化", "يتم تحديث وتحسين نماذج الذكاء الاصطناعي لدينا بانتظام بناءً على ملاحظات المستخدمين والبيانات الجديدة", "I nostri modelli di IA vengono regolarmente aggiornati e perfezionati in base al feedback degli utenti e ai nuovi dati", "Unsere KI-Modelle werden regelmäßig aktualisiert und basierend auf Benutzerfeedback und neuen Daten verfeinert", "Onze AI-modellen worden regelmatig bijgewerkt en verfijnd op basis van gebruikersfeedback en nieuwe gegevens")}</li>
          <li><strong>{t("Quality Assurance:", "Assurance Qualité :", "Garantía de Calidad:", "Garantia de Qualidade:", "质量保证：", "ضمان الجودة:", "Garanzia di Qualità:", "Qualitätssicherung:", "Kwaliteitsborging:")}</strong> {t("We implement rigorous testing to ensure consistent and reliable results", "Nous mettons en œuvre des tests rigoureux pour garantir des résultats cohérents et fiables", "Implementamos pruebas rigurosas para garantizar resultados consistentes y confiables", "Implementamos testes rigorosos para garantir resultados consistentes e confiáveis", "我们实施严格的测试以确保一致和可靠的结果", "نطبق اختبارات صارمة لضمان نتائج متسقة وموثوقة", "Implementiamo test rigorosi per garantire risultati coerenti e affidabili", "Wir führen rigorose Tests durch, um konsistente und zuverlässige Ergebnisse zu gewährleisten", "We implementeren rigoureuze tests om consistente en betrouwbare resultaten te garanderen")}</li>
          <li><strong>{t("Transparent Limitations:", "Limitations Transparentes :", "Limitaciones Transparentes:", "Limitações Transparentes:", "透明的局限性：", "قيود شفافة:", "Limitazioni Trasparenti:", "Transparente Einschränkungen:", "Transparante Beperkingen:")}</strong> {t("We clearly communicate what our AI can and cannot do", "Nous communiquons clairement ce que notre IA peut et ne peut pas faire", "Comunicamos claramente lo que nuestra IA puede y no puede hacer", "Comunicamos claramente o que nossa IA pode e não pode fazer", "我们清楚地说明我们的 AI 能做什么和不能做什么", "نوضح بوضوح ما يمكن وما لا يمكن للذكاء الاصطناعي لدينا فعله", "Comunichiamo chiaramente cosa la nostra IA può e non può fare", "Wir kommunizieren klar, was unsere KI kann und was nicht", "We communiceren duidelijk wat onze AI wel en niet kan doen")}</li>
        </ul>

        <hr className="my-8 border-border" />

        {/* Our Content Promise */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Our Content Promise", "Notre Promesse de Contenu", "Nuestra Promesa de Contenido", "Nossa Promessa de Conteúdo", "我们的内容承诺", "وعد المحتوى لدينا", "La Nostra Promessa sui Contenuti", "Unser Inhaltsversprechen", "Onze Content Belofte")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "We take our responsibility as an educational resource seriously. Here's what you can expect from CalorieVision:",
            "Nous prenons notre responsabilité en tant que ressource éducative au sérieux. Voici ce que vous pouvez attendre de CalorieVision :",
            "Tomamos en serio nuestra responsabilidad como recurso educativo. Esto es lo que puedes esperar de CalorieVision:",
            "Levamos a sério nossa responsabilidade como recurso educacional. Aqui está o que você pode esperar do CalorieVision:",
            "我们认真履行作为教育资源的责任。以下是您对 CalorieVision 的期望：",
            "نحن نأخذ مسؤوليتنا كمورد تعليمي على محمل الجد. إليك ما يمكنك توقعه من CalorieVision:",
            "Prendiamo sul serio la nostra responsabilità come risorsa educativa. Ecco cosa puoi aspettarti da CalorieVision:",
            "Wir nehmen unsere Verantwortung als Bildungsressource ernst. Hier ist, was Sie von CalorieVision erwarten können:",
            "We nemen onze verantwoordelijkheid als educatieve bron serieus. Dit is wat je van CalorieVision kunt verwachten:"
          )}
        </p>

        <div className="bg-muted/50 border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            📝 {t("Original & Well-Researched Content", "Contenu Original et Bien Documenté", "Contenido Original y Bien Investigado", "Conteúdo Original e Bem Pesquisado", "原创且深入研究的内容", "محتوى أصلي ومدروس جيداً", "Contenuti Originali e Ben Documentati", "Originelle und gut recherchierte Inhalte", "Originele en Goed Onderzochte Content")}
          </h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t("All articles and educational materials are 100% original, created by our team", "Tous les articles et matériels éducatifs sont 100% originaux, créés par notre équipe", "Todos los artículos y materiales educativos son 100% originales, creados por nuestro equipo", "Todos os artigos e materiais educacionais são 100% originais, criados pela nossa equipe", "所有文章和教育材料均为我们团队 100% 原创", "جميع المقالات والمواد التعليمية أصلية 100%، أنشأها فريقنا", "Tutti gli articoli e i materiali educativi sono originali al 100%, creati dal nostro team", "Alle Artikel und Bildungsmaterialien sind zu 100% original und von unserem Team erstellt", "Alle artikelen en educatieve materialen zijn 100% origineel, gemaakt door ons team")}</li>
            <li>{t("Content is thoroughly researched using reputable sources and nutritional databases", "Le contenu est minutieusement recherché à partir de sources réputées et de bases de données nutritionnelles", "El contenido está minuciosamente investigado utilizando fuentes acreditadas y bases de datos nutricionales", "O conteúdo é minuciosamente pesquisado usando fontes confiáveis e bancos de dados nutricionais", "使用权威来源和营养数据库进行深入研究", "يتم البحث في المحتوى بدقة باستخدام مصادر موثوقة وقواعد بيانات غذائية", "I contenuti sono accuratamente ricercati utilizzando fonti affidabili e database nutrizionali", "Inhalte werden gründlich recherchiert unter Verwendung seriöser Quellen und Nährwertdatenbanken", "Content wordt grondig onderzocht met behulp van gerenommeerde bronnen en voedingsdatabases")}</li>
            <li>{t("We never copy or plagiarize content from other sources", "Nous ne copions ni ne plagions jamais le contenu d'autres sources", "Nunca copiamos ni plagiamos contenido de otras fuentes", "Nunca copiamos ou plagiamos conteúdo de outras fontes", "我们从不复制或剽窃其他来源的内容", "لا ننسخ أو نسرق أبداً محتوى من مصادر أخرى", "Non copiamo mai né plagiamo contenuti da altre fonti", "Wir kopieren oder plagiieren niemals Inhalte aus anderen Quellen", "We kopiëren of plagiëren nooit content van andere bronnen")}</li>
          </ul>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            📚 {t("Educational Purpose", "But Éducatif", "Propósito Educativo", "Propósito Educacional", "教育目的", "الغرض التعليمي", "Scopo Educativo", "Bildungszweck", "Educatief Doel")}
          </h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t("Our content is designed to educate and inform, not to provide medical advice", "Notre contenu est conçu pour éduquer et informer, pas pour fournir des conseils médicaux", "Nuestro contenido está diseñado para educar e informar, no para proporcionar consejos médicos", "Nosso conteúdo é projetado para educar e informar, não para fornecer aconselhamento médico", "我们的内容旨在教育和提供信息，而非提供医疗建议", "تم تصميم محتوانا للتعليم والإعلام، وليس لتقديم نصائح طبية", "I nostri contenuti sono progettati per educare e informare, non per fornire consigli medici", "Unsere Inhalte sind dazu gedacht, zu bilden und zu informieren, nicht um medizinische Ratschläge zu geben", "Onze content is ontworpen om te onderwijzen en te informeren, niet om medisch advies te geven")}</li>
            <li>{t("We encourage users to consult healthcare professionals for personalized advice", "Nous encourageons les utilisateurs à consulter des professionnels de santé pour des conseils personnalisés", "Animamos a los usuarios a consultar a profesionales de la salud para obtener consejos personalizados", "Encorajamos os usuários a consultar profissionais de saúde para aconselhamento personalizado", "我们鼓励用户咨询医疗专业人员以获得个性化建议", "نشجع المستخدمين على استشارة متخصصي الرعاية الصحية للحصول على نصائح شخصية", "Incoraggiamo gli utenti a consultare professionisti sanitari per consigli personalizzati", "Wir ermutigen Benutzer, Gesundheitsfachleute für persönliche Beratung zu konsultieren", "We moedigen gebruikers aan om zorgprofessionals te raadplegen voor persoonlijk advies")}</li>
          </ul>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            🔄 {t("Regular Updates & Accuracy", "Mises à Jour Régulières et Précision", "Actualizaciones Regulares y Precisión", "Atualizações Regulares e Precisão", "定期更新和准确性", "تحديثات منتظمة ودقة", "Aggiornamenti Regolari e Precisione", "Regelmäßige Updates und Genauigkeit", "Regelmatige Updates en Nauwkeurigheid")}
          </h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>{t("We regularly review and update our content to ensure ongoing accuracy", "Nous révisons et mettons à jour régulièrement notre contenu pour garantir une précision continue", "Revisamos y actualizamos regularmente nuestro contenido para garantizar la precisión continua", "Revisamos e atualizamos regularmente nosso conteúdo para garantir precisão contínua", "我们定期审查和更新内容以确保持续的准确性", "نراجع ونحدث محتوانا بانتظام لضمان الدقة المستمرة", "Rivediamo e aggiorniamo regolarmente i nostri contenuti per garantire una precisione continua", "Wir überprüfen und aktualisieren regelmäßig unsere Inhalte, um kontinuierliche Genauigkeit zu gewährleisten", "We herzien en updaten regelmatig onze content om voortdurende nauwkeurigheid te garanderen")}</li>
            <li>{t("AI models are continuously improved based on the latest research and user feedback", "Les modèles d'IA sont continuellement améliorés en fonction des dernières recherches et des commentaires des utilisateurs", "Los modelos de IA se mejoran continuamente en función de las últimas investigaciones y comentarios de los usuarios", "Os modelos de IA são continuamente melhorados com base nas últimas pesquisas e feedback dos usuários", "AI 模型根据最新研究和用户反馈不断改进", "يتم تحسين نماذج الذكاء الاصطناعي باستمرار بناءً على أحدث الأبحاث وملاحظات المستخدمين", "I modelli di IA vengono continuamente migliorati in base alle ultime ricerche e al feedback degli utenti", "KI-Modelle werden kontinuierlich basierend auf der neuesten Forschung und Benutzerfeedback verbessert", "AI-modellen worden continu verbeterd op basis van het nieuwste onderzoek en gebruikersfeedback")}</li>
          </ul>
        </div>

        <hr className="my-8 border-border" />

        {/* What CalorieVision Does */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("What CalorieVision Does", "Ce que fait CalorieVision", "Lo que hace CalorieVision", "O que o CalorieVision faz", "CalorieVision 的功能", "ماذا يفعل CalorieVision", "Cosa fa CalorieVision", "Was CalorieVision macht", "Wat CalorieVision doet")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "CalorieVision is a free, AI-powered web application that helps you understand the nutritional content of your meals through photo analysis.",
            "CalorieVision est une application web gratuite alimentée par l'IA qui vous aide à comprendre le contenu nutritionnel de vos repas grâce à l'analyse de photos.",
            "CalorieVision es una aplicación web gratuita impulsada por IA que te ayuda a comprender el contenido nutricional de tus comidas a través del análisis de fotos.",
            "CalorieVision é um aplicativo web gratuito alimentado por IA que ajuda você a entender o conteúdo nutricional de suas refeições através da análise de fotos.",
            "CalorieVision 是一款免费的 AI 驱动 Web 应用程序，通过照片分析帮助您了解餐食的营养成分。",
            "CalorieVision هو تطبيق ويب مجاني مدعوم بالذكاء الاصطناعي يساعدك على فهم المحتوى الغذائي لوجباتك من خلال تحليل الصور.",
            "CalorieVision è un'applicazione web gratuita basata sull'IA che ti aiuta a comprendere il contenuto nutrizionale dei tuoi pasti attraverso l'analisi delle foto.",
            "CalorieVision ist eine kostenlose, KI-gestützte Webanwendung, die Ihnen hilft, den Nährwertgehalt Ihrer Mahlzeiten durch Fotoanalyse zu verstehen.",
            "CalorieVision is een gratis, door AI aangedreven webapplicatie die je helpt de voedingswaarde van je maaltijden te begrijpen door middel van foto-analyse."
          )}
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left text-foreground">{t("Feature", "Fonctionnalité", "Característica", "Recurso", "功能", "الميزة", "Funzionalità", "Funktion", "Functie")}</th>
                <th className="border border-border px-4 py-2 text-left text-foreground">{t("Description", "Description", "Descripción", "Descrição", "描述", "الوصف", "Descrizione", "Beschreibung", "Beschrijving")}</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr>
                <td className="border border-border px-4 py-2">📸 <strong>{t("Photo Upload", "Téléchargement de Photo", "Subida de Foto", "Upload de Foto", "照片上传", "تحميل الصورة", "Caricamento Foto", "Foto-Upload", "Foto Uploaden")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Upload or capture a photo of any meal", "Téléchargez ou capturez une photo de n'importe quel repas", "Sube o captura una foto de cualquier comida", "Faça upload ou capture uma foto de qualquer refeição", "上传或拍摄任何餐食的照片", "حمّل أو التقط صورة لأي وجبة", "Carica o scatta una foto di qualsiasi pasto", "Laden Sie ein Foto einer beliebigen Mahlzeit hoch oder machen Sie eines", "Upload of maak een foto van elke maaltijd")}</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">🤖 <strong>{t("AI Analysis", "Analyse IA", "Análisis IA", "Análise IA", "AI 分析", "تحليل الذكاء الاصطناعي", "Analisi IA", "KI-Analyse", "AI Analyse")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Our AI identifies foods and estimates portions", "Notre IA identifie les aliments et estime les portions", "Nuestra IA identifica los alimentos y estima las porciones", "Nossa IA identifica alimentos e estima porções", "我们的 AI 识别食物并估算份量", "يحدد الذكاء الاصطناعي لدينا الأطعمة ويقدر الحصص", "La nostra IA identifica i cibi e stima le porzioni", "Unsere KI identifiziert Lebensmittel und schätzt Portionen", "Onze AI identificeert voedsel en schat porties")}</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">📊 <strong>{t("Calorie Estimates", "Estimations Caloriques", "Estimaciones de Calorías", "Estimativas de Calorias", "卡路里估算", "تقديرات السعرات الحرارية", "Stime Caloriche", "Kalorienschätzungen", "Calorieën Schattingen")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Get approximate calories for your meal", "Obtenez des calories approximatives pour votre repas", "Obtén calorías aproximadas para tu comida", "Obtenha calorias aproximadas para sua refeição", "获取您餐食的大致卡路里", "احصل على السعرات الحرارية التقريبية لوجبتك", "Ottieni calorie approssimative per il tuo pasto", "Erhalten Sie ungefähre Kalorien für Ihre Mahlzeit", "Krijg geschatte calorieën voor je maaltijd")}</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">🌍 <strong>{t("Multi-Language", "Multi-Langues", "Multi-Idioma", "Multi-Idioma", "多语言", "متعدد اللغات", "Multi-Lingua", "Mehrsprachig", "Meertalig")}</strong></td>
                <td className="border border-border px-4 py-2">{t("Available in multiple languages", "Disponible en plusieurs langues", "Disponible en varios idiomas", "Disponível em vários idiomas", "支持多种语言", "متاح بعدة لغات", "Disponibile in più lingue", "In mehreren Sprachen verfügbar", "Beschikbaar in meerdere talen")}</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">🔒 <strong>{t("Privacy-First", "Confidentialité d'abord", "Privacidad Primero", "Privacidade em Primeiro", "隐私优先", "الخصوصية أولاً", "Privacy al Primo Posto", "Datenschutz zuerst", "Privacy Eerst")}</strong></td>
                <td className="border border-border px-4 py-2">{t("No account required, photos not stored", "Aucun compte requis, photos non stockées", "No se requiere cuenta, las fotos no se almacenan", "Sem necessidade de conta, fotos não armazenadas", "无需账户，照片不会被存储", "لا حاجة لحساب، الصور لا تُخزّن", "Nessun account richiesto, foto non memorizzate", "Kein Konto erforderlich, Fotos werden nicht gespeichert", "Geen account nodig, foto's worden niet opgeslagen")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr className="my-8 border-border" />

        {/* Privacy & Data Usage */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Privacy & Data Usage", "Confidentialité et Utilisation des Données", "Privacidad y Uso de Datos", "Privacidade e Uso de Dados", "隐私和数据使用", "الخصوصية واستخدام البيانات", "Privacy e Utilizzo dei Dati", "Datenschutz und Datennutzung", "Privacy en Datagebruik")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "User privacy is a core priority at CalorieVision. Your photos are processed in real-time and are not permanently stored on our servers.",
            "La confidentialité des utilisateurs est une priorité fondamentale chez CalorieVision. Vos photos sont traitées en temps réel et ne sont pas stockées de façon permanente sur nos serveurs.",
            "La privacidad del usuario es una prioridad fundamental en CalorieVision. Tus fotos se procesan en tiempo real y no se almacenan permanentemente en nuestros servidores.",
            "A privacidade do usuário é uma prioridade central no CalorieVision. Suas fotos são processadas em tempo real e não são armazenadas permanentemente em nossos servidores.",
            "用户隐私是 CalorieVision 的核心优先事项。您的照片会实时处理，不会永久存储在我们的服务器上。",
            "خصوصية المستخدم هي أولوية أساسية في CalorieVision. تتم معالجة صورك في الوقت الفعلي ولا يتم تخزينها بشكل دائم على خوادمنا.",
            "La privacy degli utenti è una priorità fondamentale in CalorieVision. Le tue foto vengono elaborate in tempo reale e non vengono memorizzate permanentemente sui nostri server.",
            "Die Privatsphäre der Benutzer hat bei CalorieVision oberste Priorität. Ihre Fotos werden in Echtzeit verarbeitet und nicht dauerhaft auf unseren Servern gespeichert.",
            "Privacy van gebruikers is een kernprioriteit bij CalorieVision. Je foto's worden in realtime verwerkt en worden niet permanent opgeslagen op onze servers."
          )}
        </p>
        <p className="text-muted-foreground mb-4">
          {t(
            "For full details, please refer to our Privacy Policy and Cookie Policy.",
            "Pour plus de détails, veuillez consulter notre Politique de Confidentialité et notre Politique de Cookies.",
            "Para más detalles, consulta nuestra Política de Privacidad y Política de Cookies.",
            "Para mais detalhes, consulte nossa Política de Privacidade e Política de Cookies.",
            "有关详细信息，请参阅我们的隐私政策和 Cookie 政策。",
            "لمزيد من التفاصيل، يرجى الرجوع إلى سياسة الخصوصية وسياسة ملفات تعريف الارتباط الخاصة بنا.",
            "Per maggiori dettagli, consulta la nostra Informativa sulla Privacy e la Politica dei Cookie.",
            "Für vollständige Details lesen Sie bitte unsere Datenschutzrichtlinie und Cookie-Richtlinie.",
            "Voor volledige details, raadpleeg ons Privacybeleid en Cookiebeleid."
          )}
        </p>

        <hr className="my-8 border-border" />

        {/* Transparency & Limitations */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Transparency & Limitations", "Transparence et Limitations", "Transparencia y Limitaciones", "Transparência e Limitações", "透明度和局限性", "الشفافية والقيود", "Trasparenza e Limitazioni", "Transparenz und Einschränkungen", "Transparantie en Beperkingen")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "We believe in being completely honest about what CalorieVision is — and what it isn't.",
            "Nous croyons qu'il est important d'être complètement honnête sur ce qu'est CalorieVision — et ce qu'il n'est pas.",
            "Creemos en ser completamente honestos sobre lo que es CalorieVision — y lo que no es.",
            "Acreditamos em ser completamente honestos sobre o que o CalorieVision é — e o que não é.",
            "我们相信完全诚实地说明 CalorieVision 是什么——以及它不是什么。",
            "نؤمن بالشفافية التامة حول ما هو CalorieVision — وما ليس كذلك.",
            "Crediamo nell'essere completamente onesti su cosa è CalorieVision — e cosa non è.",
            "Wir glauben daran, vollkommen ehrlich darüber zu sein, was CalorieVision ist — und was es nicht ist.",
            "We geloven in volledige eerlijkheid over wat CalorieVision is — en wat het niet is."
          )}
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
          {t("CalorieVision IS:", "CalorieVision EST :", "CalorieVision ES:", "CalorieVision É:", "CalorieVision 是：", "CalorieVision هو:", "CalorieVision È:", "CalorieVision IST:", "CalorieVision IS:")}
        </h3>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-1">
          <li>✅ {t("An educational tool for nutritional awareness", "Un outil éducatif pour la sensibilisation nutritionnelle", "Una herramienta educativa para la conciencia nutricional", "Uma ferramenta educacional para conscientização nutricional", "一个用于营养意识的教育工具", "أداة تعليمية للتوعية الغذائية", "Uno strumento educativo per la consapevolezza nutrizionale", "Ein Bildungswerkzeug für Ernährungsbewusstsein", "Een educatief hulpmiddel voor voedingsbewustzijn")}</li>
          <li>✅ {t("A quick way to get approximate calorie estimates", "Un moyen rapide d'obtenir des estimations caloriques approximatives", "Una forma rápida de obtener estimaciones aproximadas de calorías", "Uma maneira rápida de obter estimativas aproximadas de calorias", "一种快速获取大致卡路里估算的方法", "طريقة سريعة للحصول على تقديرات السعرات الحرارية التقريبية", "Un modo rapido per ottenere stime caloriche approssimative", "Eine schnelle Möglichkeit, ungefähre Kalorienschätzungen zu erhalten", "Een snelle manier om geschatte calorieën te krijgen")}</li>
          <li>✅ {t("A free resource for anyone curious about nutrition", "Une ressource gratuite pour quiconque est curieux de la nutrition", "Un recurso gratuito para cualquiera curioso sobre nutrición", "Um recurso gratuito para qualquer pessoa curiosa sobre nutrição", "一个供任何对营养感兴趣的人使用的免费资源", "مورد مجاني لأي شخص فضولي حول التغذية", "Una risorsa gratuita per chiunque sia curioso della nutrizione", "Eine kostenlose Ressource für alle, die an Ernährung interessiert sind", "Een gratis bron voor iedereen die nieuwsgierig is naar voeding")}</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
          {t("CalorieVision is NOT:", "CalorieVision N'EST PAS :", "CalorieVision NO ES:", "CalorieVision NÃO É:", "CalorieVision 不是：", "CalorieVision ليس:", "CalorieVision NON È:", "CalorieVision IST NICHT:", "CalorieVision IS NIET:")}
        </h3>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-1">
          <li>❌ {t("A medical service or device", "Un service ou dispositif médical", "Un servicio o dispositivo médico", "Um serviço ou dispositivo médico", "医疗服务或设备", "خدمة أو جهاز طبي", "Un servizio o dispositivo medico", "Ein medizinischer Dienst oder Gerät", "Een medische dienst of apparaat")}</li>
          <li>❌ {t("A substitute for professional nutritional advice", "Un substitut aux conseils nutritionnels professionnels", "Un sustituto del asesoramiento nutricional profesional", "Um substituto para aconselhamento nutricional profissional", "专业营养建议的替代品", "بديل عن النصائح الغذائية المهنية", "Un sostituto del consiglio nutrizionale professionale", "Ein Ersatz für professionelle Ernährungsberatung", "Een vervanging voor professioneel voedingsadvies")}</li>
          <li>❌ {t("100% accurate (all estimates are approximations)", "100% précis (toutes les estimations sont des approximations)", "100% preciso (todas las estimaciones son aproximaciones)", "100% preciso (todas as estimativas são aproximações)", "100% 准确（所有估算都是近似值）", "دقيق 100% (جميع التقديرات تقريبية)", "Preciso al 100% (tutte le stime sono approssimazioni)", "100% genau (alle Schätzungen sind Näherungen)", "100% nauwkeurig (alle schattingen zijn benaderingen)")}</li>
        </ul>

        <hr className="my-8 border-border" />

        {/* Contact Us */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Contact Us", "Contactez-Nous", "Contáctenos", "Contate-Nos", "联系我们", "اتصل بنا", "Contattaci", "Kontaktieren Sie Uns", "Neem Contact Op")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "We'd love to hear from you! Whether you have questions, feedback, or suggestions, feel free to reach out.",
            "Nous serions ravis de vous entendre ! Que vous ayez des questions, des commentaires ou des suggestions, n'hésitez pas à nous contacter.",
            "¡Nos encantaría saber de ti! Ya sea que tengas preguntas, comentarios o sugerencias, no dudes en contactarnos.",
            "Adoraríamos ouvir de você! Seja com perguntas, feedback ou sugestões, sinta-se à vontade para entrar em contato.",
            "我们很乐意收到您的来信！无论您有问题、反馈还是建议，请随时联系我们。",
            "نحب أن نسمع منك! سواء كانت لديك أسئلة أو ملاحظات أو اقتراحات، لا تتردد في التواصل معنا.",
            "Ci piacerebbe sentirti! Che tu abbia domande, feedback o suggerimenti, non esitare a contattarci.",
            "Wir würden gerne von Ihnen hören! Ob Sie Fragen, Feedback oder Vorschläge haben, zögern Sie nicht, uns zu kontaktieren.",
            "We horen graag van je! Of je nu vragen, feedback of suggesties hebt, neem gerust contact met ons op."
          )}
        </p>
        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-1">
          <li>
            <strong>
              {t(
                "Email:",
                "E-mail :",
                "Correo:",
                "E-mail:",
                "电子邮件：",
                "البريد الإلكتروني:",
                "Email:",
                "E-Mail:",
                "E-mail:"
              )}
            </strong>{" "}
            <span className="select-all">support@calorievision.online</span>
            <span className="ml-2 text-sm text-muted-foreground">
              (
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@calorievision.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Gmail
              </a>
              {" | "}
              <a
                href="https://outlook.live.com/mail/0/deeplink/compose?to=support@calorievision.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Outlook
              </a>
              )
            </span>
          </li>
          <li>
            <strong>
              {t(
                "Website:",
                "Site Web :",
                "Sitio Web:",
                "Site:",
                "网站：",
                "الموقع:",
                "Sito Web:",
                "Website:",
                "Website:"
              )}
            </strong>{" "}
            <a
              href="https://calorievision.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              calorievision.online
            </a>
          </li>
          <li>
            <strong>
              {t(
                "Contact Page:",
                "Page de Contact :",
                "Página de Contacto:",
                "Página de Contato:",
                "联系页面：",
                "صفحة الاتصال:",
                "Pagina Contatti:",
                "Kontaktseite:",
                "Contactpagina:"
              )}
            </strong>{" "}
            <LocalizedNavLink to="/contact" className="text-primary hover:underline">
              calorievision.online/contact
            </LocalizedNavLink>
          </li>
        </ul>

        <hr className="my-8 border-border" />

        {/* Join Our Journey */}
        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
          {t("Join Our Journey", "Rejoignez Notre Aventure", "Únete a Nuestro Viaje", "Junte-se à Nossa Jornada", "加入我们的旅程", "انضم إلى رحلتنا", "Unisciti al Nostro Viaggio", "Begleiten Sie Unsere Reise", "Doe Mee aan Onze Reis")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t(
            "CalorieVision is constantly evolving. We're committed to improving our AI, adding new features, and making nutrition awareness even more accessible.",
            "CalorieVision évolue constamment. Nous nous engageons à améliorer notre IA, à ajouter de nouvelles fonctionnalités et à rendre la sensibilisation nutritionnelle encore plus accessible.",
            "CalorieVision está en constante evolución. Estamos comprometidos a mejorar nuestra IA, agregar nuevas funciones y hacer que la conciencia nutricional sea aún más accesible.",
            "CalorieVision está em constante evolução. Estamos comprometidos em melhorar nossa IA, adicionar novos recursos e tornar a consciência nutricional ainda mais acessível.",
            "CalorieVision 在不断发展。我们致力于改进我们的 AI，添加新功能，并使营养意识更加易于获取。",
            "يتطور CalorieVision باستمرار. نحن ملتزمون بتحسين الذكاء الاصطناعي لدينا، وإضافة ميزات جديدة، وجعل الوعي الغذائي أكثر سهولة.",
            "CalorieVision è in continua evoluzione. Ci impegniamo a migliorare la nostra IA, aggiungere nuove funzionalità e rendere la consapevolezza nutrizionale ancora più accessibile.",
            "CalorieVision entwickelt sich ständig weiter. Wir sind bestrebt, unsere KI zu verbessern, neue Funktionen hinzuzufügen und das Ernährungsbewusstsein noch zugänglicher zu machen.",
            "CalorieVision evolueert voortdurend. We zijn toegewijd aan het verbeteren van onze AI, het toevoegen van nieuwe functies en het nog toegankelijker maken van voedingsbewustzijn."
          )}
        </p>
        <p className="text-muted-foreground mb-4">
          <strong>
            {t(
              "Thank you for choosing CalorieVision. We're honored to be part of your journey toward better nutritional awareness.",
              "Merci d'avoir choisi CalorieVision. Nous sommes honorés de faire partie de votre parcours vers une meilleure sensibilisation nutritionnelle.",
              "Gracias por elegir CalorieVision. Nos sentimos honrados de ser parte de tu viaje hacia una mejor conciencia nutricional.",
              "Obrigado por escolher CalorieVision. Estamos honrados em fazer parte da sua jornada para uma melhor consciência nutricional.",
              "感谢您选择 CalorieVision。我们很荣幸能成为您迈向更好营养意识之旅的一部分。",
              "شكراً لاختيارك CalorieVision. نحن فخورون بأن نكون جزءاً من رحلتك نحو وعي غذائي أفضل.",
              "Grazie per aver scelto CalorieVision. Siamo onorati di far parte del tuo percorso verso una migliore consapevolezza nutrizionale.",
              "Vielen Dank, dass Sie sich für CalorieVision entschieden haben. Wir fühlen uns geehrt, Teil Ihrer Reise zu einem besseren Ernährungsbewusstsein zu sein.",
              "Bedankt voor het kiezen van CalorieVision. We zijn vereerd om deel uit te maken van je reis naar beter voedingsbewustzijn."
            )}
          </strong>
        </p>

        <hr className="my-8 border-border" />

        <p className="text-sm text-muted-foreground italic mb-4">
          {t("Last updated: January 2026", "Dernière mise à jour : janvier 2026", "Última actualización: enero 2026", "Última atualização: janeiro de 2026", "最后更新：2026年1月", "آخر تحديث: يناير 2026", "Ultimo aggiornamento: gennaio 2026", "Zuletzt aktualisiert: Januar 2026", "Laatst bijgewerkt: januari 2026")}
        </p>

        <hr className="my-8 border-border" />

        <p className="text-muted-foreground italic text-center">
          {t(
            "CalorieVision — Understand your meals. Simply.",
            "CalorieVision — Comprenez vos repas. Simplement.",
            "CalorieVision — Entiende tus comidas. Simplemente.",
            "CalorieVision — Entenda suas refeições. Simplesmente.",
            "CalorieVision — 了解您的餐食。简单。",
            "CalorieVision — افهم وجباتك. ببساطة.",
            "CalorieVision — Comprendi i tuoi pasti. Semplicemente.",
            "CalorieVision — Verstehen Sie Ihre Mahlzeiten. Einfach.",
            "CalorieVision — Begrijp je maaltijden. Simpelweg."
          )}
        </p>
      </div>
    </section>
  );
};

export default About;
