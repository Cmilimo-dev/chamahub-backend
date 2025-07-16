
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, CreditCard } from "lucide-react";
import ContributionModal from "./ContributionModal";
import CreateGroupModal from "./CreateGroupModal";
import JoinGroupModal from "./JoinGroupModal";
import LoanRequestModal from "./LoanRequestModal";
import ReportsModal from "./ReportsModal";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroups";

const MobileQuickActions = () => {
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const { groups, refetch } = useRealtimeGroups();

  const handleGroupCreated = () => {
    console.log('Group created, refreshing data...');
    refetch();
  };

  const handleGroupJoined = () => {
    console.log('Group joined, refreshing data...');
    refetch();
  };

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      <Button
        variant="outline"
        size="lg"
        className="flex flex-col items-center gap-2 h-20"
        onClick={() => setContributionModalOpen(true)}
      >
        <DollarSign className="h-6 w-6" />
        <span className="text-sm">Contribute</span>
      </Button>

      <div className="flex flex-col gap-2">
        <CreateGroupModal onGroupCreated={handleGroupCreated} />
        <JoinGroupModal onGroupJoined={handleGroupJoined} />
      </div>

      <Button
        variant="outline"
        size="lg"
        className="flex flex-col items-center gap-2 h-20"
        onClick={() => setLoanModalOpen(true)}
      >
        <CreditCard className="h-6 w-6" />
        <span className="text-sm">Request Loan</span>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="flex flex-col items-center gap-2 h-20"
        onClick={() => setReportsModalOpen(true)}
      >
        <FileText className="h-6 w-6" />
        <span className="text-sm">Reports</span>
      </Button>

      <ContributionModal 
        open={contributionModalOpen} 
        onOpenChange={setContributionModalOpen}
        groups={groups}
      />
      <LoanRequestModal 
        open={loanModalOpen} 
        onOpenChange={setLoanModalOpen} 
      />
      <ReportsModal 
        open={reportsModalOpen} 
        onOpenChange={setReportsModalOpen} 
      />
    </div>
  );
};

export default MobileQuickActions;
