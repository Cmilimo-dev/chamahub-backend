import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  totalSavings: number;
  nextContribution: string;
  contributionAmount: number;
  role: string;
}

export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) {
        setGroups([]);
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.get(`/groups/user/${user.id}`);
        
        const formattedGroups: Group[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          members: item.member_count || 0,
          totalSavings: item.total_savings || 0,
          nextContribution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contributionAmount: item.contribution_amount || 0,
          role: item.role || 'member'
        }));

        setGroups(formattedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  return { groups, loading };
};
