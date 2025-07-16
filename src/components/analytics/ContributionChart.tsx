
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ContributionTrend {
  month: string;
  amount: number;
  memberCount: number;
}

interface ContributionChartProps {
  data: ContributionTrend[];
  title: string;
  detailed?: boolean;
}

const ContributionChart = ({ data, title, detailed = false }: ContributionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No contribution data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'amount') {
      return [`KES ${value.toLocaleString()}`, 'Total Amount'];
    }
    return [value, 'Active Members'];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {detailed ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="amount"
                  orientation="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  yAxisId="members"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar 
                  yAxisId="amount"
                  dataKey="amount" 
                  fill="#22c55e" 
                  name="Contributions"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="members"
                  type="monotone" 
                  dataKey="memberCount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Active Members"
                />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip formatter={formatTooltip} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#16a34a' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionChart;
