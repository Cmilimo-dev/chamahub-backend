-- COMPLETE FIX: Database functions + Schema cache fix + Missing tables

-- Step 1: Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

-- Step 2: Create the missing notifications table first
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    notification_type TEXT DEFAULT 'info',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 3: Force recreation of all foreign key constraints
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;

ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.contributions DROP CONSTRAINT IF EXISTS contributions_member_id_fkey;
ALTER TABLE public.contributions 
ADD CONSTRAINT contributions_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES public.group_members(id) ON DELETE CASCADE;

ALTER TABLE public.contributions DROP CONSTRAINT IF EXISTS contributions_group_id_fkey;
ALTER TABLE public.contributions 
ADD CONSTRAINT contributions_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES public.chama_groups(id) ON DELETE CASCADE;

-- Step 4: Create database functions to work around schema cache issues
CREATE OR REPLACE FUNCTION public.get_user_groups(p_user_id UUID)
RETURNS TABLE(
    group_id UUID,
    group_name TEXT,
    group_description TEXT,
    contribution_amount NUMERIC,
    total_savings NUMERIC,
    member_count INTEGER,
    min_contribution_amount NUMERIC,
    max_contribution_amount NUMERIC,
    loan_interest_rate NUMERIC,
    max_loan_multiplier NUMERIC,
    allow_partial_contributions BOOLEAN,
    contribution_grace_period_days INTEGER,
    group_rules JSONB,
    role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cg.id,
        cg.name,
        cg.description,
        cg.contribution_amount,
        cg.total_savings,
        cg.member_count,
        cg.min_contribution_amount,
        cg.max_contribution_amount,
        cg.loan_interest_rate,
        cg.max_loan_multiplier,
        cg.allow_partial_contributions,
        cg.contribution_grace_period_days,
        cg.group_rules,
        gm.role
    FROM public.group_members gm
    JOIN public.chama_groups cg ON gm.group_id = cg.id
    WHERE gm.user_id = p_user_id 
    AND gm.status = 'active';
END;
$$;

-- Create function to get user contributions with group and member info
CREATE OR REPLACE FUNCTION public.get_user_contributions(p_user_id UUID)
RETURNS TABLE(
    contribution_id UUID,
    amount NUMERIC,
    contribution_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    group_id UUID,
    group_name TEXT,
    member_id UUID,
    member_role TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.amount,
        c.contribution_date,
        c.status,
        c.payment_method,
        c.reference_number,
        c.notes,
        cg.id,
        cg.name,
        gm.id,
        gm.role,
        c.created_at
    FROM public.contributions c
    JOIN public.group_members gm ON c.member_id = gm.id
    JOIN public.chama_groups cg ON c.group_id = cg.id
    WHERE gm.user_id = p_user_id
    ORDER BY c.contribution_date DESC;
END;
$$;

-- Step 5: Force PostgreSQL to update statistics
ANALYZE public.group_members;
ANALYZE public.chama_groups;
ANALYZE public.contributions;
ANALYZE public.notifications;

-- Step 6: Test all relationships and functions
SELECT 'Testing get_user_groups function...' as test;
SELECT COUNT(*) as function_test FROM public.get_user_groups('00000000-0000-0000-0000-000000000000');

SELECT 'Testing manual join group_members -> chama_groups...' as test;
SELECT COUNT(*) as manual_join_test FROM public.group_members gm 
LEFT JOIN public.chama_groups cg ON gm.group_id = cg.id;

SELECT 'Testing contributions -> group_members join...' as test;
SELECT COUNT(*) as contributions_join_test FROM public.contributions c
LEFT JOIN public.group_members gm ON c.member_id = gm.id;

-- Step 7: Show all constraints
SELECT 
    'CONSTRAINT: ' || tc.constraint_name || ' on ' || tc.table_name || 
    ' -> ' || ccu.table_name || '(' || ccu.column_name || ')' as constraint_info
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('group_members', 'contributions', 'notifications') 
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- Step 8: Final status
SELECT 
    'SETUP COMPLETE: ' || COUNT(*) || ' tables with relationships configured' as final_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('group_members', 'chama_groups', 'contributions', 'notifications');
