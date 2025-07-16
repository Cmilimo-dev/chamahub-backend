
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  application_date: string;
  approval_date: string | null;
  duration_months: number;
  interest_rate: number;
  chama_groups: {
    name: string;
  };
}

interface MyLoansTableProps {
  loans: Loan[];
}

const MyLoansTable = ({ loans }: MyLoansTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Disbursed</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">
                  {loan.chama_groups.name}
                </TableCell>
                <TableCell>{formatCurrency(loan.amount)}</TableCell>
                <TableCell className="max-w-32 truncate">{loan.purpose}</TableCell>
                <TableCell>{getStatusBadge(loan.status)}</TableCell>
                <TableCell>{formatDate(loan.application_date)}</TableCell>
                <TableCell>{loan.duration_months} months</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Loan Application Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Group</label>
                            <p className="font-medium">{loan.chama_groups.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Amount</label>
                            <p className="font-medium">{formatCurrency(loan.amount)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Interest Rate</label>
                            <p className="font-medium">{loan.interest_rate}%</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Duration</label>
                            <p className="font-medium">{loan.duration_months} months</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <div className="mt-1">{getStatusBadge(loan.status)}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Applied On</label>
                            <p className="font-medium">{formatDate(loan.application_date)}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Purpose</label>
                          <p className="mt-1">{loan.purpose}</p>
                        </div>
                        {loan.approval_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              {loan.status === 'approved' ? 'Approved On' : 'Decision Made On'}
                            </label>
                            <p className="font-medium">{formatDate(loan.approval_date)}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MyLoansTable;
