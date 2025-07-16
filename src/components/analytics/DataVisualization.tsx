
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const DataVisualization = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedChart, setSelectedChart] = useState('contributions');

  // Mock data - replace with real data from your API
  const contributionsData = [
    { month: 'Jan', contributions: 450000, loans: 120000, members: 98 },
    { month: 'Feb', contributions: 520000, loans: 180000, members: 102 },
    { month: 'Mar', contributions: 480000, loans: 150000, members: 105 },
    { month: 'Apr', contributions: 600000, loans: 200000, members: 108 },
    { month: 'May', contributions: 580000, loans: 170000, members: 115 },
    { month: 'Jun', contributions: 650000, loans: 220000, members: 124 }
  ];

  const loanStatusData = [
    { name: 'Approved', value: 65, color: '#10B981' },
    { name: 'Pending', value: 25, color: '#F59E0B' },
    { name: 'Rejected', value: 10, color: '#EF4444' }
  ];

  const memberPerformanceData = [
    { name: 'Excellent', count: 45, percentage: 36 },
    { name: 'Good', count: 52, percentage: 42 },
    { name: 'Average', count: 20, percentage: 16 },
    { name: 'Poor', count: 7, percentage: 6 }
  ];

  const cashFlowData = [
    { month: 'Jan', income: 450000, expenses: 120000, net: 330000 },
    { month: 'Feb', income: 520000, expenses: 180000, net: 340000 },
    { month: 'Mar', income: 480000, expenses: 150000, net: 330000 },
    { month: 'Apr', income: 600000, expenses: 200000, net: 400000 },
    { month: 'May', income: 580000, expenses: 170000, net: 410000 },
    { month: 'Jun', income: 650000, expenses: 220000, net: 430000 }
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'contributions':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contributionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
              <Bar dataKey="contributions" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'loans':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={contributionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Loans']} />
              <Line type="monotone" dataKey="loans" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'members':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={contributionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="members" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'cashflow':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, '']} />
              <Bar dataKey="income" fill="#10B981" />
              <Bar dataKey="expenses" fill="#EF4444" />
              <Bar dataKey="net" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Data Visualization
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedChart} onValueChange={setSelectedChart}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contributions">Contributions</SelectItem>
                  <SelectItem value="loans">Loans</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="cashflow">Cash Flow</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3M</SelectItem>
                  <SelectItem value="6months">6M</SelectItem>
                  <SelectItem value="1year">1Y</SelectItem>
                  <SelectItem value="2years">2Y</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {loanStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Member Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Member Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberPerformanceData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.count} members</span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Positive Trend</h4>
              <p className="text-sm text-green-700">
                Contributions have increased by 44% over the last 6 months, showing strong member engagement.
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Growth Opportunity</h4>
              <p className="text-sm text-blue-700">
                Member count is growing steadily at 26% annually. Consider expanding loan products.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Watch Point</h4>
              <p className="text-sm text-yellow-700">
                Loan rejection rate is at 10%. Review eligibility criteria to optimize approval process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;
