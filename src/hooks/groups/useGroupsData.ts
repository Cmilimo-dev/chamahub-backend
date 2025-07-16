
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { Group } from '@/types';

export const useGroupsData = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (userId: string | undefined, isMounted: () => boolean) => {
    if (!userId || !isMounted()) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Fetching groups for user:', userId);
      
      const response = await apiClient.get(`/groups/user/${userId}`);
      const data = response; // API returns data directly, not wrapped in response.data

      const formattedGroups: Group[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        members: item.member_count || 0,
        totalSavings: item.total_savings || 0,
        nextContribution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contributionAmount: item.contribution_amount,
        role: item.role,
        // New customization fields
        minContributionAmount: item.min_contribution_amount,
        maxContributionAmount: item.max_contribution_amount,
        loanInterestRate: item.loan_interest_rate,
        maxLoanMultiplier: item.max_loan_multiplier,
        allowPartialContributions: item.allow_partial_contributions,
        contributionGracePeriodDays: item.contribution_grace_period_days,
        groupRules: item.group_rules
      }));

      if (isMounted()) {
        console.log('Successfully fetched groups:', formattedGroups.length);
        setGroups(formattedGroups);
      }
    } catch (error: any) {
      console.error('Unexpected error fetching groups:', error);
      if (isMounted()) {
        setError(error.response?.data?.error || error.message || 'Failed to fetch groups');
        setGroups([]);
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, []);

  return {
    groups,
    loading,
    error,
    setLoading,
    fetchGroups
  };
};
