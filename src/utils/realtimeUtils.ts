import { apiClient } from '@/lib/api';

interface RealtimeConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackToPolling?: boolean;
  pollingInterval?: number;
}

export class RealtimeConnectionManager {
  private static instance: RealtimeConnectionManager;
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error' = 'disconnected';
  private retryCount = 0;
  private maxRetries = 3;
  private pollingFallbacks = new Set<string>();

  static getInstance(): RealtimeConnectionManager {
    if (!RealtimeConnectionManager.instance) {
      RealtimeConnectionManager.instance = new RealtimeConnectionManager();
    }
    return RealtimeConnectionManager.instance;
  }

  private constructor() {
    this.initConnectionMonitoring();
  }

  private initConnectionMonitoring() {
    // Monitor global WebSocket connection state
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Network back online, attempting to reconnect realtime...');
        this.handleReconnect();
      });

      window.addEventListener('offline', () => {
        console.log('Network offline, realtime connections will be paused');
        this.connectionStatus = 'disconnected';
      });
    }
  }

  private handleReconnect() {
    if (this.connectionStatus === 'disconnected' && navigator.onLine) {
      this.connectionStatus = 'connecting';
      // Trigger reconnection for all active subscriptions
      this.retryCount = 0;
    }
  }

  async createReliableSubscription(
    tableName: string,
    filter: string,
    callback: (payload: any) => void,
    options: RealtimeConnectionOptions = {}
  ) {
    const {
      maxRetries = 3,
      retryDelay = 2000,
      fallbackToPolling = true,
      pollingInterval = 5000
    } = options;

    const subscriptionKey = `${tableName}:${filter}`;
    
    try {
      // TODO: Implement with MySQL backend WebSocket or polling
      console.log(`Creating subscription for ${tableName} with filter: ${filter}`);
      
      // For now, fall back to polling immediately
      return this.setupPollingFallback(subscriptionKey, tableName, filter, callback, pollingInterval);

    } catch (error) {
      console.error('Error creating realtime subscription:', error);
      
      if (fallbackToPolling) {
        return this.setupPollingFallback(subscriptionKey, tableName, filter, callback, pollingInterval);
      }
      
      throw error;
    }
  }

  private setupPollingFallback(
    subscriptionKey: string,
    tableName: string,
    filter: string,
    callback: (payload: any) => void,
    interval: number
  ) {
    console.log(`🔄 Setting up polling fallback for ${tableName} (${filter})`);
    
    this.pollingFallbacks.add(subscriptionKey);
    
    const pollInterval = setInterval(async () => {
      if (!this.pollingFallbacks.has(subscriptionKey)) {
        clearInterval(pollInterval);
        return;
      }

      try {
        // This is a basic polling implementation
        // In a real scenario, you'd want to track last update time
        // and only fetch new records since then
        console.log(`📊 Polling ${tableName} for updates...`);
        
        // For now, just indicate that polling is active
        // Individual components should handle their own polling logic
        callback({
          eventType: 'POLLING_UPDATE',
          new: null,
          old: null,
          errors: null
        });
        
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);

    return {
      unsubscribe: () => {
        clearInterval(pollInterval);
        this.pollingFallbacks.delete(subscriptionKey);
      }
    };
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  isUsingPolling(tableName: string, filter: string) {
    return this.pollingFallbacks.has(`${tableName}:${filter}`);
  }

  // Force cleanup of all connections
  cleanup() {
    this.pollingFallbacks.clear();
    this.connectionStatus = 'disconnected';
    this.retryCount = 0;
  }
}

export const realtimeManager = RealtimeConnectionManager.getInstance();

// Utility function for components to use
export function createRobustSubscription(
  tableName: string,
  filter: string = '',
  callback: (payload: any) => void,
  options: RealtimeConnectionOptions = {}
) {
  return realtimeManager.createReliableSubscription(tableName, filter, callback, options);
}
