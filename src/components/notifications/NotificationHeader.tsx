
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Bell, Check } from "lucide-react";

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

const NotificationHeader = ({ unreadCount, onMarkAllRead }: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <CardTitle>Notifications</CardTitle>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount}</Badge>
        )}
      </div>
      {unreadCount > 0 && (
        <Button onClick={onMarkAllRead} size="sm" variant="outline">
          <Check className="h-4 w-4 mr-2" />
          Mark all read
        </Button>
      )}
    </div>
  );
};

export default NotificationHeader;
