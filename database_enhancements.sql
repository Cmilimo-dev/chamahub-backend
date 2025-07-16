-- Enhanced Group Membership Request System
-- Add this to your existing database

-- Create membership_requests table for handling join requests
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
  user_id UUID REFERENCES public.profiles(id), -- Set when user completes registration
  invited_by UUID REFERENCES public.profiles(id), -- Admin who sent the invitation
  invited_role TEXT DEFAULT 'member', -- Role assigned by inviting admin
  message TEXT, -- Message from the person accepting invitation
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

-- Create function to generate unique invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    token TEXT;
BEGIN
    -- Generate a secure random token
    token := encode(gen_random_bytes(32), 'base64');
    -- Remove URL-unsafe characters
    token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
    RETURN token;
END;
$$;

-- Add RLS policies for new tables
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_actions ENABLE ROW LEVEL SECURITY;

-- Membership requests policies
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

CREATE POLICY "membership_requests_insert_policy" 
  ON public.membership_requests 
  FOR INSERT 
  WITH CHECK (true); -- Allow anonymous requests

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

-- Function to check if user has admin privileges in a group
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id 
      AND group_id = _group_id 
      AND status = 'active'
      AND role IN ('admin', 'treasurer', 'secretary')
  );
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_membership_requests_group_id ON public.membership_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_token ON public.membership_requests(invitation_token);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON public.membership_requests(status);
CREATE INDEX IF NOT EXISTS idx_membership_requests_email ON public.membership_requests(email);
CREATE INDEX IF NOT EXISTS idx_membership_requests_phone ON public.membership_requests(phone_number);
CREATE INDEX IF NOT EXISTS idx_membership_actions_request_id ON public.membership_actions(membership_request_id);
