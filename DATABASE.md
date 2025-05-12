# Database Management Guide

This guide covers common database management tasks and troubleshooting using the Supabase CLI.

## Common Database Tasks

### Initial Setup

1. Initialize Supabase:
```bash
npx supabase init
```

2. Link to your project:
```bash
npx supabase link --project-ref your-project-ref
```

3. Start local development:
```bash
npx supabase start
```

### Schema Management

1. Pull remote schema:
```bash
npx supabase db pull
```

2. Push local changes:
```bash
npx supabase db push
```

3. View pending changes:
```bash
npx supabase db diff
```

### Migrations

1. Create a new migration:
```bash
npx supabase migration new my_migration_name
```

2. Apply migrations:
```bash
npx supabase migration up
```

3. Rollback migrations:
```bash
npx supabase migration down
```

4. List all migrations:
```bash
npx supabase migration list
```

### Type Generation

Update TypeScript types from the database schema:
```bash
npx supabase gen types typescript --local > src/integrations/supabase/database.types.ts
```

## Troubleshooting

### Schema Sync Issues

If your local schema is out of sync:

1. Reset and pull fresh schema:
```bash
npx supabase db reset
npx supabase db pull
```

2. Verify changes:
```bash
npx supabase db diff
```

3. Push changes if needed:
```bash
npx supabase db push
```

### Type Generation Issues

If TypeScript types are outdated:

1. Make sure your schema is up to date:
```bash
npx supabase db pull
```

2. Regenerate types:
```bash
npx supabase gen types typescript --local > src/integrations/supabase/database.types.ts
```

### Local Development Issues

1. Stop the local instance:
```bash
npx supabase stop
```

2. Start fresh:
```bash
npx supabase start
```

3. Reset if needed:
```bash
npx supabase db reset
```

### Migration Issues

1. Check migration status:
```bash
npx supabase migration list
```

2. Reset migrations:
```bash
npx supabase db reset
```

3. Reapply migrations:
```bash
npx supabase migration up
```

## Best Practices

1. Always create migrations for schema changes:
```bash
npx supabase migration new descriptive_name
```

2. Test migrations locally before pushing:
```bash
npx supabase db reset
npx supabase migration up
```

3. Keep types in sync:
```bash
npx supabase gen types typescript --local > src/integrations/supabase/database.types.ts
```

4. Review changes before pushing:
```bash
npx supabase db diff
```

## Common Error Solutions

### "Failed to connect to database"
1. Check if Supabase is running:
```bash
npx supabase status
```

2. Restart Supabase:
```bash
npx supabase stop
npx supabase start
```

### "Migration failed"
1. Check migration logs:
```bash
npx supabase migration list
```

2. Reset and try again:
```bash
npx supabase db reset
npx supabase migration up
```

### "Types generation failed"
1. Ensure database is running:
```bash
npx supabase start
```

2. Pull latest schema:
```bash
npx supabase db pull
```

3. Regenerate types:
```bash
npx supabase gen types typescript --local > src/integrations/supabase/database.types.ts
```
