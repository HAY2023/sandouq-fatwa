-- جدول الأرشيفات المشفّرة المخزّنة داخل الموقع
CREATE TABLE IF NOT EXISTS public.site_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  data BYTEA NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  questions_count INTEGER NOT NULL DEFAULT 0,
  logs_count INTEGER NOT NULL DEFAULT 0,
  reports_count INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to site_archives"
ON public.site_archives FOR ALL
USING (false);

-- حفظ أرشيف جديد
CREATE OR REPLACE FUNCTION public.save_site_archive_authenticated(
  p_password TEXT,
  p_filename TEXT,
  p_data_b64 TEXT,
  p_size_bytes BIGINT,
  p_questions_count INTEGER,
  p_logs_count INTEGER,
  p_reports_count INTEGER,
  p_note TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF NOT public.verify_admin_password(p_password) THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO public.site_archives (filename, data, size_bytes, questions_count, logs_count, reports_count, note)
  VALUES (p_filename, decode(p_data_b64, 'base64'), p_size_bytes, p_questions_count, p_logs_count, p_reports_count, p_note)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- عرض قائمة الأرشيفات (بدون البيانات الثنائية)
CREATE OR REPLACE FUNCTION public.list_site_archives_authenticated(p_password TEXT)
RETURNS TABLE(
  id UUID, filename TEXT, size_bytes BIGINT,
  questions_count INTEGER, logs_count INTEGER, reports_count INTEGER,
  note TEXT, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT public.verify_admin_password(p_password) THEN
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    a.id, a.filename, a.size_bytes,
    a.questions_count, a.logs_count, a.reports_count,
    a.note, a.created_at
  FROM public.site_archives a
  ORDER BY a.created_at DESC;
END;
$$;

-- جلب أرشيف محدد (مع البيانات الثنائية كـ base64)
CREATE OR REPLACE FUNCTION public.get_site_archive_authenticated(p_password TEXT, p_archive_id UUID)
RETURNS TABLE(filename TEXT, data_b64 TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT public.verify_admin_password(p_password) THEN
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    a.filename, encode(a.data, 'base64') AS data_b64
  FROM public.site_archives a
  WHERE a.id = p_archive_id;
END;
$$;

-- حذف أرشيف
CREATE OR REPLACE FUNCTION public.delete_site_archive_authenticated(p_password TEXT, p_archive_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT public.verify_admin_password(p_password) THEN
    RETURN false;
  END IF;
  
  DELETE FROM public.site_archives WHERE id = p_archive_id;
  RETURN true;
END;
$$;

-- تصفير جميع بيانات الموقع
CREATE OR REPLACE FUNCTION public.reset_all_site_data_authenticated(p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  q_count INTEGER;
  r_count INTEGER;
  l_count INTEGER;
  n_count INTEGER;
  a_count INTEGER;
  f_count INTEGER;
BEGIN
  IF NOT public.verify_admin_password(p_password) THEN
    RAISE EXCEPTION 'Invalid admin password';
  END IF;
  
  WITH d AS (DELETE FROM public.questions RETURNING 1) SELECT COUNT(*) INTO q_count FROM d;
  WITH d AS (DELETE FROM public.user_reports RETURNING 1) SELECT COUNT(*) INTO r_count FROM d;
  WITH d AS (DELETE FROM public.admin_access_logs RETURNING 1) SELECT COUNT(*) INTO l_count FROM d;
  WITH d AS (DELETE FROM public.notification_history RETURNING 1) SELECT COUNT(*) INTO n_count FROM d;
  WITH d AS (DELETE FROM public.announcements RETURNING 1) SELECT COUNT(*) INTO a_count FROM d;
  WITH d AS (DELETE FROM public.flash_messages RETURNING 1) SELECT COUNT(*) INTO f_count FROM d;
  
  -- إعادة تعيين عداد الإشعارات
  UPDATE public.notification_settings SET questions_since_last_notification = 0;
  
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