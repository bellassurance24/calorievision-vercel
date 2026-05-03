import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const ORANGE = '#FF6B00';

// ── 1. Sticky top banner ───────────────────────────────────────────────────────

export function StickyBlogBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { language = 'en' } = useParams<{ language: string }>();
  if (dismissed) return null;

  return (
    <div
      className="sticky top-0 z-50 -mx-4 sm:-mx-6 md:-mx-10 mb-8"
      style={{ backgroundColor: ORANGE }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 md:px-10 py-2.5">
        <span className="text-white font-medium text-sm leading-snug">
          📸 Scan any meal &amp; know its calories instantly
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/${language}/analyze`}
            className="rounded-full text-sm font-bold px-4 py-1.5 no-underline whitespace-nowrap"
            style={{ backgroundColor: 'white', color: ORANGE }}
          >
            Try Free →
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-white opacity-80 hover:opacity-100 text-xl font-bold leading-none px-1 cursor-pointer bg-transparent border-0"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2. Mid-article CTA box ─────────────────────────────────────────────────────

export function MidArticleCta() {
  const { language = 'en' } = useParams<{ language: string }>();
  return (
    <div
      className="my-8 p-6 rounded-2xl border-2 text-center not-prose"
      style={{ background: '#fff7f0', borderColor: '#fed7aa' }}
    >
      <span className="block text-4xl mb-3" role="img" aria-label="camera">📷</span>
      <p className="font-bold text-gray-900 text-lg mb-1 m-0">
        Curious about the calories in this meal?
      </p>
      <p className="text-gray-500 text-sm mb-4 m-0">
        Point your camera and find out in seconds
      </p>
      <Link
        to={`/${language}/analyze`}
        className="inline-block rounded-full text-sm font-bold px-6 py-2.5 text-white no-underline"
        style={{ backgroundColor: ORANGE }}
      >
        Scan Now — It's Free
      </Link>
    </div>
  );
}

// ── 3. End-of-article CTA ──────────────────────────────────────────────────────

export function EndArticleCta() {
  const { language = 'en' } = useParams<{ language: string }>();
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

// ── 4. Article body renderer with injected mid-article CTAs ───────────────────
//
// Splits the article HTML at every 3rd </p> boundary, renders each chunk
// inside the prose article, and inserts a MidArticleCta between chunks.
// The CTA is wrapped in `not-prose` so Tailwind Typography doesn't bleed into it.

interface BlogArticleWithCtasProps {
  html: string;
  articleClassName: string;
}

function splitEvery3Paragraphs(html: string): string[] {
  const segments: string[] = [];
  let remaining = html;
  const CLOSE_P = '</p>';

  while (remaining.length > 0) {
    let count = 0;
    let searchFrom = 0;
    let cutAt = -1;

    while (searchFrom < remaining.length) {
      const idx = remaining.indexOf(CLOSE_P, searchFrom);
      if (idx === -1) break;
      count += 1;
      if (count === 3) {
        cutAt = idx + CLOSE_P.length;
        break;
      }
      searchFrom = idx + CLOSE_P.length;
    }

    if (cutAt === -1) {
      // Fewer than 3 paragraphs remain — push the rest and stop
      segments.push(remaining);
      break;
    }
    segments.push(remaining.slice(0, cutAt));
    remaining = remaining.slice(cutAt);
  }

  return segments;
}

export function BlogArticleWithCtas({ html, articleClassName }: BlogArticleWithCtasProps) {
  const segments = splitEvery3Paragraphs(html);

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
