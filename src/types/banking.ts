
export interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: 'mobile_money' | 'bank_account' | 'credit_card' | 'debit_card';
  provider: string;
  account_identifier: string;
  account_name?: string;
  is_primary?: boolean;
  is_verified?: boolean;
  verification_code?: string;
  verification_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'loan';
  status: 'pending' | 'completed' | 'failed';
}

export interface TransactionNotification {
  id: string;
  user_id: string;
  transaction_type: string;
  notification_type: string;
  amount: number;
  message: string;
  group_id?: string;
  payment_method_id?: string;
  external_reference?: string;
  status: string;
  created_at: string;
}

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
  endDate: string;
  paymentFrequency: 'monthly' | 'weekly';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
}
