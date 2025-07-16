
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import ActiveLoanCard from "./components/ActiveLoanCard";

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

const LoanRepaymentTracker = () => {
  const { user } = useAuth();
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [repayments, setRepayments] = useState<{ [key: string]: Repayment[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveLoansAndRepayments = async () => {
      if (!user) return;

      try {
        // Fetch active (disbursed) loans
        const response = await apiClient.get(`/loans/user/${user.id}`);
        const loans = response.data;

        // Transform the data to match our interface
        const transformedLoans = loans?.map((loan: any) => ({
          ...loan,
          chama_groups: {
            name: loan.group_name || 'Unknown Group'
          }
        }))?.filter((loan: any) => loan.status === 'disbursed') || [];

        setActiveLoans(transformedLoans);

        // For now, set empty repayments since we don't have this endpoint yet
        // TODO: Implement loan repayments endpoint
        setRepayments({});
      } catch (error: any) {
        console.error('Error fetching active loans and repayments:', error);
        setError(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLoansAndRepayments();
  }, [user]);

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
          Error loading repayment data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Active Loan Repayments</h3>
        <Badge variant="secondary">{activeLoans.length} Active Loans</Badge>
      </div>

      {activeLoans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active loans</h3>
            <p className="text-gray-500">When you have active loans to repay, they will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {activeLoans.map((loan) => (
            <ActiveLoanCard 
              key={loan.id} 
              loan={loan} 
              repayments={repayments[loan.id] || []} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanRepaymentTracker;
