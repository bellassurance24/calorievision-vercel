import { LocalizedNavLink } from '@/components/LocalizedNavLink';
import { Calendar, Tag } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useBlogTranslation } from '@/hooks/useBlogTranslation';
import { useEffect, useState } from 'react';

interface BlogCardProps {
  post: BlogPost;
}

// Strip HTML and clean text for excerpt - ensures plain text only
const cleanText = (html: string, maxLength: number = 150): string => {
  // Remove all HTML tags completely
  let text = html.replace(/<[^>]*>/g, '');
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&apos;/g, "'")
             .replace(/&#x27;/g, "'")
             .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
             .replace(/&[a-zA-Z0-9#]+;/g, ''); // Remove any remaining entities
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return maxLength > 0 && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export function BlogCard({ post }: BlogCardProps) {
  const { translateText, currentLanguage } = useBlogTranslation();
  const [translatedTitle, setTranslatedTitle] = useState(cleanText(post.title, 0));
  const [translatedExcerpt, setTranslatedExcerpt] = useState(cleanText(post.content, 150));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translate = async () => {
      // Only show loading for non-English languages
      if (currentLanguage !== 'en') {
        setIsLoading(true);
      }
      
      // Clean the source text before translating
      const cleanTitle = cleanText(post.title, 0);
      const cleanExcerptSource = cleanText(post.content, 150);
      
      try {
        const [title, translatedExc] = await Promise.all([
          translateText(cleanTitle, `${post.id}-title`),
          translateText(cleanExcerptSource, `${post.id}-excerpt`)
        ]);
        
        // Double-clean the results to ensure no HTML tags in translations
        setTranslatedTitle(cleanText(title, 0));
        setTranslatedExcerpt(cleanText(translatedExc, 150));
      } finally {
        setIsLoading(false);
      }
    };
    translate();
  }, [post.title, post.content, post.id, translateText, currentLanguage]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      {post.featured_image_url && (
        <LocalizedNavLink to={`/blog/${post.localized_slug ?? post.slug}`} className="block overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.featured_image_alt || translatedTitle}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </LocalizedNavLink>
      )}
      <div className="p-5">
        {/* Category - Hidden from public view */}
        {/* {post.category && (
          <LocalizedNavLink
            to={`/blog/category/${post.category.slug}`}
            className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
          >
            {post.category.name}
          </LocalizedNavLink>
        )} */}
        <h2 className="mb-2 text-xl font-bold text-foreground">
          <LocalizedNavLink
            to={`/blog/${post.localized_slug ?? post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse bg-muted rounded h-6 w-3/4"></span>
            ) : (
              translatedTitle
            )}
          </LocalizedNavLink>
        </h2>
        {isLoading ? (
          <div className="mb-4 space-y-2">
            <div className="animate-pulse bg-muted rounded h-3 w-full"></div>
            <div className="animate-pulse bg-muted rounded h-3 w-5/6"></div>
            <div className="animate-pulse bg-muted rounded h-3 w-4/6"></div>
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
            {translatedExcerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.published_at)}
          </span>
          {/* Tags - Hidden from public view */}
          {/* {post.tags && post.tags.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {post.tags.slice(0, 2).map(tag => tag.name).join(', ')}
            </span>
          )} */}
        </div>
      </div>
    </article>
  );
}
