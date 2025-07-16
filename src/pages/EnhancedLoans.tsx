
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnhancedLoans } from "@/hooks/loans/useEnhancedLoans";
import EnhancedAvailableLoans from "@/components/loans/EnhancedAvailableLoans";
import LoansTabContent from "@/components/loans/LoansTabContent";
import LoanStatsCards from "@/components/loans/LoanStatsCards";
import LoanRepaymentSchedule from "@/components/loans/LoanRepaymentSchedule";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EnhancedLoanCard from "@/components/loans/EnhancedLoanCard";

const EnhancedLoans = () => {
  const { loans, loading, error, fetchRepaymentSchedule, recordRepayment, repaymentSchedules } = useEnhancedLoans();
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [detailsModal, setDetailsModal] = useState(false);

  // Calculate loan statistics
  const stats = {
    totalActive: loans.filter(l => ['active', 'disbursed'].includes(l.status)).length,
    totalDisbursed: loans
      .filter(l => ['active', 'disbursed', 'completed'].includes(l.status))
      .reduce((sum, l) => sum + l.amount, 0),
    totalOverdue: loans.filter(l => l.is_overdue).length,
    completionRate: loans.length > 0 
      ? (loans.filter(l => l.status === 'completed').length / loans.length) * 100 
      : 0
  };

  const handleViewDetails = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      setSelectedLoan(loan);
      setDetailsModal(true);
      
      // Fetch repayment schedule if loan is active
      if (['active', 'disbursed', 'completed'].includes(loan.status)) {
        await fetchRepaymentSchedule(loanId);
      }
    }
  };

  const myLoans = loans.filter(loan => 
    ['pending', 'approved', 'rejected', 'active', 'disbursed', 'completed', 'defaulted'].includes(loan.status)
  );

  const activeLoans = loans.filter(loan => 
    ['active', 'disbursed'].includes(loan.status)
  );

  const completedLoans = loans.filter(l => l.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Loan Management</h1>
          <p className="text-gray-600">Comprehensive loan tracking and management system</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <LoanStatsCards stats={stats} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="my-loans">My Loans</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <EnhancedAvailableLoans />
        </TabsContent>

        <TabsContent value="active">
          <LoansTabContent
            loans={activeLoans}
            title="Active Loans"
            type="active"
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="my-loans">
          <LoansTabContent
            loans={myLoans}
            title="My Loan Applications"
            type="my-loans"
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="completed">
          <LoansTabContent
            loans={completedLoans}
            title="Completed Loans"
            type="completed"
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Loan Details Modal */}
      <Dialog open={detailsModal} onOpenChange={setDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-6">
              <EnhancedLoanCard
                loan={selectedLoan}
                showActions={false}
              />
              
              {repaymentSchedules[selectedLoan.id] && (
                <LoanRepaymentSchedule
                  loanId={selectedLoan.id}
                  schedule={repaymentSchedules[selectedLoan.id]}
                  onRecordPayment={recordRepayment}
                  canRecordPayments={true}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedLoans;
