import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LocalizedNavLink } from '@/components/LocalizedNavLink';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, BlogTag as BlogTagType } from '@/types/blog';
import { BlogCard } from '@/components/blog/BlogCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { Skeleton } from '@/components/ui/skeleton';

const translations: Record<string, { back: string; taggedWith: string; notFound: string; noPosts: string }> = {
  en: { back: 'Back to Blog', taggedWith: 'Articles tagged', notFound: 'Tag not found', noPosts: 'No articles with this tag yet.' },
  fr: { back: 'Retour au blog', taggedWith: 'Articles avec le tag', notFound: 'Tag non trouvé', noPosts: 'Pas encore d\'articles avec ce tag.' },
  es: { back: 'Volver al blog', taggedWith: 'Artículos con la etiqueta', notFound: 'Etiqueta no encontrada', noPosts: 'Aún no hay artículos con esta etiqueta.' },
  pt: { back: 'Voltar ao blog', taggedWith: 'Artigos com a tag', notFound: 'Tag não encontrada', noPosts: 'Ainda não há artigos com esta tag.' },
  zh: { back: '返回博客', taggedWith: '标签下的文章', notFound: '标签未找到', noPosts: '此标签下暂无文章。' },
  ar: { back: 'العودة إلى المدونة', taggedWith: 'مقالات بعلامة', notFound: 'العلامة غير موجودة', noPosts: 'لا توجد مقالات بهذه العلامة بعد.' },
  it: { back: 'Torna al blog', taggedWith: 'Articoli con tag', notFound: 'Tag non trovato', noPosts: 'Nessun articolo con questo tag.' },
  de: { back: 'Zurück zum Blog', taggedWith: 'Artikel mit Tag', notFound: 'Tag nicht gefunden', noPosts: 'Noch keine Artikel mit diesem Tag.' },
  nl: { back: 'Terug naar blog', taggedWith: 'Artikelen met tag', notFound: 'Tag niet gevonden', noPosts: 'Nog geen artikelen met deze tag.' },
  ru: { back: 'Назад в блог', taggedWith: 'Статьи с тегом', notFound: 'Тег не найден', noPosts: 'Статей с этим тегом пока нет.' },
  ja: { back: 'ブログに戻る', taggedWith: 'タグ付き記事', notFound: 'タグが見つかりません', noPosts: 'このタグの記事はまだありません。' },
};

export default function BlogTag() {
  const { tagSlug: slug } = useParams<{ tagSlug: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language] ?? translations['en'];

  const [tag, setTag] = useState<BlogTagType | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ALL hooks declared at the top — no hooks after conditional returns
  usePageMetadata({
    title: tag ? `${tag.name} | CalorieVision Blog` : 'Tag | CalorieVision Blog',
    description: tag ? `Read articles tagged with ${tag.name} on CalorieVision blog.` : '',
    path: `/blog/tag/${slug}`
  });

  // Single effect: handles no-slug redirect, data fetching, and not-found redirect
  useEffect(() => {
    // No slug → redirect to blog
    if (!slug) {
      navigate(`/${language}/blog`, { replace: true });
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data: tagData, error: tagError } = await supabase
          .from('blog_tags')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (cancelled) return;
        if (tagError) throw tagError;

        if (!tagData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setTag(tagData);

        // Fetch post IDs with this tag
        const { data: postTagData, error: postTagError } = await supabase
          .from('blog_post_tags')
          .select('post_id')
          .eq('tag_id', tagData.id);

        if (cancelled) return;
        if (postTagError) throw postTagError;

        if (postTagData && postTagData.length > 0) {
          const postIds = postTagData.map(pt => pt.post_id);

          // Fetch posts filtered by current language
          const { data: postsData, error: postsError } = await supabase
            .from('blog_posts')
            .select(`*, category:blog_categories(*)`)
            .in('id', postIds)
            .eq('status', 'published')
            .eq('language', language)
            .order('published_at', { ascending: false });

          if (cancelled) return;
          if (postsError) throw postsError;

          // Fetch tags for posts
          const postsWithTags = await Promise.all(
            (postsData || []).map(async (post) => {
              const { data: ptData } = await supabase
                .from('blog_post_tags')
                .select('tag_id')
                .eq('post_id', post.id);

              if (ptData && ptData.length > 0) {
                const tagIds = ptData.map(t => t.tag_id);
                const { data: tagsData } = await supabase
                  .from('blog_tags')
                  .select('*')
                  .in('id', tagIds);
                return { ...post, tags: tagsData || [] };
              }
              return { ...post, tags: [] };
            })
          );

          if (!cancelled) {
            setPosts(postsWithTags as BlogPost[]);
          }
        }
      } catch (error) {
        console.error('Error fetching tag data:', error);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [slug, language, navigate]);

  // Redirect when not found (after loading completes)
  useEffect(() => {
    if (notFound && !loading) {
      navigate(`/${language}/blog`, { replace: true });
    }
  }, [notFound, loading, language, navigate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border p-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="mt-4 h-6 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tag) {
    return null; // Will redirect via the useEffect above
  }

  return (
    <div className="space-y-8">
      <div>
        <LocalizedNavLink
          to="/blog"
          className="mb-4 inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </LocalizedNavLink>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          {t.taggedWith} "{tag.name}"
        </h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t.noPosts}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
