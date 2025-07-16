
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface LoanRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  hasEligibleGroups: boolean;
}

const LoanRequestDialog = ({ open, onOpenChange, children, hasEligibleGroups }: LoanRequestDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          Request Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Loan</DialogTitle>
        </DialogHeader>
        {!hasEligibleGroups ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              You need to be an active member of a savings group to request a loan.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          children
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoanRequestDialog;
