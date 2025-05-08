-- Function to execute SQL commands (limited to service_role only)
CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow service_role to execute this function
  IF NOT exists (
    SELECT 1 FROM pg_roles 
    WHERE rolname = current_user 
    AND rolsuper = true
  ) THEN
    RAISE EXCEPTION 'Permission denied. Only service_role can execute this function.';
  END IF;

  EXECUTE sql_string;
END;
$$;