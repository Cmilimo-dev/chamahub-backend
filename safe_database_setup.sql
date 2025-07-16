-- Safe Database Setup - Checks for existing objects before creating
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table (extends auth.users)
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

-- 2. Create chama_groups table
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

-- 3. Create group_members table (THE MISSING ONE!)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  total_contributions NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create contributions table
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.group_members(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  contribution_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_method_id UUID,
  reference_number TEXT,
  external_transaction_id TEXT,
  transaction_fees NUMERIC DEFAULT 0,
  recorded_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- 6. Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- 7. Create loan_repayments table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  recorded_by UUID REFERENCES auth.users(id) NOT NULL,
  reference_number TEXT,
  external_transaction_id TEXT,
  transaction_fees NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_group_id ON public.contributions(group_id);
CREATE INDEX IF NOT EXISTS idx_contributions_member_id ON public.contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_group_id ON public.loans(group_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON public.loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan_id ON public.loan_repayments(loan_id);

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies only if they don't exist
DO $$
BEGIN
    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Group members policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Users can view their group memberships') THEN
        CREATE POLICY "Users can view their group memberships" ON public.group_members
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Chama groups policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chama_groups' AND policyname = 'Users can view their groups') THEN
        CREATE POLICY "Users can view their groups" ON public.chama_groups
          FOR SELECT USING (
            id IN (
              SELECT group_id FROM public.group_members 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );
    END IF;
END $$;

-- Create or replace the user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Final verification
SELECT 
    'Setup Status: ' || CASE 
        WHEN COUNT(*) >= 7 THEN 'SUCCESS - All core tables exist'
        ELSE 'PARTIAL - Missing ' || (7 - COUNT(*))::text || ' tables'
    END as status,
    COUNT(*) as existing_tables,
    array_agg(table_name ORDER BY table_name) as tables_found
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'chama_groups', 'group_members', 'contributions', 'loans', 'payment_methods', 'loan_repayments');

-- Show specifically if group_members exists (the main issue)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public')
        THEN '✅ group_members table EXISTS - Relationship error should be FIXED!'
        ELSE '❌ group_members table MISSING - Still needs to be created'
    END as group_members_status;
