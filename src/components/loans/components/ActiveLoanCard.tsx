
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

interface ActiveLoan {
  id: string;
  amount: number;
  purpose: string;
  disbursement_date: string;
  due_date: string;
  duration_months: number;
  interest_rate: number;
  amount_repaid: number;
  chama_groups: {
    name: string;
  };
}

interface Repayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
}

interface ActiveLoanCardProps {
  loan: ActiveLoan;
  repayments: Repayment[];
}

const ActiveLoanCard = ({ loan, repayments }: ActiveLoanCardProps) => {
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

  const calculateRemainingBalance = () => {
    const totalWithInterest = loan.amount * (1 + loan.interest_rate / 100);
    return totalWithInterest - loan.amount_repaid;
  };

  const calculateProgress = () => {
    const totalWithInterest = loan.amount * (1 + loan.interest_rate / 100);
    if (loan.amount_repaid <= 0) return 0;
    return Math.round((loan.amount_repaid / totalWithInterest) * 100);
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const due = new Date(loan.due_date);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = () => {
    const daysUntilDue = getDaysUntilDue();
    
    if (daysUntilDue < 0) {
      return { status: 'overdue', color: 'text-red-600 border-red-600', text: `${Math.abs(daysUntilDue)} days overdue` };
    } else if (daysUntilDue <= 7) {
      return { status: 'due-soon', color: 'text-orange-600 border-orange-600', text: `Due in ${daysUntilDue} days` };
    } else {
      return { status: 'on-track', color: 'text-green-600 border-green-600', text: `Due in ${daysUntilDue} days` };
    }
  };

  const dueDateInfo = getDueDateStatus();
  const remainingBalance = calculateRemainingBalance();
  const progress = calculateProgress();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{loan.chama_groups.name}</CardTitle>
          <Badge variant="outline" className={dueDateInfo.color}>
            <Clock className="h-3 w-3 mr-1" />
            {dueDateInfo.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loan Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Original Amount</label>
            <p className="font-semibold">{formatCurrency(loan.amount)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Amount Paid</label>
            <p className="font-semibold text-green-600">{formatCurrency(loan.amount_repaid)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Remaining Balance</label>
            <p className="font-semibold text-red-600">{formatCurrency(remainingBalance)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Interest Rate</label>
            <p className="font-semibold">{loan.interest_rate}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Repayment Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Repayment History */}
        {repayments.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Recent Payments ({repayments.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {repayments.slice(0, 3).map((repayment) => (
                <div key={repayment.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                  <span>{formatDate(repayment.payment_date)}</span>
                  <span className="font-medium">{formatCurrency(repayment.amount)}</span>
                  <span className="text-gray-500 capitalize">{repayment.payment_method}</span>
                </div>
              ))}
              {repayments.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{repayments.length - 3} more payments
                </p>
              )}
            </div>
          </div>
        )}

        {/* Due Date Info */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <label className="text-sm font-medium text-gray-500">Due Date</label>
            <p className="font-medium">{formatDate(loan.due_date)}</p>
          </div>
          <Button size="sm" disabled>
            Make Payment
            <span className="text-xs ml-2">(Coming Soon)</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveLoanCard;
