
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Save, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportBuilderProps {
  groupId?: string;
}

const ReportBuilder = ({ groupId }: ReportBuilderProps) => {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    type: 'contributions',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    },
    groupBy: 'month',
    metrics: ['total_amount', 'transaction_count'],
    filters: {},
    format: 'pdf'
  });

  const reportTypes = [
    { value: 'contributions', label: 'Contributions Report' },
    { value: 'loans', label: 'Loans Report' },
    { value: 'members', label: 'Member Performance' },
    { value: 'financial', label: 'Financial Summary' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const metrics = [
    { id: 'total_amount', label: 'Total Amount', description: 'Sum of all transactions' },
    { id: 'transaction_count', label: 'Transaction Count', description: 'Number of transactions' },
    { id: 'average_amount', label: 'Average Amount', description: 'Average transaction amount' },
    { id: 'member_count', label: 'Active Members', description: 'Number of active members' },
    { id: 'growth_rate', label: 'Growth Rate', description: 'Period over period growth' }
  ];

  const handleMetricToggle = (metricId: string) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const generateReport = async () => {
    // TODO: Implement report generation logic
    console.log('Generating report with config:', reportConfig);
  };

  const saveTemplate = async () => {
    // TODO: Implement template saving logic
    console.log('Saving report template:', reportConfig);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportConfig.name}
                onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter report name"
              />
            </div>
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                value={reportConfig.type}
                onValueChange={(value) => setReportConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !reportConfig.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportConfig.dateRange.from ? format(reportConfig.dateRange.from, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportConfig.dateRange.from}
                    onSelect={(date) => date && setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: date }
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !reportConfig.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportConfig.dateRange.to ? format(reportConfig.dateRange.to, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportConfig.dateRange.to}
                    onSelect={(date) => date && setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: date }
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Group By */}
          <div>
            <Label htmlFor="group-by">Group By</Label>
            <Select
              value={reportConfig.groupBy}
              onValueChange={(value) => setReportConfig(prev => ({ ...prev, groupBy: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metrics Selection */}
          <div>
            <Label>Metrics to Include</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {metrics.map(metric => (
                <div key={metric.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={reportConfig.metrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={metric.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {metric.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Metrics Display */}
          {reportConfig.metrics.length > 0 && (
            <div>
              <Label>Selected Metrics</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {reportConfig.metrics.map(metricId => {
                  const metric = metrics.find(m => m.id === metricId);
                  return (
                    <Badge key={metricId} variant="secondary">
                      {metric?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Output Format */}
          <div>
            <Label htmlFor="format">Output Format</Label>
            <Select
              value={reportConfig.format}
              onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={generateReport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={saveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBuilder;
