
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Users, DollarSign, Calendar } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  target?: number;
  progress?: number;
  icon: React.ReactNode;
  description?: string;
}

const MetricCard = ({ title, value, change, changeType, target, progress, icon, description }: MetricCardProps) => {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {target && progress !== undefined && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to Target</span>
              <span className="font-medium">{progress}% of {target}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PerformanceMetrics = () => {
  // Mock data - replace with real data from your API
  const metrics = [
    {
      title: 'Total Contributions',
      value: 'KES 2,450,000',
      change: 12.5,
      changeType: 'positive' as const,
      target: 3000000,
      progress: 81.7,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: 'This month'
    },
    {
      title: 'Active Members',
      value: '124',
      change: 8.2,
      changeType: 'positive' as const,
      target: 150,
      progress: 82.7,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      description: 'Currently active'
    },
    {
      title: 'Loan Approval Rate',
      value: '94.2%',
      change: -2.1,
      changeType: 'negative' as const,
      icon: <Target className="h-5 w-5 text-purple-600" />,
      description: 'Last 30 days'
    },
    {
      title: 'Average Response Time',
      value: '2.4 days',
      change: -15.3,
      changeType: 'positive' as const,
      icon: <Calendar className="h-5 w-5 text-orange-600" />,
      description: 'Loan processing'
    }
  ];

  const kpiData = [
    {
      category: 'Financial Health',
      metrics: [
        { name: 'Savings Growth Rate', value: '15.2%', status: 'excellent' },
        { name: 'Loan Default Rate', value: '2.8%', status: 'good' },
        { name: 'ROI on Investments', value: '8.5%', status: 'good' }
      ]
    },
    {
      category: 'Member Engagement',
      metrics: [
        { name: 'Active Participation', value: '87.3%', status: 'excellent' },
        { name: 'Meeting Attendance', value: '76.5%', status: 'good' },
        { name: 'On-time Contributions', value: '91.2%', status: 'excellent' }
      ]
    },
    {
      category: 'Operational Efficiency',
      metrics: [
        { name: 'Processing Speed', value: '2.1 days', status: 'good' },
        { name: 'Error Rate', value: '0.4%', status: 'excellent' },
        { name: 'System Uptime', value: '99.8%', status: 'excellent' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* KPI Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpiData.map((category, index) => (
              <div key={index}>
                <h3 className="font-semibold text-lg mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{metric.name}</p>
                        <p className="text-lg font-bold">{metric.value}</p>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  High member engagement and participation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Consistent contribution growth
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Low default rates on loans
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Efficient processing times
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Meeting attendance could be higher
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Loan approval rate slightly declining
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Need more diverse investment options
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;
