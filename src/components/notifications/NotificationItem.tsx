
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'loan_status_update':
      case 'loan_approved':
      case 'loan_disbursed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loan_rejected':
      case 'payment_overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'contribution_reminder':
      case 'meeting_reminder':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatNotificationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div 
      className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${getPriorityColor(notification.priority)} ${
        notification.status === 'unread' ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">
            {getNotificationIcon(notification.notification_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {notification.title}
              </h4>
              {notification.status === 'unread' && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {formatNotificationType(notification.notification_type)}
                </Badge>
                {notification.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-2">
          {notification.status === 'unread' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAsRead}
              className="p-1 h-auto"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-1 h-auto text-gray-400 hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
