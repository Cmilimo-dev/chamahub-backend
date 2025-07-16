
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroupsData } from './groups/useGroupsData';
import { useGroupsSubscription } from './groups/useGroupsSubscription';
import { useStrictModeDetection } from './useStrictModeDetection';
import { subscriptionRegistry } from './subscriptionRegistry';

export const useRealtimeGroups = () => {
  const { user } = useAuth();
  const mountedRef = useRef<boolean>(true);
  const { isStrictMode, isDevelopment } = useStrictModeDetection();
  const initializationRef = useRef<boolean>(false);
  
  const { groups, loading, error, setLoading, fetchGroups } = useGroupsData();
  
  const isMounted = useCallback(() => mountedRef.current, []);
  
  const handleDataChange = useCallback(() => {
    if (isMounted()) {
      fetchGroups(user?.id, isMounted);
    }
  }, [fetchGroups, user?.id, isMounted]);
  
  const { setupRealtimeSubscription, cleanupSubscription } = useGroupsSubscription({
    userId: user?.id,
    onDataChange: handleDataChange,
    isMounted
  });

  const refetch = useCallback(() => {
    console.log('Manual refetch triggered');
    return fetchGroups(user?.id, isMounted);
  }, [fetchGroups, user?.id, isMounted]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Skip if no user
    if (!user?.id) {
      console.log('No user found, skipping groups subscription');
      return;
    }
    
    // Prevent double initialization in StrictMode
    if (initializationRef.current) {
      console.log('Groups hook already initialized, skipping...');
      return;
    }
    
    initializationRef.current = true;
    
    // Enhanced cleanup for StrictMode
    cleanupSubscription();
    
    // Fetch initial data with error handling
    fetchGroups(user?.id, isMounted).catch(err => {
      console.warn('Initial groups fetch failed:', err);
    });
    
    // Set up realtime subscription with longer delay in StrictMode
    const subscriptionDelay = isStrictMode ? 2000 : 1000;
    const subscriptionTimeout = setTimeout(() => {
      if (mountedRef.current && user?.id) {
        try {
          setupRealtimeSubscription();
        } catch (err) {
          console.warn('Failed to setup realtime subscription:', err);
        }
      }
    }, subscriptionDelay);

    return () => {
      console.log('Groups hook cleanup starting...');
      mountedRef.current = false;
      initializationRef.current = false;
      clearTimeout(subscriptionTimeout);
      
      try {
        cleanupSubscription();
      } catch (err) {
        console.warn('Cleanup subscription failed:', err);
      }
      
      // Debug logging in development
      if (isDevelopment) {
        console.log('Groups hook cleanup completed, subscription registry state:', 
          subscriptionRegistry.getDebugInfo());
      }
    };
  }, [user?.id, fetchGroups, setupRealtimeSubscription, cleanupSubscription, isMounted, isStrictMode, isDevelopment]);

  return { groups, loading, error, refetch };
};
