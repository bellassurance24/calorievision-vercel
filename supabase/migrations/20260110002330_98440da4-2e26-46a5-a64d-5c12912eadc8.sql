-- Fix notification read/unread behavior by allowing users to update their own notification logs

-- Ensure RLS is enabled (should already be true)
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Tighten SELECT policy: users should only see their own logs
DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.notification_logs;
CREATE POLICY "Users can view their own notification logs"
  ON public.notification_logs
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

-- Allow users to mark their own notifications as read
DROP POLICY IF EXISTS "Users can update their own notification logs" ON public.notification_logs;
CREATE POLICY "Users can update their own notification logs"
  ON public.notification_logs
  FOR UPDATE
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
