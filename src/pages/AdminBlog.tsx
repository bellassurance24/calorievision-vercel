import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Eye, Tag, FolderOpen,
  Save, RotateCcw, Globe, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { useAutoSaveDraft } from '@/hooks/useAutoSaveDraft';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost, BlogCategory, BlogTag } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BlogPostEditor } from '@/components/blog/BlogPostEditor';
import { FeaturedImageEditor } from '@/components/blog/FeaturedImageEditor';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/layout/AdminLayout';

// ── Language metadata for the progress panel ────────────────────────────────
const TRANSLATION_LANGS = ['ar', 'fr', 'es', 'de', 'it', 'nl', 'pt', 'ru', 'zh', 'ja'] as const;
type TranslationLang = typeof TRANSLATION_LANGS[number];

const LANG_META: Record<TranslationLang, { flag: string; name: string }> = {
  ar: { flag: '🇸🇦', name: 'Arabic' },
  fr: { flag: '🇫🇷', name: 'French' },
  es: { flag: '🇪🇸', name: 'Spanish' },
  de: { flag: '🇩🇪', name: 'German' },
  it: { flag: '🇮🇹', name: 'Italian' },
  nl: { flag: '🇳🇱', name: 'Dutch' },
  pt: { flag: '🇵🇹', name: 'Portuguese' },
  ru: { flag: '🇷🇺', name: 'Russian' },
  zh: { flag: '🇨🇳', name: 'Chinese' },
  ja: { flag: '🇯🇵', name: 'Japanese' },
};

type LangStatus = 'idle' | 'running' | 'done' | 'error';

// ────────────────────────────────────────────────────────────────────────────

export default function AdminBlog() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);

  // Post form state
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    featured_image_url: '',
    featured_image_alt: '',
    content: '',
    category_id: '',
    meta_title: '',
    meta_description: '',
    status: 'draft' as 'draft' | 'published',
    selectedTags: [] as string[],
  });

  // Translation state
  const [translating, setTranslating] = useState(false);
  const [langProgress, setLangProgress] = useState<Record<TranslationLang, LangStatus>>(
    {} as Record<TranslationLang, LangStatus>,
  );

  // Category/Tag form state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [newTag, setNewTag] = useState({ name: '', slug: '' });
  const [showDraftRestore, setShowDraftRestore] = useState(false);

  // Auto-save draft hook
  const handleRestoreDraft = useCallback((data: typeof postForm) => {
    setPostForm(data);
    setShowDraftRestore(false);
  }, []);

  const { saveDraft, restoreDraft, clearDraft, hasDraft, getLastSavedText } = useAutoSaveDraft({
    key: editingPost?.id || 'new_post',
    data: postForm,
    interval: 30000,
    onRestore: handleRestoreDraft,
  });

  // Check for draft when dialog opens
  useEffect(() => {
    if (postDialogOpen && !editingPost && hasDraft) {
      setShowDraftRestore(true);
    }
  }, [postDialogOpen, editingPost, hasDraft]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/auth');
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, catsRes, tagsRes] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*, category:blog_categories(*)')
          .eq('language', 'en')
          .order('created_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('blog_tags').select('*').order('name'),
      ]);

      if (postsRes.data) {
        const postsWithTags = await Promise.all(
          postsRes.data.map(async (post) => {
            const { data: tagData } = await supabase
              .from('blog_post_tags')
              .select('tag_id')
              .eq('post_id', post.id);

            if (tagData) {
              const tagIds = tagData.map((t) => t.tag_id);
              const { data: tagsData } = await supabase
                .from('blog_tags')
                .select('*')
                .in('id', tagIds);
              return { ...post, tags: tagsData || [] };
            }
            return { ...post, tags: [] };
          }),
        );
        setPosts(postsWithTags as BlogPost[]);
      }
      setCategories(catsRes.data || []);
      setTags(tagsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const resetPostForm = () => {
    setPostForm({
      title: '',
      slug: '',
      featured_image_url: '',
      featured_image_alt: '',
      content: '',
      category_id: '',
      meta_title: '',
      meta_description: '',
      status: 'draft',
      selectedTags: [],
    });
    setEditingPost(null);
    setLangProgress({} as Record<TranslationLang, LangStatus>);
    setTranslating(false);
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      featured_image_url: post.featured_image_url || '',
      featured_image_alt: post.featured_image_alt || '',
      content: post.content,
      category_id: post.category_id || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      status: post.status,
      selectedTags: post.tags?.map((t) => t.id) || [],
    });
    setPostDialogOpen(true);
  };

  // ── Save a single draft / regular post ─────────────────────────────────
  const handleSavePost = async () => {
    if (!postForm.title || !postForm.content) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
      return;
    }

    const slug = postForm.slug || generateSlug(postForm.title);
    const publishedAt =
      postForm.status === 'published' && !editingPost?.published_at
        ? new Date().toISOString()
        : editingPost?.published_at;

    try {
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: postForm.title,
            slug,
            featured_image_url: postForm.featured_image_url || null,
            featured_image_alt: postForm.featured_image_alt || null,
            content: postForm.content,
            category_id: postForm.category_id || null,
            meta_title: postForm.meta_title || null,
            meta_description: postForm.meta_description || null,
            status: postForm.status,
            published_at: publishedAt,
          })
          .eq('id', editingPost.id);
        if (error) throw error;

        await supabase.from('blog_post_tags').delete().eq('post_id', editingPost.id);
        if (postForm.selectedTags.length > 0) {
          await supabase.from('blog_post_tags').insert(
            postForm.selectedTags.map((tagId) => ({ post_id: editingPost.id, tag_id: tagId })),
          );
        }
        toast({ title: 'Success', description: 'Post updated successfully' });
      } else {
        const { data: newPost, error } = await supabase
          .from('blog_posts')
          .insert({
            title: postForm.title,
            slug,
            featured_image_url: postForm.featured_image_url || null,
            featured_image_alt: postForm.featured_image_alt || null,
            content: postForm.content,
            category_id: postForm.category_id || null,
            author_id: user!.id,
            meta_title: postForm.meta_title || null,
            meta_description: postForm.meta_description || null,
            status: postForm.status,
            published_at: publishedAt,
            language: 'en',
            localized_slug: slug,
          })
          .select()
          .single();
        if (error) throw error;

        if (postForm.selectedTags.length > 0 && newPost) {
          await supabase.from('blog_post_tags').insert(
            postForm.selectedTags.map((tagId) => ({ post_id: newPost.id, tag_id: tagId })),
          );
        }
        toast({ title: 'Success', description: 'Post created successfully' });
      }

      clearDraft();
      setPostDialogOpen(false);
      resetPostForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // ── THE MAGIC BUTTON: publish in 11 languages at once ──────────────────
  const handlePublishMultilingual = async () => {
    if (!postForm.title || !postForm.content) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
      return;
    }

    const slug = postForm.slug || generateSlug(postForm.title);
    const publishedAt = new Date().toISOString();

    // ── Step 1: save / update the English (source) post ──────────────────
    let postId: string;
    try {
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: postForm.title,
            slug,
            featured_image_url: postForm.featured_image_url || null,
            featured_image_alt: postForm.featured_image_alt || null,
            content: postForm.content,
            category_id: postForm.category_id || null,
            meta_title: postForm.meta_title || null,
            meta_description: postForm.meta_description || null,
            status: 'published',
            published_at: editingPost.published_at ?? publishedAt,
            localized_slug: slug,
          })
          .eq('id', editingPost.id);
        if (error) throw error;
        postId = editingPost.id;

        // Re-sync tags
        await supabase.from('blog_post_tags').delete().eq('post_id', postId);
        if (postForm.selectedTags.length > 0) {
          await supabase.from('blog_post_tags').insert(
            postForm.selectedTags.map((tagId) => ({ post_id: postId, tag_id: tagId })),
          );
        }
      } else {
        const { data: newPost, error } = await supabase
          .from('blog_posts')
          .insert({
            title: postForm.title,
            slug,
            featured_image_url: postForm.featured_image_url || null,
            featured_image_alt: postForm.featured_image_alt || null,
            content: postForm.content,
            category_id: postForm.category_id || null,
            author_id: user!.id,
            meta_title: postForm.meta_title || null,
            meta_description: postForm.meta_description || null,
            status: 'published',
            published_at: publishedAt,
            language: 'en',
            localized_slug: slug,
          })
          .select()
          .single();
        if (error) throw error;
        postId = newPost.id;

        if (postForm.selectedTags.length > 0) {
          await supabase.from('blog_post_tags').insert(
            postForm.selectedTags.map((tagId) => ({ post_id: postId, tag_id: tagId })),
          );
        }
      }
    } catch (error: any) {
      toast({ title: 'Failed to save English post', description: error.message, variant: 'destructive' });
      return;
    }

    // ── Step 2: fire all 10 translation calls in parallel ─────────────────
    setTranslating(true);
    const initial = Object.fromEntries(TRANSLATION_LANGS.map((l) => [l, 'running'])) as Record<
      TranslationLang,
      LangStatus
    >;
    setLangProgress(initial);

    const results = await Promise.allSettled(
      TRANSLATION_LANGS.map(async (lang) => {
        const { error } = await supabase.functions.invoke('auto-translate-blog-post', {
          body: { postId, targetLang: lang, force: true },
        });
        if (error) throw new Error(error.message || 'Translation failed');
        setLangProgress((prev) => ({ ...prev, [lang]: 'done' }));
      }),
    );

    // Mark any failures
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        setLangProgress((prev) => ({ ...prev, [TRANSLATION_LANGS[i]]: 'error' }));
      }
    });

    // ── Step 3: sync featured_image_url to all translated versions ────────
    // Belt-and-suspenders: the Edge Function already sets the image URL, but
    // if any translation fails we still want the image on partial results.
    if (postForm.featured_image_url) {
      await supabase
        .from('blog_posts')
        .update({ featured_image_url: postForm.featured_image_url })
        .eq('slug', slug)
        .neq('language', 'en');
    }

    const failedCount = results.filter((r) => r.status === 'rejected').length;
    const doneCount   = 10 - failedCount;

    setTranslating(false);
    clearDraft();
    fetchData();

    if (failedCount === 0) {
      toast({
        title: '🌍 Published in 11 languages!',
        description: 'All 10 translations completed. The sitemap updates automatically.',
      });
      // Leave dialog open briefly so user sees the green checkmarks, then close
      setTimeout(() => {
        setPostDialogOpen(false);
        resetPostForm();
      }, 2500);
    } else {
      toast({
        title: `⚠️ ${doneCount}/10 translations completed`,
        description: `${failedCount} language(s) failed. The English post is live. You can retry.`,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post and ALL its translations?')) return;
    try {
      // Delete all language versions (composite key: slug + language)
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await supabase.from('blog_posts').delete().eq('slug', post.slug);
      } else {
        await supabase.from('blog_posts').delete().eq('id', postId);
      }
      toast({ title: 'Deleted', description: 'Post and all translations removed' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    const slug = newCategory.slug || generateSlug(newCategory.name);
    try {
      const { error } = await supabase.from('blog_categories').insert({ name: newCategory.name, slug });
      if (error) throw error;
      toast({ title: 'Success', description: 'Category added' });
      setCategoryDialogOpen(false);
      setNewCategory({ name: '', slug: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const { error } = await supabase.from('blog_categories').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddTag = async () => {
    if (!newTag.name) return;
    const slug = newTag.slug || generateSlug(newTag.name);
    try {
      const { error } = await supabase.from('blog_tags').insert({ name: newTag.name, slug });
      if (error) throw error;
      toast({ title: 'Success', description: 'Tag added' });
      setTagDialogOpen(false);
      setNewTag({ name: '', slug: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      const { error } = await supabase.from('blog_tags').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const langStatusIcon = (status: LangStatus) => {
    if (status === 'running') return <Loader2 className="h-4 w-4 animate-spin text-teal-500" />;
    if (status === 'done')    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === 'error')   return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const hasTranslationProgress = Object.keys(langProgress).length > 0;

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground">
              Create and manage blog posts, categories, and tags — with one-click multilingual publishing.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Articles (EN)</div>
              <div className="mt-1 text-3xl font-bold text-foreground">{posts.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Published</div>
              <div className="mt-1 text-3xl font-bold text-green-600">
                {posts.filter((p) => p.status === 'published').length}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Drafts</div>
              <div className="mt-1 text-3xl font-bold text-yellow-600">
                {posts.filter((p) => p.status === 'draft').length}
              </div>
            </div>
          </div>

          <Tabs defaultValue="posts">
            <TabsList className="mb-6">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>

            {/* ── Posts Tab ─────────────────────────────────────────── */}
            <TabsContent value="posts">
              <div className="mb-4 flex justify-end">
                <Dialog
                  open={postDialogOpen}
                  onOpenChange={(open) => {
                    if (!open && !translating) {
                      setPostDialogOpen(false);
                      resetPostForm();
                    } else if (open) {
                      setPostDialogOpen(true);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                    </DialogHeader>

                    {/* Draft restore banner */}
                    {showDraftRestore && !editingPost && (
                      <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                          <RotateCcw className="h-4 w-4" />
                          <span>You have an unsaved draft. Would you like to restore it?</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setShowDraftRestore(false)}>
                            Dismiss
                          </Button>
                          <Button size="sm" onClick={() => restoreDraft()}>
                            Restore Draft
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Auto-save indicator */}
                    {getLastSavedText() && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Save className="h-3 w-3" />
                        <span>{getLastSavedText()}</span>
                      </div>
                    )}

                    {/* ── Translation Progress Panel ─────────────────── */}
                    {hasTranslationProgress && (
                      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950">
                        <div className="mb-3 flex items-center gap-2">
                          <Globe className="h-5 w-5 text-teal-600" />
                          <span className="font-semibold text-teal-800 dark:text-teal-200">
                            {translating ? 'Translating into 10 languages…' : 'Translation complete'}
                          </span>
                          {translating && (
                            <span className="ml-auto text-sm text-teal-600">
                              {Object.values(langProgress).filter((s) => s === 'done').length} / 10 done
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                          {TRANSLATION_LANGS.map((lang) => {
                            const status = langProgress[lang] ?? 'idle';
                            return (
                              <div
                                key={lang}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                  status === 'done'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : status === 'error'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                              >
                                <span className="text-base">{LANG_META[lang].flag}</span>
                                <span className="flex-1">{LANG_META[lang].name}</span>
                                {langStatusIcon(status)}
                              </div>
                            );
                          })}
                        </div>
                        {!translating && Object.values(langProgress).some((s) => s === 'error') && (
                          <p className="mt-3 text-sm text-red-600">
                            Some languages failed. The English post is live. Re-open the editor and click
                            "Generate & Publish Multilingual" again to retry all translations.
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Post Form ─────────────────────────────────── */}
                    <fieldset disabled={translating} className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Title *</Label>
                        <Input
                          value={postForm.title}
                          onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                          placeholder="Post title (English)"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Slug</Label>
                        <Input
                          value={postForm.slug}
                          onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                          placeholder="post-url-slug (auto-generated from title if empty)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Category</Label>
                          <Select
                            value={postForm.category_id}
                            onValueChange={(val) => setPostForm({ ...postForm, category_id: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Status (for draft save only)</Label>
                          <Select
                            value={postForm.status}
                            onValueChange={(val: 'draft' | 'published') =>
                              setPostForm({ ...postForm, status: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <label key={tag.id} className="flex cursor-pointer items-center gap-1">
                              <input
                                type="checkbox"
                                checked={postForm.selectedTags.includes(tag.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPostForm({
                                      ...postForm,
                                      selectedTags: [...postForm.selectedTags, tag.id],
                                    });
                                  } else {
                                    setPostForm({
                                      ...postForm,
                                      selectedTags: postForm.selectedTags.filter((id) => id !== tag.id),
                                    });
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{tag.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Featured Image */}
                      <FeaturedImageEditor
                        imageUrl={postForm.featured_image_url}
                        altText={postForm.featured_image_alt}
                        onImageChange={(url) => setPostForm({ ...postForm, featured_image_url: url })}
                        onAltTextChange={(alt) => setPostForm({ ...postForm, featured_image_alt: alt })}
                      />

                      <div className="grid gap-2">
                        <Label>Content * (English)</Label>
                        <BlogPostEditor
                          value={postForm.content}
                          onChange={(val) => setPostForm({ ...postForm, content: val })}
                          placeholder="Write your article here in English. The magic button will translate it into 10 languages automatically."
                          featuredImageUrl={postForm.featured_image_url}
                          title={postForm.title}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Meta Title (SEO)</Label>
                        <Input
                          value={postForm.meta_title}
                          onChange={(e) => setPostForm({ ...postForm, meta_title: e.target.value })}
                          placeholder="SEO title (auto-translated too)"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Meta Description (SEO)</Label>
                        <Textarea
                          value={postForm.meta_description}
                          onChange={(e) => setPostForm({ ...postForm, meta_description: e.target.value })}
                          placeholder="SEO description — max 160 chars (auto-translated too)"
                          rows={2}
                        />
                      </div>

                      {/* ── Action Buttons ────────────────────────── */}
                      <div className="mt-2 flex flex-col gap-3">
                        {/* Magic Button */}
                        <button
                          type="button"
                          onClick={handlePublishMultilingual}
                          disabled={translating}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {translating ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Generating translations…
                            </>
                          ) : (
                            <>
                              <Globe className="h-5 w-5" />
                              Generate &amp; Publish Multilingual
                              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                                11 langs
                              </span>
                            </>
                          )}
                        </button>

                        {/* Regular Save */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSavePost}
                          disabled={translating}
                          className="w-full"
                        >
                          {editingPost ? 'Update (English only)' : 'Save as Draft'}
                        </Button>
                      </div>
                    </fieldset>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Posts Table */}
              <div className="rounded-lg border border-border bg-card">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="w-10 px-4 py-3 text-center text-sm font-medium text-muted-foreground">#</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                      <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post, index) => (
                      <tr key={post.id} className="border-b border-border last:border-0">
                        <td className="w-10 px-4 py-3 text-center font-mono text-sm text-muted-foreground">
                          {posts.length - index}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          <span className="line-clamp-2">{post.title}</span>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {post.category?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {post.status === 'published' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="View live"
                                onClick={() => window.open(`/en/blog/${post.slug}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" title="Edit" onClick={() => openEditPost(post)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete (all languages)"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          No posts yet. Click "New Post" and hit the magic button!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* ── Categories Tab ────────────────────────────────────── */}
            <TabsContent value="categories">
              <div className="mb-4 flex justify-end">
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          placeholder="Category name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Slug</Label>
                        <Input
                          value={newCategory.slug}
                          onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                          placeholder="category-slug (auto-generated)"
                        />
                      </div>
                      <Button onClick={handleAddCategory}>Add Category</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{cat.name}</p>
                        <p className="text-sm text-muted-foreground">/{cat.slug}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="col-span-full py-8 text-center text-muted-foreground">No categories yet.</p>
                )}
              </div>
            </TabsContent>

            {/* ── Tags Tab ──────────────────────────────────────────── */}
            <TabsContent value="tags">
              <div className="mb-4 flex justify-end">
                <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Tag</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                          value={newTag.name}
                          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                          placeholder="Tag name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Slug</Label>
                        <Input
                          value={newTag.slug}
                          onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                          placeholder="tag-slug (auto-generated)"
                        />
                      </div>
                      <Button onClick={handleAddTag}>Add Tag</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
                  >
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{tag.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <p className="w-full py-8 text-center text-muted-foreground">No tags yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
