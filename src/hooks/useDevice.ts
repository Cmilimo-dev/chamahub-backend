import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

interface DeviceInfo {
  platform: string;
  isNative: boolean;
  isOnline: boolean;
  deviceId: string;
  model: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
}

export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'web',
    isNative: false,
    isOnline: true,
    deviceId: '',
    model: '',
    operatingSystem: '',
    osVersion: '',
    manufacturer: '',
    isVirtual: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        // Check if we're in a Capacitor environment
        const isNative = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
        
        if (isNative) {
          // Get device info
          const info = await Device.getInfo();
          const deviceId = await Device.getId();
          const networkStatus = await Network.getStatus();

          setDeviceInfo({
            platform: info.platform,
            isNative: true,
            isOnline: networkStatus.connected,
            deviceId: deviceId.identifier,
            model: info.model,
            operatingSystem: info.operatingSystem,
            osVersion: info.osVersion,
            manufacturer: info.manufacturer,
            isVirtual: info.isVirtual
          });

          // Configure status bar for mobile
          if (info.platform === 'android') {
            await StatusBar.setBackgroundColor({ color: '#16a34a' });
            await StatusBar.setStyle({ style: 'dark' });
          }

          // Hide splash screen
          await SplashScreen.hide();
        } else {
          // Web environment
          setDeviceInfo(prev => ({
            ...prev,
            platform: 'web',
            isNative: false,
            isOnline: navigator.onLine
          }));
        }
      } catch (error) {
        console.error('Error initializing device:', error);
        setDeviceInfo(prev => ({
          ...prev,
          platform: 'web',
          isNative: false
        }));
      } finally {
        setIsLoading(false);
      }
    };

    initializeDevice();

    // Listen for network changes
    const handleNetworkChange = (status: any) => {
      setDeviceInfo(prev => ({
        ...prev,
        isOnline: status.connected
      }));
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setDeviceInfo(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setDeviceInfo(prev => ({ ...prev, isOnline: false }));
    };

    if (deviceInfo.isNative) {
      Network.addListener('networkStatusChange', handleNetworkChange);
    } else {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (deviceInfo.isNative) {
        Network.removeAllListeners();
      } else {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const openApp = async (appId: string) => {
    try {
      if (deviceInfo.isNative) {
        // Open external app (e.g., phone dialer, SMS)
        const { App } = await import('@capacitor/app');
        await App.openUrl({ url: appId });
      } else {
        // Web fallback
        window.open(appId, '_blank');
      }
    } catch (error) {
      console.error('Error opening app:', error);
    }
  };

  const makePhoneCall = async (phoneNumber: string) => {
    await openApp(`tel:${phoneNumber}`);
  };

  const sendSMS = async (phoneNumber: string, message?: string) => {
    const smsUrl = message ? `sms:${phoneNumber}?body=${encodeURIComponent(message)}` : `sms:${phoneNumber}`;
    await openApp(smsUrl);
  };

  const sendEmail = async (email: string, subject?: string, body?: string) => {
    let emailUrl = `mailto:${email}`;
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    if (params.length > 0) emailUrl += `?${params.join('&')}`;
    await openApp(emailUrl);
  };

  return {
    deviceInfo,
    isLoading,
    openApp,
    makePhoneCall,
    sendSMS,
    sendEmail
  };
};
