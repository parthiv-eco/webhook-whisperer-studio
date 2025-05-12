
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory name (for ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL or anon key not found in environment variables.');
  console.error('Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a function to execute SQL files
async function execSql(sqlFilePath) {
  try {
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error executing SQL from ${sqlFilePath}:`, error);
    throw error;
  }
}

// Create tables using SQL file
async function createTables() {
  try {
    const sqlFilePath = path.join(__dirname, 'setup-tables.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ SQL file not found: ${sqlFilePath}`);
      return false;
    }
    
    await execSql(sqlFilePath);
    return true;
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}

// Create functions using SQL file
async function createFunctions() {
  try {
    const sqlFilePath = path.join(__dirname, 'setup-functions.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ SQL file not found: ${sqlFilePath}`);
      return false;
    }
    
    await execSql(sqlFilePath);
    return true;
  } catch (error) {
    console.error('Error creating database functions:', error);
    throw error;
  }
}

// Check if tables exist
async function tablesExist() {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {  // PGRST116 is "no results found" which is fine
      console.log('Tables do not exist or cannot be accessed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('Error checking if tables exist:', error);
    return false;
  }
}

// Insert sample categories
async function seedCategories() {
  try {
    const categories = [
      { name: 'API Services', description: 'External API service webhooks', color: '#4f46e5' },
      { name: 'Notifications', description: 'Notification and alert webhooks', color: '#10b981' },
      { name: 'Payments', description: 'Payment processing webhooks', color: '#f59e0b' },
      { name: 'Authentication', description: 'Authentication webhooks', color: '#ef4444' },
    ];
    
    const { error } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error seeding sample categories:', error);
    return false;
  }
}

// Insert demo credentials
async function seedDemoCredentials() {
  try {
    const credentials = [
      { email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { email: 'user@example.com', password: 'user123', role: 'user' },
    ];
    
    const { error } = await supabase
      .from('demo_credentials')
      .upsert(credentials, { onConflict: 'email' });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error seeding demo credentials:', error);
    return false;
  }
}

// Setup database
async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...');
  
  try {
    // Check if tables exist first
    const exist = await tablesExist();
    
    if (!exist) {
      console.log('Creating database tables...');
      await createTables();
      console.log('Creating database functions...');
      await createFunctions();
      console.log('✅ Database structure created successfully');
    } else {
      console.log('✅ Database tables already exist');
    }
    
    // Seed data
    console.log('Seeding demo credentials...');
    const demoResult = await seedDemoCredentials();
    if (!demoResult) console.log('Error seeding demo credentials: {}');
    
    console.log('Seeding sample data...');
    const categoriesResult = await seedCategories();
    if (!categoriesResult) console.log('Error seeding sample categories: {}');
    
    return true;
  } catch (error) {
    console.error('❌ Supabase setup failed:', error);
    throw error;
  }
}

// Run the setup
try {
  await setupDatabase();
  console.log('✅ Supabase setup completed successfully!');
} catch (error) {
  console.error('❌ Supabase setup failed:', error.message);
  process.exit(1);
}
