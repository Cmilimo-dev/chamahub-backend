import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MembershipRequest {
  id: string;
  group_id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  invitation_token: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requested_at: string;
  form_submitted: boolean;
  message?: string;
  user_id?: string;
  group: {
    name: string;
  };
}

export const useMembershipRequests = (groupId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      loadRequests();
    }
  }, [user, groupId]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      // TODO: Implement with MySQL backend API
      const response = await apiClient.get(`/group-members/admin-status/${user.id}`);
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Implement with MySQL backend API
      const url = groupId ? `/membership-requests/group/${groupId}` : `/membership-requests/user/${user.id}`;
      const response = await apiClient.get(url);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error loading membership requests:', error);
      toast({
        title: "Error",
        description: "Failed to load membership requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMembershipRequest = async (
    groupId: string,
    email: string,
    phoneNumber: string,
    contactMethod: 'email' | 'phone'
  ) => {
    try {
      const invitationToken = generateToken();

      // TODO: Implement with MySQL backend API
      const response = await apiClient.post('/membership-requests', {
        group_id: groupId,
        email: contactMethod === 'email' ? email : '',
        phone_number: phoneNumber,
        invitation_token: invitationToken,
        status: 'pending'
      });

      return { success: true, token: invitationToken };
    } catch (error) {
      console.error('Error creating membership request:', error);
      return { success: false, error };
    }
  };

  const submitMembershipForm = async (
    token: string,
    formData: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email?: string;
      message?: string;
    }
  ) => {
    try {
      // TODO: Implement with MySQL backend API
      const response = await apiClient.put(`/membership-requests/token/${token}`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        email: formData.email || null,
        message: formData.message || null,
        form_submitted: true,
        form_submitted_at: new Date().toISOString(),
        user_id: user?.id || null
      });

      return { success: true };
    } catch (error) {
      console.error('Error submitting membership form:', error);
      return { success: false, error };
    }
  };

  const approveRequest = async (requestId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // TODO: Implement with MySQL backend API
      const response = await apiClient.post(`/membership-requests/${requestId}/approve`, {
        approved_by: user.id
      });

      // Reload requests
      loadRequests();

      return { success: true };
    } catch (error) {
      console.error('Error approving request:', error);
      return { success: false, error };
    }
  };

  const rejectRequest = async (requestId: string, reason?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // TODO: Implement with MySQL backend API
      const response = await apiClient.post(`/membership-requests/${requestId}/reject`, {
        rejected_by: user.id,
        rejection_reason: reason
      });

      // Reload requests
      loadRequests();

      return { success: true };
    } catch (error) {
      console.error('Error rejecting request:', error);
      return { success: false, error };
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  return {
    requests,
    loading,
    isAdmin,
    loadRequests,
    createMembershipRequest,
    submitMembershipForm,
    approveRequest,
    rejectRequest
  };
};

export default useMembershipRequests;
