// This is a reference script showing how to create the admin user in Supabase
// You would run this from your local machine after setting up Supabase CLI
// Replace with your actual Supabase URL and Service Role Key (not the anon key)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Get this from your Supabase dashboard

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  // Create the admin user
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@example.com',
    password: 'admin123',
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating admin user:', error);
  } else {
    console.log('Admin user created successfully:', data);
  }
}

createAdminUser();

// Note: For development purposes, you can also create the user through the Supabase Dashboard:
// 1. Go to Authentication > Users in the Supabase Dashboard
// 2. Click "Add User"
// 3. Enter email: admin@example.com and password: admin123
// 4. Make sure "Auto-confirm email" is checked
