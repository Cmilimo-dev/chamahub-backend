
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CreditCard, 
  Target,
  Calendar,
  Download
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRealtimeGroups } from '@/hooks/useRealtimeGroups';
import OverviewMetrics from './OverviewMetrics';
import ContributionChart from './ContributionChart';
import LoanAnalytics from './LoanAnalytics';
import MemberPerformanceTable from './MemberPerformanceTable';
import ReportGenerator from './ReportGenerator';

const AnalyticsDashboard = () => {
  const { groups } = useRealtimeGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const { 
    groupAnalytics, 
    contributionTrends, 
    loanMetrics, 
    memberPerformance, 
    loading, 
    error 
  } = useAnalytics(selectedGroupId);

  const currentGroupAnalytics = groupAnalytics.find(g => g.groupId === selectedGroupId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your group performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a group to analyze" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading analytics: {error}</p>
          </CardContent>
        </Card>
      )}

      {!selectedGroupId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Group</h3>
            <p className="text-gray-500">Choose a group from the dropdown above to view detailed analytics</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Contributions
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Loans
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewMetrics analytics={currentGroupAnalytics} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContributionChart 
                data={contributionTrends} 
                title="Contribution Trends (Last 12 Months)" 
              />
              <LoanAnalytics metrics={loanMetrics} />
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-6">
            <ContributionChart 
              data={contributionTrends} 
              title="Detailed Contribution Analysis"
              detailed={true}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    KES {currentGroupAnalytics?.totalSavings.toLocaleString() || '0'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average per Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    KES {Math.round(currentGroupAnalytics?.averageContribution || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Monthly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    +{currentGroupAnalytics?.monthlyGrowth || 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-6">
            <LoanAnalytics metrics={loanMetrics} detailed={true} />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MemberPerformanceTable members={memberPerformance} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportGenerator 
              groupId={selectedGroupId}
              groupName={groups.find(g => g.id === selectedGroupId)?.name || ''}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
