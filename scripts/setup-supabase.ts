import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/integrations/supabase/types'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config()

const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '))
  process.exit(1)
}

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function runSqlFile(filePath: string): Promise<void> {
  try {
    const sql = readFileSync(filePath, 'utf8')
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql })
    if (error) throw error
  } catch (error: any) {
    console.error(`Error running SQL file ${filePath}:`, error.message)
    throw error
  }
}

async function setupDatabase() {
  console.log('Setting up database...')
  
  try {
    // Run migrations
    const setupSqlPath = resolve(__dirname, '../supabase/migrations/00000000000000_setup.sql')
    const initSqlPath = resolve(__dirname, '../supabase/migrations/00000000000001_init.sql')

    console.log('Running setup migration...')
    await runSqlFile(setupSqlPath)
    console.log('✅ Setup migration completed')

    console.log('Running init migration...')
    await runSqlFile(initSqlPath)
    console.log('✅ Init migration completed')

    // Verify tables exist
    const tables = ['categories', 'webhooks', 'webhook_responses']
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (error) {
        throw new Error(`Table ${table} was not created successfully: ${error.message}`)
      }
      console.log(`✅ Table ${table} verified`)
    }

    return true
  } catch (error: any) {
    console.error('❌ Error setting up database:', error.message)
    if (error.details) console.error('Details:', error.details)
    return false
  }
}

async function updateSupabaseConfig() {
  try {
    console.log('Updating Supabase configuration...')
    const configPath = resolve(__dirname, '../supabase/config.toml')
    
    // Extract project ID from Supabase URL
    const projectId = process.env.VITE_SUPABASE_URL!.split('.')[0].split('//')[1]
    
    const updatedConfig = `project_id = "${projectId}"\n`
    writeFileSync(configPath, updatedConfig)
    
    console.log('✅ Supabase config updated successfully')
    return true
  } catch (error: any) {
    console.error('❌ Error updating Supabase config:', error.message)
    if (error.details) console.error('Details:', error.details)
    return false
  }
}

async function main() {
  try {
    console.log('🚀 Starting Supabase setup...')
    
    const dbSetup = await setupDatabase()
    if (!dbSetup) {
      console.error('❌ Database setup failed')
      process.exit(1)
    }

    const configUpdate = await updateSupabaseConfig()
    if (!configUpdate) {
      console.error('❌ Config update failed')
      process.exit(1)
    }

    console.log('✨ Setup completed successfully!')
  } catch (error: any) {
    console.error('Setup failed:', error.message)
    if (error.details) console.error('Details:', error.details)
    process.exit(1)
  }
}

// Run the setup and handle any uncaught errors
main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})