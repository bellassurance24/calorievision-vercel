/**
 * Blog UI translations
 * Add new keys here and they'll be available via useBlogT()
 */

import type { Language } from '@/contexts/LanguageContext';

interface BlogStrings {
  back: string;        // "Back to Blog"
  toc:  string;        // "Table of Contents"
  blogTitle: string;   // Blog index page title (h1)
  subtitle: string;    // Blog index subtitle
  noPosts:  string;    // Empty-state headline
  noPostsSub: string;  // Empty-state body
  loading:  string;    // Loading message
  fallback: string;    // "Not translated yet" banner
  notFound: string;    // 404 headline
  notFoundSub: string; // 404 body
}

const translations: Record<Language, BlogStrings> = {
  en: {
    back:        '← Back to Blog',
    toc:         'Table of Contents',
    blogTitle:   'Blog',
    subtitle:    'Tips, guides, and insights on nutrition and healthy eating.',
    noPosts:     'No posts found',
    noPostsSub:  'Check back soon for articles on nutrition and healthy eating.',
    loading:     'Loading…',
    fallback:    "This article isn't available in {lang} yet — showing the English version.",
    notFound:    'Article not found',
    notFoundSub: 'This article may have been moved or is not yet translated.',
  },
  ar: {
    back:        'العودة إلى المدونة →',
    toc:         'جدول المحتويات',
    blogTitle:   'المدونة',
    subtitle:    'نصائح وأدلة ورؤى حول التغذية والأكل الصحي.',
    noPosts:     'لا توجد مقالات',
    noPostsSub:  'تحقق مرة أخرى قريباً لمقالات حول التغذية.',
    loading:     'جارٍ التحميل…',
    fallback:    'هذا المقال غير متاح بـ {lang} بعد — يتم عرض النسخة الإنجليزية.',
    notFound:    'المقال غير موجود',
    notFoundSub: 'ربما تم نقل هذا المقال أو لم يتم ترجمته بعد.',
  },
  fr: {
    back:        '← Retour au Blog',
    toc:         'Table des matières',
    blogTitle:   'Blog',
    subtitle:    'Conseils, guides et analyses sur la nutrition et la santé.',
    noPosts:     'Aucun article trouvé',
    noPostsSub:  'Revenez bientôt pour des articles sur la nutrition.',
    loading:     'Chargement…',
    fallback:    "Cet article n'est pas encore disponible en {lang} — version anglaise affichée.",
    notFound:    'Article introuvable',
    notFoundSub: "Cet article a peut-être été déplacé ou n'est pas encore traduit.",
  },
  es: {
    back:        '← Volver al Blog',
    toc:         'Tabla de contenidos',
    blogTitle:   'Blog',
    subtitle:    'Consejos, guías y perspectivas sobre nutrición y alimentación saludable.',
    noPosts:     'No se encontraron artículos',
    noPostsSub:  'Vuelve pronto para artículos sobre nutrición.',
    loading:     'Cargando…',
    fallback:    'Este artículo aún no está disponible en {lang} — mostrando la versión en inglés.',
    notFound:    'Artículo no encontrado',
    notFoundSub: 'Este artículo puede haber sido movido o aún no está traducido.',
  },
  de: {
    back:        '← Zurück zum Blog',
    toc:         'Inhaltsverzeichnis',
    blogTitle:   'Blog',
    subtitle:    'Tipps, Anleitungen und Einblicke zu Ernährung und gesundem Essen.',
    noPosts:     'Keine Beiträge gefunden',
    noPostsSub:  'Schauen Sie bald wieder für Ernährungsartikel vorbei.',
    loading:     'Wird geladen…',
    fallback:    'Dieser Artikel ist noch nicht auf {lang} verfügbar — englische Version wird angezeigt.',
    notFound:    'Artikel nicht gefunden',
    notFoundSub: 'Dieser Artikel wurde möglicherweise verschoben oder ist noch nicht übersetzt.',
  },
  it: {
    back:        '← Torna al Blog',
    toc:         'Indice dei contenuti',
    blogTitle:   'Blog',
    subtitle:    'Consigli, guide e approfondimenti su nutrizione e alimentazione sana.',
    noPosts:     'Nessun articolo trovato',
    noPostsSub:  'Torna presto per articoli su nutrizione e alimentazione.',
    loading:     'Caricamento…',
    fallback:    "Questo articolo non è ancora disponibile in {lang} — viene mostrata la versione inglese.",
    notFound:    'Articolo non trovato',
    notFoundSub: 'Questo articolo potrebbe essere stato spostato o non è ancora tradotto.',
  },
  pt: {
    back:        '← Voltar ao Blog',
    toc:         'Índice',
    blogTitle:   'Blog',
    subtitle:    'Dicas, guias e insights sobre nutrição e alimentação saudável.',
    noPosts:     'Nenhum artigo encontrado',
    noPostsSub:  'Volte em breve para artigos sobre nutrição.',
    loading:     'Carregando…',
    fallback:    'Este artigo ainda não está disponível em {lang} — exibindo a versão em inglês.',
    notFound:    'Artigo não encontrado',
    notFoundSub: 'Este artigo pode ter sido movido ou ainda não foi traduzido.',
  },
  nl: {
    back:        '← Terug naar Blog',
    toc:         'Inhoudsopgave',
    blogTitle:   'Blog',
    subtitle:    'Tips, gidsen en inzichten over voeding en gezond eten.',
    noPosts:     'Geen artikelen gevonden',
    noPostsSub:  'Kom binnenkort terug voor artikelen over voeding.',
    loading:     'Laden…',
    fallback:    'Dit artikel is nog niet beschikbaar in {lang} — Engelse versie wordt getoond.',
    notFound:    'Artikel niet gevonden',
    notFoundSub: 'Dit artikel is mogelijk verplaatst of nog niet vertaald.',
  },
  ru: {
    back:        '← Назад в блог',
    toc:         'Оглавление',
    blogTitle:   'Блог',
    subtitle:    'Советы, руководства и аналитика о питании и здоровом образе жизни.',
    noPosts:     'Статьи не найдены',
    noPostsSub:  'Скоро здесь появятся статьи о питании.',
    loading:     'Загрузка…',
    fallback:    'Эта статья ещё недоступна на {lang} — показывается английская версия.',
    notFound:    'Статья не найдена',
    notFoundSub: 'Статья могла быть перемещена или ещё не переведена.',
  },
  zh: {
    back:        '← 回到博客',
    toc:         '目录',
    blogTitle:   '博客',
    subtitle:    '关于营养和健康饮食的技巧、指南和见解。',
    noPosts:     '未找到文章',
    noPostsSub:  '请稍后回来查看营养相关文章。',
    loading:     '加载中…',
    fallback:    '此文章尚未提供{lang}版本 — 正在显示英文版本。',
    notFound:    '文章未找到',
    notFoundSub: '此文章可能已被移动或尚未翻译。',
  },
  ja: {
    back:        '← ブログに戻る',
    toc:         '目次',
    blogTitle:   'ブログ',
    subtitle:    '栄養と健康的な食事に関するヒント、ガイド、インサイト。',
    noPosts:     '記事が見つかりません',
    noPostsSub:  '栄養に関する記事を近日公開予定です。',
    loading:     '読み込み中…',
    fallback:    'この記事はまだ{lang}で利用できません — 英語版を表示しています。',
    notFound:    '記事が見つかりません',
    notFoundSub: 'この記事は移動されたか、まだ翻訳されていない可能性があります。',
  },
};

export default translations;
