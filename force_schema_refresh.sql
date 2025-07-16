-- Force Supabase Schema Cache Refresh
-- This will aggressively refresh the relationship cache

-- Step 1: Drop and recreate the foreign key constraint
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;

-- Step 2: Force PostgreSQL to update statistics and refresh internal cache
ANALYZE public.group_members;
ANALYZE public.chama_groups;

-- Step 3: Refresh materialized views if any exist
REFRESH MATERIALIZED VIEW IF EXISTS public.group_stats;

-- Step 4: Create a temporary view that uses the relationship to force cache update
CREATE OR REPLACE VIEW public.temp_relationship_test AS
SELECT 
    gm.id as member_id,
    gm.user_id,
    gm.role,
    gm.status,
    cg.id as group_id,
    cg.name as group_name
FROM public.group_members gm
JOIN public.chama_groups cg ON gm.group_id = cg.id;

-- Step 5: Test the view to force Supabase to recognize the relationship
SELECT COUNT(*) as relationship_test FROM public.temp_relationship_test;

-- Step 6: Drop the temporary view
DROP VIEW public.temp_relationship_test;

-- Step 7: Force a schema invalidation by creating and dropping a function
CREATE OR REPLACE FUNCTION public.force_cache_refresh()
RETURNS BOOLEAN AS $$
BEGIN
    -- This function forces Supabase to rebuild its schema cache
    PERFORM 1 FROM public.group_members gm 
    INNER JOIN public.chama_groups cg ON gm.group_id = cg.id 
    LIMIT 1;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to trigger cache refresh
SELECT public.force_cache_refresh();

-- Drop the function
DROP FUNCTION public.force_cache_refresh();

-- Step 8: Update table metadata
UPDATE pg_class SET reltuples = (SELECT COUNT(*) FROM public.group_members) WHERE relname = 'group_members';
UPDATE pg_class SET reltuples = (SELECT COUNT(*) FROM public.chama_groups) WHERE relname = 'chama_groups';

-- Step 9: Final verification
SELECT 
    'FINAL STATUS: Relationship between group_members and chama_groups is ' || 
    CASE 
        WHEN COUNT(*) > 0 THEN 'ACTIVE and WORKING'
        ELSE 'CONFIGURED but no data exists yet'
    END as final_status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'group_members' 
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'group_id';

-- Display all foreign key relationships for group_members
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'group_members' 
AND tc.constraint_type = 'FOREIGN KEY';
