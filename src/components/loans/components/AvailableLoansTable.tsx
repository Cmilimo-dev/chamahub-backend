
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Eye, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LoanApplication {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  application_date: string;
  duration_months: number;
  interest_rate: number;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
  chama_groups: {
    name: string;
  };
}

interface AvailableLoansTableProps {
  applications: LoanApplication[];
  processingLoan: string | null;
  onLoanDecision: (loanId: string, decision: 'approved' | 'rejected') => void;
}

const AvailableLoansTable = ({ applications, processingLoan, onLoanDecision }: AvailableLoansTableProps) => {
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
              <TableHead>Applicant</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {application.profiles.first_name} {application.profiles.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{application.profiles.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {application.chama_groups.name}
                </TableCell>
                <TableCell>{formatCurrency(application.amount)}</TableCell>
                <TableCell className="max-w-32 truncate">{application.purpose}</TableCell>
                <TableCell>{formatDate(application.application_date)}</TableCell>
                <TableCell>{application.duration_months} months</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Loan Application Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Applicant</label>
                              <p className="font-medium">
                                {application.profiles.first_name} {application.profiles.last_name}
                              </p>
                              <p className="text-sm text-gray-500">{application.profiles.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Amount Requested</label>
                              <p className="font-medium">{formatCurrency(application.amount)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Interest Rate</label>
                              <p className="font-medium">{application.interest_rate}%</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Duration</label>
                              <p className="font-medium">{application.duration_months} months</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Applied On</label>
                              <p className="font-medium">{formatDate(application.application_date)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Group</label>
                              <p className="font-medium">{application.chama_groups.name}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Purpose</label>
                            <p className="mt-1">{application.purpose}</p>
                          </div>
                          <div className="flex space-x-3 pt-4">
                            <Button 
                              onClick={() => onLoanDecision(application.id, 'approved')}
                              disabled={processingLoan === application.id}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {processingLoan === application.id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => onLoanDecision(application.id, 'rejected')}
                              disabled={processingLoan === application.id}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {processingLoan === application.id ? 'Processing...' : 'Reject'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      onClick={() => onLoanDecision(application.id, 'approved')}
                      disabled={processingLoan === application.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onLoanDecision(application.id, 'rejected')}
                      disabled={processingLoan === application.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AvailableLoansTable;
