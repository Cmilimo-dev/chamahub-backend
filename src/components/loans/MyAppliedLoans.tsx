
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import MyLoansTable from "./components/MyLoansTable";

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

const MyAppliedLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyLoans = async () => {
      console.log('fetchMyLoans called, user:', user);
      if (!user) {
        console.log('No user found, skipping loan fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching loans for user ID:', user.id);
        // Fetch loans from API
        const data = await apiClient.get(`/loans/user/${user.id}`);
        console.log('Raw API response:', data);
        
        // Transform the data to match our interface
        const transformedData = data?.map((loan: any) => ({
          ...loan,
          chama_groups: {
            name: loan.group_name || 'Unknown Group'
          }
        })) || [];

        console.log('Transformed data:', transformedData);
        setLoans(transformedData);
      } catch (error: any) {
        console.error('Error fetching loans:', error);
        setError(error.message || 'Failed to fetch loan applications');
      } finally {
        setLoading(false);
      }
    };

    fetchMyLoans();
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
          Error loading your loan applications: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Loan Applications</h3>
        <Badge variant="secondary">{loans.length} Total Applications</Badge>
      </div>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loan applications yet</h3>
            <p className="text-gray-500">When you apply for loans, they will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <MyLoansTable loans={loans} />
      )}
    </div>
  );
};

export default MyAppliedLoans;
