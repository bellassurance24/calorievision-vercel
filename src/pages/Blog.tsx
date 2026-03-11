import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useLanguage } from '../contexts/LanguageContext';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
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

  useEffect(() => {
    let cancelled = false;
    setIsEnFallback(false);

    async function fetchPosts() {
      setLoading(true);
      try {
        const SELECT = 'id, title, slug, meta_description, featured_image_url, published_at, status';

        // 1. Try current language
        let { data, error } = await supabase
          .from('blog_posts')
          .select(SELECT)
          .eq('status', 'published')
          .eq('language', language)
          .order('published_at', { ascending: false });

        // 2. Fall back to English if no translated posts exist
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

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading blog posts…</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>✍️</div>
        <h2 style={{ color: '#374151' }}>No posts found</h2>
        <p style={{ color: '#6b7280' }}>Check back soon for articles on nutrition and healthy eating.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#111827' }}>Blog</h1>
      <p style={{ color: '#6b7280', marginBottom: isEnFallback ? '16px' : '40px', fontSize: '16px' }}>
        Tips, guides, and insights on nutrition and healthy eating.
      </p>

      {isEnFallback && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px',
          padding: '12px 16px', marginBottom: '32px', fontSize: '14px', color: '#92400e',
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <span>⚠️</span>
          <span>
            No articles found in <strong>{language.toUpperCase()}</strong> yet —
            showing English articles instead.
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gap: '28px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`${blogPrefix}/${post.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <article style={{
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              }}
            >
              {post.featured_image_url && (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  loading="lazy"
                />
              )}
              {!post.featured_image_url && (
                <div style={{ width: '100%', height: '120px', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                  🥗
                </div>
              )}
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px', lineHeight: '1.4' }}>
                  {post.title}
                </h2>
                {post.meta_description && (
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 12px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.meta_description}
                  </p>
                )}
                {post.published_at && (
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                    {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
