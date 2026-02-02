-- Update the settings update function to include countdown colors
CREATE OR REPLACE FUNCTION public.update_settings_authenticated(
  p_password TEXT,
  p_is_box_open BOOLEAN DEFAULT NULL,
  p_next_session_date TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_video_title TEXT DEFAULT NULL,
  p_show_countdown BOOLEAN DEFAULT NULL,
  p_show_question_count BOOLEAN DEFAULT NULL,
  p_show_install_page BOOLEAN DEFAULT NULL,
  p_countdown_style INTEGER DEFAULT NULL,
  p_content_filter_enabled BOOLEAN DEFAULT NULL,
  p_maintenance_mode BOOLEAN DEFAULT NULL,
  p_maintenance_message TEXT DEFAULT NULL,
  p_countdown_bg_color TEXT DEFAULT NULL,
  p_countdown_text_color TEXT DEFAULT NULL,
  p_countdown_border_color TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_valid BOOLEAN;
BEGIN
  SELECT verify_admin_password(p_password) INTO is_valid;
  
  IF NOT is_valid THEN
    RETURN FALSE;
  END IF;
  
  UPDATE settings
  SET 
    is_box_open = COALESCE(p_is_box_open, is_box_open),
    next_session_date = CASE 
      WHEN p_next_session_date IS NOT NULL THEN p_next_session_date::timestamp with time zone 
      ELSE next_session_date 
    END,
    video_url = COALESCE(p_video_url, video_url),
    video_title = COALESCE(p_video_title, video_title),
    show_countdown = COALESCE(p_show_countdown, show_countdown),
    show_question_count = COALESCE(p_show_question_count, show_question_count),
    show_install_page = COALESCE(p_show_install_page, show_install_page),
    countdown_style = COALESCE(p_countdown_style, countdown_style),
    content_filter_enabled = COALESCE(p_content_filter_enabled, content_filter_enabled),
    maintenance_mode = COALESCE(p_maintenance_mode, maintenance_mode),
    maintenance_message = COALESCE(p_maintenance_message, maintenance_message),
    countdown_bg_color = COALESCE(p_countdown_bg_color, countdown_bg_color),
    countdown_text_color = COALESCE(p_countdown_text_color, countdown_text_color),
    countdown_border_color = COALESCE(p_countdown_border_color, countdown_border_color),
    updated_at = now()
  WHERE id = (SELECT id FROM settings LIMIT 1);
  
  RETURN TRUE;
END;
$$;