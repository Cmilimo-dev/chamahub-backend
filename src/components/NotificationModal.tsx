import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from './notifications/NotificationCenter';

interface NotificationModalProps {
  trigger?: React.ReactNode;
  className?: string;
}

const NotificationModal = ({ trigger, className = '' }: NotificationModalProps) => {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className={`relative ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {unreadCount > 0 ? (
        <BellRing className="h-4 w-4 mr-2" />
      ) : (
        <Bell className="h-4 w-4 mr-2" />
      )}
      Notifications
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <NotificationCenter />
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
