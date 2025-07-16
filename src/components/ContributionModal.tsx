
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign } from "lucide-react";
import ContributionForm from "./forms/ContributionForm";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroups";
import type { Group } from "@/types";

interface ContributionModalProps {
  groupId?: string;
  groupName?: string;
  contributionAmount?: number;
  groups?: Group[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ContributionModal = ({ 
  groupId, 
  groupName, 
  contributionAmount, 
  groups: providedGroups,
  open,
  onOpenChange 
}: ContributionModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { groups: hookGroups } = useRealtimeGroups();
  
  // Use provided groups or fall back to hook groups
  const groups = providedGroups || hookGroups;
  
  // Use controlled or internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const DialogWrapper = ({ children }: { children: React.ReactNode }) => {
    if (open !== undefined) {
      // Controlled mode - no trigger
      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            {children}
          </DialogContent>
        </Dialog>
      );
    }

    // Trigger mode - includes trigger button
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <DollarSign className="h-4 w-4 mr-2" />
            Contribute
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          {children}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DialogWrapper>
      <DialogHeader>
        <DialogTitle>Record Contribution</DialogTitle>
      </DialogHeader>
      
      <ContributionForm
        groups={groups}
        initialGroupId={groupId || ""}
        initialAmount={contributionAmount || 0}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </DialogWrapper>
  );
};

export default ContributionModal;
