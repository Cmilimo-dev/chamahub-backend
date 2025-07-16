
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { PaymentMethod } from '@/types/banking';

export const usePaymentMethods = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/payment-methods/user/${user.id}`);
      setPaymentMethods(response.data || []);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (methodData: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/payment-methods', {
        ...methodData,
        user_id: user.id,
      });

      const newMethod = response.data;
      setPaymentMethods(prev => [newMethod, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/payment-methods/${id}`, {
        user_id: user.id,
        updates
      });

      // Update the local state
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === id ? { ...method, ...updates } : method
        )
      );
      return true;
    } catch (err: any) {
      console.error('Error updating payment method:', err);
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMethod = async (id: string) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/payment-methods/${id}?user_id=${user.id}`);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refetch: fetchPaymentMethods
  };
};
