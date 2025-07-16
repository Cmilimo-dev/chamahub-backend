
interface SubscriptionState {
  channelRef: any;
  isSubscribed: boolean;
  isConnecting: boolean;
  lastAttempt: number;
  attemptCount: number;
  cleanupTimeout?: NodeJS.Timeout;
}

class SubscriptionRegistry {
  private subscriptions = new Map<string, SubscriptionState>();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_BASE = 1000;
  private readonly CLEANUP_DELAY = 5000; // 5 seconds delay before cleanup

  isSubscribed(key: string): boolean {
    const state = this.subscriptions.get(key);
    return state?.isSubscribed || false;
  }

  isConnecting(key: string): boolean {
    const state = this.subscriptions.get(key);
    return state?.isConnecting || false;
  }

  canAttemptSubscription(key: string): boolean {
    const state = this.subscriptions.get(key);
    if (!state) return true;
    
    // Prevent multiple attempts in quick succession
    const timeSinceLastAttempt = Date.now() - state.lastAttempt;
    const minDelay = this.RETRY_DELAY_BASE * Math.pow(2, state.attemptCount);
    
    return !state.isSubscribed && 
           !state.isConnecting && 
           state.attemptCount < this.MAX_RETRY_ATTEMPTS &&
           timeSinceLastAttempt > minDelay;
  }

  setConnecting(key: string, channelRef: any): void {
    const existing = this.subscriptions.get(key);
    
    // Clear any pending cleanup
    if (existing?.cleanupTimeout) {
      clearTimeout(existing.cleanupTimeout);
    }
    
    this.subscriptions.set(key, {
      channelRef,
      isSubscribed: false,
      isConnecting: true,
      lastAttempt: Date.now(),
      attemptCount: (existing?.attemptCount || 0) + 1
    });
  }

  setSubscribed(key: string): void {
    const state = this.subscriptions.get(key);
    if (state) {
      // Clear any pending cleanup
      if (state.cleanupTimeout) {
        clearTimeout(state.cleanupTimeout);
      }
      
      state.isSubscribed = true;
      state.isConnecting = false;
      state.attemptCount = 0; // Reset on successful connection
    }
  }

  setDisconnected(key: string): void {
    const state = this.subscriptions.get(key);
    if (state) {
      state.isSubscribed = false;
      state.isConnecting = false;
    }
  }

  scheduleCleanup(key: string): void {
    const state = this.subscriptions.get(key);
    if (state && !state.cleanupTimeout) {
      console.log(`Scheduling cleanup for subscription: ${key} in ${this.CLEANUP_DELAY}ms`);
      state.cleanupTimeout = setTimeout(() => {
        this.cleanup(key);
      }, this.CLEANUP_DELAY);
    }
  }

  cleanup(key: string): void {
    const state = this.subscriptions.get(key);
    if (state) {
      // Clear timeout if exists
      if (state.cleanupTimeout) {
        clearTimeout(state.cleanupTimeout);
      }
      
      // Unsubscribe from channel
      if (state.channelRef) {
        try {
          console.log(`Cleaning up subscription: ${key}`);
          state.channelRef.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing channel:', error);
        }
      }
    }
    this.subscriptions.delete(key);
  }

  forceCleanup(key: string): void {
    const state = this.subscriptions.get(key);
    if (state?.cleanupTimeout) {
      clearTimeout(state.cleanupTimeout);
    }
    this.cleanup(key);
  }

  getChannelRef(key: string): any {
    return this.subscriptions.get(key)?.channelRef;
  }

  // Enhanced development mode helper
  getDebugInfo(): Record<string, any> {
    const debug: Record<string, any> = {};
    this.subscriptions.forEach((state, key) => {
      debug[key] = {
        isSubscribed: state.isSubscribed,
        isConnecting: state.isConnecting,
        attemptCount: state.attemptCount,
        hasChannel: !!state.channelRef,
        hasCleanupScheduled: !!state.cleanupTimeout,
        lastAttempt: new Date(state.lastAttempt).toISOString()
      };
    });
    return debug;
  }

  // Clean up all subscriptions (for app-wide cleanup)
  cleanupAll(): void {
    console.log('Cleaning up all subscriptions...');
    const keys = Array.from(this.subscriptions.keys());
    keys.forEach(key => this.forceCleanup(key));
  }
}

export const subscriptionRegistry = new SubscriptionRegistry();
