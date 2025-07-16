-- COMPLETE DATABASE SETUP FOR CHAMA APPLICATION
-- Execute this script in your Supabase Dashboard SQL Editor

-- Step 1: Create initial schema
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"email_enabled": true, "sms_enabled": false, "in_app_enabled": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chama_groups table
CREATE TABLE IF NOT EXISTS public.chama_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  contribution_amount NUMERIC DEFAULT 0,
  contribution_frequency TEXT DEFAULT 'monthly',
  member_count INTEGER DEFAULT 0,
  total_savings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  meeting_day TEXT,
  meeting_time TEXT,
  min_contribution_amount NUMERIC DEFAULT 0,
  max_contribution_amount NUMERIC,
  loan_interest_rate NUMERIC DEFAULT 5.0,
  max_loan_multiplier NUMERIC DEFAULT 3.0,
  allow_partial_contributions BOOLEAN DEFAULT false,
  contribution_grace_period_days INTEGER DEFAULT 0,
  group_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  total_contributions NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment_methods table (needed before contributions for FK)
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

-- Create contributions table
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.group_members(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  contribution_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  reference_number TEXT,
  external_transaction_id TEXT,
  transaction_fees NUMERIC DEFAULT 0,
  recorded_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  borrower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 5.0,
  duration_months INTEGER NOT NULL,
  amount_repaid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  purpose TEXT,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  disbursement_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create loan_repayments table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  recorded_by UUID NOT NULL,
  reference_number TEXT,
  external_transaction_id TEXT,
  transaction_fees NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('loan_eligibility', 'contribution_reminder', 'loan_status_update', 'member_loan_announcement', 'general')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  channels JSONB NOT NULL DEFAULT '["in_app"]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan eligibility rules table
CREATE TABLE IF NOT EXISTS public.loan_eligibility_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('contribution_multiplier', 'membership_duration_months', 'max_active_loans', 'minimum_contributions')),
  rule_value NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, rule_type)
);

-- Step 2: Create security functions
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
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
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_groups(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT group_id
  FROM public.group_members
  WHERE user_id = _user_id 
    AND status = 'active';
$$;

-- Step 3: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_eligibility_rules ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- Profiles policies
CREATE POLICY "profiles_select_policy" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Group members policies
CREATE POLICY "group_members_select_policy" 
  ON public.group_members 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "group_members_insert_policy" 
  ON public.group_members 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members_update_policy" 
  ON public.group_members 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Groups policies
CREATE POLICY "chama_groups_select_policy" 
  ON public.chama_groups 
  FOR SELECT 
  USING (
    created_by = auth.uid() OR 
    id = ANY(SELECT public.get_user_groups(auth.uid()))
  );

CREATE POLICY "chama_groups_all_policy" 
  ON public.chama_groups 
  FOR ALL 
  USING (created_by = auth.uid());

-- Contributions policies
CREATE POLICY "contributions_select_policy" 
  ON public.contributions 
  FOR SELECT 
  USING (
    group_id = ANY(SELECT public.get_user_groups(auth.uid()))
  );

CREATE POLICY "contributions_insert_policy" 
  ON public.contributions 
  FOR INSERT 
  WITH CHECK (
    group_id = ANY(SELECT public.get_user_groups(auth.uid()))
  );

-- Loans policies
CREATE POLICY "loans_select_policy" 
  ON public.loans 
  FOR SELECT 
  USING (
    borrower_id = auth.uid() OR 
    public.is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "loans_insert_policy" 
  ON public.loans 
  FOR INSERT 
  WITH CHECK (
    borrower_id = auth.uid() AND 
    public.is_group_member(auth.uid(), group_id)
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Loan eligibility rules policies
CREATE POLICY "Group members can view eligibility rules" 
  ON public.loan_eligibility_rules 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = loan_eligibility_rules.group_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Group admins can manage eligibility rules" 
  ON public.loan_eligibility_rules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = loan_eligibility_rules.group_id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'treasurer') 
      AND status = 'active'
    )
  );

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_group_id ON public.contributions(group_id);
CREATE INDEX IF NOT EXISTS idx_contributions_member_id ON public.contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_group_id ON public.loans(group_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON public.loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan_id ON public.loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- Step 6: Create trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create loan eligibility calculation function
CREATE OR REPLACE FUNCTION public.calculate_loan_eligibility(
  _user_id UUID,
  _group_id UUID
)
RETURNS TABLE(
  is_eligible BOOLEAN,
  max_loan_amount NUMERIC,
  eligibility_reasons TEXT[]
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  membership_duration_months INTEGER;
  total_contributions NUMERIC;
  active_loans_count INTEGER;
  contribution_multiplier NUMERIC := 3.0;
  min_membership_months NUMERIC := 6.0;
  max_active_loans NUMERIC := 1.0;
  min_contributions NUMERIC := 3.0;
  reasons TEXT[] := ARRAY[]::TEXT[];
  eligible BOOLEAN := true;
  max_amount NUMERIC := 0;
BEGIN
  -- Check membership duration
  SELECT EXTRACT(MONTH FROM AGE(NOW(), joined_at)) INTO membership_duration_months
  FROM public.group_members 
  WHERE user_id = _user_id AND group_id = _group_id AND status = 'active';

  IF membership_duration_months IS NULL THEN
    eligible := false;
    reasons := array_append(reasons, 'Not a member of this group');
    RETURN QUERY SELECT eligible, max_amount, reasons;
    RETURN;
  END IF;

  IF membership_duration_months < min_membership_months THEN
    eligible := false;
    reasons := array_append(reasons, format('Membership duration (%s months) is less than required %s months', membership_duration_months, min_membership_months));
  END IF;

  -- Check total contributions
  SELECT COALESCE(SUM(amount), 0) INTO total_contributions
  FROM public.contributions 
  WHERE member_id IN (
    SELECT id FROM public.group_members 
    WHERE user_id = _user_id AND group_id = _group_id
  ) AND group_id = _group_id AND status = 'completed';

  IF total_contributions < min_contributions THEN
    eligible := false;
    reasons := array_append(reasons, format('Total contributions (%s) is less than required %s', total_contributions, min_contributions));
  END IF;

  -- Check active loans
  SELECT COUNT(*) INTO active_loans_count
  FROM public.loans 
  WHERE borrower_id = _user_id AND group_id = _group_id 
  AND status IN ('pending', 'approved', 'disbursed');

  IF active_loans_count >= max_active_loans THEN
    eligible := false;
    reasons := array_append(reasons, format('Has %s active loans (maximum allowed: %s)', active_loans_count, max_active_loans));
  END IF;

  -- Calculate maximum loan amount
  IF eligible THEN
    max_amount := total_contributions * contribution_multiplier;
    reasons := array_append(reasons, format('Eligible for up to %s (based on %s contributions × %s multiplier)', max_amount, total_contributions, contribution_multiplier));
  END IF;

  RETURN QUERY SELECT eligible, max_amount, reasons;
END;
$$;
