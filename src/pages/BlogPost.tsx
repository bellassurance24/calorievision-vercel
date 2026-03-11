import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useLanguage, Language } from '../contexts/LanguageContext';

// ── types ─────────────────────────────────────────────────────────────────────

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Walk every <h2> and <h3> in the HTML string, inject an id="" attribute so
 * the TOC can link to it, and return both the mutated HTML and the item list.
 */
function injectHeadingIds(html: string): { processedHtml: string; tocItems: TocItem[] } {
  const items: TocItem[] = [];
  let idx = 0;

  const processed = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi,
    (_m, tag: string, attrs: string, inner: string) => {
      // Strip any nested tags to get clean plain text for the TOC label
      const text = inner.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim();
      if (!text) return _m;
      const id = `toc-${idx++}`;
      items.push({ id, text, level: parseInt(tag[1], 10) as 2 | 3 });
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    },
  );

  return { processedHtml: processed, tocItems: items };
}

// Languages that are written right-to-left
const RTL_LANGS = new Set<Language>(['ar']);

// Map app language codes → BCP 47 locale strings for Intl.DateTimeFormat
const LOCALE_MAP: Partial<Record<Language, string>> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-BR',
  zh: 'zh-CN',
  ar: 'ar-SA',
  it: 'it-IT',
  de: 'de-DE',
  nl: 'nl-NL',
};

// ── component ─────────────────────────────────────────────────────────────────

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnFallback, setIsEnFallback] = useState(false);

  // ── data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsEnFallback(false);

    async function getPost() {
      if (!slug) { setLoading(false); return; }
      setLoading(true);

      try {
        // 1. Try the current language first
        let res = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('language', language)
          .eq('status', 'published')
          .maybeSingle();

        // 2. If no translation found, fall back to English
        if (!res.error && !res.data && language !== 'en') {
          res = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('language', 'en')
            .eq('status', 'published')
            .maybeSingle();

          if (!cancelled && !res.error && res.data) {
            setIsEnFallback(true);
          }
        }

        if (!cancelled && !res.error) setPost(res.data ?? null);
      } catch {
        // Supabase offline — post stays null, handled gracefully below
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getPost();
    return () => { cancelled = true; };
  }, [slug, language]);

  // ── derived values ──────────────────────────────────────────────────────────
  const { processedHtml, tocItems } = useMemo(
    () => injectHeadingIds(post?.content ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post?.content],
  );

  const isRtl    = RTL_LANGS.has(language);
  const blogPath = `/${language}/blog`;
  const locale   = LOCALE_MAP[language] ?? 'en-US';

  const coverImage = post?.featured_image_url || post?.image_url || null;
  const publishedAt = post?.published_at
    ? new Date(post.published_at).toLocaleDateString(locale, {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

  // ── loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        <p className="text-gray-500 text-lg">Loading article…</p>
      </div>
    );
  }

  // ── not found ───────────────────────────────────────────────────────────────
  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <Link to={blogPath} className="text-teal-600 font-semibold hover:underline">
          ← Back to Blog
        </Link>
        <span className="text-5xl">🔍</span>
        <h2 className="text-2xl font-bold text-gray-800">Article not found</h2>
        <p className="text-gray-500">This article may have been moved or is not yet translated.</p>
      </div>
    );
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 py-10"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Back link */}
      <Link
        to={blogPath}
        className="inline-flex items-center gap-1 text-teal-600 font-semibold hover:underline text-sm mb-6"
      >
        {isRtl ? '→' : '←'} Back to Blog
      </Link>

      {/* Title + date */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
        {post.title}
      </h1>
      {publishedAt && (
        <p className="text-sm text-gray-400 mb-6">{publishedAt}</p>
      )}

      {/* Hero image */}
      {coverImage && (
        <img
          src={coverImage}
          alt={post.title}
          className="w-full rounded-3xl object-cover max-h-[480px] shadow-2xl mt-4 mb-8"
        />
      )}

      {/* Translation fallback banner */}
      {isEnFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-8 flex items-start gap-2">
          <span>⚠️</span>
          <span>
            This article isn't available in <strong>{language.toUpperCase()}</strong> yet —
            showing the English version.
          </span>
        </div>
      )}

      {/* Table of Contents */}
      {tocItems.length > 0 && (
        <nav className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-10 not-prose">
          <h3 className="text-teal-900 font-bold text-base mb-4 flex items-center gap-2">
            ≡ Table of Contents
          </h3>
          <ol className="space-y-2 list-none m-0 p-0">
            {tocItems.map((item) => (
              <li
                key={item.id}
                className={item.level === 3 ? 'pl-5' : ''}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="text-teal-700 hover:text-teal-900 hover:underline text-sm leading-relaxed no-underline"
                >
                  {item.level === 2 ? '• ' : '◦ '}
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Article body — rendered as HTML via Tailwind Typography */}
      <article
        className="
          prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-20
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-teal-100
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
          prose-strong:text-gray-900
          prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
          prose-hr:border-teal-100 prose-hr:my-8
          prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto
          prose-ul:my-4 prose-ol:my-4 prose-li:my-1
          prose-blockquote:border-teal-400 prose-blockquote:text-gray-600
          prose-code:bg-gray-100 prose-code:rounded prose-code:px-1
        "
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </div>
  );
}
