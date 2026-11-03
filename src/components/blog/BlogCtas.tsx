import { Link, useLocation } from 'react-router-dom';
import { useBlogT } from '@/hooks/useBlogT';
import { SUPPORTED_LANGUAGES, type Language } from '@/contexts/LanguageContext';

const ORANGE = '#FF6B00';

/** Read the two-letter language prefix directly from the URL path.
 *  Routes are defined as literal paths (/en, /fr, …), not as /:language,
 *  so useParams() cannot return the language — useLocation() must be used. */
function useUrlLanguage(): Language {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (match && SUPPORTED_LANGUAGES.includes(match[1] as Language)) {
    return match[1] as Language;
  }
  return 'en';
}

// ── 1. Sticky top banner ───────────────────────────────────────────────────────

export function StickyBlogBanner() {
  // Disabled on purpose: each article keeps only 2 scan buttons
  // (one box in the middle of the article and one box at the end).
  return null;
}

// ── 2. Mid-article CTA box ─────────────────────────────────────────────────────

export function MidArticleCta() {
  const language = useUrlLanguage();
  const t = useBlogT();
  return (
    <div
      className="my-8 p-6 rounded-2xl border-2 text-center not-prose"
      style={{ background: '#fff7f0', borderColor: '#fed7aa' }}
    >
      <span className="block text-4xl mb-3" role="img" aria-label="camera">📷</span>
      <p className="font-bold text-gray-900 text-lg mb-1 m-0">
        {t.ctaScanHeadline}
      </p>
      <p className="text-gray-500 text-sm mb-4 m-0">
        {t.ctaScanSub}
      </p>
      <Link
        to={`/${language}/analyze`}
        className="inline-block rounded-full text-sm font-bold px-6 py-2.5 text-white no-underline"
        style={{ backgroundColor: ORANGE }}
      >
        {t.ctaScanBtn}
      </Link>
    </div>
  );
}

// ── 3. End-of-article CTA ──────────────────────────────────────────────────────

export function EndArticleCta() {
  const language = useUrlLanguage();
  return (
    <div
      className="mt-10 p-8 rounded-2xl border-2 text-center"
      style={{
        background: 'linear-gradient(135deg, #fff7f0 0%, #ffffff 100%)',
        borderColor: '#fed7aa',
      }}
    >
      <p className="font-extrabold text-gray-900 text-xl mb-2">
        Now you know the facts — see it in action
      </p>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        CalorieVision analyzes any meal from a photo.<br />
        Free, instant, no account needed.
      </p>
      <Link
        to={`/${language}/analyze`}
        className="inline-block rounded-full text-base font-bold px-8 py-3 text-white no-underline"
        style={{ backgroundColor: ORANGE }}
      >
        Try CalorieVision Free →
      </Link>
    </div>
  );
}

// ── 4. Article body renderer with ONE mid-article CTA ─────────────────────────
//
// Inserts a single MidArticleCta just before the <h2> section heading that is
// closest to the middle of the article. Cutting before an <h2> keeps the HTML
// valid (an <h2> is never inside a list or another block). If the article has
// fewer than 2 <h2> headings, no mid-article CTA is shown.

interface BlogArticleWithCtasProps {
  html: string;
  articleClassName: string;
}

function splitAtMiddleHeading(html: string): string[] {
  const starts: number[] = [];
  const re = /<h2[\s>]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > 0) starts.push(m.index);
  }
  if (starts.length < 2) return [html];

  const middle = html.length / 2;
  let cut = starts[0];
  for (const idx of starts) {
    if (Math.abs(idx - middle) < Math.abs(cut - middle)) cut = idx;
  }
  return [html.slice(0, cut), html.slice(cut)];
}

export function BlogArticleWithCtas({ html, articleClassName }: BlogArticleWithCtasProps) {
  const segments = splitAtMiddleHeading(html);

  return (
    <article className={articleClassName}>
      {segments.map((seg, i) => (
        <div key={i}>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: seg }} />
          {i < segments.length - 1 && (
            <div className="not-prose">
              <MidArticleCta />
            </div>
          )}
        </div>
      ))}
    </article>
  );
}
