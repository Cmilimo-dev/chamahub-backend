
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ContributionTrend {
  month: string;
  amount: number;
  memberCount: number;
}

export const useContributionTrends = (groupId?: string) => {
  const { user } = useAuth();
  const [contributionTrends, setContributionTrends] = useState<ContributionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContributionTrends = async () => {
    if (!user || !groupId) return;

    try {
      const { data, error } = // TODO: Implement backend API call

      if (error) throw error;

      // Group by month
      const monthlyData = data?.reduce((acc, contribution) => {
        const month = new Date(contribution.contribution_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!acc[month]) {
          acc[month] = { amount: 0, members: new Set() };
        }
        
        acc[month].amount += Number(contribution.amount);
        acc[month].members.add(contribution.member_id);
        
        return acc;
      }, {} as Record<string, { amount: number; members: Set<string> }>);

      const trends: ContributionTrend[] = Object.entries(monthlyData || {})
        .map(([month, data]) => ({
          month,
          amount: data.amount,
          memberCount: data.members.size
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setContributionTrends(trends);
    } catch (err: any) {
      console.error('Error fetching contribution trends:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadTrends = async () => {
      setLoading(true);
      await fetchContributionTrends();
      setLoading(false);
    };

    if (user && groupId) {
      loadTrends();
    }
  }, [user, groupId]);

  return {
    contributionTrends,
    loading,
    error,
    refetch: fetchContributionTrends
  };
};
