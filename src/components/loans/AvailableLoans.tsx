
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLoanApplications } from "./hooks/useLoanApplications";
import AvailableLoansHeader from "./components/AvailableLoansHeader";
import AvailableLoansTable from "./components/AvailableLoansTable";
import EmptyLoansState from "./components/EmptyLoansState";

const AvailableLoans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingLoan, setProcessingLoan] = useState<string | null>(null);
  
  const {
    applications,
    loading,
    error,
    refetchApplications,
    handleLoanDecision: processLoanDecision
  } = useLoanApplications(user?.id);

  const handleLoanDecision = async (loanId: string, decision: 'approved' | 'rejected') => {
    setProcessingLoan(loanId);
    
    try {
      const success = await processLoanDecision(loanId, decision, user?.id);
      
      if (success) {
        toast({
          title: "Success!",
          description: `Loan application has been ${decision}`,
          duration: 3000,
        });
        
        // No need to manually refetch as the application is already removed from state
        console.log(`Loan ${loanId} ${decision} successfully`);
      }
    } catch (error: any) {
      console.error(`Error ${decision === 'approved' ? 'approving' : 'rejecting'} loan:`, error);
      toast({
        title: "Error",
        description: `Failed to ${decision === 'approved' ? 'approve' : 'reject'} loan application. Please try again.`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setProcessingLoan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading loan applications: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <AvailableLoansHeader applicationsCount={applications.length} />
      
      {applications.length === 0 ? (
        <EmptyLoansState />
      ) : (
        <AvailableLoansTable 
          applications={applications}
          processingLoan={processingLoan}
          onLoanDecision={handleLoanDecision}
        />
      )}
    </div>
  );
};

export default AvailableLoans;
