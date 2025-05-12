 
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
    // First, create the necessary tables
    await createTables();
    
    // Then check if sample data needs to be inserted
    await seedData();

    console.log('✅ Supabase setup completed successfully!');
  } catch (error) {
    console.error('❌ Supabase setup failed:');
    console.error(error.message || error);
    process.exit(1);
  }
}

async function createTables() {
  try {
    // Execute SQL from the setup-functions.sql file
    const sqlFilePath = path.join(__dirname, 'setup-functions.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('SQL setup file not found: ' + sqlFilePath);
    }
    
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    const { error } = await supabase.sql(sqlCommands);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Database tables and functions created successfully');
  } catch (error) {
    if (error.message?.includes('relation') && error.message?.includes('already exists')) {
      console.log('✅ Database tables already exist');
    } else {
      console.error('Error creating database tables:', error);
      throw error;
    }
  }
}

async function seedData() {
  try {
    // Check if demo credentials need to be seeded
    const { data: credentialsData, error: credentialsError } = await supabase
      .from('demo_credentials')
      .select('*', { count: 'exact', head: true });
      
    if (credentialsError) {
      throw new Error(`Error checking demo credentials: ${credentialsError.message}`);
    }

    if (!credentialsData || credentialsData.length === 0) {
      console.log('Seeding demo credentials...');
      await seedDemoCredentials();
    } else {
      console.log('✅ Demo credentials already exist');
    }
    
    // Check if categories and webhooks need to be seeded
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
      
    if (categoriesError) {
      throw new Error(`Error checking categories: ${categoriesError.message}`);
    }

    if (!categoriesData || categoriesData.length === 0) {
      console.log('Seeding sample data...');
      await seedSampleData();
    } else {
      console.log('✅ Sample data already exists');
    }
  } catch (error) {
    console.error('Error seeding data:', error.message || error);
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
      throw error;
    }
    console.log('✅ Demo credentials seeded successfully');
  } catch (error) {
    console.error('Error seeding demo credentials:', error.message || error);
    throw error;
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
      throw categoryError;
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
        throw webhookError;
      }
      console.log('✅ Sample data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding sample data:', error.message || error);
    throw error;
  }
}

// Start the setup process
setupDatabase();
