-- Cleanup script to run BEFORE the enhanced features migration
-- This removes any existing policies that might conflict

-- Drop existing policies if they exist (ignore errors if they don't exist)
DO $$
BEGIN
    -- Drop policies that might exist from previous attempts
    DROP POLICY IF EXISTS "Users manage own push tokens" ON public.user_push_tokens;
    DROP POLICY IF EXISTS "Group members can view meetings" ON public.group_meetings;
    DROP POLICY IF EXISTS "Group admins can manage meetings" ON public.group_meetings;
    DROP POLICY IF EXISTS "Users can view their notifications" ON public.scheduled_notifications;
    DROP POLICY IF EXISTS "System can manage notifications" ON public.scheduled_notifications;
    DROP POLICY IF EXISTS "Group members can view documents" ON public.group_documents;
    DROP POLICY IF EXISTS "Group members can upload documents" ON public.group_documents;
    DROP POLICY IF EXISTS "Users can view their transactions" ON public.mpesa_transactions;
    DROP POLICY IF EXISTS "Users can create transactions" ON public.mpesa_transactions;
    DROP POLICY IF EXISTS "Group members can view report templates" ON public.report_templates;
    DROP POLICY IF EXISTS "Group admins can manage report templates" ON public.report_templates;
    DROP POLICY IF EXISTS "Members can view their reminders" ON public.contribution_reminders;
    
    RAISE NOTICE 'Cleanup completed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not have existed - this is expected: %', SQLERRM;
END $$;
