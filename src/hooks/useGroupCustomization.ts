
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import type { Group, GroupCustomizationSetting } from '@/types';

// Check if settings endpoint exists using sessionStorage
const checkSettingsEndpointExists = () => {
  const stored = sessionStorage.getItem('settingsEndpointExists');
  return stored === null ? true : stored === 'true';
};

const setSettingsEndpointExists = (exists: boolean) => {
  sessionStorage.setItem('settingsEndpointExists', exists.toString());
};

// Check if group delete endpoint exists
const checkGroupDeleteEndpointExists = () => {
  const stored = sessionStorage.getItem('groupDeleteEndpointExists');
  return stored === null ? true : stored === 'true';
};

const setGroupDeleteEndpointExists = (exists: boolean) => {
  sessionStorage.setItem('groupDeleteEndpointExists', exists.toString());
};

// Check if group update endpoint exists
const checkGroupUpdateEndpointExists = () => {
  const stored = sessionStorage.getItem('groupUpdateEndpointExists');
  return stored === null ? true : stored === 'true';
};

const setGroupUpdateEndpointExists = (exists: boolean) => {
  sessionStorage.setItem('groupUpdateEndpointExists', exists.toString());
};

export const useGroupCustomization = (groupId?: string) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GroupCustomizationSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async (targetGroupId?: string) => {
    if (!user || (!groupId && !targetGroupId)) return;

    // Skip API call if we know the endpoint doesn't exist
    if (!checkSettingsEndpointExists()) {
      setSettings([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      try {
        const response = await apiClient.get(`/groups/${targetGroupId || groupId}/settings`);
        setSettings(response || []);
      } catch (fetchError: any) {
        if (fetchError.message.includes('404')) {
          console.warn('Settings endpoint not found, disabling future calls');
          setSettingsEndpointExists(false); // Disable future calls
          setSettings([]); // Or provide default settings here
        } else {
          throw fetchError;
        }
      }
    } catch (err: any) {
      console.error('Error fetching group customization settings:', err);
      if (!err.message.includes('404')) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGroupSettings = async (groupData: Partial<Group>) => {
    if (!user || !groupId) return false;

    setLoading(true);
    setError(null);

    try {
      // Try to update settings endpoint first if it exists
      if (checkSettingsEndpointExists()) {
        try {
          await apiClient.put(`/groups/${groupId}/settings`, {
            min_contribution_amount: groupData.minContributionAmount,
            max_contribution_amount: groupData.maxContributionAmount,
            loan_interest_rate: groupData.loanInterestRate,
            max_loan_multiplier: groupData.maxLoanMultiplier,
            allow_partial_contributions: groupData.allowPartialContributions,
            contribution_grace_period_days: groupData.contributionGracePeriodDays,
            group_rules: groupData.groupRules,
            updated_at: new Date().toISOString()
          });
        } catch (settingsError: any) {
          if (settingsError.message.includes('404')) {
            console.warn('Settings endpoint not found, disabling and falling back to group update');
            setSettingsEndpointExists(false);
            // Fallback to updating the group directly
            await apiClient.put(`/groups/${groupId}`, {
              min_contribution_amount: groupData.minContributionAmount,
              max_contribution_amount: groupData.maxContributionAmount,
              loan_interest_rate: groupData.loanInterestRate,
              max_loan_multiplier: groupData.maxLoanMultiplier,
              allow_partial_contributions: groupData.allowPartialContributions,
              contribution_grace_period_days: groupData.contributionGracePeriodDays,
              group_rules: groupData.groupRules,
              updated_at: new Date().toISOString()
            });
          } else {
            throw settingsError;
          }
        }
      } else {
        // Direct group update since settings endpoint doesn't exist
        await apiClient.put(`/groups/${groupId}`, {
          min_contribution_amount: groupData.minContributionAmount,
          max_contribution_amount: groupData.maxContributionAmount,
          loan_interest_rate: groupData.loanInterestRate,
          max_loan_multiplier: groupData.maxLoanMultiplier,
          allow_partial_contributions: groupData.allowPartialContributions,
          contribution_grace_period_days: groupData.contributionGracePeriodDays,
          group_rules: groupData.groupRules,
          updated_at: new Date().toISOString()
        });
      }

      return true;
    } catch (err: any) {
      console.error('Error updating group settings:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomSetting = async (
    category: string,
    key: string,
    value: any
  ) => {
    if (!user || !groupId) return false;

    setLoading(true);
    setError(null);

    try {
      try {
        await apiClient.post(`/groups/${groupId}/customization`, {
          setting_category: category,
          setting_key: key,
          setting_value: value,
          is_active: true,
          updated_at: new Date().toISOString()
        });
      } catch (customError: any) {
        if (customError.message.includes('404')) {
          console.warn('Customization endpoint not found, settings will be stored locally');
          // Store in localStorage as fallback
          const localSettings = JSON.parse(localStorage.getItem(`group_${groupId}_custom_settings`) || '[]');
          const newSetting = {
            setting_category: category,
            setting_key: key,
            setting_value: value,
            is_active: true,
            updated_at: new Date().toISOString()
          };
          localSettings.push(newSetting);
          localStorage.setItem(`group_${groupId}_custom_settings`, JSON.stringify(localSettings));
        } else {
          throw customError;
        }
      }

      await fetchSettings();
      return true;
    } catch (err: any) {
      console.error('Error updating custom setting:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchSettings();
    }
  }, [groupId, user]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateGroupSettings,
    updateCustomSetting,
    refetch: () => fetchSettings()
  };
};
