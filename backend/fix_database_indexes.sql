-- Fix MySQL "Too many keys specified" error
-- This script will clean up indexes and recreate the contacts table properly

USE odooxnmit;

-- First, let's see what indexes currently exist
SHOW INDEX FROM contacts;

-- Drop all non-essential indexes (keep PRIMARY key)
-- Note: This might fail if some indexes don't exist, that's okay
ALTER TABLE contacts DROP INDEX IF EXISTS email;
ALTER TABLE contacts DROP INDEX IF EXISTS email_UNIQUE;
ALTER TABLE contacts DROP INDEX IF EXISTS contacts_email_unique;
ALTER TABLE contacts DROP INDEX IF EXISTS idx_contacts_email;
ALTER TABLE contacts DROP INDEX IF EXISTS idx_contacts_type;
ALTER TABLE contacts DROP INDEX IF EXISTS idx_contacts_is_active;
ALTER TABLE contacts DROP INDEX IF EXISTS idx_contacts_mobile;
ALTER TABLE contacts DROP INDEX IF EXISTS idx_contacts_name;

-- Add only essential columns if they don't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mobile VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gst_no VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_city VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_state VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_pincode VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL;

-- Update existing records to have is_active = true
UPDATE contacts SET is_active = TRUE WHERE is_active IS NULL;

-- Create only essential indexes
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON contacts(is_active);

-- Show final table structure and indexes
DESCRIBE contacts;
SHOW INDEX FROM contacts;
