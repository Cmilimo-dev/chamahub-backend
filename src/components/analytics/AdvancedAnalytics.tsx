
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, TrendingUp, Users, Target, Download } from 'lucide-react';
import ReportBuilder from './ReportBuilder';
import PerformanceMetrics from './PerformanceMetrics';
import DataVisualization from './DataVisualization';

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights and performance analytics for your group
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Groups</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4">
                  <Badge variant="secondary">+2 this month</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Savings</p>
                    <p className="text-2xl font-bold">KES 8.2M</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800">+15.3%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Loans</p>
                    <p className="text-2xl font-bold">45</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline">94% approval rate</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className="text-2xl font-bold">12.5%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-4">
                  <Badge className="bg-blue-100 text-blue-800">Above target</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Contributions</p>
                    <p className="text-sm text-gray-600">All groups combined</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">KES 1,245,000</p>
                    <Badge className="bg-green-100 text-green-800">+8.2%</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">New Loan Applications</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">23</p>
                    <Badge variant="outline">18 approved</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Member Growth</p>
                    <p className="text-sm text-gray-600">New members added</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">34</p>
                    <Badge className="bg-blue-100 text-blue-800">+12%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="visualization">
          <DataVisualization />
        </TabsContent>

        <TabsContent value="reports">
          <ReportBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
