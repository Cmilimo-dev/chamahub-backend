import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { LoanStatus } from './types';

export const useLoanActions = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const updateLoanStatus = async (loanId: string, status: LoanStatus, notes?: string, rejectionReason?: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'approved') {
        updateData.approval_date = new Date().toISOString().split('T')[0];
        updateData.loan_officer_id = user?.id;
      }
      
      if (notes) updateData.review_notes = notes;
      if (rejectionReason) updateData.rejection_reason = rejectionReason;

      await apiClient.put(`/loans/${loanId}`, updateData);
      
      return true;
    } catch (err: any) {
      console.error('Error updating loan status:', err);
      setError(err.message);
      return false;
    }
  };

  const recordRepayment = async (scheduleId: string, amount: number, paymentDate: string) => {
    try {
      await apiClient.put(`/loan-repayments/${scheduleId}`, {
        amount_paid: amount,
        payment_date: paymentDate,
        status: 'paid'
      });
      
      return true;
    } catch (err: any) {
      console.error('Error recording repayment:', err);
      setError(err.message);
      return false;
    }
  };

  const disburseLoan = async (loanId: string, amount: number, method: string, reference?: string, notes?: string) => {
    try {
      // Create disbursement record and update loan status
      await apiClient.post(`/loans/${loanId}/disburse`, {
        amount,
        disbursement_method: method,
        reference_number: reference,
        notes,
        disbursed_by: user?.id
      });

      return true;
    } catch (err: any) {
      console.error('Error disbursing loan:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    updateLoanStatus,
    recordRepayment,
    disburseLoan,
    error
  };
};
