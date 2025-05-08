-- Setup Categories Table
CREATE OR REPLACE FUNCTION setup_categories_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6E42CE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
  );

  -- RLS Policy
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Allow read access for authenticated users" ON categories;
  CREATE POLICY "Allow read access for authenticated users"
    ON categories FOR SELECT
    USING (auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Allow insert for authenticated users" ON categories;
  CREATE POLICY "Allow insert for authenticated users"
    ON categories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Allow update for owners" ON categories;
  CREATE POLICY "Allow update for owners"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Allow delete for owners" ON categories;
  CREATE POLICY "Allow delete for owners"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);
END;
$$;

-- Setup Webhooks Table
CREATE OR REPLACE FUNCTION setup_webhooks_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    method TEXT NOT NULL,
    headers JSONB DEFAULT '[]'::jsonb,
    default_payload TEXT,
    example_payloads JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
  );

  -- RLS Policy
  ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Allow read access for authenticated users" ON webhooks;
  CREATE POLICY "Allow read access for authenticated users"
    ON webhooks FOR SELECT
    USING (auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Allow insert for authenticated users" ON webhooks;
  CREATE POLICY "Allow insert for authenticated users"
    ON webhooks FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Allow update for owners" ON webhooks;
  CREATE POLICY "Allow update for owners"
    ON webhooks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Allow delete for owners" ON webhooks;
  CREATE POLICY "Allow delete for owners"
    ON webhooks FOR DELETE
    USING (auth.uid() = user_id);
END;
$$;

-- Setup Webhook Responses Table
CREATE OR REPLACE FUNCTION setup_webhook_responses_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS webhook_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    status INTEGER NOT NULL,
    status_text TEXT,
    headers JSONB,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
  );

  -- RLS Policy
  ALTER TABLE webhook_responses ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Allow read access for authenticated users" ON webhook_responses;
  CREATE POLICY "Allow read access for authenticated users"
    ON webhook_responses FOR SELECT
    USING (auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Allow insert for authenticated users" ON webhook_responses;
  CREATE POLICY "Allow insert for authenticated users"
    ON webhook_responses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Allow delete for owners" ON webhook_responses;
  CREATE POLICY "Allow delete for owners"
    ON webhook_responses FOR DELETE
    USING (auth.uid() = user_id);
END;
$$;