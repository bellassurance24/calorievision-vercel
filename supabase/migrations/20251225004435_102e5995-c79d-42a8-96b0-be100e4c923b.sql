-- Add RLS DELETE policy on notification_queue so users can delete only their own pending notifications
CREATE POLICY "Users can delete their own pending notifications"
ON public.notification_queue
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');