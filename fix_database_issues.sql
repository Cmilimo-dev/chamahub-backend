-- QUICK FIX FOR IMMEDIATE DATABASE ISSUES
-- Apply this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Fix missing payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  method_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  account_identifier TEXT NOT NULL,
  account_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Fix missing group_members table 
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  total_contributions NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Add missing foreign key relationships
-- Update contributions table to have proper foreign key to chama_groups
ALTER TABLE public.contributions 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE;

-- Update loans table to have proper foreign key to chama_groups
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security on new tables
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policies
-- Payment methods - users can only see their own
CREATE POLICY IF NOT EXISTS "payment_methods_select_policy" 
  ON public.payment_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "payment_methods_insert_policy" 
  ON public.payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "payment_methods_update_policy" 
  ON public.payment_methods 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Group members - members can see other members in their groups
CREATE POLICY IF NOT EXISTS "group_members_select_policy" 
  ON public.group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm2 
      WHERE gm2.user_id = auth.uid() 
      AND gm2.group_id = group_members.group_id 
      AND gm2.status = 'active'
    )
  );

CREATE POLICY IF NOT EXISTS "group_members_insert_policy" 
  ON public.group_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 6. Create a test group and membership for the current user
DO $$
DECLARE
    test_group_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user ID from auth context
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        -- Create a test group if none exists
        INSERT INTO public.chama_groups (
            id, name, description, created_by, contribution_amount, member_count
        ) VALUES (
            gen_random_uuid(),
            'Test Chama Group',
            'A test group for development',
            current_user_id,
            1000.00,
            1
        ) 
        ON CONFLICT DO NOTHING
        RETURNING id INTO test_group_id;
        
        -- If we created a group, add the user as a member
        IF test_group_id IS NOT NULL THEN
            INSERT INTO public.group_members (
                group_id, user_id, role, status
            ) VALUES (
                test_group_id, current_user_id, 'admin', 'active'
            );
        END IF;
    END IF;
END $$;
