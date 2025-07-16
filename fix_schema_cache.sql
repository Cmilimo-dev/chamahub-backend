-- Fix schema cache issue by refreshing foreign key relationships
-- This script ensures the relationship between group_members and chama_groups is properly recognized

-- First, let's check if the tables exist
DO $$
BEGIN
    -- Check if tables exist and foreign keys are properly set
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chama_groups' AND table_schema = 'public') THEN
        
        -- Drop and recreate the foreign key constraint to refresh the cache
        BEGIN
            ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
        EXCEPTION
            WHEN others THEN NULL;
        END;
        
        -- Recreate the foreign key constraint
        ALTER TABLE public.group_members 
        ADD CONSTRAINT group_members_group_id_fkey 
        FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;
        
        -- Update table statistics to refresh schema cache
        ANALYZE public.group_members;
        ANALYZE public.chama_groups;
        
        RAISE NOTICE 'Foreign key relationship refreshed successfully';
    ELSE
        RAISE NOTICE 'Tables do not exist - please run initial schema first';
    END IF;
END $$;

-- Also refresh any dependent views or functions
-- This forces Supabase to rebuild its internal schema cache
CREATE OR REPLACE VIEW public.group_members_with_groups AS
SELECT 
    gm.*,
    cg.name as group_name,
    cg.status as group_status
FROM public.group_members gm
JOIN public.chama_groups cg ON gm.group_id = cg.id;

-- Drop the view immediately (we just needed to trigger cache refresh)
DROP VIEW IF EXISTS public.group_members_with_groups;
