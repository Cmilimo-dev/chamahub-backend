
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, TrendingUp, Users, PiggyBank } from "lucide-react";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroups";
import { useRealtimeContributions } from "@/hooks/useRealtimeContributions";

interface ReportsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ReportsModal = ({ open, onOpenChange }: ReportsModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [reportType, setReportType] = useState("summary");
  
  const { groups } = useRealtimeGroups();
  const { transactions } = useRealtimeContributions();

  // Use controlled or internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const generateReport = () => {
    // In a real implementation, this would generate and download a PDF/Excel report
    console.log('Generating report for:', { selectedGroup, reportType });
  };

  const getSummaryStats = () => {
    const totalSavings = groups.reduce((sum, group) => sum + group.totalSavings, 0);
    const totalContributions = transactions.filter(t => t.type === 'contribution').length;
    const totalLoans = transactions.filter(t => t.type === 'loan').length;
    
    return { totalSavings, totalContributions, totalLoans };
  };

  const stats = getSummaryStats();

  const DialogWrapper = ({ children }: { children: React.ReactNode }) => {
    if (open !== undefined) {
      // Controlled mode - no trigger
      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-2xl">
            {children}
          </DialogContent>
        </Dialog>
      );
    }

    // Trigger mode - includes trigger button
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          {children}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DialogWrapper>
      <DialogHeader>
        <DialogTitle>Financial Reports</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Report Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Group</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="contributions">Contributions</SelectItem>
                <SelectItem value="loans">Loans</SelectItem>
                <SelectItem value="members">Members</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <PiggyBank className="h-4 w-4 mr-1" />
                Total Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                KES {stats.totalSavings.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalContributions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Active Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                {groups.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <p className="text-sm text-gray-600">{transaction.group}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}KES {Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={generateReport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default ReportsModal;
