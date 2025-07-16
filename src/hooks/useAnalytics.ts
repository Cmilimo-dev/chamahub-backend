
import { useGroupAnalytics } from './useGroupAnalytics';
import { useContributionTrends } from './useContributionTrends';
import { useLoanMetrics } from './useLoanMetrics';
import { useMemberPerformance } from './useMemberPerformance';

export const useAnalytics = (groupId?: string) => {
  const { 
    groupAnalytics, 
    loading: groupLoading, 
    error: groupError, 
    refetch: refetchGroup 
  } = useGroupAnalytics(groupId);

  const { 
    contributionTrends, 
    loading: trendsLoading, 
    error: trendsError, 
    refetch: refetchTrends 
  } = useContributionTrends(groupId);

  const { 
    loanMetrics, 
    loading: loansLoading, 
    error: loansError, 
    refetch: refetchLoans 
  } = useLoanMetrics(groupId);

  const { 
    memberPerformance, 
    loading: membersLoading, 
    error: membersError, 
    refetch: refetchMembers 
  } = useMemberPerformance(groupId);

  const loading = groupLoading || trendsLoading || loansLoading || membersLoading;
  const error = groupError || trendsError || loansError || membersError;

  const refetch = async () => {
    await Promise.all([
      refetchGroup(),
      refetchTrends(),
      refetchLoans(),
      refetchMembers()
    ]);
  };

  return {
    groupAnalytics,
    contributionTrends,
    loanMetrics,
    memberPerformance,
    loading,
    error,
    refetch
  };
};
