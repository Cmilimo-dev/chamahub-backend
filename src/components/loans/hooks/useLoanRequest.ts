
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";

interface LoanFormData {
  groupId: string;
  amount: string;
  purpose: string;
  durationMonths: string;
}

export const useLoanRequest = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoanFormData>({
    groupId: "",
    amount: "",
    purpose: "",
    durationMonths: "12"
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const resetForm = () => {
    setFormData({
      groupId: "",
      amount: "",
      purpose: "",
      durationMonths: "12"
    });
  };

  const validateForm = (): boolean => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to request a loan",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.groupId || !formData.amount || !formData.purpose) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid loan amount",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const submitLoanRequest = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);

      // Check for existing pending loans
      const existingLoansResponse = await apiClient.get(`/loans/user/${user!.id}`);
      const existingLoans = existingLoansResponse.data || [];
      
      // Check if user has any pending loans for this group
      const pendingLoansInGroup = existingLoans.filter(
        (loan: any) => loan.group_id === formData.groupId && loan.status === 'pending'
      );

      if (pendingLoansInGroup.length > 0) {
        toast({
          title: "Error",
          description: "You already have a pending loan application for this group",
          variant: "destructive",
        });
        return false;
      }

      console.log('Submitting loan request:', {
        borrower_id: user!.id,
        group_id: formData.groupId,
        amount: amount,
        purpose: formData.purpose,
        duration_months: parseInt(formData.durationMonths)
      });

      // Submit loan request to the backend
      const response = await apiClient.post('/loans', {
        borrower_id: user!.id,
        group_id: formData.groupId,
        amount: amount,
        purpose: formData.purpose,
        duration_months: parseInt(formData.durationMonths)
      });

      if (response.status !== 200) {
        throw new Error('Failed to submit loan request');
      }

      toast({
        title: "Success!",
        description: "Your loan request has been submitted for review",
      });

      resetForm();
      return true;
    } catch (error: any) {
      console.error('Error submitting loan request:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to submit loan request. Please try again.";
      
      if (error.code === '23503') {
        if (error.message?.includes('group_members')) {
          errorMessage = "You must be an active member of the selected group to request a loan.";
        } else {
          errorMessage = "Please ensure you're logged in and try again.";
        }
      } else if (error.message?.includes('violates check constraint')) {
        errorMessage = "Please check that all values are valid (amount must be positive, etc.).";
      } else if (error.message?.includes('duplicate key value')) {
        errorMessage = "You already have a pending loan application for this group.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    submitLoanRequest,
    resetForm
  };
};
