# Webhook Whisperer Studio

A powerful webhook testing and management platform.

## Quick Start

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Fill in your Supabase credentials in `.env`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Install dependencies:
```bash
npm install
```

5. Run the Supabase setup script:
```bash
npm run setup:supabase
```

6. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anon/public key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project's service role key (needed for setup)
- `VITE_ENV`: Environment name (optional, defaults to 'development')

## Features

- Create and manage webhook endpoints
- Organize webhooks into categories
- Test webhooks with custom payloads
- View webhook response history
- Secure authentication
- Row-level security
- CORS-free webhook execution

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Database Structure

The application uses three main tables:

### Categories
- `id`: UUID (Primary Key)
- `name`: Text
- `description`: Text
- `color`: Text
- `created_at`: Timestamp
- `user_id`: UUID (Foreign Key to auth.users)

### Webhooks
- `id`: UUID (Primary Key)
- `category_id`: UUID (Foreign Key to categories)
- `name`: Text
- `description`: Text
- `url`: Text
- `method`: Text
- `headers`: JSONB
- `default_payload`: Text
- `example_payloads`: JSONB
- `created_at`: Timestamp
- `user_id`: UUID (Foreign Key to auth.users)

### Webhook Responses
- `id`: UUID (Primary Key)
- `webhook_id`: UUID (Foreign Key to webhooks)
- `status`: Integer
- `status_text`: Text
- `headers`: JSONB
- `data`: JSONB
- `timestamp`: Timestamp
- `user_id`: UUID (Foreign Key to auth.users)

## Security

The application uses Supabase Row Level Security (RLS) policies to ensure:
- Only authenticated users can read data
- Users can only modify their own data
- Webhook responses are associated with the executing user

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
