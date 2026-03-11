-- Add missing columns to analytics_events table for comprehensive tracking
ALTER TABLE public.analytics_events
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS visitor_id TEXT,
ADD COLUMN IF NOT EXISTS screen_width INTEGER,
ADD COLUMN IF NOT EXISTS screen_height INTEGER;

-- Create index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Create index for visitor tracking
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON public.analytics_events(visitor_id);

-- Create index for session tracking
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);