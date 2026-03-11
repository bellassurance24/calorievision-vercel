-- Add location and device brand columns to user_scans table
ALTER TABLE public.user_scans 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS device_brand TEXT;