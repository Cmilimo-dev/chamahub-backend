
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  permission_type: string;
}

interface UserPermissions {
  permission_name: string;
  module: string;
  permission_type: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      const { data, error } = // TODO: Implement backend API call

      if (error) throw error;
      setPermissions(data || []);
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      setError(err.message);
    }
  };

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      const { data, error } = // TODO: Implement backend API call

      if (error) throw error;
      setUserPermissions(data || []);
    } catch (err: any) {
      console.error('Error fetching user permissions:', err);
      setError(err.message);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    return userPermissions.some(p => p.permission_name === permissionName);
  };

  const hasModuleAccess = (module: string, permissionType?: string): boolean => {
    return userPermissions.some(p => 
      p.module === module && (!permissionType || p.permission_type === permissionType)
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPermissions(), fetchUserPermissions()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    permissions,
    userPermissions,
    loading,
    error,
    hasPermission,
    hasModuleAccess,
    refetch: () => Promise.all([fetchPermissions(), fetchUserPermissions()])
  };
};
