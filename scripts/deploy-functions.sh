#!/bin/bash

# Exit on error
set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

# Check required environment variables
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "❌ Missing VITE_SUPABASE_URL environment variable"
  exit 1
fi

# Extract project reference from Supabase URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')

# Deploy all functions
for func in supabase/functions/*/; do
  func_name=$(basename "$func")
  echo "Deploying function: $func_name"
  npx supabase functions deploy "$func_name" --project-ref "$PROJECT_REF"
done

echo "✨ Functions deployed successfully!"