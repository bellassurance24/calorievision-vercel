export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  localized_slug?: string | null;  // per-language SEO slug; falls back to slug
  featured_image_url: string | null;
  featured_image_alt: string | null;
  content: string;
  category_id: string | null;
  author_id: string;
  status: 'draft' | 'published';
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPostTag {
  post_id: string;
  tag_id: string;
}
