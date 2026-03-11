-- Types pour les notifications
CREATE TYPE notification_category AS ENUM (
  'meal_reminder',
  'calorie_alert',
  'weekly_summary',
  'motivation',
  'system',
  'promotional'
);

CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed',
  'cancelled'
);

CREATE TYPE device_platform AS ENUM (
  'ios',
  'android',
  'web'
);

-- Table des tokens d'appareils
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform device_platform NOT NULL,
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, token)
);

-- Table des préférences de notifications
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Catégories activées
  meal_reminder_enabled BOOLEAN DEFAULT true,
  calorie_alert_enabled BOOLEAN DEFAULT true,
  weekly_summary_enabled BOOLEAN DEFAULT true,
  motivation_enabled BOOLEAN DEFAULT true,
  system_enabled BOOLEAN DEFAULT true,
  promotional_enabled BOOLEAN DEFAULT false,
  
  -- Fenêtres horaires
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  -- Rappels repas
  breakfast_reminder_time TIME DEFAULT '08:00',
  lunch_reminder_time TIME DEFAULT '12:00',
  dinner_reminder_time TIME DEFAULT '19:00',
  
  -- Timezone
  timezone TEXT DEFAULT 'Europe/Paris',
  
  -- GDPR
  gdpr_consent_given BOOLEAN DEFAULT false,
  gdpr_consent_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- File d'attente des notifications
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category notification_category NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status notification_status DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Historique des notifications
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,
  category notification_category NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status notification_status NOT NULL,
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  batch_id UUID,
  campaign_id TEXT
);

-- Rate limiting
CREATE TABLE notification_rate_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_count INTEGER DEFAULT 0,
  weekly_count INTEGER DEFAULT 0,
  last_notification_at TIMESTAMPTZ,
  last_reset_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id) WHERE is_active = true;
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id, sent_at DESC);

-- RLS Policies pour device_tokens
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own device tokens"
ON device_tokens FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens"
ON device_tokens FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens"
ON device_tokens FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens"
ON device_tokens FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies pour notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON notification_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON notification_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON notification_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies pour notification_queue (service account only)
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queued notifications"
ON notification_queue FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies pour notification_logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification logs"
ON notification_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies pour notification_rate_limits
ALTER TABLE notification_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
ON notification_rate_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Trigger pour créer les préférences par défaut lors de l'inscription
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO notification_rate_limits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_notification_prefs
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_device_tokens_updated_at
BEFORE UPDATE ON device_tokens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();