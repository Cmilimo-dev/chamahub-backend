
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  Mail,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportGeneratorProps {
  groupId: string;
  groupName: string;
}

const ReportGenerator = ({ groupId, groupName }: ReportGeneratorProps) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [format, setFormat] = useState<string>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'financial_summary', label: 'Financial Summary', description: 'Complete financial overview' },
    { value: 'contribution_report', label: 'Contribution Report', description: 'Member contribution details' },
    { value: 'loan_analysis', label: 'Loan Analysis', description: 'Loan performance and analytics' },
    { value: 'member_performance', label: 'Member Performance', description: 'Individual member analysis' },
    { value: 'audit_trail', label: 'Audit Trail', description: 'Complete transaction history' }
  ];

  const dateRanges = [
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'year_to_date', label: 'Year to Date' },
    { value: 'all_time', label: 'All Time' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];

  const handleGenerateReport = async () => {
    if (!reportType || !dateRange) {
      toast({
        title: "Missing Information",
        description: "Please select both report type and date range",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: `${reportTypes.find(t => t.value === reportType)?.label} has been generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleReport = () => {
    toast({
      title: "Report Scheduled",
      description: "Report has been scheduled for regular generation",
    });
  };

  const handleShareReport = () => {
    toast({
      title: "Share Options",
      description: "Report sharing options will be available soon",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Reports for {groupName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating || !reportType || !dateRange}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleScheduleReport}
              className="flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>

            <Button 
              variant="outline" 
              onClick={handleShareReport}
              className="flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.slice(0, 3).map((type) => (
              <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <Badge variant="outline">Quick</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{type.label}</h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Generate Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Financial Summary - December 2024', 'Contribution Report - Q4 2024', 'Member Performance - November 2024'].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="font-medium">{report}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">PDF</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
