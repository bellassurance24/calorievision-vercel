-- Allow device_tokens to work with anonymous visitors (no user_id required)
-- Add a visitor_id column for anonymous device tracking
ALTER TABLE public.device_tokens 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS visitor_id text;

-- Create index for visitor_id lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_visitor_id ON public.device_tokens(visitor_id) WHERE visitor_id IS NOT NULL;

-- Update RLS policies to allow anonymous device registration
DROP POLICY IF EXISTS "Users can insert their own device tokens" ON public.device_tokens;
DROP POLICY IF EXISTS "Users can view their own device tokens" ON public.device_tokens;
DROP POLICY IF EXISTS "Users can update their own device tokens" ON public.device_tokens;
DROP POLICY IF EXISTS "Users can delete their own device tokens" ON public.device_tokens;

-- New policies that support both authenticated users and anonymous visitors
CREATE POLICY "Anyone can insert device tokens"
  ON public.device_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own device tokens"
  ON public.device_tokens
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own device tokens"
  ON public.device_tokens
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Also allow notification_logs for anonymous users
ALTER TABLE public.notification_logs
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS visitor_id text;

CREATE INDEX IF NOT EXISTS idx_notification_logs_visitor_id ON public.notification_logs(visitor_id) WHERE visitor_id IS NOT NULL;

-- Update RLS for notification_logs to support anonymous users
DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.notification_logs;

CREATE POLICY "Users can view their own notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);