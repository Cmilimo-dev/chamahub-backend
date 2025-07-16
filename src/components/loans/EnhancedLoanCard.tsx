
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, User, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface EnhancedLoan {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  application_date: string;
  approval_date: string | null;
  duration_months: number;
  interest_rate: number;
  monthly_payment_amount: number;
  next_payment_date: string | null;
  payments_made: number;
  is_overdue: boolean;
  days_overdue: number;
  loan_officer_id: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  chama_groups: {
    name: string;
  };
  loan_officer?: {
    first_name: string;
    last_name: string;
  };
}

interface EnhancedLoanCardProps {
  loan: EnhancedLoan;
  onStatusUpdate?: (loanId: string, status: string) => void;
  onViewDetails?: (loanId: string) => void;
  showActions?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'under_review': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'disbursed': return 'bg-purple-100 text-purple-800';
    case 'active': return 'bg-indigo-100 text-indigo-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'defaulted': return 'bg-red-200 text-red-900';
    case 'cancelled': return 'bg-gray-200 text-gray-700';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const EnhancedLoanCard = ({ loan, onStatusUpdate, onViewDetails, showActions = true }: EnhancedLoanCardProps) => {
  const repaymentProgress = loan.duration_months > 0 ? (loan.payments_made / loan.duration_months) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            KES {loan.amount.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(loan.status)}>
              {loan.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {loan.is_overdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {loan.days_overdue} days overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Applied: {format(new Date(loan.application_date), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>{loan.interest_rate}% interest</span>
          </div>
          
          {loan.loan_officer && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{loan.loan_officer.first_name} {loan.loan_officer.last_name}</span>
            </div>
          )}
          
          {loan.next_payment_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Next: {format(new Date(loan.next_payment_date), 'MMM dd')}</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Purpose: {loan.purpose}</p>
          <p className="text-sm text-gray-500">Group: {loan.chama_groups.name}</p>
        </div>

        {(loan.status === 'active' || loan.status === 'completed') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Repayment Progress</span>
              <span>{loan.payments_made}/{loan.duration_months} payments</span>
            </div>
            <Progress value={repaymentProgress} className="h-2" />
            {loan.monthly_payment_amount > 0 && (
              <p className="text-sm text-gray-600">
                Monthly Payment: KES {loan.monthly_payment_amount.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {loan.review_notes && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Review Notes:</p>
            <p className="text-sm text-blue-700">{loan.review_notes}</p>
          </div>
        )}

        {loan.rejection_reason && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
            <p className="text-sm text-red-700">{loan.rejection_reason}</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(loan.id)}
              className="flex-1"
            >
              View Details
            </Button>
            
            {loan.status === 'pending' && onStatusUpdate && (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(loan.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onStatusUpdate(loan.id, 'rejected')}
                >
                  Reject
                </Button>
              </>
            )}
            
            {loan.status === 'approved' && onStatusUpdate && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(loan.id, 'disbursed')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Disburse
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedLoanCard;
