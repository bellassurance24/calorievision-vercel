-- Create blog categories table
CREATE TABLE public.blog_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog tags table
CREATE TABLE public.blog_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post status enum
CREATE TYPE public.post_status AS ENUM ('draft', 'published');

-- Create blog posts table
CREATE TABLE public.blog_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    featured_image_url TEXT,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status post_status NOT NULL DEFAULT 'draft',
    meta_title TEXT,
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_tags junction table
CREATE TABLE public.blog_post_tags (
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Categories: Anyone can read, only admins can manage
CREATE POLICY "Anyone can view categories"
ON public.blog_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.blog_categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Tags: Anyone can read, only admins can manage
CREATE POLICY "Anyone can view tags"
ON public.blog_tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tags"
ON public.blog_tags FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Posts: Anyone can read published posts, admins can manage all
CREATE POLICY "Anyone can view published posts"
ON public.blog_posts FOR SELECT
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
ON public.blog_posts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
ON public.blog_posts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
ON public.blog_posts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Post tags: Anyone can read, admins can manage
CREATE POLICY "Anyone can view post tags"
ON public.blog_post_tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage post tags"
ON public.blog_post_tags FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger for posts
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();