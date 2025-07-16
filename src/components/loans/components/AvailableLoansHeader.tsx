
import { Badge } from "@/components/ui/badge";

interface AvailableLoansHeaderProps {
  applicationsCount: number;
}

const AvailableLoansHeader = ({ applicationsCount }: AvailableLoansHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Pending Loan Applications</h3>
      <Badge variant="secondary">{applicationsCount} Pending Review</Badge>
    </div>
  );
};

export default AvailableLoansHeader;
