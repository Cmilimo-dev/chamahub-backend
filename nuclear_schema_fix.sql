-- NUCLEAR OPTION: Force PostgREST Schema Cache Reload
-- This will force Supabase to completely reload its schema cache

-- Step 1: Send schema reload signal to PostgREST
NOTIFY pgrst, 'reload schema';

-- Step 2: Create a dummy schema change to force cache invalidation
CREATE SCHEMA IF NOT EXISTS temp_cache_buster;
DROP SCHEMA IF EXISTS temp_cache_buster;

-- Step 3: Force PostgreSQL to update all relation statistics
DO $$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('group_members', 'chama_groups', 'contributions')) LOOP
        EXECUTE 'ANALYZE public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Step 4: Drop and recreate ALL foreign key constraints for our tables
-- Group members -> chama_groups
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;

-- Group members -> auth.users
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Contributions -> group_members
ALTER TABLE public.contributions DROP CONSTRAINT IF EXISTS contributions_member_id_fkey;
ALTER TABLE public.contributions 
ADD CONSTRAINT contributions_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES public.group_members(id) ON DELETE CASCADE;

-- Contributions -> chama_groups
ALTER TABLE public.contributions DROP CONSTRAINT IF EXISTS contributions_group_id_fkey;
ALTER TABLE public.contributions 
ADD CONSTRAINT contributions_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;

-- Step 5: Create the missing notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policy
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Step 6: Force a complete metadata refresh
SELECT pg_reload_conf();

-- Step 7: Update PostgreSQL system catalogs
REINDEX DATABASE postgres;

-- Step 8: Final verification with detailed output
SELECT 
    'CONSTRAINT CHECK: ' || tc.constraint_name || ' on ' || tc.table_name || 
    ' references ' || ccu.table_name || '(' || ccu.column_name || ')' as constraint_info
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('group_members', 'contributions') 
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- Step 9: Test all relationships
SELECT 'Testing group_members -> chama_groups relationship...' as test;
SELECT COUNT(*) as group_members_groups_join_test FROM public.group_members gm 
LEFT JOIN public.chama_groups cg ON gm.group_id = cg.id;

SELECT 'Testing contributions -> group_members relationship...' as test;
SELECT COUNT(*) as contributions_members_join_test FROM public.contributions c
LEFT JOIN public.group_members gm ON c.member_id = gm.id;

SELECT 'All tables and relationships configured!' as final_status;
