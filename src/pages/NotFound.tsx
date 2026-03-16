import { useLanguage } from "@/contexts/LanguageContext";

const translations: Record<string, { heading: string; link: string }> = {
  en: { heading: "Oops! Page not found",                    link: "Return to Home" },
  fr: { heading: "Oups ! Page introuvable",                 link: "Retour à l'accueil" },
  es: { heading: "¡Vaya! Página no encontrada",             link: "Volver a la página de inicio" },
  pt: { heading: "Ups! Página não encontrada",              link: "Voltar à página inicial" },
  ar: { heading: "عذرًا، هذه الصفحة غير موجودة",           link: "العودة إلى الصفحة الرئيسية" },
  it: { heading: "Ops! Pagina non trovata",                 link: "Torna alla home" },
  zh: { heading: "哎呀！页面未找到",                         link: "返回首页" },
  de: { heading: "Hoppla! Seite nicht gefunden",            link: "Zur Startseite" },
  nl: { heading: "Oeps! Pagina niet gevonden",              link: "Terug naar home" },
  ru: { heading: "Упс! Страница не найдена",                link: "Вернуться на главную" },
  ja: { heading: "おっと！ページが見つかりません",            link: "ホームに戻る" },
};

const NotFound = () => {
  const { language } = useLanguage();
  const t = translations[language] ?? translations["en"];

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t.heading}</p>
        <a href="/" className="text-primary underline underline-offset-4 hover:text-primary/90">
          {t.link}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
