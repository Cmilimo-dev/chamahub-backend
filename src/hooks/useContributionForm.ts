
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { mpesaService } from "@/lib/payments/mpesa";
import type { Group } from "@/types";

interface ContributionFormData {
  selectedGroup: string;
  amount: number;
  contribution_date: Date;
  payment_method: string;
  payment_method_id: string;
  phone_number: string;
  notes: string;
}

interface UseContributionFormProps {
  groups: Group[];
  initialGroupId?: string;
  initialAmount?: number;
  onSuccess: () => void;
}

export const useContributionForm = ({
  groups,
  initialGroupId,
  initialAmount,
  onSuccess
}: UseContributionFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ContributionFormData>({
    selectedGroup: initialGroupId || "",
    amount: initialAmount || 0,
    contribution_date: new Date(),
    payment_method: "cash",
    payment_method_id: "",
    phone_number: "",
    notes: ""
  });

  const selectedGroup = useMemo(() => 
    groups.find(g => g.id === formData.selectedGroup),
    [groups, formData.selectedGroup]
  );

  const updateFormData = (updates: Partial<ContributionFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Auto-select first group if no initial group is provided and groups are available
  useEffect(() => {
    if (!initialGroupId && groups.length > 0 && !formData.selectedGroup) {
      const firstGroup = groups[0];
      updateFormData({ 
        selectedGroup: firstGroup.id,
        amount: firstGroup.contributionAmount || 0
      });
    }
  }, [groups, initialGroupId, formData.selectedGroup]);

  const handleGroupChange = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    updateFormData({ 
      selectedGroup: groupId,
      amount: group?.contributionAmount || 0
    });
  };

  const validateForm = (): boolean => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to record a contribution",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.selectedGroup) {
      toast({
        title: "Error",
        description: "Please select a group",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      });
      return false;
    }

    // Validate amount against group limits
    if (selectedGroup?.minContributionAmount && formData.amount < selectedGroup.minContributionAmount) {
      toast({
        title: "Error",
        description: `Minimum contribution amount is KES ${selectedGroup.minContributionAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return false;
    }

    if (selectedGroup?.maxContributionAmount && formData.amount > selectedGroup.maxContributionAmount) {
      toast({
        title: "Error",
        description: `Maximum contribution amount is KES ${selectedGroup.maxContributionAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const submitContribution = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // TODO: Implement with MySQL backend API
      const response = await apiClient.post('/contributions', {
        user_id: user!.id,
        group_id: formData.selectedGroup,
        amount: formData.amount,
        contribution_date: formData.contribution_date.toISOString().split('T')[0],
        payment_method: formData.payment_method,
        payment_method_id: formData.payment_method_id || null,
        notes: formData.notes || null,
        phone_number: formData.phone_number
      });

      toast({
        title: "Success!",
        description: `Contribution of KES ${formData.amount.toLocaleString()} recorded successfully`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error recording contribution:', error);
      
      let errorMessage = "Failed to record contribution. Please try again.";
      
      // Handle specific error messages from server
      if (error.message?.includes('must be an active member')) {
        errorMessage = "You must be an active member of the selected group to record contributions.";
      } else if (error.message?.includes('User must be an active member')) {
        errorMessage = "You must be an active member of the selected group to record contributions.";
      } else if (error.code === '23503') {
        if (error.message?.includes('member_id')) {
          errorMessage = "You must be a member of the selected group to record contributions.";
        } else if (error.message?.includes('group_id')) {
          errorMessage = "Invalid group selected. Please choose a valid group.";
        }
      } else if (error.message?.includes('violates check constraint')) {
        errorMessage = "Please check that all values are valid (amount must be positive, etc.).";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    selectedGroup,
    loading,
    updateFormData,
    handleGroupChange,
    submitContribution
  };
};
