
import { useState, useEffect } from "react";
import { apiClient } from '@/lib/api';

export interface LoanApplication {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  application_date: string;
  duration_months: number;
  interest_rate: number;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
  chama_groups: {
    name: string;
  };
}

export const useLoanApplications = (userId?: string) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching available loans for user:', userId);
      
      // Get user's groups to find loans that need approval
      const userGroupsResponse = await apiClient.get(`/groups/user/${userId}`);
      const userGroups = userGroupsResponse || [];
      console.log('User groups:', userGroups);
      
      // For each group, get pending loans if user is admin/treasurer/secretary
      const allApplications = [];
      for (const group of userGroups) {
        console.log('Checking group:', group.name, 'Role:', group.role);
        if (group.role === 'admin' || group.role === 'treasurer' || group.role === 'secretary') {
          console.log('User has approval rights for group:', group.name);
          const groupLoansResponse = await apiClient.get(`/loans/group/${group.id}?status=pending`);
          const groupLoans = groupLoansResponse || [];
          console.log('Group loans:', groupLoans);
          
          // Transform to match the expected format
          const transformedLoans = groupLoans.map((loan: any) => ({
            id: loan.id,
            amount: parseFloat(loan.amount),
            purpose: loan.purpose,
            status: loan.status,
            application_date: loan.application_date,
            duration_months: loan.duration_months,
            interest_rate: parseFloat(loan.interest_rate),
            profiles: {
              first_name: loan.borrower_first_name,
              last_name: loan.borrower_last_name,
              email: loan.borrower_email
            },
            chama_groups: {
              name: loan.group_name
            }
          }));
          
          allApplications.push(...transformedLoans);
        }
      }
      
      console.log('Final applications:', allApplications);
      setApplications(allApplications);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching loan applications:', error);
      setError(error.message || 'Failed to fetch loan applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanDecision = async (loanId: string, decision: 'approved' | 'rejected', approvedBy?: string) => {
    try {
      console.log('Processing loan decision:', loanId, decision, approvedBy);
      
      // Update loan status in the backend
      await apiClient.put(`/loans/${loanId}`, {
        status: decision,
        approved_by: approvedBy
      });
      
      // Remove the processed application from the list immediately
      setApplications(prev => prev.filter(app => app.id !== loanId));
      
      return true;
    } catch (error: any) {
      console.error('Error processing loan decision:', error);
      throw error;
    }
  };

  const createLoanDecisionNotification = async (application: LoanApplication, decision: 'approved' | 'rejected') => {
    try {
      // TODO: Implement with MySQL backend API
      console.log('Creating loan decision notification:', application.id, decision);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const refetchApplications = () => {
    setLoading(true);
    fetchApplications();
  };

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  return {
    applications,
    loading,
    error,
    refetchApplications,
    handleLoanDecision
  };
};
