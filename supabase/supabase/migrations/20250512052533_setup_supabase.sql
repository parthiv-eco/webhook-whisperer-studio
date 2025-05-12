-- Start with creating the exec_sql function if needed
CREATE OR REPLACE FUNCTION public.exec_sql(sql_commands TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_commands;
END;
$$;

GRANT EXECUTE ON FUNCTION public.exec_sql TO service_role;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id),
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    method TEXT NOT NULL,
    headers JSONB DEFAULT '[]'::jsonb NOT NULL,
    default_payload TEXT DEFAULT '',
    example_payloads JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create webhook responses table
CREATE TABLE IF NOT EXISTS public.webhook_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
    status INTEGER NOT NULL,
    status_text TEXT NOT NULL,
    headers JSONB NOT NULL,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_responses ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access
CREATE POLICY "Allow authenticated users full access to categories" 
  ON public.categories 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to webhooks" 
  ON public.webhooks 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to webhook_responses" 
  ON public.webhook_responses 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Create a table to store demo credentials
CREATE TABLE IF NOT EXISTS public.demo_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to see all credentials
CREATE POLICY "Admin users can read all demo credentials" 
  ON public.demo_credentials 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create index on email
CREATE INDEX IF NOT EXISTS demo_credentials_email_idx 
  ON public.demo_credentials (email);

-- Create helper function to check demo credentials
CREATE OR REPLACE FUNCTION public.check_demo_credentials(p_email TEXT, p_password TEXT) 
RETURNS TABLE (
  is_valid BOOLEAN,
  user_role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_valid,
    role as user_role
  FROM 
    public.demo_credentials
  WHERE 
    email = p_email
    AND password = p_password;
END;
$$;

-- Allow anonymous access to the check_demo_credentials function
GRANT EXECUTE ON FUNCTION public.check_demo_credentials TO anon, authenticated;
