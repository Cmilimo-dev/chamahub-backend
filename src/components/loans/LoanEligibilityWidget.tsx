
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle, XCircle, RefreshCw, Percent, Info } from "lucide-react";
import { useLoanEligibility } from "@/hooks/useLoanEligibility";

interface LoanEligibilityWidgetProps {
  groupId: string;
  groupName: string;
  loanInterestRate?: number;
  maxLoanMultiplier?: number;
}

const LoanEligibilityWidget = ({ groupId, groupName, loanInterestRate = 5.0, maxLoanMultiplier = 3.0 }: LoanEligibilityWidgetProps) => {
  const { eligibility, loading, error, refetch } = useLoanEligibility(groupId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Checking eligibility...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-3">Error checking eligibility</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!eligibility) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5" />
          Loan Eligibility - {groupName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={eligibility.isEligible ? "default" : "destructive"} className="flex items-center gap-1">
              {eligibility.isEligible ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Eligible
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Not Eligible
                </>
              )}
            </Badge>
          </div>

          {eligibility.isEligible && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Maximum Loan:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(eligibility.maxLoanAmount)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Interest Rate</p>
                    <p className="font-semibold text-blue-600">{loanInterestRate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Max Multiplier</p>
                    <p className="font-semibold text-blue-600">{maxLoanMultiplier}x</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-sm font-medium">Details:</span>
            <ul className="space-y-1">
              {eligibility.eligibilityReasons.map((reason, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Eligibility
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanEligibilityWidget;
