
-- Create tables for the webhook application

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create demo_credentials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.demo_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhooks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    method TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    headers JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_payload TEXT DEFAULT '',
    example_payloads JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
    status INTEGER NOT NULL,
    status_text TEXT NOT NULL,
    headers JSONB NOT NULL,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
