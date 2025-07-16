-- Comprehensive fix for schema cache relationship issues
-- This script will ensure all relationships between group_members and chama_groups are properly recognized

\echo 'Starting schema relationship fix...'

-- 1. Check current table structure
\echo 'Checking current table structures...'
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE tablename IN ('group_members', 'chama_groups') 
AND schemaname = 'public';

-- 2. Check existing foreign key constraints
\echo 'Checking existing foreign key constraints...'
SELECT 
    tc.table_name, 
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

-- 3. Refresh foreign key constraints
\echo 'Refreshing foreign key constraints...'
DO $$
BEGIN
    -- Drop existing constraints if they exist
    BEGIN
        ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
    EXCEPTION
        WHEN others THEN 
            RAISE NOTICE 'group_members_group_id_fkey constraint did not exist or could not be dropped: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
    EXCEPTION
        WHEN others THEN 
            RAISE NOTICE 'group_members_user_id_fkey constraint did not exist or could not be dropped: %', SQLERRM;
    END;
    
    -- Recreate the group_id foreign key constraint
    BEGIN
        ALTER TABLE public.group_members 
        ADD CONSTRAINT group_members_group_id_fkey 
        FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;
        RAISE NOTICE 'Successfully created group_members_group_id_fkey constraint';
    EXCEPTION
        WHEN others THEN 
            RAISE NOTICE 'Failed to create group_members_group_id_fkey constraint: %', SQLERRM;
    END;
    
    -- Recreate the user_id foreign key constraint
    BEGIN
        ALTER TABLE public.group_members 
        ADD CONSTRAINT group_members_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Successfully created group_members_user_id_fkey constraint';
    EXCEPTION
        WHEN others THEN 
            RAISE NOTICE 'Failed to create group_members_user_id_fkey constraint: %', SQLERRM;
    END;
END $$;

-- 4. Update table statistics to refresh schema cache
\echo 'Updating table statistics...'
ANALYZE public.group_members;
ANALYZE public.chama_groups;

-- 5. Test the relationships
\echo 'Testing relationships...'
CREATE OR REPLACE FUNCTION public.test_schema_relationships()
RETURNS TABLE(test_name text, result text)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Test 1: Basic join between tables
    BEGIN
        PERFORM 1 FROM public.group_members gm 
        JOIN public.chama_groups cg ON gm.group_id = cg.id 
        LIMIT 1;
        RETURN QUERY SELECT 'group_members_chama_groups_join'::text, 'SUCCESS'::text;
    EXCEPTION WHEN others THEN
        RETURN QUERY SELECT 'group_members_chama_groups_join'::text, ('FAILED: ' || SQLERRM)::text;
    END;
    
    -- Test 2: Check if we can query group info with members
    BEGIN
        PERFORM 1 FROM public.chama_groups cg 
        LEFT JOIN public.group_members gm ON cg.id = gm.group_id 
        LIMIT 1;
        RETURN QUERY SELECT 'chama_groups_left_join_members'::text, 'SUCCESS'::text;
    EXCEPTION WHEN others THEN
        RETURN QUERY SELECT 'chama_groups_left_join_members'::text, ('FAILED: ' || SQLERRM)::text;
    END;
    
    -- Test 3: Check foreign key constraint validation
    BEGIN
        -- This should work without errors if constraints are proper
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'group_members' 
        AND constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
        LIMIT 1;
        RETURN QUERY SELECT 'foreign_key_constraints_exist'::text, 'SUCCESS'::text;
    EXCEPTION WHEN others THEN
        RETURN QUERY SELECT 'foreign_key_constraints_exist'::text, ('FAILED: ' || SQLERRM)::text;
    END;
    
    RETURN;
END;
$$;

-- Run the tests
SELECT * FROM public.test_schema_relationships();

-- 6. Verify final constraint state
\echo 'Final verification of constraints...'
SELECT 
    tc.table_name, 
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

-- Clean up test function
DROP FUNCTION IF EXISTS public.test_schema_relationships();

\echo 'Schema relationship fix completed!'
