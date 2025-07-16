
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PiggyBank, Users, Clock } from "lucide-react";

interface Group {
  id: string;
  name: string;
  members: number;
  totalSavings: number;
  nextContribution: string;
  contributionAmount: number;
  role: string;
}

interface SavingsOverviewProps {
  groups: Group[];
}

const SavingsOverview = ({ groups }: SavingsOverviewProps) => {
  const totalSavings = groups.reduce((sum, group) => sum + group.totalSavings, 0);
  const totalMembers = groups.reduce((sum, group) => sum + group.members, 0);
  const nextContribution = Math.min(...groups.map(g => g.contributionAmount));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          <PiggyBank className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSavings)}</div>
          <p className="text-xs text-green-100">
            +12% from last month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
          <Users className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{groups.length}</div>
          <p className="text-xs text-blue-100">
            {totalMembers} total members
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Contribution</CardTitle>
          <Clock className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(nextContribution)}</div>
          <p className="text-xs text-purple-100">
            Due in 5 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsOverview;
