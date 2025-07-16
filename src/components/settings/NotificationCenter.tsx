
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Smartphone, Clock } from 'lucide-react';
import { toast } from 'sonner';

const NotificationCenter = () => {
  const [settings, setSettings] = useState({
    // Delivery methods
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    
    // Notification types
    contributionReminders: true,
    loanStatusUpdates: true,
    groupAnnouncements: true,
    meetingReminders: true,
    paymentDue: true,
    systemUpdates: false,
    marketingEmails: false,
    
    // Timing preferences
    quietHoursEnabled: true,
    quietStart: '22:00',
    quietEnd: '07:00',
    weekendNotifications: true,
    
    // Frequency settings
    digestFrequency: 'daily',
    reminderTiming: '24hours',
    urgentOnly: false
  });

  const handleSave = () => {
    // Logic to save notification settings
    toast.success('Notification settings updated successfully');
  };

  const handleTestNotification = () => {
    toast.success('Test notification sent! Check your preferred channels.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-500">Get notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, emailEnabled: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div>
                    <Label>SMS</Label>
                    <p className="text-sm text-gray-500">Receive text messages</p>
                    <Badge variant="outline" className="mt-1">Premium</Badge>
                  </div>
                </div>
                <Switch
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, smsEnabled: checked})
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-purple-500" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Browser notifications</p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, pushEnabled: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <div>
                    <Label>In-App Notifications</Label>
                    <p className="text-sm text-gray-500">Show notifications in the app</p>
                  </div>
                </div>
                <Switch
                  checked={settings.inAppEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, inAppEnabled: checked})
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Control which types of notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Contribution Reminders</Label>
              <p className="text-sm text-gray-500">Get reminded about upcoming contributions</p>
            </div>
            <Switch
              checked={settings.contributionReminders}
              onCheckedChange={(checked) => 
                setSettings({...settings, contributionReminders: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Loan Status Updates</Label>
              <p className="text-sm text-gray-500">Updates on loan applications and payments</p>
            </div>
            <Switch
              checked={settings.loanStatusUpdates}
              onCheckedChange={(checked) => 
                setSettings({...settings, loanStatusUpdates: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Group Announcements</Label>
              <p className="text-sm text-gray-500">Important messages from group admins</p>
            </div>
            <Switch
              checked={settings.groupAnnouncements}
              onCheckedChange={(checked) => 
                setSettings({...settings, groupAnnouncements: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Meeting Reminders</Label>
              <p className="text-sm text-gray-500">Notifications about upcoming meetings</p>
            </div>
            <Switch
              checked={settings.meetingReminders}
              onCheckedChange={(checked) => 
                setSettings({...settings, meetingReminders: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Payment Due Alerts</Label>
              <p className="text-sm text-gray-500">Reminders for upcoming payment deadlines</p>
            </div>
            <Switch
              checked={settings.paymentDue}
              onCheckedChange={(checked) => 
                setSettings({...settings, paymentDue: checked})
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>System Updates</Label>
              <p className="text-sm text-gray-500">App updates and maintenance notifications</p>
            </div>
            <Switch
              checked={settings.systemUpdates}
              onCheckedChange={(checked) => 
                setSettings({...settings, systemUpdates: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Emails</Label>
              <p className="text-sm text-gray-500">Tips, features, and promotional content</p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => 
                setSettings({...settings, marketingEmails: checked})
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing & Frequency
          </CardTitle>
          <CardDescription>
            Control when and how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Quiet Hours</Label>
              <p className="text-sm text-gray-500">Disable notifications during these hours</p>
            </div>
            <Switch
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => 
                setSettings({...settings, quietHoursEnabled: checked})
              }
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select 
                  value={settings.quietStart} 
                  onValueChange={(value) => setSettings({...settings, quietStart: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 24}, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select 
                  value={settings.quietEnd} 
                  onValueChange={(value) => setSettings({...settings, quietEnd: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 24}, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Digest Frequency</Label>
              <Select 
                value={settings.digestFrequency} 
                onValueChange={(value) => setSettings({...settings, digestFrequency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reminder Timing</Label>
              <Select 
                value={settings.reminderTiming} 
                onValueChange={(value) => setSettings({...settings, reminderTiming: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1hour">1 hour before</SelectItem>
                  <SelectItem value="24hours">24 hours before</SelectItem>
                  <SelectItem value="3days">3 days before</SelectItem>
                  <SelectItem value="1week">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekend Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications on weekends</p>
            </div>
            <Switch
              checked={settings.weekendNotifications}
              onCheckedChange={(checked) => 
                setSettings({...settings, weekendNotifications: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Urgent Only Mode</Label>
              <p className="text-sm text-gray-500">Only receive high-priority notifications</p>
            </div>
            <Switch
              checked={settings.urgentOnly}
              onCheckedChange={(checked) => 
                setSettings({...settings, urgentOnly: checked})
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave}>Save Settings</Button>
        <Button variant="outline" onClick={handleTestNotification}>
          Send Test Notification
        </Button>
      </div>
    </div>
  );
};

export default NotificationCenter;
