
import { Badge } from "@/components/ui/badge";
import EnhancedLoanCard from "./EnhancedLoanCard";
import EmptyLoanState from "./EmptyLoanState";
import type { EnhancedLoan } from "@/hooks/loans/types";

interface LoansTabContentProps {
  loans: EnhancedLoan[];
  title: string;
  type: 'active' | 'my-loans' | 'completed';
  onViewDetails: (loanId: string) => void;
}

const LoansTabContent = ({ loans, title, type, onViewDetails }: LoansTabContentProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="secondary">{loans.length} {type === 'active' ? 'active' : type === 'completed' ? 'completed' : 'total'}</Badge>
      </div>
      
      {loans.length === 0 ? (
        <EmptyLoanState type={type === 'completed' ? 'my-loans' : type} count={loans.length} />
      ) : (
        <div className="grid gap-4">
          {loans.map((loan) => (
            <EnhancedLoanCard
              key={loan.id}
              loan={loan}
              onViewDetails={onViewDetails}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoansTabContent;
