
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroups";
import { useLoanRequest } from "@/components/loans/hooks/useLoanRequest";
import LoanRequestDialog from "@/components/loans/LoanRequestDialog";
import LoanRequestForm from "@/components/loans/LoanRequestForm";

interface LoanRequestModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const LoanRequestModal = ({ open, onOpenChange }: LoanRequestModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { groups } = useRealtimeGroups();
  const { formData, setFormData, loading, submitLoanRequest, resetForm } = useLoanRequest();

  // Use controlled or internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Filter groups to only show where user is an active member
  const eligibleGroups = groups.filter(group => group.role !== undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitLoanRequest();
    if (success) {
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  return (
    <LoanRequestDialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
      hasEligibleGroups={eligibleGroups.length > 0}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <LoanRequestForm 
          formData={formData}
          setFormData={setFormData}
          eligibleGroups={eligibleGroups}
        />
        
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || eligibleGroups.length === 0} 
            className="flex-1"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </LoanRequestDialog>
  );
};

export default LoanRequestModal;
