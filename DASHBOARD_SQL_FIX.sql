-- COPY AND PASTE THIS ENTIRE QUERY INTO SUPABASE DASHBOARD SQL EDITOR
-- This will fix the schema cache relationship issue

-- Step 1: Refresh foreign key constraints
DO $$
BEGIN
    -- Drop and recreate group_id foreign key constraint
    ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
    ALTER TABLE public.group_members 
    ADD CONSTRAINT group_members_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;
    
    -- Ensure user_id foreign key exists
    ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
    ALTER TABLE public.group_members 
    ADD CONSTRAINT group_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraints refreshed successfully';
END $$;

-- Step 2: Update table statistics to refresh schema cache
ANALYZE public.group_members;
ANALYZE public.chama_groups;

-- Step 3: Verify the fix worked
SELECT 
    'Schema Cache Fix Status: ' || CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS - Foreign key constraints are active'
        ELSE 'WARNING - No foreign key constraints found'
    END as fix_status
FROM information_schema.table_constraints 
WHERE table_name = 'group_members' 
AND constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';

-- Step 4: Show all foreign key constraints for verification
SELECT 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'group_members'
AND tc.table_schema = 'public';
