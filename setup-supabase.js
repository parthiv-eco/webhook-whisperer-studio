#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing Supabase setup...');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file from .env.example...');
  try {
    // If .env.example exists, copy it to .env
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
    } else {
      // Otherwise create a minimal .env file
      fs.writeFileSync(envPath, `# Supabase Configuration
VITE_SUPABASE_URL=https://tgdglmsfhlzphoenglpv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZGdsbXNmaGx6cGhvZW5nbHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NzU2MzMsImV4cCI6MjA2MTA1MTYzM30.YNN8ADl38QcCnvSL3GsuGUApjdSCwEv9Me2g1yQNoGA
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZGdsbXNmaGx6cGhvZW5nbHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ3NTYzMywiZXhwIjoyMDYxMDUxNjMzfQ.ZnysQFM8AFQ-E75NiOPyGNtA42KGBlPPkBs4vyTMYa8

# Optional: Environment name
VITE_ENV=development`);
    }
  } catch (err) {
    console.error('Error creating .env file:', err);
  }
}

// Create the database setup functions in Supabase
console.log('Creating database setup functions...');

try {
  // Create SQL file with setup functions
  const sqlFunctionsPath = path.join(process.cwd(), 'supabase', 'setup-functions.sql');
  const sqlDir = path.dirname(sqlFunctionsPath);
  
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir, { recursive: true });
  }
  
  fs.writeFileSync(sqlFunctionsPath, `
-- Function to create demo_credentials table
CREATE OR REPLACE FUNCTION public.create_demo_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.demo_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  );
END;
$$;

-- Function to check credentials
CREATE OR REPLACE FUNCTION public.check_demo_credentials(p_email text, p_password text)
RETURNS TABLE(is_valid boolean, user_role text)
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

-- Function to seed demo data
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing data to avoid duplicates
  DELETE FROM public.demo_credentials;
  
  -- Insert admin user
  INSERT INTO public.demo_credentials (email, password, role)
  VALUES ('admin@example.com', 'admin123', 'admin');
  
  -- Insert regular user
  INSERT INTO public.demo_credentials (email, password, role)
  VALUES ('user@example.com', 'user123', 'user');
END;
$$;
`);

  console.log('✅ Setup functions created');
  console.log('✅ Supabase setup complete!');
  console.log('\nTo run the app with Supabase initialization:');
  console.log('1. Run: node supabase/setup.js');
  console.log('2. Start app: npm run dev');
  
} catch (err) {
  console.error('Error during setup:', err);
  process.exit(1);
}
