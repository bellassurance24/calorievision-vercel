import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';
import { useBlogT } from '../hooks/useBlogT';
import { SolidBlogImage } from '../components/blog/SolidBlogImage';

const SITE_URL = 'https://calorievision.online';

function setBlogIndexSEO(lang: string) {
  document.title = 'Blog | CalorieVision';

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = `${SITE_URL}/${lang}/blog`;

  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  SUPPORTED_LANGUAGES.forEach(l => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = l;
    link.href = `${SITE_URL}/${l}/blog`;
    document.head.appendChild(link);
  });
  const def = document.createElement('link');
  def.rel = 'alternate';
  def.hreflang = 'x-default';
  def.href = `${SITE_URL}/en/blog`;
  document.head.appendChild(def);
}

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  localized_slug?: string | null;
  meta_description?: string;
  featured_image_url?: string;
  published_at?: string;
  status: string;
};

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnFallback, setIsEnFallback] = useState(false);
  const { language } = useLanguage();
  const t = useBlogT();

  // ── SEO ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setBlogIndexSEO(language);
    return () => { document.title = 'CalorieVision - AI Meal Analysis From a Photo'; };
  }, [language]);

  // ── Data fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsEnFallback(false);

    async function fetchPosts() {
      setLoading(true);
      try {
        const SELECT = 'id, title, slug, localized_slug, meta_description, featured_image_url, published_at, status';

        let { data, error } = await supabase
          .from('blog_posts')
          .select(SELECT)
          .eq('status', 'published')
          .eq('language', language)
          .order('published_at', { ascending: false });

        if (!error && (!data || data.length === 0) && language !== 'en') {
          ({ data, error } = await supabase
            .from('blog_posts')
            .select(SELECT)
            .eq('status', 'published')
            .eq('language', 'en')
            .order('published_at', { ascending: false }));
          if (!cancelled && !error && data && data.length > 0) setIsEnFallback(true);
        }

        if (!cancelled && !error) setPosts(data ?? []);
      } catch {
        // Supabase offline — silently leave posts empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => { cancelled = true; };
  }, [language]);

  const blogPrefix = `/${language}/blog`;
  const isRtl = language === 'ar';

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>{t.loading}</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (posts.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>✍️</div>
        <h2 style={{ color: '#374151' }}>{t.noPosts}</h2>
        <p style={{ color: '#6b7280' }}>{t.noPostsSub}</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}
    >
      <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#111827' }}>
        {t.blogTitle}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: isEnFallback ? '16px' : '40px', fontSize: '16px', textAlign: isRtl ? 'right' : 'left' }}>
        {t.subtitle}
      </p>

      {isEnFallback && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px',
          padding: '12px 16px', marginBottom: '32px', fontSize: '14px', color: '#92400e',
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <span>⚠️</span>
          <span dangerouslySetInnerHTML={{
            __html: t.fallback.replace('{lang}', `<strong>${language.toUpperCase()}</strong>`),
          }} />
        </div>
      )}

      <div style={{ display: 'grid', gap: '28px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`${blogPrefix}/${post.localized_slug ?? post.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <article
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.14)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              }}
            >
              {post.featured_image_url ? (
                <SolidBlogImage
                  src={post.featured_image_url}
                  alt={post.title}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    minHeight: '220px',
                    maxHeight: '220px',
                    overflow: 'hidden',
                    borderRadius: '24px 24px 0 0',
                    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '48px' }}>🥗</span>
                </div>
              )}
              <div style={{ padding: '20px' }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 8px',
                  lineHeight: '1.4',
                  /* Clamp to 2 lines on ALL language routes — prevents long
                     translated titles (RU/DE/FR/AR/JA…) from making the card
                     taller than the EN card.  EN titles are already ≤2 lines
                     so this has zero visual impact on the English route. */
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {post.title}
                </h2>
                {post.meta_description && (
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 12px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.meta_description}
                  </p>
                )}
                {post.published_at && (
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                    {new Date(post.published_at).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
