# Webhook Whisperer Studio - Setup Guide

This guide will walk you through setting up the Webhook Whisperer Studio project locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) and npm: [Install Node.js](https://nodejs.org/)
- **Bun** (for package management): [Install Bun](https://bun.sh/)
- **Git**: [Install Git](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd webhook-whisperer-studio
```

### 2. Install Dependencies

The project uses Bun as the package manager. Install all dependencies by running:

```bash
bun install
```

### 3. Environment Setup

1. The project will automatically create a `.env` file if it doesn't exist when you run the setup script. However, you can manually copy the `.env.example` file if you prefer:

```bash
cp .env.example .env
```

2. Configure your Supabase credentials in the `.env` file:
   - `VITE_SUPABASE_URL`: Your Supabase project URL (from Project Settings > API)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (from Project Settings > API)

3. Supabase Edge Functions Configuration:
   - Install Supabase CLI if you haven't already:
     ```bash
     npm install -g supabase
     ```
   - Login to Supabase:
     ```bash
     supabase login
     ```
   - Link your project:
     ```bash
     supabase link --project-ref your-project-ref
     ```
   - Deploy Edge Functions:
     ```bash
     supabase functions deploy
     ```

The Edge Functions in the `supabase/functions` directory include:
- `execute-webhook`: Handles webhook execution with CORS support
- Additional shared utilities in `_shared` folder

### 4. Supabase Setup

#### 4.1 Create a Supabase Project and Set Up CLI

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and anon key from Project Settings > API

#### 4.2 Install and Configure Supabase CLI

1. Install Supabase CLI globally:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project:
```bash
npx supabase init
```

3. Login to Supabase:
```bash
npx supabase login
```

4. Link your project (replace YOUR_PROJECT_REF with your project reference ID from the Supabase dashboard):
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

5. Generate types from your database schema:
```bash
npx supabase gen types typescript --local > src/integrations/supabase/database.types.ts
```

#### 4.3 Database Management

1. Pull the remote database schema to work locally:
```bash
npx supabase db pull
```

2. Push local schema changes to the remote database:
```bash
npx supabase db push
```

3. Start a local Supabase instance for development:
```bash
npx supabase start
```

4. Create a new migration:
```bash
npx supabase migration new your_migration_name
```

5. List all migrations:
```bash
npx supabase migration list
```

6. Reset the database (caution: this will clear all data):
```bash
npx supabase db reset
```

7. Check database changes:
```bash
npx supabase db diff
```

#### 4.4 Working with Migrations

Your migrations are stored in `supabase/migrations/`. Each migration file follows the format:
```
YYYYMMDDHHMMSS_migration_name.sql
```

After creating a new migration:
1. Add your SQL changes to the migration file
2. Apply the migration:
```bash
npx supabase migration up
```

To roll back a migration:
```bash
npx supabase migration down
```

#### 4.2 Database Schema Setup

Run the Supabase setup script to create the database schema:

```bash
node setup-supabase.js
```

This script will create the following tables:

1. **categories**
   - `id`: UUID (Primary Key)
   - `name`: Text
   - `description`: Text
   - `color`: Text
   - `created_at`: Timestamp

2. **demo_credentials**
   - `id`: UUID (Primary Key)
   - `email`: Text (Unique)
   - `password`: Text
   - `role`: Text
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

3. **webhooks**
   - `id`: UUID (Primary Key)
   - `name`: Text
   - `description`: Text
   - `url`: Text
   - `method`: Text
   - `category_id`: UUID (Foreign Key)
   - `headers`: JSONB
   - `default_payload`: Text
   - `example_payloads`: JSONB
   - `created_at`: Timestamp

4. **webhook_responses**
   - `id`: UUID (Primary Key)
   - `webhook_id`: UUID (Foreign Key)
   - `status`: Integer
   - `status_text`: Text
   - `headers`: JSONB
   - `data`: JSONB
   - `timestamp`: Timestamp

#### 4.3 Database Functions

The setup will create the following PostgreSQL functions:

1. **check_demo_credentials(p_email TEXT, p_password TEXT)**
   - Validates demo user credentials
   - Returns: `is_valid` (boolean) and `user_role` (text)

2. **exec_sql(sql TEXT)**
   - For setup purposes only
   - Limited to service_role access

#### 4.4 Security and Access Control

The setup includes the following security configurations:

1. Function Permissions:
   - `check_demo_credentials`: Accessible to anon, authenticated, and service_role
   - `exec_sql`: Limited to service_role only

2. Row Level Security (RLS):
   - Implemented on all tables to ensure data security
   - Custom policies based on user roles

### 5. Start the Development Server

Start the development server by running:

```bash
bun run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

## Available Scripts

The project includes several npm scripts you can use:

- `bun run dev` - Start the development server
- `bun run build` - Build the project for production
- `bun run build:dev` - Build the project for development
- `bun run preview` - Preview the production build locally
- `bun run lint` - Run ESLint to check for code issues

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/         # Custom React hooks
├── integrations/  # External service integrations (Supabase)
├── lib/           # Utility functions and constants
├── pages/         # Application pages
└── types/         # TypeScript type definitions
```

## Key Technologies

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: 
  - Radix UI primitives
  - Custom components in `src/components`
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Package Manager**: Bun
- **Code Editor Integration**: Monaco Editor

## Troubleshooting

If you encounter any issues:

1. **Environment Variables**
   - Make sure your `.env` file exists and contains the correct Supabase credentials
   - Check that the Supabase URL and anonymous key are valid

2. **Database Setup**
   - If you encounter database errors, try running the setup script again:
     ```bash
     node setup-supabase.js
     ```

3. **Build Issues**
   - Clear your node_modules and reinstall dependencies:
     ```bash
     rm -rf node_modules
     bun install
     ```

## Contributing

1. Create a new branch for your feature/fix
2. Make your changes
3. Run the linter before committing:
   ```bash
   bun run lint
   ```
4. Submit a pull request

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)
