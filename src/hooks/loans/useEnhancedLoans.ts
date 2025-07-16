
import { useEffect } from 'react';
import { useLoanData } from './useLoanData';
import { useLoanActions } from './useLoanActions';

export { type LoanStatus, type EnhancedLoan, type LoanRepaymentSchedule, type LoanDisbursement } from './types';

export const useEnhancedLoans = (groupId?: string) => {
  const {
    loans,
    repaymentSchedules,
    disbursements,
    loading,
    setLoading,
    error: dataError,
    fetchLoans,
    fetchRepaymentSchedule,
    fetchDisbursements
  } = useLoanData(groupId);

  const {
    updateLoanStatus,
    recordRepayment,
    disburseLoan,
    error: actionError
  } = useLoanActions();

  // Combine errors from both hooks
  const error = dataError || actionError;

  const handleUpdateLoanStatus = async (loanId: string, status: any, notes?: string, rejectionReason?: string) => {
    const success = await updateLoanStatus(loanId, status, notes, rejectionReason);
    if (success) {
      await fetchLoans();
    }
    return success;
  };

  const handleRecordRepayment = async (scheduleId: string, amount: number, paymentDate: string) => {
    const success = await recordRepayment(scheduleId, amount, paymentDate);
    if (success) {
      await fetchLoans();
    }
    return success;
  };

  const handleDisburseLoan = async (loanId: string, amount: number, method: string, reference?: string, notes?: string) => {
    const success = await disburseLoan(loanId, amount, method, reference, notes);
    if (success) {
      await fetchLoans();
    }
    return success;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchLoans();
      setLoading(false);
    };

    loadData();
  }, [groupId]);

  return {
    loans,
    repaymentSchedules,
    disbursements,
    loading,
    error,
    updateLoanStatus: handleUpdateLoanStatus,
    recordRepayment: handleRecordRepayment,
    disburseLoan: handleDisburseLoan,
    fetchRepaymentSchedule,
    fetchDisbursements,
    refetch: fetchLoans
  };
};
