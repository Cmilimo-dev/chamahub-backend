-- Create the complete membership_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.membership_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  invitation_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'invited')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.profiles(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  form_submitted BOOLEAN DEFAULT false,
  form_submitted_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES public.profiles(id),
  invited_role TEXT DEFAULT 'member',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create membership_actions table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.membership_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_request_id UUID REFERENCES public.membership_requests(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'reviewed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_actions ENABLE ROW LEVEL SECURITY;

-- Membership requests policies
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

-- Membership actions policies
DROP POLICY IF EXISTS "membership_actions_select_policy" ON public.membership_actions;
CREATE POLICY "membership_actions_select_policy" 
  ON public.membership_actions 
  FOR SELECT 
  USING (
    -- Allow access to group admins, treasurers, and secretaries
    EXISTS (
      SELECT 1 FROM public.membership_requests mr
      JOIN public.group_members gm ON gm.group_id = mr.group_id
      WHERE mr.id = membership_actions.membership_request_id
        AND gm.user_id = auth.uid()
        AND gm.status = 'active'
        AND gm.role IN ('admin', 'treasurer', 'secretary')
    )
  );

DROP POLICY IF EXISTS "membership_actions_insert_policy" ON public.membership_actions;
CREATE POLICY "membership_actions_insert_policy" 
  ON public.membership_actions 
  FOR INSERT 
  WITH CHECK (
    -- Only group admins, treasurers, and secretaries can create actions
    EXISTS (
      SELECT 1 FROM public.membership_requests mr
      JOIN public.group_members gm ON gm.group_id = mr.group_id
      WHERE mr.id = membership_request_id
        AND gm.user_id = auth.uid()
        AND gm.status = 'active'
        AND gm.role IN ('admin', 'treasurer', 'secretary')
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_membership_requests_group_id ON public.membership_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_token ON public.membership_requests(invitation_token);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON public.membership_requests(status);
CREATE INDEX IF NOT EXISTS idx_membership_requests_email ON public.membership_requests(email);
CREATE INDEX IF NOT EXISTS idx_membership_requests_phone ON public.membership_requests(phone_number);
CREATE INDEX IF NOT EXISTS idx_membership_requests_form_submitted ON public.membership_requests(form_submitted, status);
CREATE INDEX IF NOT EXISTS idx_membership_requests_user_id ON public.membership_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_actions_request_id ON public.membership_actions(membership_request_id);
