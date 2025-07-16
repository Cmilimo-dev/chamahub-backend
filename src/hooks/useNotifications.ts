
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';

const API_BASE_URL = 'http://localhost:4000/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'archived';
  group_id?: string;
  metadata?: any;
  created_at: string;
  scheduled_for?: string;
  expires_at?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching notifications for user:', user.id);
      
      const response = await fetch(`${API_BASE_URL}/notifications/${user.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Notifications endpoint not found, using fallback');
          // Use fallback notifications with mock data
          const mockNotifications: Notification[] = [
            {
              id: '1',
              title: 'Welcome to ChamaApp',
              message: 'Welcome to your savings group management system!',
              notification_type: 'system',
              priority: 'medium',
              status: 'unread',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'System Update',
              message: 'The notification system is being set up. Some features may be limited.',
              notification_type: 'system',
              priority: 'low',
              status: 'read',
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
          ];
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => n.status === 'unread').length);
          setError(null);
          setRetryCount(0);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: Notification) => n.status === 'unread').length || 0);
      setError(null);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      
      // Handle 404 errors gracefully
      if (err.message.includes('404')) {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Welcome to ChamaApp',
            message: 'Welcome to your savings group management system!',
            notification_type: 'system',
            priority: 'medium',
            status: 'unread',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'System Update',
            message: 'The notification system is being set up. Some features may be limited.',
            notification_type: 'system',
            priority: 'low',
            status: 'read',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => n.status === 'unread').length);
        setError(null);
        return;
      }
      
      setError(err.message);
      
      // Implement retry logic for network errors
      if (retryCount < 3 && (err.message.includes('network') || err.message.includes('fetch'))) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchNotifications();
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Mark as read endpoint not found, updating locally');
          // Update locally only
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, status: 'read' as const } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, status: 'read' as const } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      if (err.message.includes('404')) {
        // Fallback to local update
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, status: 'read' as const } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // For now, just update the UI - in a real app you'd call an API endpoint
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Delete notification endpoint not found, updating locally');
          // Update locally only
          const deletedNotification = notifications.find(n => n.id === notificationId);
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
          if (deletedNotification?.status === 'unread') {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      if (err.message.includes('404')) {
        // Fallback to local update
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (deletedNotification?.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    }
  };

  // Fetch notifications on mount and user change
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
  }, [user, retryCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};
