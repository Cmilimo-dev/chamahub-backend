
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface MemberPerformance {
  memberId: string;
  memberName: string;
  totalContributions: number;
  consistencyScore: number;
  loanHistory: number;
  repaymentScore: number;
  engagementLevel: 'high' | 'medium' | 'low';
}

export const useMemberPerformance = (groupId?: string) => {
  const { user } = useAuth();
  const [memberPerformance, setMemberPerformance] = useState<MemberPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberPerformance = async () => {
    if (!user || !groupId) return;

    try {
      const { data, error } = // TODO: Implement backend API call

      if (error) throw error;

      const performance: MemberPerformance[] = data?.map(member => {
        const completedContributions = member.contributions?.filter(c => c.status === 'completed') || [];
        const totalContributions = completedContributions.reduce((sum, c) => sum + Number(c.amount), 0);
        
        // Calculate consistency score based on regular contributions
        const monthsActive = Math.max(1, Math.ceil(
          (Date.now() - new Date(completedContributions[0]?.contribution_date || Date.now()).getTime()) 
          / (30 * 24 * 60 * 60 * 1000)
        ));
        const consistencyScore = Math.min(100, (completedContributions.length / monthsActive) * 100);
        
        const loanHistory = member.loans?.length || 0;
        const completedLoans = member.loans?.filter(l => l.status === 'completed') || [];
        const repaymentScore = completedLoans.length > 0 ? 
          (completedLoans.filter(l => Number(l.amount_repaid) >= Number(l.amount)).length / completedLoans.length) * 100 : 100;

        let engagementLevel: 'high' | 'medium' | 'low' = 'low';
        if (consistencyScore > 80 && totalContributions > 10000) engagementLevel = 'high';
        else if (consistencyScore > 50 && totalContributions > 5000) engagementLevel = 'medium';

        // Fix the type issue by properly accessing the profiles data
        const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
        const firstName = profile?.first_name || '';
        const lastName = profile?.last_name || '';

        return {
          memberId: member.user_id,
          memberName: `${firstName} ${lastName}`.trim() || 'Unknown Member',
          totalContributions,
          consistencyScore: Math.round(consistencyScore),
          loanHistory,
          repaymentScore: Math.round(repaymentScore),
          engagementLevel
        };
      }) || [];

      setMemberPerformance(performance.sort((a, b) => b.totalContributions - a.totalContributions));
    } catch (err: any) {
      console.error('Error fetching member performance:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadPerformance = async () => {
      setLoading(true);
      await fetchMemberPerformance();
      setLoading(false);
    };

    if (user && groupId) {
      loadPerformance();
    }
  }, [user, groupId]);

  return {
    memberPerformance,
    loading,
    error,
    refetch: fetchMemberPerformance
  };
};
