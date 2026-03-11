-- Create settings table for app configuration
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read settings
CREATE POLICY "Admins can view settings"
ON public.settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
ON public.settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default contact email setting
INSERT INTO public.settings (key, value, description)
VALUES ('contact_email', 'support@calorievision.online', 'Email address to receive contact form submissions');