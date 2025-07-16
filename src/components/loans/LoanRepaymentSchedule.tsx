
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface LoanRepaymentSchedule {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  amount_paid: number;
  payment_date: string | null;
  status: string;
  is_overdue: boolean;
  days_overdue: number;
}

interface LoanRepaymentScheduleProps {
  loanId: string;
  schedule: LoanRepaymentSchedule[];
  onRecordPayment: (scheduleId: string, amount: number, paymentDate: string) => Promise<boolean>;
  canRecordPayments?: boolean;
}

const LoanRepaymentSchedule = ({ 
  loanId, 
  schedule, 
  onRecordPayment, 
  canRecordPayments = false 
}: LoanRepaymentScheduleProps) => {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<LoanRepaymentSchedule | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordPayment = async () => {
    if (!selectedPayment || !paymentAmount) return;

    setIsRecording(true);
    
    try {
      const success = await onRecordPayment(
        selectedPayment.id,
        parseFloat(paymentAmount),
        paymentDate
      );

      if (success) {
        toast({
          title: "Payment Recorded",
          description: "The repayment has been successfully recorded.",
        });
        setSelectedPayment(null);
        setPaymentAmount('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const getStatusBadge = (item: LoanRepaymentSchedule) => {
    if (item.amount_paid >= item.total_amount) {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    }
    if (item.amount_paid > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
    }
    if (item.is_overdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const totalScheduled = schedule.reduce((sum, item) => sum + item.total_amount, 0);
  const totalPaid = schedule.reduce((sum, item) => sum + item.amount_paid, 0);
  const completedPayments = schedule.filter(item => item.amount_paid >= item.total_amount).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Repayment Schedule</span>
          <div className="text-sm font-normal text-gray-600">
            {completedPayments}/{schedule.length} payments completed
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-semibold">KES {totalScheduled.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount Paid</p>
            <p className="text-lg font-semibold text-green-600">KES {totalPaid.toLocaleString()}</p>
          </div>
        </div>

        {/* Schedule Items */}
        <div className="space-y-3">
          {schedule.map((item) => (
            <div 
              key={item.id} 
              className={`p-4 border rounded-lg ${item.is_overdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Payment #{item.installment_number}</span>
                  {getStatusBadge(item)}
                  {item.is_overdue && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {item.days_overdue} days overdue
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">KES {item.total_amount.toLocaleString()}</p>
                  {item.amount_paid > 0 && (
                    <p className="text-sm text-green-600">
                      Paid: KES {item.amount_paid.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {format(new Date(item.due_date), 'MMM dd, yyyy')}</span>
                </div>
                {item.payment_date && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Paid: {format(new Date(item.payment_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>Principal: KES {item.principal_amount.toLocaleString()}</div>
                <div>Interest: KES {item.interest_amount.toLocaleString()}</div>
              </div>

              {canRecordPayments && item.amount_paid < item.total_amount && (
                <div className="mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedPayment(item);
                          setPaymentAmount(item.total_amount.toString());
                        }}
                      >
                        Record Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Record Payment for Installment #{item.installment_number}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="amount">Payment Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="Enter payment amount"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Due amount: KES {item.total_amount.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="date">Payment Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleRecordPayment}
                            disabled={isRecording || !paymentAmount}
                            className="flex-1"
                          >
                            {isRecording ? 'Recording...' : 'Record Payment'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanRepaymentSchedule;
