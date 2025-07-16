
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from '@/lib/api';
import type { TransactionNotification } from "@/types/banking";

const TransactionNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<TransactionNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
      const data = await apiClient.get(`/users/${user.id}/transaction-notifications`);
      setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching transaction notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Real-time functionality can be implemented with polling or WebSocket
    // For now, we'll skip the real-time subscription
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getNotificationIcon = (notificationType: string, status: string) => {
    if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
    
    switch (notificationType) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Transaction Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Transaction Notifications
          {notifications.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transaction notifications yet
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.notification_type, notification.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">
                        {notification.transaction_type} {notification.notification_type}
                      </span>
                      {getStatusBadge(notification.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatCurrency(notification.amount)}</span>
                      <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      {notification.external_reference && (
                        <span>Ref: {notification.external_reference}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionNotifications;
