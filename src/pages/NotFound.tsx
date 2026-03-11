import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const t = (en: string, fr: string, es: string, pt?: string, ar?: string, it?: string) => {
    if (language === "fr") return fr;
    if (language === "es") return es;
    if (language === "pt") return pt ?? en;
    if (language === "ar") return ar ?? en;
    if (language === "it") return it ?? en;
    return en;
  };
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          {t(
            "Oops! Page not found",
            "Oups ! Page introuvable",
            "¡Vaya! Página no encontrada",
            "Ups! Página não encontrada",
            "عذرًا، هذه الصفحة غير موجودة",
            "Ops! Pagina non trovata",
          )}
        </p>
        <a href="/" className="text-primary underline underline-offset-4 hover:text-primary/90">
          {t(
            "Return to Home",
            "Retour à l'accueil",
            "Volver a la página de inicio",
            "Voltar à página inicial",
            "العودة إلى الصفحة الرئيسية",
            "Torna alla home",
          )}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
