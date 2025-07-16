
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LoanMetrics {
  totalRequests: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  approvalRate: number;
  averageLoanAmount: number;
  totalDisbursed: number;
  totalRepaid: number;
  defaultRate: number;
}

export const useLoanMetrics = (groupId?: string) => {
  const { user } = useAuth();
  const [loanMetrics, setLoanMetrics] = useState<LoanMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoanMetrics = async () => {
    if (!user || !groupId) return;

    try {
      // TODO: Implement backend API endpoint for loan metrics
      // For now, return empty metrics to prevent errors
      const mockMetrics: LoanMetrics = {
        totalRequests: 0,
        approvedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
        approvalRate: 0,
        averageLoanAmount: 0,
        totalDisbursed: 0,
        totalRepaid: 0,
        defaultRate: 0
      };

      setLoanMetrics(mockMetrics);
    } catch (err: any) {
      console.error('Error fetching loan metrics:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      await fetchLoanMetrics();
      setLoading(false);
    };

    if (user && groupId) {
      loadMetrics();
    }
  }, [user, groupId]);

  return {
    loanMetrics,
    loading,
    error,
    refetch: fetchLoanMetrics
  };
};
