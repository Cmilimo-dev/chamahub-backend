import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { pushNotificationService } from '@/lib/notifications/pushService';

interface NotificationPreferences {
  contribution_reminders: boolean;
  meeting_notifications: boolean;
  loan_updates: boolean;
  group_announcements: boolean;
  payment_confirmations: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
}

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    contribution_reminders: true,
    meeting_notifications: true,
    loan_updates: true,
    group_announcements: true,
    payment_confirmations: true,
    email_enabled: true,
    sms_enabled: false,
    in_app_enabled: true
  });

  useEffect(() => {
    loadNotificationPreferences();
    checkPushNotificationStatus();
  }, [user]);

  const loadNotificationPreferences = async () => {
    if (!user) return;

    try {
      // TODO: Implement backend API call to load notification preferences
      // For now, use default preferences
      const profile = null;
      
      if (profile?.notification_preferences) {
        setPreferences({
          ...preferences,
          ...profile.notification_preferences
        });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const checkPushNotificationStatus = async () => {
    try {
      if ('Notification' in window) {
        setPushEnabled(Notification.permission === 'granted');
      }
    } catch (error) {
      console.error('Error checking push notification status:', error);
    }
  };

  const enablePushNotifications = async () => {
    setLoading(true);
    try {
      await pushNotificationService.initialize();
      setPushEnabled(true);
      toast({
        title: "Push Notifications Enabled",
        description: "You'll now receive push notifications for important updates.",
      });
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      // TODO: Implement backend API call to update preferences
      // await apiClient.put('/api/notification-preferences', updatedPreferences);
      
      setPreferences(updatedPreferences);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    if (!pushEnabled) {
      toast({
        title: "Push Notifications Disabled",
        description: "Please enable push notifications first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Send a test notification via Supabase Edge Function
      // TODO: Implement backend API call

      toast({
        title: "Test Notification Sent",
        description: "Check your device for the test notification.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-enabled" className="text-base">
                Enable Push Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive notifications on your device for important updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              {pushEnabled ? (
                <Bell className="h-4 w-4 text-green-600" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
              <Switch
                id="push-enabled"
                checked={pushEnabled}
                onCheckedChange={enablePushNotifications}
                disabled={loading}
              />
            </div>
          </div>

          {pushEnabled && (
            <Button
              variant="outline"
              onClick={testNotification}
              className="w-full"
              disabled={loading}
            >
              Send Test Notification
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contribution-reminders">Contribution Reminders</Label>
                <p className="text-sm text-gray-500">
                  Get notified when contributions are due
                </p>
              </div>
              <Switch
                id="contribution-reminders"
                checked={preferences.contribution_reminders}
                onCheckedChange={(checked) => 
                  updatePreferences({ contribution_reminders: checked })
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meeting-notifications">Meeting Notifications</Label>
                <p className="text-sm text-gray-500">
                  Get notified about upcoming meetings
                </p>
              </div>
              <Switch
                id="meeting-notifications"
                checked={preferences.meeting_notifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ meeting_notifications: checked })
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="loan-updates">Loan Updates</Label>
                <p className="text-sm text-gray-500">
                  Get notified about loan status changes
                </p>
              </div>
              <Switch
                id="loan-updates"
                checked={preferences.loan_updates}
                onCheckedChange={(checked) => 
                  updatePreferences({ loan_updates: checked })
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="group-announcements">Group Announcements</Label>
                <p className="text-sm text-gray-500">
                  Get notified about group announcements
                </p>
              </div>
              <Switch
                id="group-announcements"
                checked={preferences.group_announcements}
                onCheckedChange={(checked) => 
                  updatePreferences({ group_announcements: checked })
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-confirmations">Payment Confirmations</Label>
                <p className="text-sm text-gray-500">
                  Get notified when payments are processed
                </p>
              </div>
              <Switch
                id="payment-confirmations"
                checked={preferences.payment_confirmations}
                onCheckedChange={(checked) => 
                  updatePreferences({ payment_confirmations: checked })
                }
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="in-app-enabled">In-App Notifications</Label>
              <p className="text-sm text-gray-500">
                Show notifications within the app
              </p>
            </div>
            <Switch
              id="in-app-enabled"
              checked={preferences.in_app_enabled}
              onCheckedChange={(checked) => 
                updatePreferences({ in_app_enabled: checked })
              }
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-enabled">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Send notifications to your email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => 
                updatePreferences({ email_enabled: checked })
              }
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-enabled">SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Send notifications via SMS (additional charges may apply)
              </p>
            </div>
            <Switch
              id="sms-enabled"
              checked={preferences.sms_enabled}
              onCheckedChange={(checked) => 
                updatePreferences({ sms_enabled: checked })
              }
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
