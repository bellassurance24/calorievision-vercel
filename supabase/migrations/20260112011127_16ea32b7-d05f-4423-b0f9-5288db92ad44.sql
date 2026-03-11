-- Create homepage_sections table for section-specific content and settings
CREATE TABLE public.homepage_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key text NOT NULL UNIQUE,
    title text,
    subtitle text,
    description text,
    is_visible boolean DEFAULT true,
    display_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create homepage_section_items table for items within sections (features, steps, etc.)
CREATE TABLE public.homepage_section_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id uuid REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
    title text,
    description text,
    icon_url text,
    image_url text,
    display_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create homepage_images table for section images
CREATE TABLE public.homepage_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key text NOT NULL,
    image_url text NOT NULL,
    alt_text text,
    image_type text DEFAULT 'background',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create homepage_colors table for advanced color settings
CREATE TABLE public.homepage_colors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    color_key text NOT NULL UNIQUE,
    color_value text NOT NULL,
    color_category text DEFAULT 'general',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_colors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_sections
CREATE POLICY "Anyone can view homepage sections" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Admins can insert homepage sections" ON public.homepage_sections FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update homepage sections" ON public.homepage_sections FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete homepage sections" ON public.homepage_sections FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for homepage_section_items
CREATE POLICY "Anyone can view homepage section items" ON public.homepage_section_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert homepage section items" ON public.homepage_section_items FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update homepage section items" ON public.homepage_section_items FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete homepage section items" ON public.homepage_section_items FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for homepage_images
CREATE POLICY "Anyone can view homepage images" ON public.homepage_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert homepage images" ON public.homepage_images FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update homepage images" ON public.homepage_images FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete homepage images" ON public.homepage_images FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for homepage_colors
CREATE POLICY "Anyone can view homepage colors" ON public.homepage_colors FOR SELECT USING (true);
CREATE POLICY "Admins can insert homepage colors" ON public.homepage_colors FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update homepage colors" ON public.homepage_colors FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete homepage colors" ON public.homepage_colors FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_homepage_section_items_updated_at BEFORE UPDATE ON public.homepage_section_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_homepage_images_updated_at BEFORE UPDATE ON public.homepage_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_homepage_colors_updated_at BEFORE UPDATE ON public.homepage_colors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, description, is_visible, display_order) VALUES
('hero', 'Understand your meal better with CalorieVision.', 'AI Meal Analysis From a Photo - Instantly', 'Upload a simple picture of your plate and let CalorieVision estimate the foods present, portion sizes, and approximate calories.', true, 1),
('about', 'What is CalorieVision?', 'Learn More About Us', '', true, 2),
('features', 'Features', 'What We Offer', '', true, 3),
('how-it-works', 'How It Works', 'Simple Steps', '', true, 4),
('cta', 'Get Started Today', '', 'Start analyzing your meals with AI-powered calorie estimation.', true, 5),
('footer', '', '', '', true, 6);

-- Insert default color settings
INSERT INTO public.homepage_colors (color_key, color_value, color_category) VALUES
-- Header colors
('header_background', '#9b87f5', 'header'),
('header_text', '#ffffff', 'header'),
('nav_link', '#ffffff', 'header'),
('nav_hover', '#e0e0e0', 'header'),
-- Hero colors
('hero_background', '#1A1F2C', 'hero'),
('hero_overlay', '#000000', 'hero'),
('hero_title', '#ffffff', 'hero'),
('hero_subtitle', '#9b87f5', 'hero'),
('hero_description', '#94a3b8', 'hero'),
-- Button colors
('primary_button_bg', '#9b87f5', 'buttons'),
('primary_button_text', '#ffffff', 'buttons'),
('primary_button_hover_bg', '#7E69AB', 'buttons'),
('primary_button_hover_text', '#ffffff', 'buttons'),
('secondary_button_bg', 'transparent', 'buttons'),
('secondary_button_text', '#9b87f5', 'buttons'),
('secondary_button_hover_bg', 'rgba(155, 135, 245, 0.1)', 'buttons'),
('secondary_button_hover_text', '#9b87f5', 'buttons'),
-- Section colors
('section_background', '#1A1F2C', 'sections'),
('section_title', '#ffffff', 'sections'),
('section_subtitle', '#9b87f5', 'sections'),
('section_text', '#94a3b8', 'sections'),
-- Card colors
('card_background', '#1E2330', 'cards'),
('card_border', '#333333', 'cards'),
('card_shadow', 'rgba(0, 0, 0, 0.3)', 'cards'),
('card_hover_background', '#252a3a', 'cards'),
-- Link colors
('link_color', '#9b87f5', 'links'),
('link_hover', '#7E69AB', 'links'),
-- Footer colors
('footer_background', '#9b87f5', 'footer'),
('footer_text', '#ffffff', 'footer'),
('footer_link', '#ffffff', 'footer'),
('footer_link_hover', '#e0e0e0', 'footer'),
-- Other colors
('icon_color', '#9b87f5', 'other'),
('border_color', '#333333', 'other'),
('divider_color', '#333333', 'other'),
('input_background', '#1E2330', 'other'),
('input_border', '#333333', 'other'),
('input_text', '#ffffff', 'other'),
('input_focus_border', '#9b87f5', 'other');