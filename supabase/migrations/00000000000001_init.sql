-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Initialize tables and policies
SELECT setup_categories_table();
SELECT setup_webhooks_table();
SELECT setup_webhook_responses_table();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webhooks_category_id ON webhooks(category_id);
CREATE INDEX IF NOT EXISTS idx_webhook_responses_webhook_id ON webhook_responses(webhook_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_responses_user_id ON webhook_responses(user_id);