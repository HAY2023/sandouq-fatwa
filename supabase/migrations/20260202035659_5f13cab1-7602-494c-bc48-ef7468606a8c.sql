-- Add countdown color customization columns to settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS countdown_bg_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS countdown_text_color TEXT DEFAULT '#22c55e',
ADD COLUMN IF NOT EXISTS countdown_border_color TEXT DEFAULT '#166534';