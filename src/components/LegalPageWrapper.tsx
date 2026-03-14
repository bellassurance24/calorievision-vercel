import { useLanguage, Language } from "@/contexts/LanguageContext";

interface LegalPageWrapperProps {
  children: React.ReactNode;
}

// Translations for the "This page is available in English only for legal purposes" notice
const legalNoticeTranslations: Record<Language, string> = {
  en: "", // No notice needed for English
  fr: "ℹ️ Cette page est disponible uniquement en anglais à des fins juridiques.",
  es: "ℹ️ Esta página está disponible solo en inglés por motivos legales.",
  pt: "ℹ️ Esta página está disponível apenas em inglês para fins legais.",
  zh: "ℹ️ 此页面仅以英文提供，用于法律目的。",
  ar: "ℹ️ هذه الصفحة متاحة باللغة الإنجليزية فقط لأغراض قانونية.",
  it: "ℹ️ Questa pagina è disponibile solo in inglese per motivi legali.",
  de: "ℹ️ Diese Seite ist aus rechtlichen Gründen nur auf Englisch verfügbar.",
  nl: "ℹ️ Deze pagina is alleen beschikbaar in het Engels voor juridische doeleinden.",
  ru: "ℹ️ Эта страница доступна только на английском языке в юридических целях.",
  ja: "ℹ️ このページは法的な理由により英語のみでご提供しています。",
};

/**
 * Wrapper component for legal pages that ensures proper RTL/LTR handling.
 * - Shows translated notice banner when viewing in non-English languages
 * - Forces LTR direction on English legal content regardless of page language
 */
export const LegalPageWrapper = ({ children }: LegalPageWrapperProps) => {
  const { language } = useLanguage();
  const isNonEnglish = language !== "en";
  const isArabic = language === "ar";
  const noticeText = legalNoticeTranslations[language];

  return (
    <>
      {/* Notice banner for non-English languages */}
      {isNonEnglish && noticeText && (
        <div 
          dir={isArabic ? "rtl" : "ltr"} 
          lang={language}
          className="container mx-auto max-w-4xl px-4 pt-16 pb-4"
        >
          <div className={`rounded-lg border border-primary/20 bg-primary/5 p-4 ${isArabic ? "text-right" : "text-left"}`}>
            <p className="text-sm text-primary md:text-base">
              {noticeText}
            </p>
          </div>
        </div>
      )}
      
      {/* English legal content - MUST BE LTR */}
      <section 
        dir="ltr" 
        lang="en"
        className={`container mx-auto max-w-4xl px-4 ${isNonEnglish ? "py-8" : "py-16"} text-left`}
        style={{ direction: 'ltr', textAlign: 'left' }}
      >
        {children}
      </section>
    </>
  );
};
