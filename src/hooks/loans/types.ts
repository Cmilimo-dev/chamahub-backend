
export type LoanStatus = 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'disbursed' 
  | 'active' 
  | 'completed' 
  | 'defaulted' 
  | 'cancelled';

export interface EnhancedLoan {
  id: string;
  amount: number;
  purpose: string;
  status: LoanStatus;
  application_date: string;
  approval_date: string | null;
  duration_months: number;
  interest_rate: number;
  monthly_payment_amount: number;
  next_payment_date: string | null;
  payments_made: number;
  is_overdue: boolean;
  days_overdue: number;
  loan_officer_id: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  disbursement_method: string;
  disbursement_reference: string | null;
  borrower_id: string;
  group_id: string;
  chama_groups: {
    name: string;
  };
  loan_officer?: {
    first_name: string;
    last_name: string;
  };
}

export interface LoanRepaymentSchedule {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  amount_paid: number;
  payment_date: string | null;
  status: string;
  is_overdue: boolean;
  days_overdue: number;
}

export interface LoanDisbursement {
  id: string;
  loan_id: string;
  disbursement_date: string;
  amount: number;
  disbursement_method: string;
  reference_number: string | null;
  disbursed_by: string | null;
  notes: string | null;
  status: string;
}
