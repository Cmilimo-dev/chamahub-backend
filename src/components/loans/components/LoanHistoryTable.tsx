
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HistoricalLoan {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  application_date: string;
  approval_date: string | null;
  disbursement_date: string | null;
  due_date: string | null;
  duration_months: number;
  interest_rate: number;
  amount_repaid: number;
  chama_groups: {
    name: string;
  };
}

interface LoanHistoryTableProps {
  loans: HistoricalLoan[];
}

const LoanHistoryTable = ({ loans }: LoanHistoryTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-700 border-green-700">Completed</Badge>;
      case 'defaulted':
        return <Badge variant="outline" className="text-red-700 border-red-700">Defaulted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (loan: HistoricalLoan) => {
    if (loan.status === 'rejected') return 0;
    if (loan.status === 'completed') return 100;
    if (loan.amount_repaid <= 0) return 0;
    return Math.round((loan.amount_repaid / loan.amount) * 100);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Disbursed</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">
                  {loan.chama_groups.name}
                </TableCell>
                <TableCell>{formatCurrency(loan.amount)}</TableCell>
                <TableCell>{getStatusBadge(loan.status)}</TableCell>
                <TableCell>{formatDate(loan.application_date)}</TableCell>
                <TableCell>{formatDate(loan.disbursement_date)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(loan)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{calculateProgress(loan)}%</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(loan.due_date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LoanHistoryTable;
