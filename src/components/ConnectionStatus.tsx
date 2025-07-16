import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { realtimeManager } from '@/utils/realtimeUtils';

const ConnectionStatus = () => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll connection status
    const interval = setInterval(() => {
      const currentStatus = realtimeManager.getConnectionStatus();
      setStatus(currentStatus);
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Don't show if everything is working fine
  if (isOnline && status === 'connected') {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        variant: 'destructive' as const,
        description: 'No internet connection'
      };
    }

    switch (status) {
      case 'connecting':
        return {
          icon: RotateCcw,
          text: 'Reconnecting',
          variant: 'secondary' as const,
          description: 'Attempting to reconnect...'
        };
      case 'error':
        return {
          icon: WifiOff,
          text: 'Connection Issues',
          variant: 'destructive' as const,
          description: 'Real-time updates may be delayed'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          variant: 'secondary' as const,
          description: 'Real-time features unavailable'
        };
      default:
        return {
          icon: Wifi,
          text: 'Connected',
          variant: 'default' as const,
          description: 'All systems operational'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-20 right-4 z-40">
      <Badge 
        variant={config.variant}
        className="flex items-center gap-2 px-3 py-2 shadow-lg animate-pulse"
      >
        <Icon className={`h-4 w-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{config.text}</span>
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
