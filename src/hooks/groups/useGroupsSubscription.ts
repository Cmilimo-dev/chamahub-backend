
import { useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { subscriptionRegistry } from '../subscriptionRegistry';

interface UseGroupsSubscriptionProps {
  userId: string | undefined;
  onDataChange: () => void;
  isMounted: () => boolean;
}

export const useGroupsSubscription = ({ userId, onDataChange, isMounted }: UseGroupsSubscriptionProps) => {
  const subscriptionKeyRef = useRef<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const getSubscriptionKey = useCallback((userId: string) => {
    return `groups-${userId}`;
  }, []);

  const cleanupSubscription = useCallback(() => {
    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }

    if (subscriptionKeyRef.current) {
      console.log('Cleaning up groups subscription:', subscriptionKeyRef.current);
      subscriptionRegistry.forceCleanup(subscriptionKeyRef.current);
      subscriptionKeyRef.current = null;
    }
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    if (!userId || !isMounted()) {
      console.log('Skipping groups subscription setup - invalid state:', {
        hasUser: !!userId,
        isMounted: isMounted()
      });
      return;
    }

    const subscriptionKey = getSubscriptionKey(userId);
    subscriptionKeyRef.current = subscriptionKey;

    // Check if we can attempt subscription
    if (!subscriptionRegistry.canAttemptSubscription(subscriptionKey)) {
      console.log('Cannot attempt groups subscription:', {
        isSubscribed: subscriptionRegistry.isSubscribed(subscriptionKey),
        isConnecting: subscriptionRegistry.isConnecting(subscriptionKey),
        key: subscriptionKey
      });
      return;
    }

    console.log('Setting up groups realtime subscription with polling:', subscriptionKey);
    
    // Since we're using MySQL backend, we'll use polling instead of realtime subscriptions
    // Set up polling interval to check for changes
    const pollInterval = setInterval(() => {
      if (isMounted() && subscriptionRegistry.isSubscribed(subscriptionKey)) {
        console.log('Polling for groups changes...');
        onDataChange();
      }
    }, 30000); // Poll every 30 seconds
    
    // Mark as subscribed and store the interval
    subscriptionRegistry.setSubscribed(subscriptionKey);
    subscriptionRegistry.setConnecting(subscriptionKey, { unsubscribe: () => clearInterval(pollInterval) });
  }, [userId, onDataChange, isMounted, getSubscriptionKey]);

  return {
    setupRealtimeSubscription,
    cleanupSubscription
  };
};
