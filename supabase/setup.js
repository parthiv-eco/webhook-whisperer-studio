
#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

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
    // Check for demo_credentials table
    const { error: checkError, count } = await supabase
      .from('demo_credentials')
      .select('*', { count: 'exact', head: true });

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        // Table doesn't exist, create it
        console.log('Creating demo_credentials table...');
        
        // Create table
        const { error: createError } = await supabase.rpc(
          'create_demo_table',
          {}
        );
        
        if (createError) {
          throw new Error(`Error creating demo_credentials table: ${createError.message}`);
        }

        // Create function for checking credentials
        const { error: functionError } = await supabase.rpc(
          'create_check_credentials_function',
          {}
        );
        
        if (functionError) {
          throw new Error(`Error creating check_demo_credentials function: ${functionError.message}`);
        }

        // Seed demo data
        console.log('Inserting demo users...');
        const { error: seedError } = await supabase
          .rpc('seed_demo_data');
          
        if (seedError) {
          throw new Error(`Error seeding demo data: ${seedError.message}`);
        }
      } else {
        throw new Error(`Error checking for demo_credentials table: ${checkError.message}`);
      }
    } else if (count === 0) {
      // Table exists but is empty, seed it
      console.log('Seeding empty demo_credentials table...');
      const { error: seedError } = await supabase
        .rpc('seed_demo_data');
        
      if (seedError) {
        throw new Error(`Error seeding demo data: ${seedError.message}`);
      }
    } else {
      console.log('Demo credentials already set up.');
    }

    console.log('✅ Supabase setup completed successfully!');
  } catch (error) {
    console.error('❌ Supabase setup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

setupDatabase();
