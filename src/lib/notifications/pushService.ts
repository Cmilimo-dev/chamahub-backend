// Push Notifications Service
// Handles both web and mobile push notifications

import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { apiClient } from '@/lib/api';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushNotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (Capacitor.isNativePlatform()) {
      await this.initializeNativePush();
    } else {
      await this.initializeWebPush();
    }

    this.isInitialized = true;
  }

  private async initializeNativePush(): Promise<void> {
    // Request permission for push notifications
    const permStatus = await PushNotifications.requestPermissions();
    
    if (permStatus.receive === 'granted') {
      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration success
      PushNotifications.addListener('registration', async (token: Token) => {
        console.log('Push registration success, token:', token.value);
        await this.saveTokenToDatabase(token.value);
      });

      // Listen for push notification received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        this.handleNotificationReceived(notification);
      });

      // Listen for push notification action performed
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        this.handleNotificationAction(notification);
      });
    }
  }

  private async initializeWebPush(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Only request permission if it hasn't been set yet
        const currentPermission = Notification.permission;
        if (currentPermission === 'default') {
          console.log('Notification permission will be requested when user interacts with the app');
          return;
        }
        
        if (currentPermission === 'granted') {
          const registration = await navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service worker not available, skipping');
            return null;
          });
          
          if (registration && import.meta.env.VITE_VAPID_PUBLIC_KEY) {
            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlBase64ToUint8Array(
                import.meta.env.VITE_VAPID_PUBLIC_KEY
              )
            });

            await this.saveSubscriptionToDatabase(subscription);
          }
        }
      } catch (error) {
        console.log('Web push notifications not available:', error.message);
      }
    }
  }

  private async saveTokenToDatabase(token: string): Promise<void> {
    try {
      // For now, just log the token - in a real app, you'd save it to the database
      console.log('Saving push token:', token, 'for platform:', Capacitor.getPlatform());
      
      // In a real implementation, you'd call your API:
      // await apiClient.post('/push-tokens', {
      //   token,
      //   platform: Capacitor.getPlatform(),
      // });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  private async saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
    try {
      // For now, just log the subscription - in a real app, you'd save it to the database
      console.log('Saving push subscription for web platform:', subscription);
      
      // In a real implementation, you'd call your API:
      // await apiClient.post('/push-tokens', {
      //   token: JSON.stringify(subscription),
      //   platform: 'web',
      // });
    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  }

  private handleNotificationReceived(notification: any): void {
    // Handle notification when app is in foreground
    console.log('Notification received in foreground:', notification);
  }

  private handleNotificationAction(notification: any): void {
    // Handle notification tap/action
    console.log('Notification action:', notification);
    
    // Navigate to relevant screen based on notification data
    const data = notification.notification?.data;
    if (data?.type === 'contribution_reminder') {
      // Navigate to contributions screen
    } else if (data?.type === 'meeting_reminder') {
      // Navigate to meetings screen
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      await apiClient.post('/notifications/send-to-user', {
        userId,
        ...payload
      });
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }

  // Send notification to all group members
  async sendNotificationToGroup(groupId: string, payload: NotificationPayload): Promise<void> {
    try {
      await apiClient.post('/notifications/send-to-group', {
        groupId,
        ...payload
      });
    } catch (error) {
      console.error('Error sending notification to group:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
