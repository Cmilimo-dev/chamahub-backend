
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  status: string;
  joined_at: string;
  total_contributions: number;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  // Computed properties
  name: string;
  email: string;
  avatar_url?: string;
}

export const useGroupRoles = (groupId?: string) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupMembers = async () => {
    if (!groupId) return;

    setLoading(true);
    try {
      const data = await apiClient.get(`/groups/${groupId}/members`);
      
      // Transform data to include computed properties
      const transformedMembers = (data || []).map((item: any) => ({
        ...item,
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown User',
        email: item.email || '',
        avatar_url: item.avatar_url
      }));
      
      setMembers(transformedMembers);
    } catch (err: any) {
      console.error('Error fetching group members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await apiClient.put(`/groups/${groupId}/members/${memberId}`, { role: newRole });

      // Update local state
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, role: newRole }
            : member
        )
      );

      toast.success('Member role updated successfully');
      return true;
    } catch (err: any) {
      console.error('Error updating member role:', err);
      toast.error('Failed to update member role');
      return false;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await apiClient.delete(`/groups/${groupId}/members/${memberId}`);

      // Remove from local state
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast.success('Member removed from group');
      return true;
    } catch (err: any) {
      console.error('Error removing member:', err);
      toast.error('Failed to remove member');
      return false;
    }
  };

  const getCurrentUserRole = (): string => {
    if (!user) return 'member';
    const currentMember = members.find(m => m.user_id === user.id);
    return currentMember?.role || 'member';
  };

  const canManageRoles = (): boolean => {
    const userRole = getCurrentUserRole();
    return userRole === 'admin';
  };

  const canRemoveMembers = (): boolean => {
    const userRole = getCurrentUserRole();
    return ['admin', 'treasurer'].includes(userRole);
  };

  useEffect(() => {
    fetchGroupMembers();
  }, [groupId]);

  return {
    members,
    loading,
    error,
    updateMemberRole,
    removeMember,
    getCurrentUserRole,
    canManageRoles,
    canRemoveMembers,
    refetch: fetchGroupMembers
  };
};
