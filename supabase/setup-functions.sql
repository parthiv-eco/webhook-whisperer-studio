
-- Function to check demo credentials
CREATE OR REPLACE FUNCTION public.check_demo_credentials(p_email TEXT, p_password TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    user_role TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE as is_valid,
        dc.role as user_role
    FROM
        public.demo_credentials dc
    WHERE
        dc.email = p_email AND
        dc.password = p_password;
END;
$$;

-- Function to execute arbitrary SQL (for setup purposes)
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    EXECUTE sql;
END;
$$;

-- Supabase RPC permissions
GRANT EXECUTE ON FUNCTION public.check_demo_credentials TO anon;
GRANT EXECUTE ON FUNCTION public.check_demo_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_demo_credentials TO service_role;

-- Only allow service_role to execute arbitrary SQL (for setup)
REVOKE EXECUTE ON FUNCTION public.exec_sql FROM anon;
REVOKE EXECUTE ON FUNCTION public.exec_sql FROM authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql TO service_role;
