CREATE OR REPLACE FUNCTION public.delete_all_access_logs_authenticated(p_password text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.verify_security_password(p_password) THEN
    RETURN -1;
  END IF;

  WITH d AS (DELETE FROM public.admin_access_logs RETURNING 1)
  SELECT COUNT(*) INTO deleted_count FROM d;

  RETURN deleted_count;
END;
$$;