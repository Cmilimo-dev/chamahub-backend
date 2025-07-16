
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Calendar 
} from 'lucide-react';

interface GroupAnalytics {
  groupId: string;
  groupName: string;
  totalMembers: number;
  totalSavings: number;
  monthlyGrowth: number;
  averageContribution: number;
  activeLoans: number;
  totalLoansValue: number;
  repaymentRate: number;
  meetingAttendance: number;
}

interface OverviewMetricsProps {
  analytics?: GroupAnalytics;
}

const OverviewMetrics = ({ analytics }: OverviewMetricsProps) => {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Members',
      value: analytics.totalMembers.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2 this month',
      changeType: 'positive' as const
    },
    {
      title: 'Total Savings',
      value: `KES ${analytics.totalSavings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `+${analytics.monthlyGrowth}% this month`,
      changeType: analytics.monthlyGrowth >= 0 ? 'positive' as const : 'negative' as const
    },
    {
      title: 'Active Loans',
      value: analytics.activeLoans.toString(),
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: `KES ${analytics.totalLoansValue.toLocaleString()} value`,
      changeType: 'neutral' as const
    },
    {
      title: 'Average Contribution',
      value: `KES ${Math.round(analytics.averageContribution).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: 'per member',
      changeType: 'neutral' as const
    },
    {
      title: 'Repayment Rate',
      value: `${Math.round(analytics.repaymentRate)}%`,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      change: 'on-time payments',
      changeType: analytics.repaymentRate >= 80 ? 'positive' as const : 'negative' as const
    },
    {
      title: 'Meeting Attendance',
      value: `${Math.round(analytics.meetingAttendance)}%`,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: 'average attendance',
      changeType: analytics.meetingAttendance >= 70 ? 'positive' as const : 'negative' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                {metric.value}
              </div>
              <div className="flex items-center">
                <Badge 
                  variant={
                    metric.changeType === 'positive' ? 'default' : 
                    metric.changeType === 'negative' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewMetrics;
