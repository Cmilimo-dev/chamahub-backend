
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationFilters from "./NotificationFilters";
import NotificationsList from "./NotificationsList";
import NotificationHeader from "./NotificationHeader";

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Notification Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Unable to load notifications: {error}
          </p>
          <Button 
            onClick={refetch} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <NotificationHeader 
          unreadCount={unreadCount}
          onMarkAllRead={markAllAsRead}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <NotificationFilters />
        <NotificationsList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
