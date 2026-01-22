-- Add countdown_style column to settings table
ALTER TABLE public.settings 
ADD COLUMN countdown_style INTEGER DEFAULT 1;