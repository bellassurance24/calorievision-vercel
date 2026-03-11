-- Add delete policy for admins on user_scans
CREATE POLICY "Admins can delete user scans"
ON public.user_scans
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));