import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LocalizedNavLink } from '@/components/LocalizedNavLink';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, BlogCategory as BlogCategoryType } from '@/types/blog';
import { BlogCard } from '@/components/blog/BlogCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { Skeleton } from '@/components/ui/skeleton';

const translations: Record<string, { back: string; articlesIn: string; notFound: string; noPosts: string }> = {
  en: { back: 'Back to Blog', articlesIn: 'Articles in', notFound: 'Category not found', noPosts: 'No articles in this category yet.' },
  fr: { back: 'Retour au blog', articlesIn: 'Articles dans', notFound: 'Catégorie non trouvée', noPosts: 'Pas encore d\'articles dans cette catégorie.' },
  es: { back: 'Volver al blog', articlesIn: 'Artículos en', notFound: 'Categoría no encontrada', noPosts: 'Aún no hay artículos en esta categoría.' },
  pt: { back: 'Voltar ao blog', articlesIn: 'Artigos em', notFound: 'Categoria não encontrada', noPosts: 'Ainda não há artigos nesta categoria.' },
  zh: { back: '返回博客', articlesIn: '分类下的文章', notFound: '分类未找到', noPosts: '此分类下暂无文章。' },
  ar: { back: 'العودة إلى المدونة', articlesIn: 'مقالات في', notFound: 'الفئة غير موجودة', noPosts: 'لا توجد مقالات في هذه الفئة بعد.' },
  it: { back: 'Torna al blog', articlesIn: 'Articoli in', notFound: 'Categoria non trovata', noPosts: 'Nessun articolo in questa categoria.' },
  de: { back: 'Zurück zum Blog', articlesIn: 'Artikel in', notFound: 'Kategorie nicht gefunden', noPosts: 'Noch keine Artikel in dieser Kategorie.' },
  nl: { back: 'Terug naar blog', articlesIn: 'Artikelen in', notFound: 'Categorie niet gevonden', noPosts: 'Nog geen artikelen in deze categorie.' },
  ru: { back: 'Назад в блог', articlesIn: 'Статьи в', notFound: 'Категория не найдена', noPosts: 'В этой категории пока нет статей.' },
  ja: { back: 'ブログに戻る', articlesIn: 'カテゴリの記事', notFound: 'カテゴリが見つかりません', noPosts: 'このカテゴリにはまだ記事がありません。' },
};

export default function BlogCategory() {
  const { categorySlug: slug } = useParams<{ categorySlug: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language] ?? translations['en'];

  const [category, setCategory] = useState<BlogCategoryType | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No slug provided (bare /blog/category route) → redirect immediately
    if (!slug) {
      navigate(`/${language}/blog`, { replace: true });
      return;
    }
  }, [slug, language, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Fetch category
        const { data: catData, error: catError } = await supabase
          .from('blog_categories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (catError) throw catError;
        setCategory(catData);

        if (catData) {
          // Fetch posts in category
          const { data: postsData, error: postsError } = await supabase
            .from('blog_posts')
            .select(`
              *,
              category:blog_categories(*)
            `)
            .eq('category_id', catData.id)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

          if (postsError) throw postsError;

          // Fetch tags for posts
          const postsWithTags = await Promise.all(
            (postsData || []).map(async (post) => {
              const { data: tagData } = await supabase
                .from('blog_post_tags')
                .select('tag_id')
                .eq('post_id', post.id);

              if (tagData && tagData.length > 0) {
                const tagIds = tagData.map(t => t.tag_id);
                const { data: tagsData } = await supabase
                  .from('blog_tags')
                  .select('*')
                  .in('id', tagIds);
                return { ...post, tags: tagsData || [] };
              }
              return { ...post, tags: [] };
            })
          );

          setPosts(postsWithTags as BlogPost[]);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  usePageMetadata({
    title: category ? `${category.name} | CalorieVision Blog` : 'Category | CalorieVision Blog',
    description: category ? `Read articles about ${category.name} on CalorieVision blog.` : '',
    path: `/blog/category/${slug}`
  });

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

  // Category not found → redirect to blog (better for SEO than a dead page)
  useEffect(() => {
    if (!loading && !category) {
      navigate(`/${language}/blog`, { replace: true });
    }
  }, [loading, category, language, navigate]);

  if (!category) {
    return null;
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
          {t.articlesIn} "{category.name}"
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
