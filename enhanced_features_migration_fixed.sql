-- Migration: Add tables for enhanced features (FIXED VERSION)
-- Push notifications, meetings, document storage, and advanced reporting
-- This version handles existing policies and tables gracefully

-- 1. Push notification tokens table
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, platform)
);

-- 2. Group meetings table
CREATE TABLE IF NOT EXISTS public.group_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  location TEXT,
  agenda JSONB DEFAULT '[]'::jsonb,
  attendees JSONB DEFAULT '[]'::jsonb,
  minutes JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Scheduled notifications table
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('meeting_reminder', 'contribution_reminder', 'loan_reminder', 'payment_due')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Document storage table
CREATE TABLE IF NOT EXISTS public.group_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  document_type TEXT DEFAULT 'general' CHECK (document_type IN ('general', 'receipt', 'meeting_minutes', 'financial_report', 'agreement', 'photo')),
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. M-Pesa transactions table
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_request_id TEXT,
  checkout_request_id TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  group_id UUID REFERENCES public.chama_groups(id),
  contribution_id UUID REFERENCES public.contributions(id),
  amount NUMERIC NOT NULL,
  phone_number TEXT NOT NULL,
  mpesa_receipt_number TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  response_code TEXT,
  response_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Enhanced reporting views and functions
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  template_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('financial_summary', 'member_contributions', 'loan_status', 'meeting_attendance', 'custom')),
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Contribution reminders table
CREATE TABLE IF NOT EXISTS public.contribution_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chama_groups(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.group_members(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('monthly', 'weekly', 'custom')),
  reminder_date DATE NOT NULL,
  amount_due NUMERIC NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_group_meetings_group_date ON public.group_meetings(group_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_group_documents_group_id ON public.group_documents(group_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_id ON public.mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_contribution_reminders_date ON public.contribution_reminders(reminder_date) WHERE status = 'pending';

-- Enable RLS (safe even if already enabled)
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
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

-- Create RLS Policies (now safe to create)

-- Push tokens - users can only manage their own
CREATE POLICY "Users manage own push tokens" ON public.user_push_tokens
  FOR ALL USING (user_id = auth.uid());

-- Group meetings - members can view, admins can manage
CREATE POLICY "Group members can view meetings" ON public.group_meetings
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Group admins can manage meetings" ON public.group_meetings
  FOR ALL USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('admin', 'treasurer')
    )
  );

-- Scheduled notifications
CREATE POLICY "Users can view their notifications" ON public.scheduled_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage notifications" ON public.scheduled_notifications
  FOR ALL USING (true); -- Allow system operations

-- Group documents
CREATE POLICY "Group members can view documents" ON public.group_documents
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_public = true
  );

CREATE POLICY "Group members can upload documents" ON public.group_documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- M-Pesa transactions
CREATE POLICY "Users can view their transactions" ON public.mpesa_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions" ON public.mpesa_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Report templates
CREATE POLICY "Group members can view report templates" ON public.report_templates
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Group admins can manage report templates" ON public.report_templates
  FOR ALL USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('admin', 'treasurer')
    )
  );

-- Contribution reminders
CREATE POLICY "Members can view their reminders" ON public.contribution_reminders
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM public.group_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create or replace function to calculate group financial summary
CREATE OR REPLACE FUNCTION public.get_group_financial_summary(_group_id uuid, _start_date date DEFAULT NULL, _end_date date DEFAULT NULL)
RETURNS TABLE(
  total_contributions numeric,
  total_loans numeric,
  total_repayments numeric,
  active_loans_count bigint,
  member_count bigint,
  average_contribution numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT 
      COALESCE(_start_date, CURRENT_DATE - INTERVAL '1 year') as start_date,
      COALESCE(_end_date, CURRENT_DATE) as end_date
  ),
  contribution_stats AS (
    SELECT 
      COALESCE(SUM(c.amount), 0) as total_contributions,
      COALESCE(AVG(c.amount), 0) as avg_contribution
    FROM public.contributions c
    CROSS JOIN date_range dr
    WHERE c.group_id = _group_id 
      AND c.status = 'completed'
      AND c.contribution_date::date BETWEEN dr.start_date AND dr.end_date
  ),
  loan_stats AS (
    SELECT 
      COALESCE(SUM(l.amount), 0) as total_loans,
      COUNT(*) FILTER (WHERE l.status IN ('active', 'disbursed')) as active_loans
    FROM public.loans l
    CROSS JOIN date_range dr
    WHERE l.group_id = _group_id
      AND l.application_date::date BETWEEN dr.start_date AND dr.end_date
  ),
  repayment_stats AS (
    SELECT 
      COALESCE(SUM(lr.amount), 0) as total_repayments
    FROM public.loan_repayments lr
    JOIN public.loans l ON lr.loan_id = l.id
    CROSS JOIN date_range dr
    WHERE l.group_id = _group_id
      AND lr.payment_date::date BETWEEN dr.start_date AND dr.end_date
  ),
  member_stats AS (
    SELECT COUNT(*) as member_count
    FROM public.group_members gm
    WHERE gm.group_id = _group_id AND gm.status = 'active'
  )
  SELECT 
    cs.total_contributions,
    ls.total_loans,
    rs.total_repayments,
    ls.active_loans,
    ms.member_count,
    cs.avg_contribution
  FROM contribution_stats cs
  CROSS JOIN loan_stats ls
  CROSS JOIN repayment_stats rs
  CROSS JOIN member_stats ms;
END;
$$;
