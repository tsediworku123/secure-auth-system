-- Migration to add password reset and other missing columns
USE secure_auth_db;

-- Add reset_token column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL;

-- Add reset_token_expires column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME DEFAULT NULL;

-- Add refresh_token column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS refresh_token TEXT DEFAULT NULL;

-- Add auth_provider column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';

-- Create index on reset_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_reset_token ON users(reset_token);

SELECT 'Migration completed successfully' AS status;
