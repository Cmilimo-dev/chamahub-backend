
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LoanEligibility {
  isEligible: boolean;
  maxLoanAmount: number;
  eligibilityReasons: string[];
}

export const useLoanEligibility = (groupId?: string) => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async (targetGroupId?: string) => {
    if (!user || (!groupId && !targetGroupId)) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post('/functions/calculate-loan-eligibility', {
        groupId: targetGroupId || groupId
      });

      setEligibility(data);
    } catch (err: any) {
      console.error('Error checking loan eligibility:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      checkEligibility();
    }
  }, [groupId, user]);

  return {
    eligibility,
    loading,
    error,
    checkEligibility,
    refetch: () => checkEligibility()
  };
};
