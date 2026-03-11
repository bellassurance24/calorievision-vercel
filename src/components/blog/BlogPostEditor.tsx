import { useEffect, useMemo, useState } from 'react';
import { Columns, Edit3, Eye, List, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from './RichTextEditor';
import { processContentWithIds, type TocItem } from '@/lib/blogContent';

interface BlogPostEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  featuredImageUrl?: string;
  title?: string;
}

export function BlogPostEditor({
  value,
  onChange,
  placeholder,
  featuredImageUrl,
  title,
}: BlogPostEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewRenderMode, setPreviewRenderMode] = useState<'public' | 'editor'>('editor');

  // Count words from HTML content
  const countWords = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').filter((word) => word.length > 0).length : 0;
  };

  const wordCount = countWords(value);
  const isAdSenseReady = wordCount >= 700;

  const publicPreview = useMemo<{ processedHtml: string; tocItems: TocItem[] }>(() => {
    if (!value) return { processedHtml: '', tocItems: [] };
    return processContentWithIds(value);
  }, [value]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const editorContent = (
    <div className={`space-y-3 ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
      {/* View mode toggle and word count */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('edit')}
          >
            <Edit3 className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant={viewMode === 'split' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            <Columns className="mr-1 h-4 w-4" />
            Split
          </Button>
          <Button
            type="button"
            variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="mr-1 h-4 w-4" />
            Preview
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            variant={previewRenderMode === 'public' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setPreviewRenderMode('public')}
            title="Rendu identique à la page publique"
          >
            Public
          </Button>
          <Button
            type="button"
            variant={previewRenderMode === 'editor' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setPreviewRenderMode('editor')}
            title="Rendu HTML brut (comme dans l’éditeur)"
          >
            Éditeur
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isAdSenseReady ? 'text-green-600' : 'text-amber-600'}`}>
            {wordCount} words
          </span>
          {isAdSenseReady ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              AdSense Ready ✓
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Need {700 - wordCount} more words
            </span>
          )}
        </div>
      </div>

      {/* Editor/Preview panels */}
      <div
        className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} ${
          isFullscreen ? 'flex-1 min-h-0' : ''
        }`}
      >
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`space-y-2 ${isFullscreen ? 'flex flex-col min-h-0' : ''}`}>
            {viewMode === 'split' && (
              <h3 className="text-sm font-medium text-muted-foreground flex-shrink-0">Editor</h3>
            )}
            <div className={isFullscreen ? 'flex-1 min-h-0 overflow-auto' : ''}>
              <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} />
            </div>
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`space-y-2 ${isFullscreen ? 'flex flex-col min-h-0' : ''}`}>
            {viewMode === 'split' && (
              <h3 className="text-sm font-medium text-muted-foreground flex-shrink-0">Live Preview</h3>
            )}

            <div
              className={`rounded-lg border border-border bg-card p-6 overflow-auto ${
                isFullscreen ? 'flex-1 min-h-0' : 'max-h-[500px]'
              }`}
            >
              {/* Featured Image Preview */}
              {featuredImageUrl && (
                <div className="mb-6">
                  <img
                    src={featuredImageUrl}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Title Preview */}
              {title && <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>}

              {/* Content Preview */}
              {value ? (
                previewRenderMode === 'public' ? (
                  <div className="space-y-6">
                    {publicPreview.tocItems.length > 0 && (
                      <nav className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <List className="h-4 w-4 text-primary" />
                          <h2 className="text-sm font-semibold text-foreground">Sommaire</h2>
                        </div>
                        <ul className="space-y-1">
                          {publicPreview.tocItems.map((item, index) => (
                            <li key={index} className={item.level === 3 ? 'ml-4' : ''}>
                              <a
                                href={`#${item.id}`}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const element = document.getElementById(item.id);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }}
                              >
                                {item.level === 3 ? '— ' : ''}
                                {item.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}

                    <div className="blog-article-content prose prose-slate lg:prose-xl max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-ul:list-disc prose-ol:list-decimal prose-li:text-muted-foreground prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                      <style>{`
                        .blog-article-content > * + * {
                          margin-top: 1.5em;
                        }
                        .blog-article-content h1,
                        .blog-article-content h2,
                        .blog-article-content h3 {
                          margin-top: 2.5em;
                          margin-bottom: 0.75em;
                          font-weight: 700;
                          scroll-margin-top: 2rem;
                        }
                        .blog-article-content p {
                          margin-bottom: 1.5em;
                          line-height: 1.8;
                        }
                        .blog-article-content ul,
                        .blog-article-content ol {
                          margin-bottom: 1.5em;
                          padding-left: 1.5rem;
                        }
                        .blog-article-content li {
                          margin-bottom: 0.5em;
                        }
                        .blog-article-content blockquote {
                          margin-top: 1.5em;
                          margin-bottom: 1.5em;
                          padding-left: 1rem;
                          font-style: italic;
                        }
                      `}</style>
                      <div dangerouslySetInnerHTML={{ __html: publicPreview.processedHtml }} />
                    </div>
                  </div>
                ) : (
                  <article
                    className="prose prose-sm max-w-none dark:prose-invert
                      prose-headings:text-foreground prose-headings:font-bold
                      prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                      prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
                      prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                      prose-p:text-muted-foreground prose-p:mb-3 prose-p:leading-relaxed
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:my-3 prose-ol:my-3
                      prose-li:text-muted-foreground prose-li:mb-1
                      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                      prose-a:text-primary prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                )
              ) : (
                <p className="text-muted-foreground italic">Start writing to see the preview...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return <div className="fixed inset-0 z-50 bg-background p-6 animate-fade-in">{editorContent}</div>;
  }

  return editorContent;
}
