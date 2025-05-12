
#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials in .env file');
  console.error('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY set');
  process.exit(1);
}

// Create Supabase client with service role for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...');

  try {
    // Check for categories table
    const { error: checkCategoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    // Check for webhooks table
    const { error: checkWebhooksError } = await supabase
      .from('webhooks')
      .select('*', { count: 'exact', head: true });

    // Check for webhook_responses table
    const { error: checkResponsesError } = await supabase
      .from('webhook_responses')
      .select('*', { count: 'exact', head: true });

    // Check for demo_credentials table
    const { error: checkCredsError } = await supabase
      .from('demo_credentials')
      .select('*', { count: 'exact', head: true });

    // If tables don't exist or SQL error with code PGRST116, create tables
    if (
      (checkCategoriesError && checkCategoriesError.code === 'PGRST116') ||
      (checkWebhooksError && checkWebhooksError.code === 'PGRST116') ||
      (checkResponsesError && checkResponsesError.code === 'PGRST116') ||
      (checkCredsError && checkCredsError.code === 'PGRST116')
    ) {
      console.log('Creating database tables...');
      
      // Read SQL file and execute the SQL commands
      const sqlFilePath = path.join(__dirname, 'setup-functions.sql');
      if (fs.existsSync(sqlFilePath)) {
        const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Check if exec_sql function exists
        const hasExecSql = await createExecSqlFunction();
        
        if (hasExecSql) {
          // Execute SQL commands
          const { error: sqlError } = await supabase.rpc('exec_sql', {
            sql_commands: sqlCommands
          });
          
          if (sqlError) {
            console.error('Error executing SQL commands:', sqlError);
            
            // Try alternative approach - create tables directly
            console.log('Attempting to create tables directly...');
            await setupTablesDirectly();
          } else {
            console.log('✅ Successfully created database tables and policies');
          }
        } else {
          console.log('Could not use exec_sql function, creating tables directly...');
          await setupTablesDirectly();
        }
      } else {
        console.log('SQL file not found, creating tables directly...');
        await setupTablesDirectly();
      }
    } else {
      console.log('✅ Database tables already exist');
      
      // Check if demo data needs to be inserted
      const { count: credsCount } = await supabase
        .from('demo_credentials')
        .select('*', { count: 'exact', head: true });
      
      if (!credsCount) {
        console.log('Seeding demo credentials...');
        await seedDemoCredentials();
      }
      
      // Check if sample webhooks and categories need to be inserted
      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
        
      const { count: webhooksCount } = await supabase
        .from('webhooks')
        .select('*', { count: 'exact', head: true });
      
      if (!categoriesCount || !webhooksCount) {
        console.log('Seeding sample data...');
        await seedSampleData();
      }
    }

    console.log('✅ Supabase setup completed successfully!');
  } catch (error) {
    console.error('❌ Supabase setup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

async function setupTablesDirectly() {
  try {
    // Create categories table
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql_commands: `
        CREATE TABLE IF NOT EXISTS public.categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          color TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow authenticated users full access to categories" 
        ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
      `
    });
    
    if (categoriesError) console.error('Error creating categories table:', categoriesError);
    
    // Create webhooks table
    const { error: webhooksError } = await supabase.rpc('exec_sql', {
      sql_commands: `
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
        
        ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow authenticated users full access to webhooks" 
        ON public.webhooks FOR ALL TO authenticated USING (true) WITH CHECK (true);
      `
    });
    
    if (webhooksError) console.error('Error creating webhooks table:', webhooksError);
    
    // Create webhook_responses table
    const { error: responsesError } = await supabase.rpc('exec_sql', {
      sql_commands: `
        CREATE TABLE IF NOT EXISTS public.webhook_responses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
          status INTEGER NOT NULL,
          status_text TEXT NOT NULL,
          headers JSONB NOT NULL,
          data JSONB,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        
        ALTER TABLE public.webhook_responses ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow authenticated users full access to webhook_responses" 
        ON public.webhook_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
      `
    });
    
    if (responsesError) console.error('Error creating webhook_responses table:', responsesError);
    
    // Create demo_credentials table
    const { error: credsError } = await supabase.rpc('exec_sql', {
      sql_commands: `
        CREATE TABLE IF NOT EXISTS public.demo_credentials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.demo_credentials ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Admin users can read all demo credentials" 
          ON public.demo_credentials 
          FOR SELECT 
          TO authenticated 
          USING (true);
        
        CREATE INDEX IF NOT EXISTS demo_credentials_email_idx ON public.demo_credentials (email);
        
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
        
        GRANT EXECUTE ON FUNCTION public.check_demo_credentials TO anon, authenticated;
      `
    });
    
    if (credsError) console.error('Error creating demo_credentials table:', credsError);
    
    // Seed demo data
    await seedDemoCredentials();
    await seedSampleData();
    
  } catch (error) {
    console.error('Error setting up tables directly:', error);
    throw error;
  }
}

async function seedDemoCredentials() {
  try {
    const { error } = await supabase
      .from('demo_credentials')
      .insert([
        { email: 'admin@example.com', password: 'admin123', role: 'admin' },
        { email: 'user@example.com', password: 'user123', role: 'user' }
      ]);
    
    if (error) {
      console.error('Error seeding demo credentials:', error);
    } else {
      console.log('✅ Demo credentials seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding demo credentials:', error);
  }
}

async function seedSampleData() {
  try {
    // Add sample categories
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .insert([
        { name: 'API Testing', description: 'Webhooks for testing REST APIs', color: '#3B82F6' },
        { name: 'Notifications', description: 'Webhooks for notification services', color: '#10B981' },
        { name: 'Development', description: 'Development and debugging webhooks', color: '#8B5CF6' }
      ])
      .select('*');
    
    if (categoryError) {
      console.error('Error seeding sample categories:', categoryError);
      return;
    }
    
    if (categories && categories.length > 0) {
      // Add sample webhooks
      const { error: webhookError } = await supabase
        .from('webhooks')
        .insert([
          {
            name: 'JSON Placeholder Test',
            description: 'Test webhook to JSONPlaceholder API',
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'POST',
            category_id: categories[0].id,
            headers: JSON.stringify([
              { key: 'Content-Type', value: 'application/json', enabled: true }
            ]),
            default_payload: JSON.stringify({ title: 'Test Post', body: 'This is a test post', userId: 1 }, null, 2),
            example_payloads: JSON.stringify([
              { name: 'Basic Post', payload: JSON.stringify({ title: 'Basic Test', body: 'Simple test body', userId: 1 }, null, 2) },
              { name: 'Advanced Post', payload: JSON.stringify({ title: 'Advanced Test', body: 'Detailed test description', userId: 2, tags: ['test', 'example'] }, null, 2) }
            ])
          },
          {
            name: 'Public Echo API',
            description: 'Webhook to echo the request body',
            url: 'https://postman-echo.com/post',
            method: 'POST',
            category_id: categories[2].id,
            headers: JSON.stringify([
              { key: 'Content-Type', value: 'application/json', enabled: true },
              { key: 'X-Custom-Header', value: 'Custom Value', enabled: true }
            ]),
            default_payload: JSON.stringify({ message: 'Hello World!', timestamp: new Date().toISOString() }, null, 2)
          },
          {
            name: 'Get Todo Item',
            description: 'Retrieve a sample todo item',
            url: 'https://jsonplaceholder.typicode.com/todos/1',
            method: 'GET',
            category_id: categories[0].id,
            headers: JSON.stringify([]),
            default_payload: ''
          }
        ]);
      
      if (webhookError) {
        console.error('Error seeding sample webhooks:', webhookError);
      } else {
        console.log('✅ Sample data seeded successfully');
      }
    }
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  try {
    // First try to execute a simple SQL statement to check if function exists
    const { error } = await supabase.rpc('exec_sql', {
      sql_commands: `SELECT 1`
    });
    
    // If function doesn't exist, create it
    if (error && error.message.includes('function exec_sql(text) does not exist')) {
      // Use raw SQL execution to create the function
      const { error: createError } = await supabase.sql(`
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
      `);
      
      if (createError) {
        console.error('Could not create exec_sql function:', createError);
        return false;
      }
      
      return true;
    } else if (error) {
      console.error('Error checking exec_sql function:', error);
      return false;
    } else {
      // Function exists and works
      return true;
    }
  } catch (error) {
    console.error('Error checking/creating exec_sql function:', error);
    return false;
  }
}

// Start the setup process
setupDatabase();
