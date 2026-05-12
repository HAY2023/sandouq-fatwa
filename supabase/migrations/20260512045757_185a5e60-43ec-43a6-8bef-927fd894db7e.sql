CREATE OR REPLACE FUNCTION public.reset_all_site_data_authenticated(p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_valid BOOLEAN;
  q_count INT := 0; r_count INT := 0; l_count INT := 0;
  n_count INT := 0; a_count INT := 0; f_count INT := 0;
BEGIN
  SELECT public.verify_admin_password(p_password) INTO is_valid;
  IF NOT is_valid THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  WITH d AS (DELETE FROM public.questions WHERE true RETURNING 1) SELECT COUNT(*) INTO q_count FROM d;
  WITH d AS (DELETE FROM public.user_reports WHERE true RETURNING 1) SELECT COUNT(*) INTO r_count FROM d;
  WITH d AS (DELETE FROM public.admin_access_logs WHERE true RETURNING 1) SELECT COUNT(*) INTO l_count FROM d;
  WITH d AS (DELETE FROM public.notification_history WHERE true RETURNING 1) SELECT COUNT(*) INTO n_count FROM d;
  WITH d AS (DELETE FROM public.announcements WHERE true RETURNING 1) SELECT COUNT(*) INTO a_count FROM d;
  WITH d AS (DELETE FROM public.flash_messages WHERE true RETURNING 1) SELECT COUNT(*) INTO f_count FROM d;

  UPDATE public.notification_settings SET questions_since_last_notification = 0 WHERE true;

  RETURN jsonb_build_object(
    'questions_deleted', q_count,
    'reports_deleted', r_count,
    'logs_deleted', l_count,
    'notifications_deleted', n_count,
    'announcements_deleted', a_count,
    'flash_messages_deleted', f_count
  );
END;
$$;