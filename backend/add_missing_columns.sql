-- Add missing columns to contacts table
-- Run this script if you're getting 500 errors due to missing columns

-- Add mobile column if it doesn't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mobile VARCHAR(255);

-- Add is_active column if it doesn't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add gst_no column if it doesn't exist (for vendors)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gst_no VARCHAR(255);

-- Add address columns if they don't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_city VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_state VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_pincode VARCHAR(255);

-- Add profile_image column if it doesn't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);

-- Add archived_at column if it doesn't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL;

-- Update existing records to have is_active = true
UPDATE contacts SET is_active = TRUE WHERE is_active IS NULL;

-- Show the updated table structure
DESCRIBE contacts;
