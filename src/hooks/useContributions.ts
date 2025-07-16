import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  group: string;
  date: string;
  status: string;
}

export const useContributions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch transactions from API
        const data = await apiClient.get(`/transactions/user/${user.id}`);
        
        const formattedTransactions: Transaction[] = data.map((transaction: any) => ({
          id: transaction.id,
          type: transaction.type || 'contribution',
          amount: transaction.amount,
          group: transaction.group_name || 'Unknown Group',
          date: transaction.date || transaction.created_at,
          status: transaction.status || 'completed'
        }));

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  return { transactions, loading };
};
