
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, FileText, CreditCard } from "lucide-react";
import ContributionModal from "./ContributionModal";
import CreateGroupModal from "./CreateGroupModal";
import JoinGroupModal from "./JoinGroupModal";
import LoanRequestModal from "./LoanRequestModal";
import ReportsModal from "./ReportsModal";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroups";

const QuickActions = () => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => setContributionModalOpen(true)}
          >
            <DollarSign className="h-6 w-6" />
            <span className="text-xs">Contribute</span>
          </Button>

          <CreateGroupModal onGroupCreated={handleGroupCreated} />

          <JoinGroupModal onGroupJoined={handleGroupJoined} />

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => setLoanModalOpen(true)}
          >
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Request Loan</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => setReportsModalOpen(true)}
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs">Reports</span>
          </Button>
        </div>

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
      </CardContent>
    </Card>
  );
};

export default QuickActions;
