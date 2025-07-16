
import { Bell } from "lucide-react";
import { Notification } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationsList = ({ notifications, onMarkAsRead, onDelete }: NotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No notifications found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={() => onMarkAsRead(notification.id)}
          onDelete={() => onDelete(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationsList;
