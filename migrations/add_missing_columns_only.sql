-- Step 1: Add missing columns to existing table
ALTER TABLE public.membership_requests 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS form_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS form_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS invited_by UUID,
ADD COLUMN IF NOT EXISTS invited_role TEXT DEFAULT 'member',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS rejected_by UUID,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days');

-- Step 2: Add foreign key constraints after columns exist
-- (These might fail if the references don't exist, but that's ok)
DO $$
BEGIN
    -- Add foreign key for user_id
    BEGIN
        ALTER TABLE public.membership_requests 
        ADD CONSTRAINT fk_membership_requests_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    EXCEPTION WHEN others THEN
        -- If constraint fails, just continue
        NULL;
    END;
    
    -- Add foreign key for invited_by
    BEGIN
        ALTER TABLE public.membership_requests 
        ADD CONSTRAINT fk_membership_requests_invited_by 
        FOREIGN KEY (invited_by) REFERENCES public.profiles(id);
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    -- Add foreign key for approved_by
    BEGIN
        ALTER TABLE public.membership_requests 
        ADD CONSTRAINT fk_membership_requests_approved_by 
        FOREIGN KEY (approved_by) REFERENCES public.profiles(id);
    EXCEPTION WHEN others THEN
        NULL;
    END;
    
    -- Add foreign key for rejected_by
    BEGIN
        ALTER TABLE public.membership_requests 
        ADD CONSTRAINT fk_membership_requests_rejected_by 
        FOREIGN KEY (rejected_by) REFERENCES public.profiles(id);
    EXCEPTION WHEN others THEN
        NULL;
    END;
END $$;

-- Step 3: Update existing records
UPDATE public.membership_requests 
SET form_submitted = TRUE, 
    form_submitted_at = COALESCE(updated_at, created_at)
WHERE first_name IS NOT NULL AND first_name != '' 
  AND last_name IS NOT NULL AND last_name != '';

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_membership_requests_form_submitted 
ON public.membership_requests(form_submitted, status);

CREATE INDEX IF NOT EXISTS idx_membership_requests_user_id 
ON public.membership_requests(user_id);

-- Step 5: Enable RLS
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;

-- Step 6: Create basic RLS policies
DROP POLICY IF EXISTS "membership_requests_select_policy" ON public.membership_requests;
CREATE POLICY "membership_requests_select_policy" 
  ON public.membership_requests 
  FOR SELECT 
  USING (
    -- Allow access to group admins, treasurers, and secretaries
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = membership_requests.group_id
        AND gm.user_id = auth.uid()
        AND gm.status = 'active'
        AND gm.role IN ('admin', 'treasurer', 'secretary')
    )
    OR 
    -- Allow access to the person who made the request (if they have a user_id)
    membership_requests.user_id = auth.uid()
  );

DROP POLICY IF EXISTS "membership_requests_insert_policy" ON public.membership_requests;
CREATE POLICY "membership_requests_insert_policy" 
  ON public.membership_requests 
  FOR INSERT 
  WITH CHECK (true); -- Allow anonymous requests

DROP POLICY IF EXISTS "membership_requests_update_policy" ON public.membership_requests;
CREATE POLICY "membership_requests_update_policy" 
  ON public.membership_requests 
  FOR UPDATE 
  USING (
    -- Allow updates by group admins, treasurers, and secretaries
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = membership_requests.group_id
        AND gm.user_id = auth.uid()
        AND gm.status = 'active'
        AND gm.role IN ('admin', 'treasurer', 'secretary')
    )
    OR 
    -- Allow the requester to update their own request
    membership_requests.user_id = auth.uid()
  );
