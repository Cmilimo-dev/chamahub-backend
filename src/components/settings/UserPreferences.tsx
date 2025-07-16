
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Settings } from 'lucide-react';
import { toast } from 'sonner';

const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    dashboardLayout: 'default',
    defaultView: 'overview',
    itemsPerPage: 10,
    showAdvancedFeatures: false,
    quickActionsEnabled: true,
    autoRefreshData: true,
    refreshInterval: 30,
    showNotificationBadges: true,
    enableAnimations: true,
    compactMode: false,
    darkMode: false,
    fontSize: 14,
    showHelpTips: true
  });

  const handleSave = () => {
    // Logic to save user preferences
    toast.success('Preferences saved successfully');
  };

  const handleReset = () => {
    // Reset to default preferences
    setPreferences({
      dashboardLayout: 'default',
      defaultView: 'overview',
      itemsPerPage: 10,
      showAdvancedFeatures: false,
      quickActionsEnabled: true,
      autoRefreshData: true,
      refreshInterval: 30,
      showNotificationBadges: true,
      enableAnimations: true,
      compactMode: false,
      darkMode: false,
      fontSize: 14,
      showHelpTips: true
    });
    toast.success('Preferences reset to defaults');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize how the application looks and behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dashboard Layout</Label>
              <Select 
                value={preferences.dashboardLayout} 
                onValueChange={(value) => setPreferences({...preferences, dashboardLayout: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="expanded">Expanded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default View</Label>
              <Select 
                value={preferences.defaultView} 
                onValueChange={(value) => setPreferences({...preferences, defaultView: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="groups">My Groups</SelectItem>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Size: {preferences.fontSize}px</Label>
            <Slider
              value={[preferences.fontSize]}
              onValueChange={(value) => setPreferences({...preferences, fontSize: value[0]})}
              min={12}
              max={18}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Items Per Page</Label>
            <Select 
              value={preferences.itemsPerPage.toString()} 
              onValueChange={(value) => setPreferences({...preferences, itemsPerPage: parseInt(value)})}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Interface Options</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Advanced Features</Label>
                <p className="text-sm text-gray-500">Display advanced tools and options</p>
              </div>
              <Switch
                checked={preferences.showAdvancedFeatures}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, showAdvancedFeatures: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Quick Actions Panel</Label>
                <p className="text-sm text-gray-500">Show quick action buttons</p>
              </div>
              <Switch
                checked={preferences.quickActionsEnabled}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, quickActionsEnabled: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notification Badges</Label>
                <p className="text-sm text-gray-500">Show notification count badges</p>
              </div>
              <Switch
                checked={preferences.showNotificationBadges}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, showNotificationBadges: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Animations</Label>
                <p className="text-sm text-gray-500">Use smooth transitions and animations</p>
              </div>
              <Switch
                checked={preferences.enableAnimations}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, enableAnimations: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Help Tips</Label>
                <p className="text-sm text-gray-500">Display helpful tooltips and guides</p>
              </div>
              <Switch
                checked={preferences.showHelpTips}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, showHelpTips: checked})
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Data & Performance</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-refresh Data</Label>
                <p className="text-sm text-gray-500">Automatically update data in real-time</p>
              </div>
              <Switch
                checked={preferences.autoRefreshData}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, autoRefreshData: checked})
                }
              />
            </div>

            {preferences.autoRefreshData && (
              <div className="space-y-2">
                <Label>Refresh Interval</Label>
                <Select 
                  value={preferences.refreshInterval.toString()} 
                  onValueChange={(value) => setPreferences({...preferences, refreshInterval: parseInt(value)})}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave}>Save Preferences</Button>
            <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;
