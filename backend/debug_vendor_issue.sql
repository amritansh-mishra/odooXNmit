-- Debug script to find why vendors aren't showing up
USE odooxnmit;

-- 1. Show ALL records in contacts table
SELECT '=== ALL CONTACTS ===' as debug_section;
SELECT id, name, type, email, mobile, is_active, created_at FROM contacts ORDER BY created_at DESC;

-- 2. Show type distribution (including NULL values)
SELECT '=== TYPE DISTRIBUTION ===' as debug_section;
SELECT 
  CASE 
    WHEN type IS NULL THEN 'NULL' 
    WHEN type = '' THEN 'EMPTY_STRING'
    ELSE type 
  END as type_value, 
  COUNT(*) as count 
FROM contacts 
GROUP BY type;

-- 3. Look for records that might be vendors (case-insensitive)
SELECT '=== POTENTIAL VENDORS ===' as debug_section;
SELECT id, name, type, email FROM contacts 
WHERE LOWER(name) LIKE '%vendor%' 
   OR LOWER(name) LIKE '%supplier%'
   OR LOWER(name) LIKE '%azure%'
   OR LOWER(name) LIKE '%trading%'
   OR LOWER(name) LIKE '%ltd%'
   OR LOWER(name) LIKE '%company%'
   OR LOWER(name) LIKE '%corp%';

-- 4. Show exact type values (with quotes to see spaces/special chars)
SELECT '=== EXACT TYPE VALUES ===' as debug_section;
SELECT id, name, CONCAT('"', IFNULL(type, 'NULL'), '"') as type_with_quotes, email FROM contacts;

-- 5. Check if type column exists and its definition
SELECT '=== TABLE STRUCTURE ===' as debug_section;
DESCRIBE contacts;

-- 6. Show records with type = 'Vendor' (exact match)
SELECT '=== RECORDS WITH TYPE = Vendor ===' as debug_section;
SELECT id, name, type, email FROM contacts WHERE type = 'Vendor';

-- 7. Show records with type LIKE 'vendor' (case-insensitive)
SELECT '=== RECORDS WITH TYPE LIKE vendor ===' as debug_section;
SELECT id, name, type, email FROM contacts WHERE LOWER(type) LIKE '%vendor%';
