import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  group: string;
  date: string;
  status: string;
}

export const useRealtimeContributions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  const fetchTransactions = useCallback(async () => {
    if (!user || !mountedRef.current) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Fetching transactions for user:', user.id);

      // Fetch contributions
      const contributionsResponse = await apiClient.get(`/contributions/user/${user.id}`);
      const contributions = contributionsResponse || [];

      // Fetch loans
      const loansResponse = await apiClient.get(`/loans/user/${user.id}`);
      const loans = loansResponse || [];

      // Format contributions
      const formattedContributions: Transaction[] = (contributions || []).map((contrib: any) => ({
        id: contrib.id,
        type: 'contribution',
        amount: parseFloat(contrib.amount) || 0,
        group: contrib.group_name || 'Unknown Group',
        date: contrib.contribution_date || contrib.created_at,
        status: contrib.status || 'pending'
      }));

      // Format loans
      const formattedLoans: Transaction[] = (loans || []).map((loan: any) => ({
        id: loan.id,
        type: 'loan',
        amount: -(parseFloat(loan.amount) || 0),
        group: loan.group_name || 'Unknown Group',
        date: loan.application_date || loan.created_at,
        status: loan.status || 'pending'
      }));

      // Combine and sort by date
      const allTransactions = [...formattedContributions, ...formattedLoans]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50); // Limit to most recent 50 transactions

      if (mountedRef.current) {
        console.log('Successfully fetched transactions:', allTransactions.length);
        setTransactions(allTransactions);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      if (mountedRef.current) {
        setError(error.response?.data?.error || error.message || 'Failed to fetch transactions');
        setTransactions([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('Stopping transactions polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!user?.id || !mountedRef.current) {
      return;
    }

    // Clear any existing interval
    stopPolling();

    console.log('Starting transactions polling for user:', user.id);
    
    // Set up polling interval - poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        console.log('Polling for transactions changes...');
        fetchTransactions();
      }
    }, 30000);
  }, [user?.id, fetchTransactions, stopPolling]);

  // Initial fetch and setup polling
  useEffect(() => {
    mountedRef.current = true;
    
    // Fetch initial data
    fetchTransactions();
    
    // Start polling after initial fetch
    const pollingTimeout = setTimeout(() => {
      if (mountedRef.current) {
        startPolling();
      }
    }, 2000);

    return () => {
      mountedRef.current = false;
      clearTimeout(pollingTimeout);
      stopPolling();
    };
  }, [user?.id, fetchTransactions, startPolling, stopPolling]);

  // Manual refresh function
  const refreshTransactions = useCallback(() => {
    setLoading(true);
    fetchTransactions();
  }, [fetchTransactions]);

  return { 
    transactions, 
    loading, 
    error, 
    refreshTransactions 
  };
};
