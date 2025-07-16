
import { useToast } from "@/hooks/use-toast";
import type { Group } from "@/types";

export const useContributionValidation = () => {
  const { toast } = useToast();

  const validateAmount = (amount: number, selectedGroup: Group | undefined) => {
    const minAmount = selectedGroup?.minContributionAmount || 0;
    const maxAmount = selectedGroup?.maxContributionAmount;

    if (minAmount && amount < minAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum contribution amount is KES ${minAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return false;
    }

    if (maxAmount && amount > maxAmount) {
      toast({
        title: "Invalid Amount", 
        description: `Maximum contribution amount is KES ${maxAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateAmount };
};
