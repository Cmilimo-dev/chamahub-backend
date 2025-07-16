-- Check what tables currently exist in the database
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- Check specifically for chama-related tables
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%chama%' 
   OR table_name LIKE '%group%' 
   OR table_name LIKE '%member%'
   OR table_name LIKE '%contribution%'
   OR table_name LIKE '%loan%'
ORDER BY table_name;
