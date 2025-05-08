#!/bin/bash

# Exit on error
set -e

echo "🚀 Running Supabase migrations..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

# Check required environment variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Missing required environment variables. Please check your .env file."
  exit 1
fi

# Extract project reference from Supabase URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')

# Connect using direct connection URL (Direct Postgres Connection)
CONNECTION_STRING="postgres://postgres:${VITE_SUPABASE_SERVICE_ROLE_KEY}@${PROJECT_REF}.supabase-postgres.net:5432/postgres"

# Apply migrations in order
for migration in supabase/migrations/*.sql; do
  echo "Applying $(basename "$migration")..."
  PGSSLMODE=require psql "$CONNECTION_STRING" -f "$migration"
done

echo "✨ Migrations completed successfully!"