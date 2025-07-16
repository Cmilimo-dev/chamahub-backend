import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Filter, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedLoans } from "@/hooks/loans/useEnhancedLoans";
import EnhancedLoanCard from "./EnhancedLoanCard";
import LoanDisbursementModal from "./LoanDisbursementModal";

const EnhancedAvailableLoans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loans, loading, error, updateLoanStatus, disburseLoan, refetch } = useEnhancedLoans();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'disburse' | null;
    loan: any;
  }>({ isOpen: false, type: null, loan: null });
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter loans that need review (pending, under_review, approved)
  const availableLoans = loans.filter(loan => 
    ['pending', 'under_review', 'approved'].includes(loan.status)
  );

  const filteredLoans = availableLoans.filter(loan => {
    const matchesSearch = loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.chama_groups.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (loanId: string, status: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    if (status === 'approved' || status === 'rejected') {
      setActionModal({
        isOpen: true,
        type: status as 'approve' | 'reject',
        loan
      });
    } else if (status === 'disbursed') {
      setActionModal({
        isOpen: true,
        type: 'disburse',
        loan
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!actionModal.loan || !actionModal.type) return;

    setIsProcessing(true);
    
    try {
      let success = false;
      
      if (actionModal.type === 'disburse') {
        // This will be handled by the disbursement modal
        return;
      } else {
        const rejectionReason = actionModal.type === 'reject' ? actionNotes : undefined;
        const notes = actionModal.type === 'approve' ? actionNotes : undefined;
        
        success = await updateLoanStatus(
          actionModal.loan.id,
          actionModal.type === 'approve' ? 'approved' : 'rejected',
          notes,
          rejectionReason
        );
      }

      if (success) {
        toast({
          title: "Success",
          description: `Loan has been ${actionModal.type}d successfully.`,
        });
        setActionModal({ isOpen: false, type: null, loan: null });
        setActionNotes('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${actionModal.type} loan. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Loan Applications</h2>
        <div className="text-sm text-gray-600">
          {filteredLoans.length} application{filteredLoans.length !== 1 ? 's' : ''} requiring review
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by purpose or group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Loans List */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loan applications</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No applications match your current filters.' 
              : 'There are no loan applications requiring review at this time.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLoans.map((loan) => (
            <EnhancedLoanCard
              key={loan.id}
              loan={loan}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={(loanId) => setSelectedLoan(loans.find(l => l.id === loanId))}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Action Confirmation Modal */}
      <Dialog 
        open={actionModal.isOpen && actionModal.type !== 'disburse'} 
        onOpenChange={(open) => !open && setActionModal({ isOpen: false, type: null, loan: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === 'approve' ? 'Approve' : 'Reject'} Loan Application
            </DialogTitle>
          </DialogHeader>
          
          {actionModal.loan && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">KES {actionModal.loan.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{actionModal.loan.purpose}</p>
                <p className="text-sm text-gray-600">{actionModal.loan.chama_groups.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {actionModal.type === 'approve' ? 'Approval Notes' : 'Rejection Reason'} 
                  {actionModal.type === 'reject' && ' *'}
                </label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={actionModal.type === 'approve' 
                    ? 'Add any notes about this approval (optional)' 
                    : 'Please provide a reason for rejection'}
                  rows={3}
                  required={actionModal.type === 'reject'}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActionModal({ isOpen: false, type: null, loan: null })}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  disabled={isProcessing || (actionModal.type === 'reject' && !actionNotes.trim())}
                  className={`flex-1 ${actionModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  {isProcessing ? 'Processing...' : `${actionModal.type === 'approve' ? 'Approve' : 'Reject'} Loan`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disbursement Modal */}
      <LoanDisbursementModal
        isOpen={actionModal.isOpen && actionModal.type === 'disburse'}
        onClose={() => setActionModal({ isOpen: false, type: null, loan: null })}
        loan={actionModal.loan}
        onDisburse={disburseLoan}
      />
    </div>
  );
};

export default EnhancedAvailableLoans;
