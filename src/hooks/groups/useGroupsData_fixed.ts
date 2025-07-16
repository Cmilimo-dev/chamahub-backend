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
      
      // TODO: Implement with MySQL backend API
      const response = await apiClient.get(`/groups/user/${userId}`);
      const groupsData = response.data || [];

      const formattedGroups: Group[] = groupsData.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        members: group.member_count,
        totalSavings: group.total_savings,
        nextContribution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contributionAmount: group.contribution_amount,
        role: group.role,
        minContributionAmount: group.min_contribution_amount,
        maxContributionAmount: group.max_contribution_amount,
        loanInterestRate: group.loan_interest_rate,
        maxLoanMultiplier: group.max_loan_multiplier,
        allowPartialContributions: group.allow_partial_contributions,
        contributionGracePeriodDays: group.contribution_grace_period_days,
        groupRules: group.group_rules
      }));

      if (isMounted()) {
        console.log('Successfully fetched groups:', formattedGroups.length);
        setGroups(formattedGroups);
      }
    } catch (error: any) {
      console.error('Unexpected error fetching groups:', error);
      if (isMounted()) {
        setError(error.message || 'Failed to fetch groups');
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
