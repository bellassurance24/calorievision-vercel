import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Tag, FolderOpen, Save, RotateCcw } from 'lucide-react';
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
    selectedTags: [] as string[]
  });

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
    interval: 30000, // 30 seconds
    onRestore: handleRestoreDraft
  });

  // Check for draft when dialog opens
  useEffect(() => {
    if (postDialogOpen && !editingPost && hasDraft) {
      setShowDraftRestore(true);
    }
  }, [postDialogOpen, editingPost, hasDraft]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, catsRes, tagsRes] = await Promise.all([
        supabase.from('blog_posts').select('*, category:blog_categories(*)').order('created_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('blog_tags').select('*').order('name')
      ]);

      if (postsRes.data) {
        // Fetch tags for each post
        const postsWithTags = await Promise.all(
          postsRes.data.map(async (post) => {
            const { data: tagData } = await supabase
              .from('blog_post_tags')
              .select('tag_id')
              .eq('post_id', post.id);
            
            if (tagData) {
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
      setCategories(catsRes.data || []);
      setTags(tagsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

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
      selectedTags: []
    });
    setEditingPost(null);
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
      selectedTags: post.tags?.map(t => t.id) || []
    });
    setPostDialogOpen(true);
  };

  const handleSavePost = async () => {
    if (!postForm.title || !postForm.content) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
      return;
    }

    const slug = postForm.slug || generateSlug(postForm.title);
    const publishedAt = postForm.status === 'published' && !editingPost?.published_at
      ? new Date().toISOString()
      : editingPost?.published_at;

    try {
      if (editingPost) {
        // Update post
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
            published_at: publishedAt
          })
          .eq('id', editingPost.id);

        if (error) throw error;

        // Update tags
        await supabase.from('blog_post_tags').delete().eq('post_id', editingPost.id);
        if (postForm.selectedTags.length > 0) {
          await supabase.from('blog_post_tags').insert(
            postForm.selectedTags.map(tagId => ({ post_id: editingPost.id, tag_id: tagId }))
          );
        }

        toast({ title: 'Success', description: 'Post updated successfully' });
      } else {
        // Create post
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
            published_at: publishedAt
          })
          .select()
          .single();

        if (error) throw error;

        // Add tags
        if (postForm.selectedTags.length > 0 && newPost) {
          await supabase.from('blog_post_tags').insert(
            postForm.selectedTags.map(tagId => ({ post_id: newPost.id, tag_id: tagId }))
          );
        }

        toast({ title: 'Success', description: 'Post created successfully' });
      }

      clearDraft(); // Clear auto-saved draft on successful save
      setPostDialogOpen(false);
      resetPostForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Post deleted' });
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

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage blog posts, categories, and tags</p>
          </div>

          {/* Statistics Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Articles</div>
              <div className="mt-1 text-3xl font-bold text-foreground">{posts.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Published</div>
              <div className="mt-1 text-3xl font-bold text-green-600">{posts.filter(p => p.status === 'published').length}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Drafts</div>
              <div className="mt-1 text-3xl font-bold text-yellow-600">{posts.filter(p => p.status === 'draft').length}</div>
            </div>
          </div>

          <Tabs defaultValue="posts">
            <TabsList className="mb-6">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <div className="mb-4 flex justify-end">
              <Dialog open={postDialogOpen} onOpenChange={(open) => { setPostDialogOpen(open); if (!open) resetPostForm(); }}>
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
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Title *</Label>
                      <Input
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        placeholder="Post title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Slug</Label>
                      <Input
                        value={postForm.slug}
                        onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                        placeholder="post-url-slug (auto-generated if empty)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Category</Label>
                        <Select value={postForm.category_id} onValueChange={(val) => setPostForm({ ...postForm, category_id: val })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={postForm.status} onValueChange={(val: 'draft' | 'published') => setPostForm({ ...postForm, status: val })}>
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
                          <label key={tag.id} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={postForm.selectedTags.includes(tag.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPostForm({ ...postForm, selectedTags: [...postForm.selectedTags, tag.id] });
                                } else {
                                  setPostForm({ ...postForm, selectedTags: postForm.selectedTags.filter(id => id !== tag.id) });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{tag.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Featured Image Section - Integrated Media Manager */}
                    <FeaturedImageEditor
                      imageUrl={postForm.featured_image_url}
                      altText={postForm.featured_image_alt}
                      onImageChange={(url) => setPostForm({ ...postForm, featured_image_url: url })}
                      onAltTextChange={(alt) => setPostForm({ ...postForm, featured_image_alt: alt })}
                    />
                    <div className="grid gap-2">
                      <Label>Content *</Label>
                      <BlogPostEditor
                        value={postForm.content}
                        onChange={(val) => setPostForm({ ...postForm, content: val })}
                        placeholder="Write your content here..."
                        featuredImageUrl={postForm.featured_image_url}
                        title={postForm.title}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Meta Title (SEO)</Label>
                      <Input
                        value={postForm.meta_title}
                        onChange={(e) => setPostForm({ ...postForm, meta_title: e.target.value })}
                        placeholder="SEO title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Meta Description (SEO)</Label>
                      <Textarea
                        value={postForm.meta_description}
                        onChange={(e) => setPostForm({ ...postForm, meta_description: e.target.value })}
                        placeholder="SEO description (max 160 chars)"
                        rows={2}
                      />
                    </div>
                    <Button onClick={handleSavePost} className="w-full">
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg border border-border bg-card">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center text-sm font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <tr key={post.id} className="border-b border-border last:border-0">
                      <td className="w-12 px-4 py-3 text-center font-mono text-sm text-muted-foreground">{posts.length - index}</td>
                      <td className="px-4 py-3 text-foreground">{post.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{post.category?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === 'published' && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEditPost(post)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No posts yet. Create your first post!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Categories Tab */}
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
                <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
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
                <p className="col-span-full text-center text-muted-foreground py-8">No categories yet.</p>
              )}
            </div>
          </TabsContent>

          {/* Tags Tab */}
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
                <div key={tag.id} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{tag.name}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDeleteTag(tag.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
              {tags.length === 0 && (
                <p className="w-full text-center text-muted-foreground py-8">No tags yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </AdminLayout>
  );
}
