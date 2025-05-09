const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabase() {
  try {
    console.log('Setting up Supabase...');

    // Example: Create a table
    const { error: tableError } = await supabase.rpc('create_table', {
      table_name: 'example_table',
      schema: {
        id: 'uuid primary key',
        name: 'text not null',
        created_at: 'timestamp default now()'
      }
    });

    if (tableError) {
      throw tableError;
    }

    console.log('Supabase setup completed successfully.');
  } catch (error) {
    console.error('Error setting up Supabase:', error);
  }
}

setupSupabase();
