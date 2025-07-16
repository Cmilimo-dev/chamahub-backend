
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, History } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import LoanHistoryTable from "./components/LoanHistoryTable";

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

const LoanHistory = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<HistoricalLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoanHistory = async () => {
      if (!user) return;

      try {
        const response = await apiClient.get(`/loans/user/${user.id}`);
        const data = response.data;

        // Transform the data to match our interface
        const transformedData = data?.map((loan: any) => ({
          ...loan,
          chama_groups: {
            name: loan.group_name || 'Unknown Group'
          }
        })) || [];

        setLoans(transformedData);
      } catch (error: any) {
        console.error('Error fetching loan history:', error);
        setError(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanHistory();
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
          Error loading loan history: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Loan History</h3>
        <Badge variant="secondary">{loans.length} Historical Loans</Badge>
      </div>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loan history</h3>
            <p className="text-gray-500">Your completed and processed loans will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <LoanHistoryTable loans={loans} />
      )}
    </div>
  );
};

export default LoanHistory;
