
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Award, Users } from 'lucide-react';

interface MemberPerformance {
  memberId: string;
  memberName: string;
  totalContributions: number;
  consistencyScore: number;
  loanHistory: number;
  repaymentScore: number;
  engagementLevel: 'high' | 'medium' | 'low';
}

interface MemberPerformanceTableProps {
  members: MemberPerformance[];
}

const MemberPerformanceTable = ({ members }: MemberPerformanceTableProps) => {
  if (!members || members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Member Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-gray-500">
            No member performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Member Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Total Contributions</TableHead>
                <TableHead>Consistency Score</TableHead>
                <TableHead>Loan History</TableHead>
                <TableHead>Repayment Score</TableHead>
                <TableHead>Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.memberId}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.memberName || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.memberName || 'Unknown Member'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-green-600">
                      KES {member.totalContributions.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-semibold ${getScoreColor(member.consistencyScore)}`}>
                      {member.consistencyScore}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                      {member.loanHistory}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-semibold ${getScoreColor(member.repaymentScore)}`}>
                      {member.repaymentScore}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`capitalize ${getEngagementColor(member.engagementLevel)}`}
                      variant="secondary"
                    >
                      {member.engagementLevel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {members.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Contributor</p>
                    <p className="text-lg font-bold">
                      {members[0]?.memberName || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Consistency</p>
                    <p className="text-lg font-bold">
                      {Math.round(members.reduce((sum, m) => sum + m.consistencyScore, 0) / members.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-lg font-bold">
                      {members.filter(m => m.engagementLevel !== 'low').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberPerformanceTable;
