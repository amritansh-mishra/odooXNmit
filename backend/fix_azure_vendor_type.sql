-- Fix vendor records - Update records that should be vendors
USE odooxnmit;

-- Show all current records to see what we have
SELECT id, name, type, email, created_at FROM contacts ORDER BY created_at DESC;

-- Show current type distribution
SELECT type, COUNT(*) as count FROM contacts GROUP BY type;

-- Update Azure Interior to be a Vendor (if it exists)
UPDATE contacts 
SET type = 'Vendor' 
WHERE name LIKE '%azure%' OR name LIKE '%Azure%';

-- Update any other records that should be vendors based on common vendor indicators
-- You can modify this based on your specific data
UPDATE contacts 
SET type = 'Vendor' 
WHERE name LIKE '%supplier%' 
   OR name LIKE '%Supplier%'
   OR name LIKE '%vendor%'
   OR name LIKE '%Vendor%'
   OR name LIKE '%trading%'
   OR name LIKE '%Trading%'
   OR name LIKE '%Ltd%'
   OR name LIKE '%Limited%'
   OR name LIKE '%Corp%'
   OR name LIKE '%Company%'
   OR name LIKE '%Industries%';

-- If you want to manually set specific records as vendors, uncomment and modify:
-- UPDATE contacts SET type = 'Vendor' WHERE name = 'Specific Vendor Name';
-- UPDATE contacts SET type = 'Vendor' WHERE email = 'vendor@example.com';

-- Show updated records
SELECT id, name, type, email, created_at FROM contacts ORDER BY type, name;

-- Show final type distribution
SELECT type, COUNT(*) as count FROM contacts GROUP BY type;

-- Show specifically the vendor records
SELECT id, name, type, email FROM contacts WHERE type = 'Vendor';
