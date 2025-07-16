import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { useDevice } from './useDevice';

export const usePushNotifications = () => {
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { deviceInfo } = useDevice();

  useEffect(() => {
    if (!deviceInfo.isNative) return;

    const initializePushNotifications = async () => {
      try {
        // Request permission
        const permissionStatus = await PushNotifications.requestPermissions();
        
        if (permissionStatus.receive === 'granted') {
          // Register with FCM
          await PushNotifications.register();
          
          // Listen for registration success
          PushNotifications.addListener('registration', (token) => {
            console.log('Push registration token:', token.value);
            setRegistrationToken(token.value);
            setIsRegistered(true);
          });

          // Listen for registration errors
          PushNotifications.addListener('registrationError', (error) => {
            console.error('Push registration error:', error);
          });

          // Listen for incoming push notifications
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);
            setNotifications(prev => [...prev, notification]);
          });

          // Listen for notification action performed
          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push notification action performed:', notification);
            // Handle notification tap
          });
        } else {
          console.log('Push notification permission denied');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [deviceInfo.isNative]);

  const sendTokenToServer = async (userId: string) => {
    if (!registrationToken) return;

    try {
      // Send token to your backend server
      const response = await fetch('/api/push-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: registrationToken,
          platform: deviceInfo.platform
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send token to server');
      }

      console.log('Token sent to server successfully');
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    registrationToken,
    isRegistered,
    notifications,
    sendTokenToServer,
    clearNotifications
  };
};
